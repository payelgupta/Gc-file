// Supabase Edge Functions Shared Security Module
// Provides CORS, IP extraction, rate limiting, and withSupabase authentication wrapper

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

export function errorResponse(message: string, status = 400, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error: message, success: false }), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

// In-memory fallback rate limiter in case Postgres connection is degraded
const inMemoryRateLimitStore = new Map<string, { count: number; windowStart: number; blockedUntil?: number }>();

/**
 * Extracts a sanitized, untampered IP address from trusted headers.
 */
export function extractClientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) return cfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) return realIp.trim();

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (isValidIp(first)) return first;
  }

  return "anon-client";
}

function isValidIp(ip: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4.test(ip)) {
    const parts = ip.split(".").map(Number);
    return parts.every(p => p >= 0 && p <= 255);
  }
  const ipv6 = /^[0-9a-fA-F:]{2,39}$/;
  return ipv6.test(ip);
}

export interface AuthContext {
  isAnonymous: boolean;
  userId?: string;
  userEmail?: string;
  isAdmin: boolean;
  clientIdentifier: string;
}

/**
 * Verifies request authentication according to Supabase standards:
 * - Anonymous: apikey = publishable key (no Authorization header sent)
 * - Authenticated: apikey = publishable key AND Authorization = actual user session JWT
 */
export async function authenticateRequest(req: Request): Promise<AuthContext> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  const apikeyHeader = req.headers.get("apikey") || "";
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  const clientIp = extractClientIp(req);

  // If a user JWT is provided, verify it against Supabase Auth
  if (bearerToken && bearerToken !== anonKey && bearerToken !== apikeyHeader) {
    try {
      const authClient = createClient(supabaseUrl, anonKey || apikeyHeader, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: { user }, error } = await authClient.auth.getUser(bearerToken);
      if (user && !error) {
        let isAdmin = false;
        if (serviceRoleKey) {
          const adminClient = createClient(supabaseUrl, serviceRoleKey);
          const { data: roleData } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          isAdmin = !!roleData;
        }

        return {
          isAnonymous: false,
          userId: user.id,
          userEmail: user.email,
          isAdmin,
          clientIdentifier: `user:${user.id}`,
        };
      }
    } catch (e) {
      console.warn("User JWT validation failed, falling back to anonymous IP:", e);
    }
  }

  // Anonymous request
  return {
    isAnonymous: true,
    isAdmin: false,
    clientIdentifier: `ip:${clientIp}`,
  };
}

/**
 * Supported Supabase Edge Function wrapper: withSupabase({ auth: 'publishable' })
 * Ensures:
 * 1. apikey header must be present and valid.
 * 2. Publishable key must NOT be sent as Authorization Bearer.
 * 3. Supports anonymous callers without requiring a user JWT.
 * 4. Resolves authenticated user session JWT and role when provided.
 */
export function withSupabase(options: { auth: "publishable" | "required" } = { auth: "publishable" }) {
  return function(handler: (req: Request, auth: AuthContext) => Promise<Response>) {
    return async function(req: Request): Promise<Response> {
      // 1. CORS Preflight
      const corsRes = handleCors(req);
      if (corsRes) return corsRes;

      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      const apikeyHeader = req.headers.get("apikey") || "";

      // 2. Validate apikey header
      if (!apikeyHeader) {
        return errorResponse("Missing API key: 'apikey' header is required.", 401);
      }
      if (anonKey && apikeyHeader !== anonKey) {
        return errorResponse("Invalid API key provided in 'apikey' header.", 401);
      }

      // 3. Ensure publishable key is not mistakenly sent as Authorization Bearer
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        const bearer = authHeader.slice(7).trim();
        if (anonKey && bearer === anonKey) {
          return errorResponse("Security requirement: Do NOT send the publishable key as Authorization Bearer.", 400);
        }
      }

      // 4. Authenticate caller (resolves user / admin if JWT is provided)
      const auth = await authenticateRequest(req);

      if (options.auth === "required" && auth.isAnonymous) {
        return errorResponse("Authentication required: valid user session JWT must be provided.", 401);
      }

      return handler(req, auth);
    };
  };
}

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
  cooldownSeconds?: number;
}

/**
 * Enforces atomic database rate limiting via Postgres check_rate_limit stored function.
 * Falls back to in-memory window if database RPC is temporarily unreachable.
 */
export async function enforceRateLimit(
  auth: AuthContext,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter: number; remaining?: number }> {
  const maxRequests = auth.isAdmin ? config.maxRequests * 5 : config.maxRequests;
  const cooldownSeconds = config.cooldownSeconds || 120;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";

  if (supabaseUrl && serviceRoleKey) {
    try {
      const client = createClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await client.rpc("check_rate_limit", {
        p_identifier: auth.clientIdentifier,
        p_endpoint: config.endpoint,
        p_max_requests: maxRequests,
        p_window_seconds: config.windowSeconds,
        p_cooldown_seconds: cooldownSeconds,
      });

      if (!error && data) {
        return {
          allowed: !!data.allowed,
          retryAfter: Number(data.retry_after) || 0,
          remaining: Number(data.remaining) || 0,
        };
      }
    } catch (err) {
      console.warn("Postgres check_rate_limit RPC failed, falling back to memory:", err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const key = `${auth.clientIdentifier}:${config.endpoint}`;
  let entry = inMemoryRateLimitStore.get(key);

  if (!entry || now - entry.windowStart > config.windowSeconds * 1000) {
    entry = { count: 1, windowStart: now };
    inMemoryRateLimitStore.set(key, entry);
    return { allowed: true, retryAfter: 0, remaining: maxRequests - 1 };
  }

  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    entry.blockedUntil = now + cooldownSeconds * 1000;
    return { allowed: false, retryAfter: cooldownSeconds, remaining: 0 };
  }

  return { allowed: true, retryAfter: 0, remaining: maxRequests - entry.count };
}

/**
 * Validates request payload size.
 */
export function checkContentLength(req: Request, maxBytes: number): Response | null {
  const lenStr = req.headers.get("content-length");
  if (lenStr) {
    const len = parseInt(lenStr, 10);
    if (!isNaN(len) && len > maxBytes) {
      return errorResponse(`অনুরোধের সাইজ অনেক বড় (সর্বোচ্চ ${Math.round(maxBytes / (1024 * 1024))}MB অনুমোদিত)।`, 413);
    }
  }
  return null;
}

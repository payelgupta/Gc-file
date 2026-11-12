// Safe Supabase client initialization with environment validation
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

// Read from import.meta.env or process.env safely
const envUrl = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  ""
).trim();

const envKey = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  ""
).trim();

const isPlaceholder = (val: string) =>
  !val || val.includes("placeholder-project") || val.includes("placeholder-anon");

const isValidUrl = (url: string) =>
  Boolean(url) && (/^https:\/\//i.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url));

// Configuration validation state
export const isSupabaseConfigured: boolean = Boolean(
  envUrl && envKey && !isPlaceholder(envUrl) && !isPlaceholder(envKey) && isValidUrl(envUrl)
);

export const supabaseConfigurationError: string | null = isSupabaseConfigured
  ? null
  : !envUrl || !envKey
  ? "Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment."
  : !isValidUrl(envUrl)
  ? "VITE_SUPABASE_URL must be a valid HTTPS URL (or HTTP localhost for local development)."
  : "Supabase configuration is using placeholder credentials.";

if (!isSupabaseConfigured) {
  // Safe console warning instead of top-level crash; allows tests, CI, and build tools to run safely
  console.warn(
    `[Supabase Configuration Warning] ${supabaseConfigurationError} Running in unconfigured fallback mode.`
  );
}

// Fallback values prevent runtime crash during module import, SSR, or Vitest runs
export const SUPABASE_URL: string = isValidUrl(envUrl) ? envUrl : "https://placeholder-project.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY: string = envKey || "placeholder-anon-key";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
  }
});
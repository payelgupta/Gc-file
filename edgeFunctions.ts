// Client-side helper for invoking Supabase Edge Functions securely.
// Adheres strictly to Supabase publishable-key authentication standard:
// - Anonymous requests: apikey = publishable key (NO Authorization Bearer sent)
// - Authenticated requests: apikey = publishable key AND Authorization = actual user session JWT

import { supabase } from "@/integrations/supabase/client";

export const getEdgeFunctionUrl = (functionName: string): string => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
  return `${baseUrl}/functions/v1/${functionName}`;
};

export const getEdgeFunctionHeaders = async (
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> => {
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: publishableKey,
    ...extraHeaders,
  };

  // Only attach Authorization Bearer if there is an actual authenticated user session JWT
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn("Could not retrieve user session for edge function:", err);
  }

  return headers;
};

/**
 * Parses Server-Sent Events (SSE) from edge function response.
 */
export async function streamEdgeResponse(
  response: Response,
  onDelta: (content: string) => void
): Promise<string> {
  if (!response.body) throw new Error("প্রতিক্রিয়ার কোনো বডি পাওয়া যায়নি।");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") return fullText;

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onDelta(delta);
        }
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  return fullText;
}

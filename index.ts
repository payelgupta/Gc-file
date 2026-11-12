import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  withSupabase,
  corsHeaders,
  errorResponse,
  enforceRateLimit,
  checkContentLength,
} from "../_shared/security.ts";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
  "txt",
  "csv",
  "json",
]);

serve(
  withSupabase({ auth: "publishable" })(async (req, auth) => {
    if (req.method !== "POST") {
      return errorResponse("Only POST method is allowed", 405);
    }

    // 1. Content size validation (max 10MB)
    const sizeError = checkContentLength(req, 10 * 1024 * 1024);
    if (sizeError) return sizeError;

    try {
      // 2. Rate limiting (10 requests per 60s for public, 50 for admin; 180s cooldown)
      const rateCheck = await enforceRateLimit(auth, {
        endpoint: "process-file",
        maxRequests: 10,
        windowSeconds: 60,
        cooldownSeconds: 180,
      });

      if (!rateCheck.allowed) {
        return errorResponse(
          `ফাইল প্রসেসিং এর অনুরোধের সীমা অতিক্রম করেছে। অনুগ্রহ করে ${rateCheck.retryAfter} সেকেন্ড পর চেষ্টা করুন।`,
          429,
          { "Retry-After": rateCheck.retryAfter.toString() }
        );
      }

      // 3. Safe JSON parsing
      let body: any;
      try {
        body = await req.json();
      } catch {
        return errorResponse("অবৈধ JSON ফরম্যাট।", 400);
      }

      const { messages, fileData, fileType, fileName } = body || {};

      // Validate fileType and fileName
      if (fileType && typeof fileType === "string") {
        const cleanMime = fileType.toLowerCase().split(";")[0].trim();
        if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
          return errorResponse(`অননুমোদিত ফাইল টাইপ: ${fileType}। শুধুমাত্র PDF, ছবি এবং টেক্সট ফাইল সমর্থিত।`, 400);
        }
      }

      if (fileName && typeof fileName === "string") {
        const ext = fileName.split(".").pop()?.toLowerCase() || "";
        if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
          return errorResponse(`অননুমোদিত ফাইল এক্সটেনশন: .${ext}। শুধুমাত্র PDF, ছবি এবং টেক্সট ফাইল সমর্থিত।`, 400);
        }
      }

      // Validate fileData size
      if (fileData && typeof fileData === "string") {
        if (fileData.length > 8 * 1024 * 1024) {
          return errorResponse("ফাইলের সাইজ অনেক বড়। সর্বোচ্চ ৮MB ফাইল অনুমোদিত।", 400);
        }
      }

      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      // Build user message content
      const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

      if (fileData && typeof fileData === "string") {
        userContent.push({
          type: "image_url",
          image_url: { url: fileData },
        });
      }

      const lastUserMsg = Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.content || "এই ফাইলটি বিশ্লেষণ করো।"
        : "এই ফাইলটি বিশ্লেষণ করো।";

      userContent.push({ type: "text", text: String(lastUserMsg).slice(0, 4000) });

      const systemPrompt = `তুমি "জ্ঞানচর্চা'লয়" এর বিশ্বস্ত AI শিক্ষামূলক সহকারী। তুমি বাংলায় শিক্ষার্থীদের ফাইল ও বিষয়বস্তু সহজে বুঝিয়ে দাও।`;

      const recentHistory = Array.isArray(messages)
        ? messages.slice(0, -1).slice(-10).map((m: any) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: typeof m.content === "string" ? m.content.slice(0, 2000) : "",
          }))
        : [];

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: userContent },
      ];

      // Source 1: Lovable AI (multimodal)
      if (LOVABLE_API_KEY) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 35000);

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: apiMessages,
              stream: true,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return new Response(response.body, {
              headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
              },
            });
          }
        } catch (e) {
          console.warn("Lovable AI file processing failed, falling back:", e);
        }
      }

      // Source 2: Direct Gemini API fallback
      if (GEMINI_API_KEY) {
        try {
          const geminiContents = apiMessages.map((m) => {
            if (typeof m.content === "string") {
              return {
                role: m.role === "system" ? "user" : m.role,
                parts: [{ text: m.content }],
              };
            }
            const parts = m.content.map((c) => {
              if (c.type === "text") return { text: c.text || "" };
              if (c.type === "image_url" && c.image_url?.url) {
                const dataUrl = c.image_url.url;
                const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
                if (match) {
                  return { inline_data: { mime_type: match[1], data: match[2] } };
                }
              }
              return { text: "" };
            });
            return {
              role: m.role === "system" ? "user" : m.role,
              parts,
            };
          });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: geminiContents }),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "ফাইল বিশ্লেষণ সম্পন্ন হয়েছে।";
            const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
            return new Response(sseData, {
              headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
              },
            });
          }
        } catch (e) {
          console.warn("Gemini API fallback failed:", e);
        }
      }

      return errorResponse("ফাইল প্রসেস করা সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।", 500);
    } catch (e) {
      console.error("process-file error:", e);
      return errorResponse(e instanceof Error ? e.message : "অপ্রত্যাশিত ত্রুটি ঘটেছে।", 500);
    }
  })
);

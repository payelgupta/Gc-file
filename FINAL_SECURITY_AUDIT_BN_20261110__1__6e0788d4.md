# Gyan Prakasha Path — Final Local Security Patch & Audit Report

**তারিখ:** ১০ নভেম্বর ২০২৬  
**পরিধি:** সরবরাহকৃত ZIP-এর Local Source Code  
**Production পরিবর্তন:** করা হয়নি  
**Live Supabase migration/deployment:** করা হয়নি  
**সামগ্রিক অবস্থা:** Local patch প্রস্তুত; Staging verification ও legacy-data remediation বাকি

---

## 1. এই প্যাকেজে সংশোধিত বিষয়

| ক্ষেত্র | পরিবর্তন | অবস্থা |
|---|---|---|
| Chatbot Prompt Injection | Client-provided `system` role আর গ্রহণ করা হয় না; system prompt server-side | Local source fixed |
| Admin Authentication | Session ও admin role check শেষ না হওয়া পর্যন্ত loading; stale async role result উপেক্ষা | Local source fixed |
| Supabase Environment | Placeholder URL/key fallback বাদ; missing/invalid config-এ fail-fast error | Local source fixed |
| Edge Function URL | Supabase config-এর একই validated values ব্যবহার | Local source fixed |
| Admin Unlock Counter | ভুল `unlock_requests` টেবিলের বদলে `pdf_unlock_requests` | Local source fixed |
| Paid PDF Storage | নতুন `premium-pdfs` private bucket; admin-only write/list policy | Migration added; not deployed |
| Paid PDF Delivery | অনুমোদিত শিক্ষার্থী বা Admin-এর জন্য server-side approval check ও ৩০ মিনিটের signed URL | Edge Function added; not deployed |
| Paid PDF Upload UI | Paid toggle চালু থাকলে private bucket-এ PDF upload; public URL দিয়ে paid save block | Local source fixed |
| Public Upload Security | `uploads` bucket-এর public read অক্ষত; insert/update/delete শুধু Admin | Migration added; not deployed |
| Chapter Visibility | Parent post unpublished হলে public chapter read বন্ধ | Migration added; not deployed |
| File Processing | MIME allowlist, data URL/MIME matching, bounded payload; raw text আর image হিসেবে পাঠানো হয় না | Local source fixed |
| PDF Processing | PDF-কে OpenAI-compatible image endpoint-এ পাঠানো বন্ধ; Gemini native inline data path | Local source fixed; provider test pending |
| Rate Limit | Chat admin limit-এর অতিরিক্ত multiplier ঠিক করা | Local source fixed |
| IP Rate Limit Key | `X-Forwarded-For`-এর প্রথম caller-controlled hop-এর বদলে শেষ hop নেওয়া | Local source fixed |
| Typecheck Script | Root solution-এর প্রকৃত project references build করার জন্য `tsc -b` | Local source fixed |
| Security Tests | Private bucket, storage policy ও chapter policy-র জন্য ৫টি pgTAP assertion যোগ | Test source updated; DB run pending |

## 2. নতুন ফাইল

- `supabase/migrations/20261110000000_production_security_hardening.sql`
- `supabase/functions/get-premium-pdf/index.ts`
- `FINAL_SECURITY_AUDIT_BN_20261110.md`

## 3. পরিবর্তিত গুরুত্বপূর্ণ ফাইল

- `supabase/functions/chat/index.ts`
- `supabase/functions/process-file/index.ts`
- `supabase/functions/_shared/security.ts`
- `supabase/config.toml`
- `src/hooks/useAuth.tsx`
- `src/integrations/supabase/client.ts`
- `src/lib/edgeFunctions.ts`
- `src/pages/admin/AdminPosts.tsx`
- `src/pages/admin/AdminHome.tsx`
- `src/components/premium/PremiumUnlock.tsx`
- `src/pages/StudentDashboard.tsx`
- `supabase/tests/database_security.test.sql`
- `package.json`, `.env.example`, `README.md`

## 4. Production-এ যাওয়ার আগে অবশ্যই করণীয়

### A. পুরোনো Paid PDF

আগের `uploads` public bucket-এ থাকা Paid PDF ফাইলগুলো এই Local patch স্বয়ংক্রিয়ভাবে স্থানান্তর করে না। পুরোনো public URL সরাসরি খোলা সম্ভব থাকতে পারে। প্রতিটি পুরোনো Paid PDF Admin Panel দিয়ে নতুন করে upload করতে হবে—Paid toggle চালু রেখে—যাতে তা `premium-pdfs` private bucket-এ যায়। তারপর পুরোনো public object মুছে ফেলা বা public access প্রত্যাহারের পরিকল্পনা করতে হবে।

### B. Supabase Staging Setup

1. Staging project-এ `VITE_SUPABASE_URL` এবং `VITE_SUPABASE_PUBLISHABLE_KEY` সেট করুন।
2. Edge Function secrets হিসেবে `SUPABASE_SERVICE_ROLE_KEY` এবং ব্যবহৃত AI provider-এর secret configure করুন। Service role key কখনো `VITE_` variable বা client bundle-এ রাখা যাবে না।
3. Staging-এ নতুন migration apply করুন।
4. `get-premium-pdf` Edge Function deploy করুন।
5. Admin, approved student, pending student, anonymous visitor এবং expired URL—সব access case পরীক্ষা করুন।

### C. AI Provider ও $0 Budget

এই প্যাচ কোনো AI provider-এর free quota, availability বা uptime নিশ্চিত করে না। Lovable AI, OpenRouter, Gemini, Hugging Face ও Pollinations-এর বর্তমান API key, rate limit, endpoint support এবং Terms আলাদাভাবে যাচাই করতে হবে। Video generation এখনো বিশেষভাবে অনিশ্চিত; সফল response, actual playable video এবং বড় output-এর আচরণ Live/Staging test ছাড়া নিশ্চিত নয়।

### D. Dependency Lockfile

মূল ZIP-এ `bun.lock` নামে ০-byte ফাইল ছিল; এটি কার্যকর dependency lockfile নয়। এটি সরানো হয়েছে। npm lockfile তৈরি করার চেষ্টা করা হলেও dependency resolution সময়সীমার মধ্যে শেষ হয়নি। Deployment-এর package manager নির্বাচন করে প্রকৃত lockfile generate ও commit করতে হবে।

## 5. যাচাইয়ের ফলাফল

| পরীক্ষা | ফলাফল | ব্যাখ্যা |
|---|---|---|
| Changed TS/TSX syntax transpilation | PASS | সংশোধিত ১১টি TypeScript/TSX ফাইলে syntax diagnostics পাওয়া যায়নি |
| Full TypeScript project build | BLOCKED | `node_modules` নেই; `vitest/globals`, `vite`, `@vitejs/plugin-react-swc`, `lovable-tagger` ইত্যাদি dependency অনুপস্থিত |
| ESLint | NOT RUN | Dependencies install হয়নি |
| Vitest | NOT RUN | Dependencies install হয়নি |
| Vite production build | NOT RUN | Dependencies install হয়নি |
| Supabase pgTAP | NOT RUN | Supabase CLI/DB connection উপলব্ধ ছিল না |
| Migration execution | NOT RUN | User instruction অনুযায়ী Production-এ কোনো পরিবর্তন নয়; Staging credentials-ও দেওয়া হয়নি |
| AI provider live test | NOT RUN | Provider secrets/credentials ব্যবহার করা হয়নি |
| Browser/mobile E2E | NOT RUN | Live/Staging browser test হয়নি |

## 6. গুরুত্বপূর্ণ সীমাবদ্ধতা ও অবশিষ্ট ঝুঁকি

- Migration ও Edge Function শুধু ZIP-এ যোগ করা হয়েছে; Hosted Supabase-এ চালানো হয়নি।
- Legacy public Paid PDF-গুলো পুনরায় upload না করা পর্যন্ত পুরোনো URL-এর exposure থাকতে পারে।
- `get-premium-pdf` কাজ করতে Staging/Production Edge Function environment-এ `SUPABASE_SERVICE_ROLE_KEY` secret থাকতে হবে।
- Payment TrxID যাচাই এখনও manual admin approval workflow; এটি কোনো automatic payment-provider verification নয়।
- AI image/video provider availability ও $0 quota নিশ্চিত নয়।
- Dependency install না হওয়ায় full build, lint ও unit test ফলাফল অজানা।
- ZIP-এ থাকা অন্যান্য third-party services ও browser/device compatibility সম্পূর্ণ E2E-তে পরীক্ষা করা হয়নি।

## 7. নিরাপদ Rollout Recommendation

**এই প্যাকেজকে Production-ready বলে ঘোষণা করা হচ্ছে না।** প্রথমে Staging-এ migration, function deploy, legacy paid PDF re-upload, RLS/storage tests, TypeScript, lint, Vitest, production build এবং browser/mobile tests সম্পন্ন করতে হবে। সব পরীক্ষা সফল হলে আলাদা Production rollout approval নিতে হবে।

**Production status:** Unchanged. কোনো live website, live database, production storage বা production secret পরিবর্তন করা হয়নি।

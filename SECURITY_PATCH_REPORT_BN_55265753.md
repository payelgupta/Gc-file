# Gyan Prakasha Path — Local Security Patch Report

তারিখ: 2026-11-05

## Scope
এই প্যাচটি সংযুক্ত ZIP-এর লোকাল কপি থেকে তৈরি। মূল ZIP অপরিবর্তিত। কোনো Supabase project, production database, migration বা Edge Function deploy করা হয়নি।

## পরিবর্তন
1. `supabase/functions/chat/index.ts`
   - Client-provided `system`/`developer`/`tool` role বাদ; কেবল user/assistant history গ্রহণ।
   - Public ও verified-admin system prompt পৃথক।
   - Gemini 2.5 Flash primary এবং OpenRouter `meta-llama/llama-3.3-70b-instruct:free` fallback।
   - সর্বোচ্চ দুই provider attempt, প্রতি attempt-এ 22s timeout এবং 45s global deadline (streaming body-সহ)।
   - Secret কেবল Edge Function environment থেকে পড়া হয়: `GEMINI_API_KEY`, `OPENROUTER_API_KEY`।
2. `src/components/admin/SuperIntelligentAI.tsx`
   - AI command parser action/table/data shape যাচাই করে।
   - Update-এ target UUID বাধ্যতামূলক।
   - Database mutation-এর একমাত্র পথ `admin_execute_command` RPC; RPC ব্যর্থ হলে direct table-write fallback নেই।
   - Site/theme settings-এর secret-like key নিষিদ্ধ।
3. `supabase/migrations/20261105000000_admin_ai_command_hardening.sql`
   - Server-side authenticated admin role verification।
   - Table/action/column allowlist; secret-key protection; missing update target হলে exception।
   - Notices, posts, photo_gallery এবং settings-এর অনুমোদিত operation implement করা হয়েছে। নতুন post সর্বদা draft।
4. Admin AI settings screen ও README-তে current routing এবং secret configuration বিষয়ে স্পষ্টীকরণ।
5. `typecheck` npm script সংশোধন: এখন app ও node TypeScript project দুটিই নির্দিষ্টভাবে check করবে।

## Validation
- ZIP CRC/integrity: PASS (original archive test; 159 entries)
- TypeScript/TSX transpile syntax checks for changed files: PASS
- Full npm install: timed out in execution environment
- Full Vite production build: NOT RUN
- Vitest: NOT RUN
- PostgreSQL migration execution/pgTAP: NOT RUN
- Gemini/OpenRouter live API test: NOT RUN (no API credentials supplied)
- Production deployment/database migration: NOT PERFORMED

## Required before production
1. Review and apply the new migration only after explicit owner approval and backup.
2. Set `GEMINI_API_KEY` and `OPENROUTER_API_KEY` in Supabase Edge Function Secrets. Do not put them in `VITE_` variables or client-visible files.
3. Deploy the updated `chat` Edge Function only after approval.
4. Run npm install, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` in a network-enabled development environment.
5. Run authenticated admin/non-admin RPC tests and live provider failover tests.
6. Verify Image Generation, Video Generation, file processing, authentication, RLS, and existing UI flows in staging before production.

## Important caveat
OpenRouter free-model availability, rate limits, and provider response compatibility can change. The fallback is configured in code but has not been live-verified. Image/video generation and file processing were intentionally not rewritten in this patch to avoid changing their existing behavior; they still require separate live verification.

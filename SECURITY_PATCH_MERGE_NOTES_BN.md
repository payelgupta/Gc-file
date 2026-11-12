# Gyan Prakasha Path — Security Patch Merge Notes

তারিখ: ১০ নভেম্বর ২০২৬

## Merge-এর ভিত্তি
- Original ZIP: `gyan-prakasha-path (1).zip` — authoritative base
- Security patch ZIP: `Gyan-Prakasha-Path-Updated-Security-Patch-2026-11-10.zip`
- Patch-এর ফাইলগুলো Original Project-এর ওপর overlay করা হয়েছে; Original-এর অন্য ফাইলগুলো অক্ষত রাখা হয়েছে।
- `bun.lock` Original Project থেকে রাখা হয়েছে।

## Merge করা গুরুত্বপূর্ণ ফাইল
- `supabase/migrations/20261110000000_production_security_hardening.sql` (নতুন)
- `supabase/functions/get-premium-pdf/index.ts` (নতুন)
- `supabase/config.toml`
- `supabase/functions/chat/index.ts`
- `supabase/functions/process-file/index.ts`
- `supabase/functions/_shared/security.ts`
- `src/hooks/useAuth.tsx`
- `src/components/premium/PremiumUnlock.tsx`
- `src/pages/admin/AdminPosts.tsx`
- `src/pages/admin/AdminHome.tsx`
- `src/pages/StudentDashboard.tsx`
- `src/integrations/supabase/client.ts`
- `src/lib/edgeFunctions.ts`
- `supabase/tests/database_security.test.sql`
- `package.json`

## অতিরিক্ত Hardening
- Premium PDF endpoint এখন পোস্টটি আছে কি না, `is_paid` সক্রিয় কি না এবং সাধারণ ব্যবহারকারীর জন্য পোস্টটি প্রকাশিত কি না যাচাই করে।
- পোস্ট Free করা হলে বা PDF সরানো হলে `premium_files`-এর পুরোনো metadata সরানোর trigger logic যোগ করা হয়েছে।
- `pdf_url = 'premium'` sentinel থাকলে corresponding private metadata না থাকলে migration trigger save প্রত্যাখ্যান করবে।

## নিরাপত্তা ও Deployment সীমা
- এই ZIP-এ থাকা Migration শুধু Local Source-এ আছে; কোনো Supabase Project-এ চালানো হয়নি।
- কোনো Edge Function Deploy করা হয়নি।
- কোনো Production Database, Storage Bucket, Secret বা Website পরিবর্তন করা হয়নি।
- পুরোনো Public `uploads`-এ থাকা Paid PDF স্বয়ংক্রিয়ভাবে Private হয় না; Staging-এ নতুন `premium-pdfs` bucket-এ re-upload এবং যাচাই প্রয়োজন।

## Verification Status
- ZIP extraction/integrity: PASS.
- Original source file preservation: PASS (Original files retained; patch files overlaid).
- Full TypeScript/Lint/Vitest/Build after merge: NOT RUN in this environment; dependency installation timed out.
- Google AI Studio audit results previously supplied by user (41/41 tests, typecheck, lint, build PASS) were for the pre-merge root source, so they are NOT evidence that this merged ZIP passes those tests.
- Supabase RLS/pgTAP and live AI generation: BLOCKED / NOT RUN; requires a separate Staging environment and secrets.

## Production Readiness
NOT READY until the merged ZIP passes Typecheck, Lint, Vitest, Build and Staging Supabase verification, including Storage RLS, signed URL authorization, approved/unapproved user access, and legacy-file migration checks.

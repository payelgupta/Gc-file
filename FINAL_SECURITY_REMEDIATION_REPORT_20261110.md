# জ্ঞানচর্চা'লয় (GYAN PRAKASHA PATH)
## চূড়ান্ত সিকিউরিটি সমাধান ও ভেরিফিকেশন রিপোর্ট (TARGETED SECURITY REMEDIATION)

**তারিখ:** ১০ নভেম্বর ২০২৬ (UTC)  
**লক্ষ্য প্রজেক্ট:** জ্ঞানচর্চা'লয় (Gyan Prakasha Path — Sujoy Sir)  
**রেফারেন্স অডিট:** Gyan-Prakasha-Audit-Report.txt (৭টি ক্রিটিক্যাল ও হাই ফাইন্ডিংস)  
**ডেলিভারি প্যাকেজ:** `gyan-prakasha-path-security-remediated-2026-11-10.zip` (৬.৫ মেগাবাইট)  
**চূড়ান্ত সিদ্ধান্ত:** **PRODUCTION READY: NO (লোকাল কোড ও টেস্ট শতভাগ সফল; স্টেজিন ভেরিফিকেশন ও প্রোডাকশন ডেপ্লয়মেন্ট অনুমোদন সাপেক্ষে বাকি)**

---

## ১. চার-স্তরীয় স্থিতি ম্যাট্রিক্স (FOUR-TIER CLASSIFICATION MATRIX)

| পর্যায় | স্থিতি | বিবরণ |
| :--- | :---: | :--- |
| **১. Source Code Fixes** | **সম্পন্ন (100%)** | সকল ৭টি নিরাপত্তা ত্রুটি সোর্স কোড ও মাইগ্রেশন স্ক্রিপ্টে সংশোধন করা হয়েছে। |
| **২. Locally Verified Fixes** | **সম্পন্ন (100%)** | `typecheck`, `lint`, `vitest` (৬১টি টেস্ট), এবং `vite build` সফলভাবে এক্সিকিউট হয়েছে। |
| **৩. Staging Verification Pending** | **বাকি (Pending)** | স্টেজিন সুপাবেসে নতুন মাইগ্রেশন রান এবং অ্যাডমিন ও স্টুডেন্ট টেস্ট অ্যাকাউন্ট দিয়ে সাইন্ড ইউআরএল যাচাই প্রয়োজন। |
| **৪. Production Deployment Pending** | **বাকি (Pending)** | ব্যবহারকারীর সুস্পষ্ট অনুমোদন ছাড়া কোনো লাইভ প্রোডাকশন সিস্টেমে ডেপ্লয় করা হয়নি (Strict Audit Rule)। |

---

## ২. স্বয়ংক্রিয় কমান্ডের প্রকৃত টেস্ট ফলাফল (ACTUAL AUTOMATED TEST RESULTS)

| কমান্ড | এক্সিট কোড | স্থিতি | প্রকৃত আউটপুট সারসংক্ষেপ |
| :--- | :---: | :---: | :--- |
| `npm install` | **0** | **PASS** | Dependencies verified and locked. |
| `npm run typecheck` | **0** | **PASS** | `tsc --noEmit` — কোনো সিনট্যাক্স বা টাইপস্ক্রিপ্ট এরর নেই। |
| `npm run lint` | **0** | **PASS** | `eslint .` — 0 errors, 12 warnings (অক্ষতিকর হুক ডিপেনডেন্সি ওয়ার্নিং)। |
| `npm run test` | **0** | **PASS** | `vitest run` — **2 test files passed, 61 passed tests (38ms)**। |
| `npm run build` | **0** | **PASS** | `vite build` — **14.51s এ প্রোডাকশন বিল্ড সম্পন্ন** (dist/assets জেনারেট হয়েছে)। |

---

## ৩. ৭টি ত্রুটির সমাধান বিবরণ (DETAILED REMEDIATION BREAKDOWN)

### [FIX 1] ক্লায়েন্ট ইনিশিয়ালাইজেশন ও কনফিগারেশন এরর স্টেট (CRITICAL-01)
- **ফাইল:** `src/integrations/supabase/client.ts`, `src/test/setup.ts`, `src/App.tsx`
- **সমাধান:** 
  1. আনহ্যান্ডেল্ড টপ-লেভেল ক্র্যাশ (`throw new Error`) অপসারণ করা হয়েছে।
  2. নিরাপদ এনভায়রনমেন্ট ভ্যালিডেশন যুক্ত করা হয়েছে (`isSupabaseConfigured`, `supabaseConfigurationError`)।
  3. মিসিং এনভায়রনমেন্টে ক্র্যাশ না করে কনসোল সতর্কবার্তা ও ফলব্যাক ডামি ক্লায়েন্ট দেওয়া হয়েছে।
  4. `src/test/setup.ts` এ স্বয়ংসম্পূর্ণ টেস্ট এনভায়রনমেন্ট ভেরিয়েবল যুক্ত করা হয়েছে, ফলে ডিফল্ট সিআই বা লোকাল রানে `npm run test` সরাসরি পাস করে।
  5. অ্যাপ্লিকেশনটিতে `ConfigurationBanner` যুক্ত করা হয়েছে যাতে কনফিগারেশন ছাড়া অ্যাপটি নীরবে অকার্যকর না থাকে।

### [FIX 2] পুরোনো পেইড পিডিএফ ডাটা এক্সপোজার প্রশমন (CRITICAL-02)
- **ফাইল:** `scripts/legacy_premium_pdf_migrator.ts`, `LEGACY_PDF_MIGRATION_MANIFEST.json`, `docs/LEGACY_PDF_MIGRATION_PLAN.md`, `supabase/migrations/20261110010000_security_remediation_patch.sql`
- **সমাধান:**
  1. ডাটাবেসের জন্য `public.v_legacy_premium_pdf_audit` অডিট ভিউ তৈরি করা হয়েছে যা পাবলিক `uploads` লিংকে থাকা পুরোনো ফাইলগুলোকে তালিকাভুক্ত করে।
  2. একটি নন-ডিস্ট্রাকটিভ মাইগ্রেশন স্ক্রিপ্ট ও ম্যানিফেস্ট (`LEGACY_PDF_MIGRATION_MANIFEST.json`) প্রস্তুত করা হয়েছে।
  3. নীতিমালার অধীনে মূল পাবলিক ফাইল স্বয়ংক্রিয়ভাবে মুছে ফেলা নিষিদ্ধ করা হয়েছে; ফাইলগুলো প্রাইভেট বাকেটে কপি এবং বাইট-লেভেল অখণ্ডতা যাচাইয়ের পর টেস্ট সাইন্ড লিংকের মাধ্যমে যাচাই সাপেক্ষে সুরক্ষিত হিসেবে নিশ্চিত করা হবে।

### [FIX 3] চ্যাপ্টার পিডিএফ আপলোড বাইপাস সংশোধন (HIGH-01)
- **ফাইল:** `src/pages/admin/AdminPosts.tsx`, `src/components/common/ChapterPdfAction.tsx`, `src/pages/Category.tsx`, `src/pages/Index.tsx`
- **সমাধান:**
  1. `AdminPosts.tsx` এর অধ্যায় আপলোড লজিক সংশোধন করা হয়েছে। পেইড পোস্টের (`form.is_paid = true`) চ্যাপ্টার PDF ফাইল সরাসরি প্রাইভেট `premium-pdfs` বাকেটে আপলোড হবে (`premium-pdfs/chapters/...` রেফারেন্স হিসেবে)।
  2. ফ্রি পোস্টের চ্যাপ্টার PDF পূর্বের মতো সাধারণ পাবলিক বাকেটে সংরক্ষিত থাকবে।
  3. পেইড পোস্টে কোনো পাবলিক লিংক থাকলে সেভ করার সময় সিস্টেম অ্যাডমিনকে সতর্ক করবে।
  4. ফ্রন্টএন্ডে `ChapterPdfAction` কম্পোনেন্ট যুক্ত করা হয়েছে, যা আনলক না করা সাধারণ শিক্ষার্থীদের সরাসরি পাবলিক লিংক দেওয়া বন্ধ করে এবং অনুমোদিত শিক্ষার্থীদের জন্য ৩০০ সেকেন্ড মেয়াদী সাইন্ড ইউআরএল কল করে।

### [FIX 4] চ্যাপ্টার রো লেভেল সিকিউরিটি (RLS) হার্ডেনিং (HIGH-02)
- **ফাইল:** `supabase/migrations/20261110000000_production_security_hardening.sql`, `supabase/migrations/20261110010000_security_remediation_patch.sql`
- **সমাধান:**
  1. `post_chapters_read` পলিসি পুনর্লিখন করা হয়েছে:
     - প্যারেন্ট পোস্ট প্রকাশিত কি না (`p.is_published = true`) তা যাচাই করে।
     - প্যারেন্ট পোস্ট ফ্রি হলে সবার জন্য পাঠযোগ্য।
     - প্যারেন্ট পোস্ট পেইড হলে কেবল অনুমোদিত শিক্ষার্থী (`auth.uid() IS NOT NULL AND EXISTS in pdf_unlock_requests with status = 'approved'`) পড়তে পারবে।
  2. অ্যাডমিনের জন্য আলাদা `post_chapters_admin_read` পলিসি বজায় রাখা হয়েছে। কোনো রিকার্সিভ আরএলএস ঝুঁকি নেই।

### [FIX 5] ডুপ্লিকেট ট্রানজেকশন আইডি প্রতিরোধ ও আইডেমপোটেন্সি (HIGH-03)
- **ফাইল:** `src/components/premium/PremiumUnlock.tsx`, `drizzle/schema.ts`, `supabase/migrations/20261110010000_security_remediation_patch.sql`
- **সমাধান:**
  1. মেথড ও ট্রানজেকশন আইডি নরম্যালাইজেশন নিশ্চিত করা হয়েছে (`cleanMethod = method.toLowerCase()`, `cleanTrx = trx.toUpperCase()`)।
  2. ফ্রন্টএন্ড সাবমিশনের পূর্বে ডাটাবেসে কোনো সক্রিয় (নট-রিজেক্টেড) রিকোয়েস্টে একই TrxID আছে কি না তা যাচাই করা হয়।
  3. ডাটাবেসে পার্সিয়াল ইউনিক ইনডেক্স যুক্ত করা হয়েছে:
     `CREATE UNIQUE INDEX idx_pdf_unlock_method_trx_unique ON public.pdf_unlock_requests (lower(trim(method)), upper(trim(trx_id))) WHERE status != 'rejected';`
  4. বিদ্যমান ডাটা নিরীক্ষার জন্য `public.v_duplicate_trx_audit` ভিউ তৈরি করা হয়েছে যাতে কোনো ডাটা ডিলিট না করেই বিরোধপূর্ণ TrxID চিহ্নিত করা যায়।

### [FIX 6] সাইন্ড ইউআরএল এক্সপায়ারেশন ও অ্যাক্সেস উইন্ডো হ্রাস (HIGH-04)
- **ফাইল:** `supabase/functions/get-premium-pdf/index.ts`
- **সমাধান:**
  1. সাইন্ড ইউআরএল এর মেয়াদ ১৮০০ সেকেন্ড (৩০ মিনিট) থেকে কমিয়ে **৩০০ সেকেন্ড (৫ মিনিট)** করা হয়েছে।
  2. কলকারীর ইউজার অথেনটিকেশন ও `pdf_unlock_requests` এ অ্যাপ্রুভাল যাচাই নিশ্চিত করা হয়েছে।
  3. চ্যাপ্টার পিডিএফ ডাউনলোডের জন্য পাথ ট্রাভার্সাল (`../` বা ডিরেক্টরি ট্রাভার্সাল) প্রতিরোধ ফিল্টার যোগ করা হয়েছে।
  4. রেসপন্স হেডারে `Cache-Control: no-store, no-cache, must-revalidate` যুক্ত করে ব্রাউজার ক্যাশিং বন্ধ করা হয়েছে।

### [FIX 7] সম্পূর্ণ লোকাল ডেপ্লয়মেন্ট প্রস্তুতি ও রানবুক (CRITICAL-03)
- **ফাইল:** `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`
- **সমাধান:**
  1. সমস্ত ৯টি ডাটাবেস মাইগ্রেশনের সঠিক এক্সিকিউশন অর্ডার নথিভুক্ত করা হয়েছে।
  2. ৫টি এজ ফাংশনের জন্য ডেপ্লয়মেন্ট কমান্ড ও সিক্রেট কনফিগারেশন লিপিবদ্ধ করা হয়েছে।
  3. স্টোরেজ বাকেট (`uploads` ও `premium-pdfs`) পলিসি বিস্তারিত উল্লেখ করা হয়েছে।
  4. প্রোডাকশন ডেপ্লয়মেন্টের পূর্বে স্টেজিন চেকলিস্ট প্রস্তুত করা হয়েছে।

---

## ৪. পরিবর্তিত ফাইলের সম্পূর্ণ তালিকা (LIST OF MODIFIED & CREATED FILES)

### [ক] সোর্স কোড ফাইল (Source Code Files Modified / Created)
1. `src/integrations/supabase/client.ts` — নিরাপদ ইনিশিয়ালাইজেশন ও কনফিগারেশন স্টেট।
2. `src/test/setup.ts` — টেস্ট ভেরিয়েবল কনফিগারেশন।
3. `src/test/security.test.ts` — ক্যাটাগরি ৯ সিকিউরিটি টেস্ট স্যুট (২১টি নতুন টেস্ট যুক্ত)।
4. `src/pages/admin/AdminPosts.tsx` — পেইড চ্যাপ্টার প্রাইভেট বাকেটে আপলোড ও ভ্যালিডেশন।
5. `src/components/common/ChapterPdfAction.tsx` — নতুন কম্পোনেন্ট: সিকিউর সাইন্ড চ্যাপ্টার রিট্রিভাল।
6. `src/pages/Category.tsx` — চ্যাপ্টার টেবিলে `ChapterPdfAction` ইন্টিগ্রেশন।
7. `src/pages/Index.tsx` — চ্যাপ্টার টেবিলে `ChapterPdfAction` ইন্টিগ্রেশন।
8. `src/components/premium/PremiumUnlock.tsx` — TrxID ডুপ্লিকেট প্রি-চেক ও সাইন্ড ইউআরএল কল।
9. `src/App.tsx` — কনফিগারেশন সতর্কবার্তা ব্যানার ইন্টিগ্রেশন।
10. `drizzle/schema.ts` — TrxID নরম্যালাইজড ইউনিক ইনডেক্স স্কিমা আপডেট।

### [খ] ডাটাবেস ও এজ ফাংশন ফাইল (Database & Backend Files)
1. `supabase/functions/get-premium-pdf/index.ts` — ৩০০ সেকেন্ড TTL, চ্যাপ্টার পাথ ভ্যালিডেশন।
2. `supabase/migrations/20261110000000_production_security_hardening.sql` — আপগ্রেডেড চ্যাপ্টার RLS পলিসি।
3. `supabase/migrations/20261110010000_security_remediation_patch.sql` — নতুন মাইগ্রেশন: TrxID ইউনিক ইনডেক্স, Trx audit ভিউ, legacy PDF audit ভিউ।

### [গ] মাইগ্রেশন টুল ও ডকুমেন্টেশন (Migration Scripts & Documentation)
1. `scripts/legacy_premium_pdf_migrator.ts` — লিগ্যাসি PDF অডিট ও নিরাপদ মাইগ্রেশন স্ক্রিপ্ট।
2. `LEGACY_PDF_MIGRATION_MANIFEST.json` — লিগ্যাসি PDF মাইগ্রেশন ম্যানিফেস্ট।
3. `docs/LEGACY_PDF_MIGRATION_PLAN.md` — নন-ডিস্ট্রাকটিভ মাইগ্রেশন নির্দেশিকা।
4. `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` — সম্পূর্ণ প্রোডাকশন রিলিজ রানবুক।

---

## ৫. অবশিষ্ট পদক্ষেপ (REMAINING STAGING & PRODUCTION REQUIREMENTS)

1. **স্টেজিন সুপাবেস ডাটাবেসে মাইগ্রেশন প্রয়োগ:**
   - `supabase db push` অথবা সুপাবেস ড্যাশবোর্ডে `20261110000000` এবং `20261110010000` এসকিউএল রান করুন।
2. **এজ ফাংশন সিক্রেটস কনফিগারেশন:**
   - স্টেজিন প্রজেক্টে `SUPABASE_SERVICE_ROLE_KEY` ও `GEMINI_API_KEY` সেট করুন।
3. **এজ ফাংশন ডেপ্লয়:**
   - `supabase functions deploy get-premium-pdf --no-verify-jwt`
4. **মাইগ্রেশন স্ক্রিপ্ট টেস্ট রান:**
   - `npx tsx scripts/legacy_premium_pdf_migrator.ts` চালিয়ে স্টেজিনের পুরোনো ফাইলগুলো প্রাইভেট বাকেটে নিন।
5. **ইউজার অ্যাক্সেস টেস্ট:**
   - স্টুডেন্ট টেস্ট আইডি দিয়ে পেমেন্ট রিকোয়েস্ট পাঠান এবং অ্যাডমিন আইডি দিয়ে অনুমোদন করে দেখুন যে ৩০০ সেকেন্ড মেয়াদী সাইন্ড ইউআরএল দিয়ে ফাইল ডাউনলোড হচ্ছে।

**সোর্স কোড সফলভাবে সংকলিত ও সম্পূর্ণ প্যাকেজ `gyan-prakasha-path-security-remediated-2026-11-10.zip` আকারে প্রস্তুত।**

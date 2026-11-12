# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

# জ্ঞানচর্চা'লয় (Gyan Prakasha Path) — নিরাপত্তা ও সিস্টেম ডকুমেন্টেশন

## ১. ওভারভিউ ও নিরাপত্তা নীতি (Security Overview)
- **বাজেট নীতি**: সম্পূর্ণ $০ (জিরো কস্ট)। কোনো পেইড রেডিস বা থার্ড-পার্টি সাবস্ক্রিপশন নেই। শুধুমাত্র Supabase PostgreSQL ও এজ ফাংশন ব্যবহৃত হয়েছে।
- **আর্কিটেকচার সুরক্ষা**:
  1. এজ ফাংশনে আসল ও সুরক্ষিত `apikey` হেডার এবং ব্যবহারকারী লগইন থাকলে বাস্তব JWT পাঠানো হয়।
  2. সাধারণ ও বেনামী (Anonymous) ব্যবহারকারীদের জন্য AI চ্যাট সম্পূর্ণ সচল রাখা হয়েছে।
  3. সমস্ত AI মিডিয়া জেনারেশন এবং ফাইল প্রসেসিংয়ে রেট লিমিটিং যুক্ত।
  4. প্রম্পট ইনজেকশন দ্বারা ডেটাবেসে অননুমোদিত লেখা সম্পূর্ণ নিষিদ্ধ করা হয়েছে।

---

## ২. এজ ফাংশন নিরাপত্তা ও রেট লিমিট (Rate Limiting Architecture)
PostgreSQL ভিত্তিক অ্যাটমিক কাউন্টার এবং কুলডাউন ব্যবস্থা:

| ফাংশন / এন্ডপয়েন্ট | পাবলিক সীমা | অ্যাডমিন সীমা | কুলডাউন সময় |
|---|---|---|---|
| `chat` | ২০ রিকোয়েস্ট / ৬০ সেকেন্ড | ১০০ রিকোয়েস্ট / ৬০ সেকেন্ড | ১২০ সেকেন্ড |
| `generate-image` | ৫ রিকোয়েস্ট / ৬০ সেকেন্ড | ২৫ রিকোয়েস্ট / ৬০ সেকেন্ড | ১৮০ সেকেন্ড |
| `generate-video` | ৩ রিকোয়েস্ট / ৬০ সেকেন্ড | ১৫ রিকোয়েস্ট / ৬০ সেকেন্ড | ৩০০ সেকেন্ড |
| `process-file` | ১০ রিকোয়েস্ট / ৬০ সেকেন্ড | ৫০ রিকোয়েস্ট / ৬০ সেকেন্ড | ১৮০ সেকেন্ড |

- **নিরাপদ আইপি নিষ্কাশন**: `cf-connecting-ip`, `x-real-ip`, এবং স্যানিটাইজড `x-forwarded-for` থেকে আইপি যাচাই করে সংগ্রহ করা হয়। ক্লায়েন্টের পাঠানো ভুয়া আইপি সরাসরি বাতিল করা হয়।
- **ফাইল ও বডি যাচাই**: সর্বোচ্চ ৮MB ফাইল এবং নির্দিষ্ট MIME টাইপ (`application/pdf`, `image/*`, `text/plain`) ছাড়া অন্য কোনো এক্সিকিউটেবল ফাইল প্রসেস করা হয় না।

---

---

## ৩. AI কমান্ড ইনজেকশন প্রতিরোধ (Zero Autonomous Injection)
- **SuperIntelligentAI.tsx**: AI মডেল থেকে কোনো `[EXECUTE_COMMAND]` আসলে তা সরাসরি ডেটাবেসে রান হয় না।
- স্ক্রিনে একটি হলুদ রঙের **"অ্যাডমিন অনুমোদনের প্রয়োজন" (Admin Approval Required)** প্যানেল প্রদর্শিত হয়।
- অ্যাডমিন নিজে টেবিলের নাম এবং পরিবর্তিত ডেটা দেখে "অনুমোদন করুন" বাটনে ক্লিক করলেই কেবল RLS ও কলাম যাচাই শেষে ডেটাবেসে সেভ হয়।
- `user_roles`, `user_login_activity` টেবিলে কোনো কমান্ড দেওয়া সম্পূর্ণ ব্লকড।

---

## ৩.৫. AI রাউটিং ও মডেল ফলব্যাক আর্কিটেকচার (AI Routing Architecture)
- **Primary Model**: `google/gemini-2.5-flash` (সর্বাধিক নির্ভরযোগ্য এবং দ্রুত প্রতিক্রিয়া)।
- **Fallback Model**: `meta-llama/llama-3.3-70b-instruct:free` অথবা `google/gemini-2.5-flash-lite` (OpenRouter / Lovable Free Gateway)।
- **চেষ্টা সীমা (Max Attempts)**: সর্বোচ্চ ২টি প্রচেষ্টা (Attempt 1: Gemini 2.5 Flash ➔ ব্যর্থ হলে Attempt 2: Free Fallback)।
- **গ্লোবাল সময়সীমা (Global Deadline)**: ৪৫ সেকেন্ড মোট সময়সীমা (AbortController দ্বারা উভয় প্রচেষ্টার মোট সময় ৪৫ সেকেন্ডে সীমাবদ্ধ)।
- **চ্যাটবট বিচ্ছিন্নতা (Role Isolation)**: সাধারণ শিক্ষার্থীদের পাবলিক চ্যাটবটে কোনো কমান্ড বা ডাটাবেস এক্সেস কোড নেই; শুধুমাত্র অনুমোদিত অ্যাডমিন সেশনের জন্য "Gyan AI Core" চালু হয়।

---

## ৪. ডেটাবেস মাইগ্রেশন ও আর্কিটেকচার নির্দেশিকা (Deployment & Rollback)

### মাইগ্রেশন ফাইলসমূহ (Forward-Only Migrations):
1. `supabase/migrations/20260313000000_security_rate_limits.sql`
   - পোস্টগ্রেস ভিত্তিক অ্যাটমিক রেট লিমিটিং (`public.rate_limits`)।
   - `site_settings` টেবিলে গোপন API কী প্রটেকশনে স্ট্রিক্ট হোয়াইটলিস্ট RLS।
   - সার্ভার-ভেরিফায়েড অ্যাডমিন কমান্ড এক্সিকিউশন RPC (`admin_execute_command`)।
2. `supabase/migrations/20260314000000_database_hardening_audit.sql`
   - `public.post_chapters`: ভিডিও/লেকচার চ্যাপ্টারের জন্য সাধারণ রিড ও অ্যাডমিন রাইট RLS এবং ইনডেক্স।
   - `public.premium_files`: সাধারণ authenticated রোলের অপ্রয়োজনীয় INSERT/UPDATE/DELETE সুবিধা বাতিল, `protect_paid_pdf()` ট্রিগারে `search_path = ''` পিন করা, এবং পোস্ট ডিলিট ক্যাসকেড হ্যান্ডলিং।
   - `public.pdf_unlock_requests`: ডুপ্লিকেট ট্রানজ্যাকশন আইডি প্রতিরোধক ইউনিক ইনডেক্স, মেথড ও ফোন নম্বর ভ্যালিডেশন, এবং সার্ভার-সাইড মূল্য নির্ধারণ ট্রিগার (ক্লায়েন্ট কর্তৃক ট্যাম্পারিং প্রতিরোধ)।
   - pgTAP টেস্ট সুইট: `supabase/tests/database_security.test.sql`

### Drizzle বনাম Supabase মাইগ্রেশন ওনারশিপ:
- **Drizzle Kit (`drizzle/schema.ts`, `drizzle.config.ts`)**: Lovable UI এবং TypeScript ফ্রেমওয়ার্কের ডাটা মডেল রেফারেন্স হিসেবে ব্যবহৃত হয়। কোনো ব্লাইন্ড রি-রাইট ছাড়াই `posts`, `premium_files`, `pdf_unlock_requests`, এবং `post_chapters` টেবিল টাইপসেফভাবে সংজ্ঞায়িত।
- **Supabase CLI (`supabase/migrations/`)**: ডাটাবেস নিরাপত্তা, RLS পলিসি, রোল গ্রান্টস, সিকিউরিটি ডেফিনার ট্রিগার এবং ফাংশনালিটির একক বিশ্বস্ত ওনার (Single Source of Truth)।

### প্রয়োগ করার ধাপ (Deployment Steps):
1. Supabase ড্যাশবোর্ডে লগইন করুন: `https://supabase.com/dashboard/project/xxnduecropgyonwoqnfq`
2. বাম পাশের মেনু থেকে **SQL Editor**-এ যান।
3. প্রথমে `supabase/migrations/20260313000000_security_rate_limits.sql` কোড রান করুন।
4. এরপর `supabase/migrations/20260314000000_database_hardening_audit.sql` কোড রান করুন।
5. নিশ্চিত করুন যে সকল টেবিল ও ট্রিগার সফলভাবে তৈরি হয়েছে।

### এজ ফাংশন ডিপ্লয় করার ধাপ:
```sh
supabase functions deploy chat --project-ref xxnduecropgyonwoqnfq
supabase functions deploy generate-image --project-ref xxnduecropgyonwoqnfq
supabase functions deploy generate-video --project-ref xxnduecropgyonwoqnfq
supabase functions deploy process-file --project-ref xxnduecropgyonwoqnfq
```

### নিরাপদ রোলব্যাক নির্দেশিকা (Safe Rollback Instructions):
যদি কোনো কারণে হার্ডেনিং বা রেট লিমিটিং রোলব্যাক করার প্রয়োজন হয়, কোনো ব্যবহারকারীর ডাটা ড্রপ না করে এই স্ক্রিপ্টটি রান করুন:
```sql
-- ১. রেট লিমিট ফাংশন ও টেবিল ড্রপ করুন
DROP FUNCTION IF EXISTS public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.cleanup_expired_rate_limits();
DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP FUNCTION IF EXISTS public.admin_execute_command(TEXT, TEXT, JSONB, UUID);

-- ২. হার্ডেনিং ট্রিগার ড্রপ করুন
DROP TRIGGER IF EXISTS trg_enforce_unlock_integrity ON public.pdf_unlock_requests;
DROP FUNCTION IF EXISTS public.enforce_pdf_unlock_request_integrity();
DROP TRIGGER IF EXISTS trg_cleanup_premium_files ON public.posts;
DROP FUNCTION IF EXISTS public.cleanup_premium_file_on_post_delete();

-- ৩. সাইট সেটিংসের সিক্রেট প্রটেকশন নীতি নিরাপদ রাখা:
-- [সতর্কবার্তা]: পলিসিকে কখনোই USING (true)-তে রূপান্তর করবেন না, কারণ এতে site_settings টেবিলে থাকা গোপন AI API কী উন্মুক্ত হয়ে যাবে।
DROP POLICY IF EXISTS "Public can read approved public site settings" ON public.site_settings;
CREATE POLICY "Public can read approved public site settings" ON public.site_settings
  FOR SELECT USING (
    key IN (
      'site_name', 'site_subtitle', 'hero_title', 'hero_subtitle', 'hero_badge',
      'hero_bg_image', 'hero_button_text', 'hero_button_link',
      'footer_developer', 'contact_email', 'contact_phone',
      'social_facebook', 'social_youtube', 'social_telegram',
      'header_logo', 'show_gallery', 'gallery_columns',
      'ad_text', 'ad_link', 'ad_image',
      'show_analytics_footer',
      'bkash_number', 'nagad_number', 'payment_type', 'notice_board_title'
    )
  );
```




## Production security patch (2026-11-10)

The source package includes a new migration at `supabase/migrations/20261110000000_production_security_hardening.sql` and a `get-premium-pdf` Edge Function. These are **local source changes only**; they have not been applied to any hosted Supabase project. Review and apply the migration to a staging project first.

- Paid PDFs uploaded after this patch must be uploaded while the Paid PDF toggle is enabled. They are stored in the private `premium-pdfs` bucket and delivered through a 30-minute signed URL after the server verifies the caller's approval (admins are allowed).
- Existing paid PDF files previously stored in the public `uploads` bucket are **not automatically made private**. Re-upload each existing paid PDF using the admin editor with the Paid PDF toggle enabled, then verify its old public URL is no longer referenced. Public objects cannot be made private merely by changing the database row.
- Existing public `uploads` remains public for public images and free resources, but writes are restricted to admins by the new migration.
- The new Edge Function requires the Supabase `SUPABASE_SERVICE_ROLE_KEY` secret. Never expose that key in `VITE_` variables or client code.
- The client now fails fast when `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` is missing. Configure both before running or building.
- The original archive contained a zero-byte `bun.lock`, which is not a valid dependency lockfile; it has been removed. Generate and commit a real lockfile with the package manager selected for deployment.
- `post_chapters` public reads are restricted to chapters whose parent post is published.

### Safe rollout sequence

1. Configure the required environment variables and Edge Function secrets in a **staging** Supabase project.
2. Apply the new migration to staging; do not run it against production until you explicitly approve.
3. Deploy the `get-premium-pdf` Edge Function to staging.
4. Re-upload legacy paid PDFs to the private bucket and test student/admin access, denied access, and expired signed URLs.
5. Run `supabase/tests/database_security.test.sql`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
6. Only after staging passes, prepare a separate production rollout plan.

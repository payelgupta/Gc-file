# জ্ঞানচর্চা'লয় (GYAN PRAKASHA PATH)
## সম্পূর্ণ প্রোডাকশন ডেপ্লয়মেন্ট গাইড ও রেডিলাইনস ডকুমেন্টেশন (Fix 7)

**নথি সংস্করণ:** ২০২৬.১১.১০ (Production Ready Deployment Playbook)  
**নিরাপত্তা পর্যায়:** Local Remediation Verified — Deployment Pending Staging Validation  
**গুরুত্বপূর্ণ নির্দেশিকা:** কোনো লাইভ প্রোডাকশন সিস্টেমে সরাসরি পরিবর্তন করবেন না। প্রথমে স্টেজিন (Staging) পরিবেশে পরীক্ষা নিশ্চিত করুন।

---

### ১. প্রয়োজনীয় এনভায়রনমেন্ট ভেরিয়েবল (Required Environment Variables)

#### [ক] ফ্রন্টএন্ড ক্লায়েন্ট (Frontend Web App / Vercel / Cloud Run / Hosting)
এই ভেরিয়েবলগুলো বিল্ড ও রানটাইমে ক্লায়েন্ট ব্রাউজারে ইনজেক্ট হবে (VITE_ প্রিফিক্স যুক্ত):
| ভেরিয়েবল নাম | উদাহরণ / বিবরণ | সংবেদনশীলতা |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | পাবলিক (HTTPS বাধ্যতামূলক) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOi...` (Supabase Anon/Publishable Key) | পাবলিক |

#### [খ] সুপাবেস এজ ফাংশন সিক্রেটস (Supabase Edge Functions Secrets)
সুপাবেস সিএলআই দিয়ে নিচের সিক্রেটগুলো কনফিগার করুন:
```bash
supabase secrets set \
  SUPABASE_URL="https://your-project-id.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJh...<SERVICE_ROLE_SECRET>" \
  GEMINI_API_KEY="AIzaSy...<GEMINI_KEY>" \
  OPENROUTER_API_KEY="sk-or-...<OPTIONAL_FALLBACK_KEY>"
```
*সতর্কতা: `SUPABASE_SERVICE_ROLE_KEY` কখনোই ফ্রন্টএন্ড কোডে বা `.env` ফাইলে রাখবেন না।*

---

### ২. ডাটাবেস মাইগ্রেশন ক্রম (Database Migrations Execution Order)

সুপাবেস ডাটাবেসে মাইগ্রেশনগুলো নিচের ক্রমানুসারে রান করতে হবে:

1. `supabase/migrations/20260308210321_48050134-c86c-493b-b147-f6c522645fa6.sql` (Initial Schema)
2. `supabase/migrations/20260308215511_6bc9c933-619f-49dc-98fa-a7d2ca95cd01.sql` (Base tables)
3. `supabase/migrations/20260311080547_cfe9e0a3-d260-4d07-a7ea-1d6e05e362df.sql` (Gallery & Analytics)
4. `supabase/migrations/20260311080602_93170a3d-2cae-43ca-89a7-7b0db93dcb73.sql` (Indexes)
5. `supabase/migrations/20260312093314_03a755e5-c86d-430c-95d0-cf23c38b3664.sql` (Role policies)
6. `supabase/migrations/20260313000000_security_rate_limits.sql` (IP rate limiting tables & check_rate_limit RPC)
7. `supabase/migrations/20260314000000_database_hardening_audit.sql` (Post chapters, premium_files, RLS hardening)
8. `supabase/migrations/20261110000000_production_security_hardening.sql` (Private bucket creation, protect_paid_pdf trigger)
9. `supabase/migrations/20261110010000_security_remediation_patch.sql` (Chapter RLS paid gating, TrxID unique constraint, audit views)

**সিএলআই কমান্ড:**
```bash
supabase db push
```

---

### ৩. স্টোরেজ বাকেট কনফিগারেশন (Storage Bucket Configuration)

| বাকেট আইডি | পাবলিক? | সাইজ লিমিট | অনুমোদিত MIME টাইপ | উদ্দেশ্য |
| :--- | :---: | :--- | :--- | :--- |
| `uploads` | **True** | 8 MB | `image/*`, `application/pdf` | পাবলিক ছবি, লোগো, ফ্রি হ্যান্ডনোট |
| `premium-pdfs` | **False** (প্রাইভেট) | 20 MB | `application/pdf` | পেইড প্রিমিয়াম কোর্স হ্যান্ডনোট ও পেইড চ্যাপ্টার |

---

### ৪. স্টোরেজ অ্যাক্সেস ও সিকিউরিটি পলিসি (Storage Access Policies)

1. **`uploads` বাকেট:**
   - রিড: যে কেউ (Public/Anon) পড়তে পারে।
   - রাইট/আপডেট/ডিলিট: শুধুমাত্র অ্যাডমিন (`public.has_role(auth.uid(), 'admin')`)।
2. **`premium-pdfs` বাকেট:**
   - ডিরেক্ট পাবলিক রিড: **সম্পূর্ণ নিষিদ্ধ (403 Forbidden)**।
   - অ্যাডমিন ডিরেক্ট ম্যানেজমেন্ট: অনুমোদিত।
   - ছাত্রছাত্রীদের অ্যাক্সেস: কেবলমাত্র `get-premium-pdf` এজ ফাংশন কর্তৃক ইস্যুকৃত **৩০০ সেকেন্ড (৫ মিনিট) মেয়াদী সাইন্ড ইউআরএল** এর মাধ্যমে।

---

### ৫. এজ ফাংশন ডেপ্লয়মেন্ট (Edge Function Deployment)

নিচের কমান্ডগুলো দিয়ে ফাংশনগুলো ডেপ্লয় করুন:
```bash
# ১. প্রিমিয়াম পিডিএফ ডেলিভারি ফাংশন (৩০০ সেকেন্ড সাইন্ড ইউআরএল, অথ ও পেমেন্ট যাচাইকারী)
supabase functions deploy get-premium-pdf --no-verify-jwt

# ২. এআই চ্যাটবট (সিস্টেম প্রম্পট ইনজেকশন প্রোটেকশন ও ফলব্যাক রাউটার সহ)
supabase functions deploy chat --no-verify-jwt

# ৩. ইমেজ জেনারেশন
supabase functions deploy generate-image --no-verify-jwt

# ৪. ভিডিও জেনারেশন
supabase functions deploy generate-video --no-verify-jwt

# ৫. ফাইল প্রসেসিং (Gemini Native Inline Multimodal)
supabase functions deploy process-file --no-verify-jwt
```
*(নোট: `--no-verify-jwt` দেওয়া হলেও ফাংশন কোডের মধ্যে `withSupabase({ auth: "required" })` দ্বারা কঠোরভাবে অথেনটিকেশন চেক প্রয়োগ করা হয়েছে।)*

---

### ৬. পুরোনো পেইড পিডিএফ মাইগ্রেশন রানবুক (Legacy PDF Migration Runbook)

1. স্টেজিনে ডেটাবেস ভিউ চেক করুন:
   ```sql
   SELECT * FROM public.v_legacy_premium_pdf_audit;
   ```
2. মাইগ্রেশন অডিট রান করুন:
   ```bash
   npx tsx scripts/legacy_premium_pdf_migrator.ts
   ```
3. প্রস্তুতকৃত `LEGACY_PDF_MIGRATION_MANIFEST.json` ফাইলটি পরীক্ষা করুন।
4. ফাইল প্রাইভেট বাকেটে কপি সম্পন্ন হওয়ার পর প্রতিটি টেস্ট লিংকে সাইন্ড ইউআরএল পরীক্ষা করুন।
5. মূল ফাইলগুলো অবিলম্বে মুছে ফেলবেন না; ৩০ দিনের ট্রানজিশন পিরিয়ড নিশ্চিত করুন।

---

### ৭. গো-লাইভ সাইন-অফ চেকলিস্ট (Pre-Release Sign-Off Checklist)

- [ ] লোকাল টেস্ট স্যুট (`npm run test`) সম্পূর্ণ পাস করেছে।
- [ ] টাইপচেক (`npm run typecheck`) ও লিন্ট (`npm run lint`) সফল হয়েছে।
- [ ] প্রোডাকশন বিল্ড (`npm run build`) সফল হয়েছে।
- [ ] স্টেজিন সুপাবেসে সব মাইগ্রেশন ও এজ ফাংশন রান হয়েছে।
- [ ] অ্যাডমিন অ্যাকাউন্টে চ্যাপ্টার আপলোড করে দেখা হয়েছে যে পেইড চ্যাপ্টার প্রাইভেট স্টোরেজে যাচ্ছে।
- [ ] ডুপ্লিকেট TrxID সাবমিট করার চেষ্টা করে দেখা হয়েছে যে ডাটাবেস এরর প্রতিরোধ করছে।
- [ ] অনুমোদন ছাড়া পেইড চ্যাপ্টার ডাউনলোড ব্লক হচ্ছে এবং অনুমোদিত ইউজার ৩০০ সেকেন্ড মেয়াদী লিঙ্ক পাচ্ছে।
- [ ] ক্লায়েন্ট এনভায়রনমেন্ট কনফিগারেশনের সতর্কবার্তা সঠিকভাবে কাজ করছে।

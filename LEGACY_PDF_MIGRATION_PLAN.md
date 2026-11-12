# জ্ঞানচর্চা'লয় (Gyan Prakasha Path)
## Legacy Premium PDF Migration & Data Protection Plan (Fix 2)

**Document Version:** 2026.11.10-v1  
**Classification:** Critical Security Operational Blueprint  
**Target Environment:** Staging Supabase -> Production Supabase  
**Authoritative Rule:** Never delete original files automatically; never claim legacy files are secured until signed-URL verification succeeds.

---

### ১. সমস্যার পটভূমি ও ঝুঁকি বিশ্লেষণ (Context & Security Risk)

পূর্ববর্তী অডিটে চিহ্নিত করা হয়েছে যে:
1. প্রজেক্টের সূচনাপর্বে আপলোডকৃত কিছু পেইড হ্যান্ডনোট সরাসরি পাবলিক `uploads` বাকেটে আপলোড করা হয়েছিল।
2. ডেটাবেসের `posts.pdf_url` অথবা `premium_files.file_url` এ সরাসরি পাবলিক URL (যেমন: `https://.../storage/v1/object/public/uploads/pdfs/...`) সংরক্ষিত ছিল।
3. পেইড কোর্সের অধীনে যুক্ত কিছু অধ্যায় (Chapters) এর PDF লিংক সরাসরি পাবলিক স্টোরেজে পয়েন্ট করে রয়েছে।
4. এজ ফাংশন `get-premium-pdf` অনিরাপদ পাবলিক URL সনাক্ত করলে **409 Conflict** রিটার্ন করে যাতে কোনো শিক্ষার্থী ভুলবশত এক্সটার্নাল বা পাবলিক লিংক না পায়।

**প্রভাব:**
- অনুমোদনপ্রাপ্ত বৈধ শিক্ষার্থীরা পুরোনো পেইড PDF ডাউনলোডে সমস্যার সম্মুখীন হতে পারেন।
- পাবলিক বাকেটের সরাসরি লিংক জানা থাকলে যে কেউ কোনো পেমেন্ট ছাড়া ফাইল ডাউনলোড করে নিতে পারত।

---

### ২. নিরাপদ মাইগ্রেশন নীতিমালা (Non-Negotiable Safety Policies)

1. **কোনো স্বয়ংক্রিয় ফাইল ডিলিট নয় (No Auto-Deletion):**
   পাবলিক `uploads` বাকেট থেকে কোনো ফাইল স্বয়ংক্রিয়ভাবে মুছে ফেলা হবে না। ফাইলগুলো ব্যাকআপ হিসেবে অক্ষত থাকবে।
2. **অখণ্ডতা যাচাই (Byte-for-Byte & Checksum Integrity):**
   ফাইল প্রাইভেট বাকেটে কপি করার পর তার সাইজ (Byte Length) এবং SHA-256 চেকসাম হুবহু মিলে যাওয়া নিশ্চিত করতে হবে।
3. **সম্পর্ক অক্ষুণ্ণ রাখা (Preserve Relationships):**
   `post_id`, চ্যাপ্টার ইনডেক্স এবং মূল ফাইলের নাম অবিকৃত থাকবে।
4. **ভেরিফিকেশন সম্পন্ন না হওয়া পর্যন্ত সিকিউরড দাবি নয়:**
   প্রাইভেট বাকেটে নেওয়ার পর `get-premium-pdf` এজ ফাংশন দিয়ে সাইন্ড ইউআরএল তৈরি করে টেস্ট ডাউনলোড সফল হলেই কেবল স্ট্যাটাস `VERIFIED_SECURED` করা হবে।

---

### ৩. পর্যায়ক্রমিক বাস্তবায়ন পদ্ধতি (Step-by-Step Procedure)

#### ধাপ ১: ডেটাবেস অডিট কুয়েরি চালানো
সুপাবেস এসকিউএল এডিটরে নিচের কুয়েরিটি চালান:
```sql
SELECT * FROM public.v_legacy_premium_pdf_audit;
```
এই ভিউটি স্বয়ংক্রিয়ভাবে এমন সমস্ত পোস্ট এবং অধ্যায় তালিকাভুক্ত করবে যেগুলোর ফাইল এখনও পাবলিক বাকেটে রয়ে গেছে।

#### ধাপ ২: মাইগ্রেশন স্ক্রিপ্ট চালানো (Staging First)
লোকাল টার্মিনালে স্টেজিন ক্রেডেনশিয়াল দিয়ে মাইগ্রেশন অডিট রান করুন:
```bash
npx tsx scripts/legacy_premium_pdf_migrator.ts
```
এটি `LEGACY_PDF_MIGRATION_MANIFEST.json` ফাইলে প্রতিটি ফাইলের সোর্স ও টার্গেট পাথ প্রস্তুত করবে।

#### ধাপ ৩: অবজেক্ট কপি ও ডেটাবেস আপডেট
স্ক্রিপ্টটি প্রতিটি চিহ্নিত ফাইলের জন্য:
1. `supabase.storage.from('uploads').download(sourcePath)`
2. `supabase.storage.from('premium-pdfs').upload(targetPath, fileBlob)`
3. ডেটাবেসে পাথ আপডেট:
   - মূল PDF এর জন্য: `INSERT INTO public.premium_files(post_id, file_url) VALUES (post_id, targetPath) ON CONFLICT (post_id) DO UPDATE SET file_url = EXCLUDED.file_url;`
   - পোস্টে `pdf_url = 'premium'` সেট করা।
   - চ্যাপ্টার PDF এর জন্য: `posts.chapters` JSON এ URL টি `premium-pdfs/chapters/...` আকারে আপডেট করা।

#### ধাপ ৪: সাইন্ড ইউআরএল পরীক্ষা ও ভেরিফিকেশন
একটি অনুমোদিত টেস্ট ইউজার আইডি দিয়ে `get-premium-pdf` কল করুন:
```bash
curl -X POST "https://<PROJECT-REF>.supabase.co/functions/v1/get-premium-pdf" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <TEST_STUDENT_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"post_id": "<TARGET_POST_ID>"}'
```
প্রত্যাশা:
- স্ট্যাটাস কোড: **200 OK**
- রেসপন্স: `{"success": true, "signedUrl": "https://...", "expiresIn": 300}`
- প্রাপ্ত লিংকে ব্রাউজারে প্রবেশ করে PDF খোলা নিশ্চিত করুন।

#### ধাপ ৫: পোস্ট-মাইগ্রেশন পাবলিক ফাইল প্রত্যাহার
সমস্ত ভেরিফিকেশন সফল হওয়ার পর, এবং ন্যূনতম ৩০ দিনের ট্রানজিশন পিরিয়ড শেষে অ্যাডমিন ম্যানুয়ালি পুরোনো পাবলিক ফাইলগুলো আর্কাইভ বা ডিলিট করবেন।

---

### ৪. রোলব্যাক পরিকল্পনা (Safe Rollback Strategy)
যেহেতু মূল ফাইলগুলো `uploads` বাকেটে অপরিবর্তিত রাখা হয়েছে, কোনো কারণে প্রাইভেট স্টোরেজ রিট্রিভালে ব্যর্থতা ঘটলে ডেটাবেস রেকর্ড পূর্বের ব্যাকআপ থেকে সহজেই রিস্টোর করা সম্ভব।

# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — STAGING TEST MATRIX
**Document Version:** 1.0  
**Audit Protocol:** Rigorous Verification Matrix  
**Status Legend:**
- **PASS:** Formally executed and verified locally with automated tests / builds (Exit Code 0).
- **PENDING:** Requires deployment to a live Staging Supabase instance for end-to-end user session verification.
- **FAIL:** Failed execution (None currently unresolved).

---

## 1. Automated Local Unit & Security Verification (Executed)

All tests below were genuinely executed in the local environment using Vitest (`npm run test`), TypeScript (`tsc --noEmit`), Vite (`npm run build`), and ESLint (`eslint .`).

| Test ID | Test Category | Target Component | Description & Expected Result | Actual Result / Exit Code | Status |
|---|---|---|---|---|---|
| **AUT-01** | Path Authorization | `get-premium-pdf` | Proves student authorized for Post A cannot sign Post B's chapter by manipulating `chapter_path`. | Ignored `chapter_path`; resolved canonical URL strictly from Post A database record. | **PASS** |
| **AUT-02** | Cross-Post Denial | `get-premium-pdf` | Student requesting Post B without approval receives 403 Forbidden. | Returns status 403 `এই PDF দেখার অনুমতি নেই`. | **PASS** |
| **AUT-03** | Index Validation | `get-premium-pdf` | Negative, floating-point, or non-integer `chapter_index` is rejected with 400 Bad Request. | Returns status 400 `চ্যাপ্টার ইনডেক্স একটি সঠিক অঋণাত্মক পূর্ণসংখ্যা হতে হবে`. | **PASS** |
| **AUT-04** | Index Bounds | `get-premium-pdf` | Out-of-bounds `chapter_index` (e.g. index 99) returns 404 Not Found. | Returns status 404 `অনুরোধকৃত চ্যাপ্টার পাওয়া যায়নি`. | **PASS** |
| **AUT-05** | Signed URL TTL | `get-premium-pdf` | Signed URL expiration is strictly set to 300 seconds (5 minutes). | `expiresIn: 300` returned in response body. | **PASS** |
| **AUT-06** | Anonymous Chapter RLS | `can_read_post_chapter` | Anonymous visitor (`authUid = null`) can read published free chapters. | Returns `true` without querying `pdf_unlock_requests`. | **PASS** |
| **AUT-07** | Anonymous Paid Chapter | `can_read_post_chapter` | Anonymous visitor is strictly blocked from reading paid chapters. | Returns `false` without raising Postgres permission error. | **PASS** |
| **AUT-08** | Approved Student Read | `can_read_post_chapter` | Authenticated student with approved unlock request can read paid chapters. | Returns `true`. | **PASS** |
| **AUT-09** | Admin Chapter Access | `can_read_post_chapter` | Verified admin can access chapters of unpublished and paid posts. | Returns `true`. | **PASS** |
| **AUT-10** | TrxID Deduplication | `idx_pdf_unlock_unique_trx` | Normalizes method and TrxID; blocks duplicate submissions for pending/approved status. | Case-insensitive and whitespace-trimmed duplicate detected. | **PASS** |
| **AUT-11** | Migrator Staging Guard | `legacy_premium_pdf_migrator` | Execution against `MIGRATION_ENV=production` is blocked by default with Exit Code 1. | Exited with Code 1 and printed `REFUSED: Direct execution against Production is strictly blocked`. | **PASS** |
| **AUT-12** | Checksum Integrity | `legacy_premium_pdf_migrator` | Checksum mismatch between source and target file aborts database reference update. | Throws `Checksum mismatch detected`; marks item as FAILED. | **PASS** |
| **AUT-13** | MIME Validation | `legacy_premium_pdf_migrator` | Files without `%PDF-` header are rejected. | Rejects non-PDF payloads; marks item as FAILED. | **PASS** |
| **AUT-14** | TypeScript Static Check | Codebase | Zero TypeScript compile errors across all components and edge functions. | `tsc --noEmit` exited with Code 0. | **PASS** |
| **AUT-15** | Vite Production Build | Frontend Bundler | Full production bundle compiles successfully without missing modules or circular imports. | `vite build` completed in 13.56s (Exit Code 0). | **PASS** |
| **AUT-16** | ESLint Code Quality | Codebase | Codebase satisfies all lint rules without fatal syntax or import errors. | `eslint .` finished with 0 errors (Exit Code 0). | **PASS** |

---

## 2. Live Staging End-to-End Verification Matrix (Pending Staging Execution)

The following tests require deployment to the live Staging Supabase environment and interactive browser testing.

| Test ID | Functional Area | Step-by-Step Procedure | Expected Result | Actual Staging Result | Staging Status |
|---|---|---|---|---|---|
| **STG-01** | User Registration | 1. Navigate to `/signup`<br>2. Submit new email & password<br>3. Verify email confirmation | User record created in `auth.users`; profile initialized; auto-redirected to student dashboard. | *To be tested on Staging* | **PENDING** |
| **STG-02** | User Login | 1. Navigate to `/login`<br>2. Submit valid credentials<br>3. Submit invalid credentials | Valid credentials redirect to `/dashboard`; invalid credentials display Bengali error toast. | *To be tested on Staging* | **PENDING** |
| **STG-03** | Password Recovery | 1. Navigate to `/forgot-password`<br>2. Enter email address<br>3. Click reset link in email<br>4. Reset password on `/reset-password` | Password reset email sent; student successfully updates password and logs in. | *To be tested on Staging* | **PENDING** |
| **STG-04** | Free Content Access | 1. Open browser in Incognito (anonymous guest)<br>2. Navigate to `/classes`<br>3. Click a free course & lesson | Public course, description, videos, and free PDF links open without login prompts or 403 errors. | *To be tested on Staging* | **PENDING** |
| **STG-05** | Paid Content Gating | 1. Open browser in Incognito<br>2. Navigate to a paid course<br>3. Click "PDF পড়ুন" on a paid chapter | UI shows Lock icon; clicking prompts login requirement toast; signed URL is NOT generated. | *To be tested on Staging* | **PENDING** |
| **STG-06** | Payment Submission | 1. Log in as test student<br>2. Navigate to paid post<br>3. Fill bKash/Nagad form with phone and TrxID<br>4. Submit request | Request saved in `pdf_unlock_requests` with status `pending`; student dashboard shows "যাচাইাধীন". | *To be tested on Staging* | **PENDING** |
| **STG-07** | Duplicate TrxID Rejection | 1. As same or different student, submit identical TrxID for same payment method | Frontend pre-check and database unique constraint block submission with duplicate error toast. | *To be tested on Staging* | **PENDING** |
| **STG-08** | Admin Payment Approval | 1. Log in as verified admin (`/admin-login`)<br>2. Go to `/admin/unlock-requests`<br>3. Click "অনুমোদন করুন" (Approve) | Status changes to `approved`; student dashboard instantly updates to show "অনুমোদিত" and download button. | *To be tested on Staging* | **PENDING** |
| **STG-09** | Secure PDF Download | 1. Log in as approved student<br>2. Go to `/dashboard`<br>3. Click "PDF ডাউনলোড" | Calls `get-premium-pdf`; returns 300s signed URL; PDF opens in new tab; direct bucket URL is hidden. | *To be tested on Staging* | **PENDING** |
| **STG-10** | Chapter PDF Upload | 1. Log in as admin (`/admin/posts`)<br>2. Edit paid post<br>3. Upload chapter PDF | Uploaded file saved to `premium-pdfs/chapters/...` bucket; path saved in `posts.chapters` as private reference. | *To be tested on Staging* | **PENDING** |
| **STG-11** | Cross-Post Attack Test | 1. Intercept network request from student approved for Post A<br>2. Send POST to `/functions/v1/get-premium-pdf` with Post B's ID | Server responds with `403 Forbidden` (`এই PDF দেখার অনুমতি নেই`); no signed URL generated. | *To be tested on Staging* | **PENDING** |
| **STG-12** | AI Chatbot Interaction | 1. Click AI Chatbot floating bubble on homepage<br>2. Ask an educational question in Bengali (e.g. "হিসাববিজ্ঞান ১ম পত্রের সাজেশন দিন") | AI assistant responds accurately in Bengali; no admin commands or secret keys leaked. | *To be tested on Staging* | **PENDING** |
| **STG-13** | Image Generation | 1. In AI Chatbot, request educational diagram/illustration | Edge function calls free image model or displays fallback educational illustration gracefully. | *To be tested on Staging* | **PENDING** |
| **STG-14** | Video Generation | 1. In AI Chatbot or Admin AI, request short educational video demonstration | Edge function contacts Hugging Face free inference API; handles queue or timeout gracefully. | *To be tested on Staging* | **PENDING** |
| **STG-15** | Mobile Responsive Navigation | 1. Open mobile browser (viewport 375px)<br>2. Test hamburger menu, mobile bottom nav, and course cards | Navigation flows smoothly; sticky bottom nav stays accessible; touch targets are >= 44px. | *To be tested on Staging* | **PENDING** |
| **STG-16** | Desktop Large Screen | 1. Open desktop browser (viewport 1920px)<br>2. Test sidebar navigation, post tables, and modal dialogs | Layout centers gracefully with `max-w-7xl`; no horizontal scrollbars; backdrop blur renders cleanly. | *To be tested on Staging* | **PENDING** |
| **STG-17** | Admin Route Separation | 1. Log in as regular student<br>2. Attempt direct URL navigation to `/admin` or `/admin/posts` | `AdminDashboard` checks `isAdmin`; automatically redirects unauthorized user to `/admin-login`. | *To be tested on Staging* | **PENDING** |
| **STG-18** | Configuration Degraded Mode | 1. Set dummy invalid keys in `.env`<br>2. Reload site | Top `ConfigurationBanner` shows configuration notice; site renders static content without white screen. | *To be tested on Staging* | **PENDING** |

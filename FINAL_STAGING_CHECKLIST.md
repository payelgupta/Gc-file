# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — FINAL STAGING PRE-FLIGHT CHECKLIST
**Purpose:** Comprehensive sign-off checklist before promoting Gyan Prakasha Path to Production.  
**Rule:** Every item in this checklist must be physically checked on Staging. No item may be skipped or marked complete without evidence.  

---

## Phase 1: Environment & Secrets Setup
- [ ] **Staging Supabase Project Provisioned:** Separate Staging project created (isolated from Production).
- [ ] **Client Environment Variables (`.env`):**
  - [ ] `VITE_SUPABASE_URL` points to Staging URL.
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` set to Staging publishable key.
  - [ ] No `SUPABASE_SERVICE_ROLE_KEY` or API secret present in client `.env`.
- [ ] **Edge Functions Secrets Configured:**
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` configured in Supabase Vault.
  - [ ] `OPENROUTER_API_KEY` (Free Tier) configured for AI Chatbot.
  - [ ] `GEMINI_API_KEY` (Free Tier) configured for educational document assistant.
  - [ ] `HF_API_KEY` (Free Tier) configured for video generation.

---

## Phase 2: Database Schema & Migration Execution
- [ ] **Pre-Migration Snapshot:** Executed `pg_dump` on Staging database (`backup_gyan_prakasha_staging.dump`).
- [ ] **Apply Migration Patch:**
  - [ ] Applied `supabase/migrations/20261110010000_security_remediation_patch.sql`.
  - [ ] Verified `public.can_read_post_chapter` function exists with `SECURITY DEFINER` and `SET search_path = ''`.
  - [ ] Verified `idx_pdf_unlock_unique_trx` unique index is active on `pdf_unlock_requests`.
  - [ ] Checked `SELECT * FROM public.v_duplicate_trx_audit;` (returns 0 unhandled conflicts).

---

## Phase 3: Storage Migration & File Verification
- [ ] **Private Bucket Creation:** Verified `premium-pdfs` bucket exists with `public: false`.
- [ ] **Legacy PDF Migrator Dry Run:**
  - [ ] Executed `MIGRATION_ENV=staging npx tsx scripts/legacy_premium_pdf_migrator.ts`.
  - [ ] Inspected `LEGACY_PDF_MIGRATION_MANIFEST.json` to verify detected legacy items.
- [ ] **Legacy PDF Migrator Live Execution:**
  - [ ] Executed `MIGRATION_ENV=staging npx tsx scripts/legacy_premium_pdf_migrator.ts --execute`.
  - [ ] Verified `LEGACY_PDF_MIGRATION_LOG.txt` records all items as `VERIFIED_SECURED`.
  - [ ] Verified SHA-256 checksum match and `%PDF-` header for all transferred files.
  - [ ] Verified original files remain intact in `uploads` bucket (no source deletions).
  - [ ] Query `public.v_legacy_premium_pdf_audit` confirms all records have `security_status = 'SECURE'`.

---

## Phase 4: Security & Access Control Sign-Off
- [ ] **Anonymous Guest Access:**
  - [ ] Guest can open `/` and `/classes` without login.
  - [ ] Guest can open and read published free lessons.
  - [ ] Zero PostgreSQL permission errors on `pdf_unlock_requests`.
- [ ] **Paid Course Protection:**
  - [ ] Guest and unapproved student see Lock icon on paid chapters.
  - [ ] Direct calls to `get-premium-pdf` return `403 Forbidden`.
  - [ ] No direct storage URLs to private PDFs are visible in page source.
- [ ] **Cross-Post Attack Defense:**
  - [ ] Calling `get-premium-pdf` with valid approval for Course A and ID for Course B strictly returns `403 Forbidden`.
  - [ ] Signed URL TTL verified at exactly 300 seconds (5 minutes).
- [ ] **Duplicate Transaction Defense:**
  - [ ] Submitting a previously used TrxID is blocked in UI and database with clear Bengali error message.
- [ ] **Admin Route Separation:**
  - [ ] Non-admin authenticated students navigating to `/admin` are redirected to `/admin-login`.
  - [ ] Only verified admins with `has_role(uid, 'admin')` can access Admin Dashboard.

---

## Phase 5: Student & Admin Flow Testing
- [ ] **Student Flow:**
  - [ ] New user registration, email confirmation, and login.
  - [ ] Course browsing and category filtering.
  - [ ] bKash/Nagad payment submission.
  - [ ] Student dashboard shows pending request with TrxID.
  - [ ] Approved student clicks "PDF ডাউনলোড" and opens authenticated 300s signed URL.
- [ ] **Admin Flow:**
  - [ ] Admin login (`/admin-login`).
  - [ ] Reviewing pending requests at `/admin/unlock-requests`.
  - [ ] Approving payment request.
  - [ ] Uploading new paid chapter PDF to `premium-pdfs` bucket.
  - [ ] Post creation, editing, and publishing.

---

## Phase 6: Performance, Reliability & $0 Budget Check
- [ ] **Free-Tier Inactivity Guard:** Documented Supabase free project 7-day pause mitigation.
- [ ] **Bandwidth Limits:** Stored PDFs under 20MB; static assets under 500KB.
- [ ] **API Timeouts:** Edge Functions enforce 45s global deadline and 2-attempt model fallback.
- [ ] **Responsive Design:** Mobile (375px), Tablet (768px), and Desktop (1440px+) tested and clean.
- [ ] **Console Errors:** Clean browser developer console during typical student workflows.

---

## Final Operational Status Determination
After all phases above are completed and documented on Staging, the release lead assigns one of the following statuses:

- [ ] **OPERATIONAL PREPARATION COMPLETE — STAGING PENDING** *(Current Status)*
- [ ] **STAGING VERIFICATION PASSED — APPROVED FOR PRODUCTION ROLLOUT**

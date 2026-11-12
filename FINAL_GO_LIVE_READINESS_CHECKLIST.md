# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — FINAL GO-LIVE READINESS CHECKLIST
**Purpose:** Pre-Flight Gate Sign-Off Checklist for Staging Verification and Production Promotion  
**Current Phase:** Pre-Staging Complete -> Staging Verification Pending  
**Budget Standard:** Strict $0 Free-Tier Compliance  
**Rule:** Every checkbox must be validated against real Staging logs and test runs before ticking.

---

## Pre-Requisite Local Gate (100% Complete)
- [x] **Source Code Integrity:** All 5 audit findings and 15 adversarial test vectors resolved in local code.
- [x] **Automated Tests:** 107 / 107 tests passing (`npm test`, exit code 0).
- [x] **TypeScript Build:** `tsc --noEmit` clean (`npm run typecheck`, exit code 0).
- [x] **Linter Clean:** `eslint .` clean with 0 errors (`npm run lint`, exit code 0).
- [x] **Production Bundle:** `vite build` completed successfully in `/dist`.
- [x] **No Secrets Leaked:** Clean search for keys and credentials across client code.
- [x] **Updated Archive:** `gyan-prakasha-path-security-remediated-2026-11-10.zip` packaged and ready.

---

## Phase 1: Staging Environment Provisioning
- [ ] **Provision Staging Project:**
  - [ ] Separate Supabase Staging project created (isolated from Production).
  - [ ] Staging project URL and Publishable Key added to staging `.env`.
  - [ ] Service role key added to Supabase Vault / Edge Function secrets only.
- [ ] **Edge Functions Deployment to Staging:**
  - [ ] Deploy `get-premium-pdf` (`supabase functions deploy get-premium-pdf`).
  - [ ] Deploy `chat`, `generate-image`, `generate-video`, `process-file`.
  - [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is present in function secrets.

---

## Phase 2: Database Schema & Migration Execution
- [ ] **Create Staging Snapshot:**
  - [ ] `pg_dump "$STAGING_DB_URL" > staging_pre_migration.dump`.
- [ ] **Execute Patch Migration:**
  - [ ] Run `supabase/migrations/20261110010000_security_remediation_patch.sql`.
  - [ ] Confirm preflight passes without exceptions.
  - [ ] Confirm `idx_pdf_unlock_unique_trx` unique index created.
  - [ ] Confirm `can_read_post_chapter(uuid)` created with `SECURITY DEFINER` and `search_path = ''`.
- [ ] **Query Verification Views:**
  - [ ] `SELECT * FROM public.v_duplicate_trx_audit;` (must return 0 conflicts).
  - [ ] `SELECT * FROM public.v_legacy_premium_pdf_audit;` (audits legacy status).

---

## Phase 3: Storage Migration on Staging
- [ ] **Private Bucket Creation:**
  - [ ] Verify `premium-pdfs` bucket exists and has `public: false`.
- [ ] **Dry-Run Audit:**
  - [ ] Run: `MIGRATION_ENV=staging npx tsx scripts/legacy_premium_pdf_migrator.ts`.
  - [ ] Inspect generated `LEGACY_PDF_MIGRATION_MANIFEST.json`.
- [ ] **Live Execution:**
  - [ ] Run: `MIGRATION_ENV=staging npx tsx scripts/legacy_premium_pdf_migrator.ts --execute`.
  - [ ] Verify `LEGACY_PDF_MIGRATION_LOG.txt` records all items as `VERIFIED_SECURED`.
  - [ ] Confirm SHA-256 match for each transferred file.
  - [ ] Confirm source files in `uploads` bucket remain untouched (100% retention).
  - [ ] Query `public.v_legacy_premium_pdf_audit` confirms all items show `SECURE`.

---

## Phase 4: End-to-End User Journeys on Staging
- [ ] **Journey 1: Anonymous Visitor:**
  - [ ] Open homepage, courses catalog, and view free lessons.
  - [ ] Confirm zero PostgreSQL RLS permission errors in console.
  - [ ] Confirm paid chapters show Lock icon and cannot be downloaded.
- [ ] **Journey 2: Student Purchase & Duplicate Defense:**
  - [ ] Register new student account; log in.
  - [ ] Submit bKash unlock request with TrxID.
  - [ ] Submit identical TrxID a second time; confirm UI displays duplicate rejection.
  - [ ] Submit TrxID with leading/trailing spaces or lowercase; confirm duplicate rejection.
- [ ] **Journey 3: Admin Review & PDF Access:**
  - [ ] Log in as admin at `/admin-login`.
  - [ ] Approve student's unlock request at `/admin/unlock-requests`.
  - [ ] Log back in as student; confirm course now shows "PDF পড়ুন" button.
  - [ ] Click "PDF পড়ুন"; confirm 300s signed URL opens the correct PDF document.
- [ ] **Journey 4: Cross-Post Attack Defense:**
  - [ ] Attempt calling `get-premium-pdf` using approved student session for Course A with Course B's post ID or chapter; confirm strict `403 Forbidden`.

---

## Phase 5: Final Production Promotion Approval
Only after all checkboxes above are signed off on Staging:
- [ ] **Final Sign-Off By:** ____________________
- [ ] **Target Production Date:** ____________________
- [ ] **Final Deployment Status:** `APPROVED FOR PRODUCTION ROLLOUT`

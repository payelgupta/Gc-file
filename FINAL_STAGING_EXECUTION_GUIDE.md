# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — FINAL STAGING EXECUTION GUIDE
**Date:** 2026-11-11  
**Target Environment:** Isolated Staging Supabase Project  
**Purpose:** Comprehensive Operational & Verification Manual for Staging Execution  
**Policy Compliance:** Strict $0 Budget, Zero Production Leakage, Complete Feature Preservation

---

## 1. Overview & Execution Architecture

This guide provides step-by-step instructions for executing the final staging verification of Gyan Prakasha Path. It covers:
1. **Database Patch Application:** Applying migration `20261110010000_security_remediation_patch.sql`.
2. **Legacy PDF Migration:** Executing `scripts/legacy_premium_pdf_migrator.ts` in dry-run and verified live modes.
3. **End-to-End User Journeys:** Validating all 18 core application workflows.

---

## 2. Distinction: Automated Tests vs. Staging Verification

| Scope | Automated Tests (Local Codebase) | Staging Verification (Live Isolated Supabase) |
|---|---|---|
| **Environment** | Mocked in-memory (Node.js/Vitest, zero network) | Live isolated Staging Supabase project & browser |
| **Execution** | `npm test`, `npm run typecheck`, `npm run lint` | CLI migration, edge function invokes, manual browser flows |
| **Coverage** | Syntax, types, unit logic, RLS simulation, attack matrix | Real database RLS, live Storage signing, real auth sessions |
| **Current Status** | **100% COMPLETE & PASSING (107/107 Tests)** | **READY TO EXECUTE ON STAGING** |

---

## 3. Storage & PDF Migration Execution Procedure

### Step 1: Pre-Migration Database Snapshot (Staging)
```bash
pg_dump "$STAGING_DATABASE_URL" --format=custom --file="staging_backup_pre_migration.dump"
```

### Step 2: Apply SQL Migration Patch
Execute the patch using `psql` or Supabase CLI:
```bash
psql "$STAGING_DATABASE_URL" -f supabase/migrations/20261110010000_security_remediation_patch.sql
```
* **Preflight Check:** The migration automatically counts duplicate active transactions (`status != 'rejected'`). If duplicates exist, it raises a descriptive exception and halts without changing any data.
* **Audit View Check:**
  ```sql
  SELECT * FROM public.v_duplicate_trx_audit;
  SELECT * FROM public.v_legacy_premium_pdf_audit WHERE security_status != 'SECURE';
  ```

### Step 3: Run Migrator in Read-Only Audit Mode (Dry Run)
Inspect legacy public uploads without modifying storage or database:
```bash
MIGRATION_ENV=staging \
MIGRATION_SUPABASE_URL="https://your-staging-project.supabase.co" \
MIGRATION_SERVICE_ROLE_KEY="your-staging-service-role-key" \
MIGRATION_STAGING_ALLOWLIST="your-staging-project.supabase.co" \
npx tsx scripts/legacy_premium_pdf_migrator.ts
```
* **Verify Outputs:**
  1. `LEGACY_PDF_MIGRATION_MANIFEST.json` is generated.
  2. Check `legacyItemsDetected` count.
  3. Confirm `isAuditOnly: true` and zero items written.

### Step 4: Run Migrator in Verified Live Mode (`--execute`)
```bash
MIGRATION_ENV=staging \
MIGRATION_SUPABASE_URL="https://your-staging-project.supabase.co" \
MIGRATION_SERVICE_ROLE_KEY="your-staging-service-role-key" \
MIGRATION_STAGING_ALLOWLIST="your-staging-project.supabase.co" \
npx tsx scripts/legacy_premium_pdf_migrator.ts --execute
```
* **Safety Pipeline Verified Per Item:**
  1. Downloads binary buffer from `uploads`.
  2. Inspects magic bytes (must start with `%PDF-`).
  3. Computes source SHA-256 hash.
  4. Uploads to private `premium-pdfs` bucket (`migrated-legacy/${postId}-${name}`).
  5. Re-downloads from `premium-pdfs` and compares target SHA-256 to source SHA-256.
  6. Executes `public.migrate_legacy_pdf_atomic(...)` to update database atomically.
  7. Original source files in `uploads` remain 100% untouched.

### Step 5: Interrupted Migration Recovery
If the migration script is interrupted (e.g. timeout or network drop):
1. Simply re-run the `--execute` command.
2. The script checks `premium_files` and `posts.chapters` status; items already secured are skipped, and incomplete items are resumed safely.

---

## 4. End-to-End Staging Verification: 18 Core Workflows

Execute each of the following 18 user journeys against the Staging environment:

### Workflow 1: Anonymous Free-Content Access
* **Steps:** Open browser in Incognito mode. Navigate to `/` and `/classes`. Click on a free course (e.g. বাংলা ১ম পত্র). Open Lesson 1.
* **Expected Result:** Lesson content and free chapter video/notes are visible. Browser console shows **zero** PostgreSQL permission errors on `pdf_unlock_requests`.

### Workflow 2: Student Registration & Login
* **Steps:** Navigate to `/auth`. Enter email and password. Click "নিবন্ধন করুন" (Sign Up). Verify email, then log in.
* **Expected Result:** Successful authentication. Redirected to homepage or student dashboard. User avatar/email displayed in header.

### Workflow 3: Password Recovery
* **Steps:** On `/auth`, click "পাসওয়ার্ড ভুলে গেছেন?". Enter registered email. Submit.
* **Expected Result:** Supabase Auth sends password recovery email with reset link. Reset page allows entering new password.

### Workflow 4: Paid-Content Authorization
* **Steps:** Log in as a student with no purchases. Open a paid course (e.g. HSC উচ্চতর গণিত).
* **Expected Result:** Price and "কোর্সটি আনলক করুন" (Unlock Course) button are displayed. Chapter PDF buttons show Lock icons. Direct storage paths are NOT exposed.

### Workflow 5: Payment Submission
* **Steps:** Click "কোর্সটি আনলক করুন". Select bKash. Copy merchant number. Enter sender mobile number (`01711111111`) and TrxID (`TESTTRX1001`). Submit.
* **Expected Result:** Toast notification confirms request submission. Request status shows "অপেক্ষমাণ" (Pending) in student dashboard. Price is verified server-side.

### Workflow 6: Admin Payment Approval
* **Steps:** Log in as verified admin (`/admin-login`). Navigate to `/admin/unlock-requests`. Locate the pending request with TrxID `TESTTRX1001`. Click "অনুমোদন করুন" (Approve).
* **Expected Result:** Request status transitions to `approved`. Record moves to approved tab.

### Workflow 7: Duplicate TrxID Rejection
* **Steps:** As a student, attempt to submit another unlock request using the same TrxID (`TESTTRX1001`) with bKash, with variations such as leading/trailing spaces or lowercase (`  testtrx1001  `).
* **Expected Result:** Database constraint / unique index rejects insertion. Toast notification displays clear error: "এই ট্রানজেকশন আইডিটি ইতিমধ্যে ব্যবহৃত হয়েছে।"

### Workflow 8: Premium PDF Upload (Admin)
* **Steps:** As admin, navigate to `/admin/posts`. Edit a paid course. In Chapter Management, add Chapter 2 and upload a PDF file (`sample-chapter.pdf`). Save.
* **Expected Result:** File uploads to private `premium-pdfs` bucket with canonical naming: `chapters/${postId}-2-${timestamp}-${filename}`. Storage reference stored securely.

### Workflow 9: Authorized PDF Download (Student)
* **Steps:** Log in as the approved student. Navigate to the unlocked course. Click "PDF পড়ুন" or "PDF ডাউনলোড".
* **Expected Result:** Edge function `get-premium-pdf` validates user's approval in `pdf_unlock_requests`. Returns signed URL with 300s TTL. PDF reader opens document correctly.

### Workflow 10: Unauthorized PDF Denial
* **Steps:** Log in as a different student without an approved unlock request for that post. Attempt to invoke `get-premium-pdf` directly via browser console or curl.
* **Expected Result:** Function returns `403 Forbidden` (`এই PDF দেখার অনুমতি নেই। কোর্সটি আনলক করুন।`).

### Workflow 11: Cross-Post Access Denial
* **Steps:** Log in as a student approved for Course A. In the developer console, invoke `get-premium-pdf` passing Course B's post ID.
* **Expected Result:** Function strictly evaluates Course B's approval status and returns `403 Forbidden`. Course B's PDF cannot be accessed.

### Workflow 12: Admin Dashboard & Analytics
* **Steps:** Log in as admin. Navigate to `/admin`. Inspect student count, course count, recent unlock requests, and analytics graphs.
* **Expected Result:** Metrics load accurately from database. Non-admin users attempting to open `/admin` are redirected to `/admin-login`.

### Workflow 13: AI Educational Chatbot
* **Steps:** Open AI Chat widget on homepage or `/classes`. Ask an educational question in Bengali (e.g., "নিউটনের ৩য় সূত্রটি ব্যাখ্যা করো").
* **Expected Result:** Chatbot responds with educational explanations in Bengali using free-tier model. Errors degrade gracefully.

### Workflow 14: Educational Image Generation
* **Steps:** In admin or learning tools, request educational diagram generation (e.g., "কোষ প্রাচীরের চিত্র").
* **Expected Result:** Free-tier image model returns educational graphic. No paid subscription required.

### Workflow 15: Educational Video Generation / Embedding
* **Steps:** Open Video Library (`/videos`). Filter by subject (গণিত, বিজ্ঞান, বাংলা). Play an educational video lesson.
* **Expected Result:** Video player streams lecture smoothly. Chapter markers and descriptions load without stuttering.

### Workflow 16: Mobile Navigation & Responsiveness
* **Steps:** Open Chrome DevTools in Mobile Emulation mode (375px width - iPhone SE/Android). Test hamburger menu, course cards, unlock modals, and PDF reader.
* **Expected Result:** Responsive layout adapts cleanly. Buttons are tap-friendly. No horizontal overflow or truncated text.

### Workflow 17: Desktop Navigation & Typography
* **Steps:** Test layout on 1440px desktop display. Test sidebar navigation, category filtering, search input, and high-resolution Bengali typography.
* **Expected Result:** Clean alignment, crisp Bengali fonts, accessible contrast ratios, and responsive flex/grid layouts.

### Workflow 18: Session Expiration & Logout
* **Steps:** Log in. Open developer tools and clear auth session token or click "লগআউট" (Logout) in user menu.
* **Expected Result:** Session terminated immediately. Protected routes redirect to `/auth`. Calling authenticated edge functions returns `401 Unauthorized`.

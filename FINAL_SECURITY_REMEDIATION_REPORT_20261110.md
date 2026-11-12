# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — FINAL SECURITY REMEDIATION REPORT
**Date:** 2026-11-10  
**Status:** STAGING READY — PRODUCTION NOT VERIFIED  
**Security Policy Compliance:** Strict Local Source Work; Zero Live DB Connections; Strict $0 Budget; Non-Destructive Storage Handling.

---

## 1. Executive Summary

In response to the latest independent source inspection and audit prompt, five specific security, reliability, and authorization issues were identified and remediated in the local codebase. Every fix preserves all existing functionality, branding, user data structures, and workflows without introducing paid services or mock fallbacks.

| Issue | Severity | Component | Finding & Vulnerability | Remediation Summary | Status |
|---|---|---|---|---|---|
| **ISSUE 1** | **CRITICAL** | `supabase/functions/get-premium-pdf/index.ts`, `src/pages/admin/AdminPosts.tsx` | Edge Function accepted `post_id` and `chapter_index`, but did not sufficiently verify that the resolved storage path belongs to the requested post. A corrupted or malicious DB entry could point to another post's PDF. | Enforced strict server-side storage path ownership validation. Paths are resolved exclusively from trusted database records (never client input). Added directory traversal checks (`..`, `//`, `\`). Verified that any path containing post UUIDs matches `requestedPostId`. Checked cross-post ownership against `premium_files`. Uploads in `AdminPosts.tsx` now embed post ID and chapter index. TTL locked at 300s. | **RESOLVED & VERIFIED** |
| **ISSUE 2** | **HIGH** | `supabase/migrations/20261110010000_security_remediation_patch.sql`, `supabase/migrations/20261110000000_production_security_hardening.sql` | `can_read_post_chapter` took `(p_post_id uuid, p_auth_uid uuid)`. An attacker could call the RPC passing another student's UUID to probe their unlock status. | Redesigned `can_read_post_chapter` to single-argument signature: `public.can_read_post_chapter(p_post_id uuid) RETURNS boolean`. Derives identity internally via `auth.uid()`, preventing any spoofing or probing. Dropped obsolete 2-argument signature. Anonymous users can read free chapters without querying `pdf_unlock_requests`. | **RESOLVED & VERIFIED** |
| **ISSUE 3** | **HIGH** | `scripts/legacy_premium_pdf_migrator.ts` | Migrator accepted `--force-production-confirm` allowing bypass of production safety guards, and fell back to `VITE_SUPABASE_URL` if dedicated keys were absent. | Hardened migrator environment validation: unconditionally blocks `production` (exits code 1, zero bypass). Completely removed `VITE_SUPABASE_URL` fallback; requires dedicated `MIGRATION_SUPABASE_URL` and `MIGRATION_SERVICE_ROLE_KEY`. Enforces `MIGRATION_STAGING_ALLOWLIST`. | **RESOLVED & VERIFIED** |
| **ISSUE 4** | **HIGH** | `scripts/legacy_premium_pdf_migrator.ts`, `supabase/migrations/20261110010000_security_remediation_patch.sql` | Chapter migration updated whole chapters array via client-side patch, which could overwrite concurrent admin edits or report false success on missing chapter indexes. | Created atomic transactional database update RPC `public.migrate_legacy_pdf_atomic(p_post_id, p_item_type, p_target_path, p_chapter_index)`. Performs array bounds check and fails explicitly if chapter index is invalid or out of bounds (zero false success). Source files in `uploads` remain 100% retained. | **RESOLVED & VERIFIED** |
| **ISSUE 5** | **MEDIUM** | `supabase/migrations/20261110010000_security_remediation_patch.sql`, `drizzle/schema.ts` | Direct execution of `CREATE UNIQUE INDEX ... idx_pdf_unlock_unique_trx` could fail catastrophically if pre-existing duplicate TrxIDs existed in the database. | Added automated preflight check in migration: queries duplicate active transactions (`status != 'rejected'`). If duplicates exist, it raises a descriptive exception with duplicate group counts and halts migration safely without altering data. If 0 duplicates exist, creates canonical `idx_pdf_unlock_unique_trx`. Provided `v_duplicate_trx_audit` view. | **RESOLVED & VERIFIED** |

---

## 2. Technical Remediation Details

### Fix 1 — Premium PDF Storage Path Ownership Validation
- **Location:** `supabase/functions/get-premium-pdf/index.ts`
- **Implementation:**
  1. Requests only accept `{ post_id: string, chapter_index?: number }`. Client-supplied storage paths are strictly forbidden.
  2. For main course PDF: retrieves canonical path from `premium_files` table where `post_id = postId`.
  3. For chapter PDF: retrieves `chapters` JSON array from `posts` table, validates `chapter_index` is a non-negative integer within bounds (`0 <= chapter_index < chapters.length`), and extracts `chapter.url`.
  4. Path format & traversal verification: path must not contain `..`, `\0`, `\\`, or `//`, and must have `.pdf` extension.
  5. Prefix/Ownership check:
     - If path begins with `chapters/<postId>-...`, verified that the embedded post ID matches `postId`. If it contains a foreign UUID prefix, returns `403 Forbidden` (`STORAGE_PATH_OWNERSHIP_MISMATCH`).
     - If path begins with `migrated-legacy/<postId>-...`, verified matching post ID.
     - Database cross-post check: ensures `objectPath` is not associated with any other `post_id` in `premium_files`.
  6. Signed URL generation: uses private bucket `premium-pdfs` with strict `expiresIn = 300` (5 minutes).
- **Admin Post Uploads:**
  - In `src/pages/admin/AdminPosts.tsx`, updated chapter PDF uploads to `chapters/${editing.id}-${i + 1}-${Date.now()}-${safeName}`, embedding the post ID and chapter index directly in the filename.

### Fix 2 — Single-Argument `can_read_post_chapter` (Prevent Probe Attacks)
- **Location:** `supabase/migrations/20261110010000_security_remediation_patch.sql` and `supabase/migrations/20261110000000_production_security_hardening.sql`
- **Implementation:**
  1. Redesigned function signature to:
     ```sql
     CREATE OR REPLACE FUNCTION public.can_read_post_chapter(p_post_id uuid)
     RETURNS boolean
     LANGUAGE plpgsql
     STABLE
     SECURITY DEFINER
     SET search_path = ''
     ```
  2. The function internally derives `v_uid := auth.uid();`, completely eliminating the caller's ability to supply a victim user's UUID.
  3. Explicitly dropped legacy signature `DROP FUNCTION IF EXISTS public.can_read_post_chapter(uuid, uuid);`.
  4. Logic:
     - Returns `true` if post is published and `is_paid IS NOT TRUE` (allowing anonymous and student visitors to read published free lessons without permission errors on `pdf_unlock_requests`).
     - Returns `true` if caller is an admin (`public.has_role(v_uid, 'admin')`).
     - Returns `true` if `v_uid IS NOT NULL` and an approved unlock request exists in `public.pdf_unlock_requests`.
     - Returns `false` otherwise.
  5. Policy update:
     ```sql
     CREATE POLICY "post_chapters_read"
       ON public.post_chapters
       FOR SELECT
       TO anon, authenticated
       USING (public.can_read_post_chapter(post_chapters.post_id));
     ```

### Fix 3 & 4 — Legacy PDF Migrator Hardening & Atomic Updates
- **Location:** `scripts/legacy_premium_pdf_migrator.ts`, `supabase/migrations/20261110010000_security_remediation_patch.sql`
- **Implementation:**
  1. Environment Guard: `MIGRATION_ENV` must be strictly `staging` or `local_test`. `production` is unconditionally rejected; no force flag can bypass this.
  2. Credential Isolation: Migrator requires `MIGRATION_SUPABASE_URL` and `MIGRATION_SERVICE_ROLE_KEY`. Removed all fallback to `VITE_SUPABASE_URL` or client keys.
  3. Staging Allowlist: Checks hostname against `MIGRATION_STAGING_ALLOWLIST` to prevent accidental configuration errors.
  4. Audit/Dry-Run Mode: Defaults to dry run; only writes when `--execute` is explicitly passed.
  5. Byte-Level Integrity: Checks `%PDF-` header, downloads source buffer, computes SHA-256, uploads to `premium-pdfs`, re-downloads and verifies target SHA-256 matches.
  6. Atomic Database Update RPC:
     ```sql
     CREATE OR REPLACE FUNCTION public.migrate_legacy_pdf_atomic(
       p_post_id uuid,
       p_item_type text,
       p_target_path text,
       p_chapter_index integer DEFAULT NULL
     ) RETURNS jsonb ...
     ```
     For chapters, checks array bounds and verifies target element exists before updating. Returns `{"success": true}` or raises error. Zero false success.
  7. Non-Destructive: Source files in `uploads` are never deleted.

### Fix 5 — Safe Preflight Check for Unique TrxID Index
- **Location:** `supabase/migrations/20261110010000_security_remediation_patch.sql`
- **Implementation:**
  1. Preflight block executes before index creation:
     ```sql
     DO $$
     DECLARE
       v_duplicate_count integer;
     BEGIN
       SELECT count(*) INTO v_duplicate_count
       FROM (
         SELECT lower(trim(method)), upper(trim(trx_id))
         FROM public.pdf_unlock_requests
         WHERE status != 'rejected'
         GROUP BY lower(trim(method)), upper(trim(trx_id))
         HAVING count(*) > 1
       ) dups;

       IF v_duplicate_count > 0 THEN
         RAISE EXCEPTION 'PREFLIGHT_ABORT: Found % duplicate active TrxID group(s)...', v_duplicate_count;
       END IF;
     END $$;
     ```
  2. Prevents migration failure or accidental data deletion.
  3. Provides `public.v_duplicate_trx_audit` view for auditability.

---

## 3. Automated Verification Results

### Vitest Test Suite (92 Tests Passing)
```bash
> vite_react_shadcn_ts@0.0.0 test
> vitest run

 ✓ src/test/example.test.ts (1 test) 4ms
 ✓ src/test/security.test.ts (91 tests) 40ms

 Test Files  2 passed (2)
      Tests  92 passed (92)
   Duration  2.49s
 Exit Code: 0 (SUCCESS)
```

### Production Build (`npm run build`)
```bash
> vite_react_shadcn_ts@0.0.0 build
> vite build
✓ 3318 modules transformed.
dist/index.html                         1.21 kB │ gzip:   0.59 kB
dist/assets/sujoy-sir-9TkMShTp.png     62.96 kB
dist/assets/hero-bg-CMoDtV5f.jpg      206.50 kB
dist/assets/index-rQKmGiaN.css        148.53 kB │ gzip:  22.15 kB
dist/assets/index-BD0nb9aE.js       2,201.93 kB │ gzip: 583.46 kB
✓ built in 13.16s
 Exit Code: 0 (SUCCESS)
```

---

## 4. Operational Status

**Status: STAGING READY — PRODUCTION NOT VERIFIED**

In strict adherence to the project security policies:
- No changes have been applied to live Production Supabase.
- No live database credentials were used or exposed.
- Full E2E verification on an isolated Staging instance is required prior to production rollout according to `MIGRATION_RUNBOOK.md` and `FINAL_STAGING_CHECKLIST.md`.

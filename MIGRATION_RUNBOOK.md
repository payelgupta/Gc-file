# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — MIGRATION RUNBOOK
**Version:** 2.0.0 (Hardened)  
**Target Environment:** Staging First (Production Strictly Blocked by Guard)  
**Budget:** $0 (Free-tier compliant)  
**Security Policy:** Strict isolation, zero live production modifications, non-destructive file handling.

---

## 1. Overview & Safety Architecture

This runbook outlines the operational procedure to apply database migrations and migrate legacy public PDF assets to the private `premium-pdfs` bucket.

### Absolute Safety Guarantees
1. **Production Guard:** `scripts/legacy_premium_pdf_migrator.ts` unconditionally aborts if `MIGRATION_ENV` is set to `production` or anything other than `staging` / `local_test`.
2. **Dedicated Credentials Only:** The migrator will NOT fall back to `VITE_SUPABASE_URL` or public publishable keys. It requires `MIGRATION_SUPABASE_URL` and `MIGRATION_SERVICE_ROLE_KEY`.
3. **Staging Hostname Allowlist:** `MIGRATION_STAGING_ALLOWLIST` must match the target host (e.g. `*.supabase.co`, `localhost`, `127.0.0.1`).
4. **Non-Destructive File Transfer:** Source files in the public `uploads` bucket are NEVER deleted. They remain intact for rollback and historical integrity.
5. **Byte-Level Verification:** Files are checked for `%PDF-` MIME header and SHA-256 byte-level hash before and after upload.
6. **Atomic Transactional Database Updates:** The database reference is updated only via `public.migrate_legacy_pdf_atomic(...)`. If chapter index is missing or out of bounds, it rolls back and fails with zero false success.

---

## 2. Pre-Requisites & Required Staging Secrets

Set the following environment variables in your secure execution shell (NEVER commit these to Git):

```bash
export MIGRATION_ENV="staging"
export MIGRATION_SUPABASE_URL="https://your-staging-project.supabase.co"
export MIGRATION_SERVICE_ROLE_KEY="eyJhbGciOi..." # Staging Service Role Key only
export MIGRATION_STAGING_ALLOWLIST="your-staging-project.supabase.co"
```

Verify the environment is NOT production:
```bash
echo "Current Target: $MIGRATION_SUPABASE_URL"
```

---

## 3. Step-by-Step Staging Migration Procedure

### Step 1: Pre-Migration Database Snapshot (Staging)
Always create a complete snapshot before running any DDL/DML:
```bash
pg_dump "$STAGING_DATABASE_URL" --format=custom --file="backup_gyan_prakasha_staging_$(date +%Y%m%d_%H%M%S).dump"
```

### Step 2: Apply Database Hardening Migration Patch
Apply the SQL migration file to your Staging database:
```bash
psql "$STAGING_DATABASE_URL" -f supabase/migrations/20261110010000_security_remediation_patch.sql
```

**What this migration applies:**
- Safe duplicate TrxID preflight check: queries active transactions (`status != 'rejected'`). If duplicates exist, it prints group summaries and aborts safely. If 0 duplicates exist, it idempotently creates canonical partial unique index `idx_pdf_unlock_unique_trx`.
- Single-argument `public.can_read_post_chapter(p_post_id uuid)` function with `SECURITY DEFINER` and `SET search_path = ''`. Internal `auth.uid()` derivation stops user probe attacks.
- Atomic legacy migration RPC: `public.migrate_legacy_pdf_atomic(p_post_id, p_item_type, p_target_path, p_chapter_index)`.
- Non-destructive audit views: `v_duplicate_trx_audit` and `v_legacy_premium_pdf_audit`.

### Step 3: Verify Preflight Audit Views
Run the verification queries:
```sql
-- Check for any conflicting transactions
SELECT * FROM public.v_duplicate_trx_audit;

-- Check legacy PDF exposure status
SELECT * FROM public.v_legacy_premium_pdf_audit WHERE security_status = 'LEGACY_PUBLIC_EXPOSURE';
```

### Step 4: Run Legacy PDF Migrator in Dry-Run (Audit Mode)
Execute the migrator script in audit mode to inspect all files to be migrated without modifying storage or database:
```bash
npx tsx scripts/legacy_premium_pdf_migrator.ts
```
Expected output:
- Generates `LEGACY_PDF_MIGRATION_MANIFEST.json`
- Summarizes legacy public files detected
- Confirms: `DRY RUN COMPLETE — No files were written to storage or updated in the database.`

### Step 5: Run Legacy PDF Migrator in Execute Mode
Once the manifest is verified, run live migration against Staging:
```bash
npx tsx scripts/legacy_premium_pdf_migrator.ts --execute
```
**Execution workflow executed per item:**
1. Validates storage path and naming convention.
2. Downloads source binary from `uploads`.
3. Verifies `%PDF-` header and computes source SHA-256.
4. Uploads to private `premium-pdfs` bucket (`migrated-legacy/${postId}-${cleanName}`).
5. Downloads uploaded object and validates target SHA-256 matches source SHA-256.
6. Invokes `public.migrate_legacy_pdf_atomic(...)` to update database atomically.
7. Logs `VERIFIED_SECURED` into `LEGACY_PDF_MIGRATION_LOG.txt`.

### Step 6: Post-Migration Audit Verification
Query the audit view to confirm zero legacy exposures:
```sql
SELECT count(*) AS remaining_exposures 
FROM public.v_legacy_premium_pdf_audit 
WHERE security_status = 'LEGACY_PUBLIC_EXPOSURE';
```
Result must be `0`.

---

## 4. Rollback and Disaster Recovery

### Case A: File Checksum Mismatch during Migration
- The script automatically halts updates for that item.
- No database change is committed for the failed item.
- Source file remains untouched in `uploads`.
- Fix the corrupted file in `uploads` or re-upload from author source, then re-run the script.

### Case B: Database Migration Patch Rollback
If the SQL migration needs to be rolled back on Staging:
```sql
-- Restore previous post_chapters_read policy if needed
DROP POLICY IF EXISTS "post_chapters_read" ON public.post_chapters;
DROP FUNCTION IF EXISTS public.can_read_post_chapter(uuid);
DROP FUNCTION IF EXISTS public.migrate_legacy_pdf_atomic(uuid, text, text, integer);
```
Or restore from the pre-migration snapshot taken in Step 1:
```bash
pg_restore --clean --if-exists -d "$STAGING_DATABASE_URL" backup_gyan_prakasha_staging_*.dump
```

---

## 5. Security Sign-off Criteria
Before declaring Staging Verification passed:
1. `MIGRATION_ENV=production` must exit with code 1 and error message.
2. `get-premium-pdf` Edge Function strictly validates chapter ownership and rejects mismatched post IDs.
3. Anonymous users can browse public courses and free chapters without Postgres RLS errors.
4. Paid chapter PDFs can only be signed for verified, approved students.

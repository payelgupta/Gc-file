# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — BACKUP & RECOVERY GUIDE
**Document Version:** 1.0  
**Scope:** PostgreSQL Database, Supabase Storage, and Edge Functions  
**Policy:** Non-destructive operations only; zero data loss guarantee  

---

## 1. Database Backup & Snapshot Procedures

Supabase provides automated physical backups on paid tiers, but on the **$0 Free Tier**, administrators must maintain scripted logical backups using PostgreSQL standard utilities (`pg_dump`).

### A. Pre-Migration Database Snapshot (Logical Dump)
Before applying any migration or schema change (such as `20261110010000_security_remediation_patch.sql`), execute a complete logical backup:

```bash
# Set connection string for Staging/Production
DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 1. Full Schema and Data Backup (Custom Archive Format)
pg_dump "$DB_URL" \
  --format=custom \
  --file="backup_gyan_prakasha_$(date +%Y%m%d_%H%M%S).dump" \
  --no-owner \
  --no-privileges

# 2. Plaintext SQL Schema Only (for version audit)
pg_dump "$DB_URL" \
  --schema-only \
  --file="schema_snapshot_$(date +%Y%m%d_%H%M%S).sql"
```

### B. High-Value Table Specific Snapshots
Before performing data remediation or running the legacy PDF migrator, backup the specific sensitive tables:
```bash
# Backup posts, pdf_unlock_requests, and premium_files
pg_dump "$DB_URL" \
  --table=public.posts \
  --table=public.pdf_unlock_requests \
  --table=public.premium_files \
  --table=public.post_chapters \
  --file="critical_tables_backup_$(date +%Y%m%d_%H%M%S).sql"
```

---

## 2. Safe Database Restoration Procedures

In case of schema corruption, accidental data loss, or failed migration:

### A. Non-Destructive Table Restoration
To restore specific tables without affecting the rest of the database:
```bash
pg_restore \
  --dbname="$DB_URL" \
  --table=public.pdf_unlock_requests \
  --clean \
  --if-exists \
  "backup_gyan_prakasha_YYYYMMDD_HHMMSS.dump"
```

### B. Full Database Restoration
If restoring to a fresh Staging instance:
```bash
pg_restore \
  --dbname="$DB_URL" \
  --clean \
  --if-exists \
  --no-owner \
  "backup_gyan_prakasha_YYYYMMDD_HHMMSS.dump"
```

---

## 3. Migration Rollback Procedures

Every migration applied to Gyan Prakasha Path has an explicit rollback script.

### Rollback for `20261110010000_security_remediation_patch.sql`

If you need to roll back the security patch on Staging:

```sql
-- ============================================================================
-- ROLLBACK SCRIPT: 20261110010000_security_remediation_patch.sql
-- ============================================================================

-- 1. Revert Post Chapters RLS to previous policy if required
DROP POLICY IF EXISTS post_chapters_read ON public.post_chapters;
DROP POLICY IF EXISTS post_chapters_admin_read ON public.post_chapters;

-- Recreate standard admin read
CREATE POLICY post_chapters_admin_read ON public.post_chapters
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Revert to direct post visibility (free posts visible to public)
CREATE POLICY post_chapters_read ON public.post_chapters
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_chapters.post_id AND p.is_published = true
  ));

-- 2. Drop the can_read_post_chapter helper
DROP FUNCTION IF EXISTS public.can_read_post_chapter(uuid, uuid);

-- 3. Drop Audit Views (non-destructive)
DROP VIEW IF EXISTS public.v_duplicate_trx_audit;
DROP VIEW IF EXISTS public.v_legacy_premium_pdf_audit;

-- 4. Note: Do NOT drop idx_pdf_unlock_unique_trx as it prevents duplicate payments.
```

---

## 4. Storage Migration Recovery & Preservation Rules

### Absolute Rule: Original Public Files Are Never Deleted
The `LegacyPdfMigrator` tool enforces a strict non-destructive policy:
- Files in the public `uploads` bucket are **read only**.
- The script never executes `supabase.storage.from('uploads').remove(...)`.
- `manifest.sourceFilesRetained = true` is unconditionally enforced.

### How to Recover from a Failed PDF Migration

If a network interruption, process kill, or checksum failure occurs mid-migration:

1. **Inspect the Manifest and Log File:**
   - Open `LEGACY_PDF_MIGRATION_MANIFEST.json` and `LEGACY_PDF_MIGRATION_LOG.txt`.
   - Identify which items have status `"FAILED"`.
2. **Review Database State:**
   - Query `public.v_legacy_premium_pdf_audit`:
     ```sql
     SELECT post_id, post_title, security_status FROM public.v_legacy_premium_pdf_audit WHERE security_status != 'SECURE';
     ```
   - Notice that because the migrator only updates `posts` and `premium_files` **after** verified SHA-256 checksum matching, any item that failed mid-upload will retain its previous database reference.
3. **Re-Run Migrator Safely:**
   - The migrator is completely idempotent (`upsert: true`).
   - Simply re-run:
     ```bash
     MIGRATION_ENV=staging npx tsx scripts/legacy_premium_pdf_migrator.ts --execute
     ```
   - It will scan again, skip already secured files, and retry any remaining legacy files.
4. **Manual Recovery If Target Object Is Corrupted:**
   - If a target file in `premium-pdfs` was partially written, delete only the target object:
     ```bash
     # Delete corrupted target object in private bucket only
     supabase storage rm "premium-pdfs/migrated-legacy/post-xxx.pdf"
     ```
   - Re-run the migrator to re-copy and re-verify from the intact original in `uploads`.

---

## 5. Emergency Incident Response Matrix

| Incident Type | Initial Action | Recovery Action | Verification |
|---|---|---|---|
| **Failed Migration** | Stop migrator process. | Inspect `LEGACY_PDF_MIGRATION_LOG.txt`. Re-run with `--execute`. | Check `v_legacy_premium_pdf_audit`. |
| **Corrupted Chapter Reference** | Do not delete posts. | Re-save post chapters from Admin Dashboard (`/admin/posts`) or restore chapters JSON from backup. | Verify chapter PDF opens in student view. |
| **Duplicate TrxID Conflict** | Check `v_duplicate_trx_audit`. | Reject fraudulent/test transaction record in Admin Dashboard (`/admin/unlock-requests`). | Verify student can submit valid request. |
| **Service Role Secret Rotation** | Update Supabase secrets via CLI. | Restart Edge Functions: `supabase functions deploy get-premium-pdf`. | Generate signed URL test. |

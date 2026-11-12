# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — FINAL MIGRATION SAFETY REVIEW
**Date:** 2026-11-11  
**Target Environment:** Isolated Staging Supabase Database  
**Review Type:** Comprehensive Chronological SQL Migration & Safety Review  
**Safety Standard:** Non-Destructive, Idempotent, Zero Data Loss, Fail-Safe Preflights

---

## 1. Executive Summary

A comprehensive safety review of all 9 chronological SQL migrations in `supabase/migrations/` was conducted to guarantee:
1. Safe fresh database installation from scratch.
2. Safe idempotent upgrade execution on pre-existing databases with historical user, post, and payment records.
3. Strict prevention of destructive operations or silent data corruption.
4. Fail-safe preflight mechanisms that halt execution gracefully if unexpected data anomalies (such as duplicate transaction IDs) are detected.

---

## 2. Chronological Migration Safety Analysis

### 1. `20260308210321_48050134-c86c-493b-b147-f6c522645fa6.sql` (Core Schema)
* **Entities Created:** `profiles`, `categories`, `posts`, `user_roles`, `app_role` enum.
* **Idempotency:** Uses `CREATE TABLE IF NOT EXISTS` and conditional type checks.
* **RLS Policies:** RLS enabled on all core tables. Profiles are self-editable; posts have public read access; user roles are read-only for users and managed by service role.
* **Safety Evaluation:** **SAFE.** No destructive drops or cascades on pre-existing data.

### 2. `20260308215511_6bc9c933-619f-49dc-98fa-a7d2ca95cd01.sql` (Role Helper Functions)
* **Entities Created:** `public.has_role(uuid, text)` function.
* **Security Definer & Search Path:** Declared `SECURITY DEFINER` with `SET search_path = ''`.
* **Explicit Grants:** Revoked from public, granted to authenticated and anon.
* **Safety Evaluation:** **SAFE.** Pinned search path prevents search-path hijacking attacks.

### 3. `20260311080547_cfe9e0a3-d260-4d07-a7ea-1d6e05e362df.sql` (Post Media Extensions)
* **Entities Modified:** `public.posts` table.
* **Columns Added:** `video_url`, `pdf_url`.
* **Idempotency:** `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
* **Safety Evaluation:** **SAFE.** Non-destructive column addition preserving all existing post rows.

### 4. `20260311080602_93170a3d-2cae-43ca-89a7-7b0db93dcb73.sql` (Chapter Hierarchy)
* **Entities Created:** `public.post_chapters` table.
* **Relationships:** `post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE`.
* **Indexes:** `idx_post_chapters_post_id`.
* **Safety Evaluation:** **SAFE.** Foreign keys strictly cascade only upon explicit parent post deletion.

### 5. `20260312093314_03a755e5-c86d-430c-95d0-cf23c38b3664.sql` (Unlock Requests)
* **Entities Created:** `public.pdf_unlock_requests` table.
* **Initial Structure:** `user_id`, `email`, `post_id`, `method`, `sender_number`, `trx_id`, `amount`, `status`.
* **Safety Evaluation:** **SAFE.** Non-destructive creation with default status `'pending'`.

### 6. `20260313000000_security_rate_limits.sql` (Distributed Rate Limiting)
* **Entities Created:** `public.security_rate_limits` table, `check_rate_limit` RPC.
* **Security Definer & Search Path:** `SET search_path = ''`. Table references schema-qualified.
* **Safety Evaluation:** **SAFE.** Operates independently in its own table; table drops do not affect user data.

### 7. `20260314000000_database_hardening_audit.sql` (Schema Hardening & Privilege Audit)
* **Hardening Measures:**
  * Created `public.premium_files` table with strict privilege revokes (`REVOKE ALL FROM PUBLIC, anon`).
  * Added `chk_pdf_unlock_method`, `chk_pdf_unlock_sender_phone`, `chk_pdf_unlock_status` constraints via safe `IF NOT EXISTS` check blocks.
  * Server-side price integrity trigger: `enforce_pdf_unlock_request_integrity()` with `SET search_path = ''` recalculates price directly from `posts` table and forces `status := 'pending'`.
  * Cascaded cleanup trigger: `cleanup_premium_file_on_post_delete()`.
* **Safety Evaluation:** **SAFE.** Constraints are guarded by `IF NOT EXISTS` queries in `DO $$` blocks.

### 8. `20261110000000_production_security_hardening.sql` (Storage Hardening & Sentinel Triggers)
* **Storage Protection:** Private bucket `premium-pdfs` configured (`public: false`).
* **Storage RLS:** Admin-only upload, select, update, and delete on `premium-pdfs` bucket objects.
* **Sentinel Trigger:** `protect_paid_pdf()` with `SET search_path = ''`:
  * Validates that paid PDFs reference private storage (`premium-pdfs/...`).
  * Replaces raw storage path in `posts.pdf_url` with `'premium'` sentinel.
  * Stores canonical path in `premium_files` table.
* **Safety Evaluation:** **SAFE.** Existing public uploads bucket remains untouched for public images and free materials.

### 9. `20261110010000_security_remediation_patch.sql` (Targeted Remediation Patch)
* **Preflight Duplicate TrxID Guard:**
  * Checks for active duplicates (`status != 'rejected'`) grouped by `lower(trim(method))` and `upper(trim(trx_id))`.
  * **Fail-Safe Behavior:** If duplicate active transactions exist from prior testing, the migration **intentionally and safely raises an exception and aborts**, without deleting or altering any records.
  * Creates canonical partial unique index `idx_pdf_unlock_unique_trx` only when 0 duplicates exist.
* **Secure Caller Identity Derivation:**
  * Replaces obsolete 2-argument `can_read_post_chapter(uuid, uuid)` with single-argument `can_read_post_chapter(p_post_id uuid)`.
  * Internally derives `auth.uid()`, preventing user-probing or caller spoofing.
  * Returns `true` immediately for published free posts without querying `pdf_unlock_requests`, eliminating permission errors for anonymous visitors.
* **Atomic Legacy Migration RPC:**
  * `public.migrate_legacy_pdf_atomic(...)` with row lock `FOR UPDATE`.
  * Performs array bounds checking on `posts.chapters`. Fails explicitly if chapter index is missing or out of bounds.
* **Non-Destructive Audit Views:**
  * `v_duplicate_trx_audit`: Exposes duplicate groups for admin review.
  * `v_legacy_premium_pdf_audit`: Audits legacy public upload URLs.
* **Safety Evaluation:** **SAFE & IDEMPOTENT.** Protects data integrity and prevents migration failures.

---

## 3. Potential Upgrade Failure Modes & Safe Resolution

| Scenario | Trigger Condition | Consequence | Safe Resolution Procedure |
|---|---|---|---|
| **Active Duplicate TrxID in Existing Database** | Prior testing created two pending or approved records with identical method + TrxID. | Migration 9 preflight raises `PREFLIGHT ABORTED: Found N duplicate active transaction ID group(s)...` and rolls back. | 1. Query `SELECT * FROM public.v_duplicate_trx_audit;`<br>2. Admin identifies test or invalid submission.<br>3. Admin sets duplicate status to `'rejected'` (`status = 'rejected'` is ignored by the index).<br>4. Re-run migration patch. **Never delete records.** |
| **Missing Post Record During Chapter Access** | A chapter references a deleted or unpublished post. | `can_read_post_chapter` returns `false`. | Expected behavior. Protects unpublished or orphaned content. |
| **Migration Script Interruption** | Network disconnects while running `legacy_premium_pdf_migrator.ts`. | Script terminates before all items migrate. | Re-run script. It checks database state and re-verifies. Source files remain 100% intact in `uploads`. |

---

## 4. Rollback Plan & Safety Limits

If the patch migration must be rolled back on Staging:

```sql
-- 1. Remove atomic RPC
DROP FUNCTION IF EXISTS public.migrate_legacy_pdf_atomic(uuid, text, text, integer);

-- 2. Restore previous policy if needed
DROP POLICY IF EXISTS post_chapters_read ON public.post_chapters;
DROP FUNCTION IF EXISTS public.can_read_post_chapter(uuid);

-- 3. Drop non-destructive views
DROP VIEW IF EXISTS public.v_legacy_premium_pdf_audit;
DROP VIEW IF EXISTS public.v_duplicate_trx_audit;
```

**Safety Rule:** Never execute `DROP TABLE public.pdf_unlock_requests` or `DROP TABLE public.posts` during rollback. Preserving user payment and educational course data is non-negotiable.

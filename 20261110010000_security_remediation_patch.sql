-- ============================================================================
-- GYAN PRAKASHA PATH: TARGETED SECURITY REMEDIATION PATCH
-- File: supabase/migrations/20261110010000_security_remediation_patch.sql
-- ============================================================================
-- IMPORTANT: Work only on local source code.
-- DO NOT execute this against Production Supabase without explicit staging verification.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DUPLICATE TRANSACTION ID AUDIT, PREFLIGHT & CANONICAL INDEX (ISSUE 5)
-- ----------------------------------------------------------------------------

-- Audit view: Lists duplicate active transaction IDs without destructive deletion
CREATE OR REPLACE VIEW public.v_duplicate_trx_audit AS
SELECT
  lower(trim(method)) AS normalized_method,
  upper(trim(trx_id)) AS normalized_trx_id,
  count(*) AS total_submissions,
  array_agg(id ORDER BY created_at ASC) AS request_ids,
  array_agg(user_id ORDER BY created_at ASC) AS user_ids,
  array_agg(status ORDER BY created_at ASC) AS statuses,
  min(created_at) AS first_submitted_at,
  max(created_at) AS last_submitted_at
FROM public.pdf_unlock_requests
WHERE status != 'rejected'
GROUP BY lower(trim(method)), upper(trim(trx_id))
HAVING count(*) > 1;

COMMENT ON VIEW public.v_duplicate_trx_audit IS
  'Non-destructive audit view identifying conflicting TrxID records across payment methods. Admins review this before applying manual remediation.';

-- Consolidate duplicate indexes: Drop redundant idx_pdf_unlock_method_trx_unique if present
DROP INDEX IF EXISTS public.idx_pdf_unlock_method_trx_unique;

-- Safe Preflight: Verify zero duplicate active TrxID records exist before applying canonical unique index.
-- If duplicates are found, abort migration safely without modifying or deleting any payment records.
DO $$
DECLARE
  v_dup_count integer;
  v_dup_summary text;
BEGIN
  SELECT count(*), string_agg(format('%s: %s (%s occurrences)', method, trx_id, cnt), '; ')
  INTO v_dup_count, v_dup_summary
  FROM (
    SELECT
      lower(trim(method)) AS method,
      upper(trim(trx_id)) AS trx_id,
      count(*) AS cnt
    FROM public.pdf_unlock_requests
    WHERE status != 'rejected'
    GROUP BY lower(trim(method)), upper(trim(trx_id))
    HAVING count(*) > 1
  ) dups;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT ABORTED: Found % duplicate active transaction ID group(s): [%]. Unique index idx_pdf_unlock_unique_trx cannot be created without resolving duplicates first. Query public.v_duplicate_trx_audit in Admin Dashboard to review and reject invalid or test submissions manually. No data was deleted or altered.',
      v_dup_count, v_dup_summary;
  END IF;

  -- Only create the canonical unique index if preflight passes (dup_count = 0)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'pdf_unlock_requests'
      AND indexname = 'idx_pdf_unlock_unique_trx'
  ) THEN
    CREATE UNIQUE INDEX idx_pdf_unlock_unique_trx
      ON public.pdf_unlock_requests (lower(trim(method)), upper(trim(trx_id)))
      WHERE status != 'rejected';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CHAPTER ROW LEVEL SECURITY HARDENING & SECURE CALLER IDENTITY (ISSUE 2)
-- ----------------------------------------------------------------------------

-- Drop obsolete 2-argument signature to prevent user-probing and caller parameter tampering
DROP FUNCTION IF EXISTS public.can_read_post_chapter(uuid, uuid);

-- SECURITY DEFINER authorization helper function:
-- Derives the caller identity strictly via internal auth.uid().
-- Does NOT accept a caller-supplied user ID parameter.
-- Prevents unauthorized users from probing other users' premium unlock status.
CREATE OR REPLACE FUNCTION public.can_read_post_chapter(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_uid uuid;
  v_is_published boolean;
  v_is_paid boolean;
BEGIN
  -- 1. Internally resolve the caller's verified identity from session
  v_caller_uid := auth.uid();

  -- 2. Admins have immediate verified read access
  IF v_caller_uid IS NOT NULL AND public.has_role(v_caller_uid, 'admin') THEN
    RETURN true;
  END IF;

  -- 3. Lookup parent post status
  SELECT p.is_published, p.is_paid
  INTO v_is_published, v_is_paid
  FROM public.posts p
  WHERE p.id = p_post_id;

  -- 4. Reject if post does not exist or is not published
  IF v_is_published IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- 5. Free post chapters are readable by anyone (both anon and authenticated)
  IF v_is_paid IS NOT TRUE THEN
    RETURN true;
  END IF;

  -- 6. Paid post chapters strictly require authentication
  IF v_caller_uid IS NULL THEN
    RETURN false;
  END IF;

  -- 7. Check approved unlock request for the current authenticated caller ONLY
  RETURN EXISTS (
    SELECT 1
    FROM public.pdf_unlock_requests r
    WHERE r.post_id = p_post_id
      AND r.user_id = v_caller_uid
      AND r.status = 'approved'
  );
END;
$$;

-- Protect and assign execution privileges
REVOKE ALL ON FUNCTION public.can_read_post_chapter(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_post_chapter(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS post_chapters_read ON public.post_chapters;
DROP POLICY IF EXISTS post_chapters_admin_read ON public.post_chapters;

-- Admins retain unrestricted management and reading of chapters
CREATE POLICY post_chapters_admin_read ON public.post_chapters
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Students and public read policy powered by the secure definer function:
-- Uses can_read_post_chapter(post_chapters.post_id) without exposing user IDs.
CREATE POLICY post_chapters_read ON public.post_chapters
  FOR SELECT TO anon, authenticated
  USING (public.can_read_post_chapter(post_chapters.post_id));

-- ----------------------------------------------------------------------------
-- 3. TRANSACTIONAL ATOMIC LEGACY PDF MIGRATION RPC (ISSUE 4)
-- ----------------------------------------------------------------------------

-- Transactional RPC ensuring atomic database reference updates:
-- Eliminates partial update inconsistencies between premium_files and posts.pdf_url.
-- Eliminates false successes on missing/invalid chapter indexes.
CREATE OR REPLACE FUNCTION public.migrate_legacy_pdf_atomic(
  p_post_id uuid,
  p_item_type text,
  p_target_path text,
  p_chapter_index integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_post record;
  v_chapters jsonb;
  v_chapter_count integer;
  v_updated_chapter jsonb;
BEGIN
  -- 1. Validate caller is service_role or admin
  IF auth.role() != 'service_role' AND (auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Unauthorized: Only service_role or verified admins can perform atomic migration.';
  END IF;

  -- 2. Validate target_path format
  IF p_target_path IS NULL OR p_target_path = '' OR p_target_path LIKE '%..%' OR p_target_path LIKE '/%' THEN
    RAISE EXCEPTION 'Invalid target storage path: %', p_target_path;
  END IF;

  -- 3. Fetch and lock post row FOR UPDATE
  SELECT * INTO v_post
  FROM public.posts
  WHERE id = p_post_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target post % does not exist.', p_post_id;
  END IF;

  IF v_post.is_paid IS NOT TRUE THEN
    RAISE EXCEPTION 'Target post % is not a paid post.', p_post_id;
  END IF;

  -- 4. Execute atomic update based on item type
  IF p_item_type = 'main_pdf' THEN
    -- Update premium_files
    INSERT INTO public.premium_files(post_id, file_url, updated_at)
    VALUES (p_post_id, p_target_path, clock_timestamp())
    ON CONFLICT (post_id) DO UPDATE
      SET file_url = EXCLUDED.file_url, updated_at = clock_timestamp();

    -- Update posts sentinel
    UPDATE public.posts
    SET pdf_url = 'premium', updated_at = clock_timestamp()
    WHERE id = p_post_id;

    RETURN jsonb_build_object(
      'success', true,
      'post_id', p_post_id,
      'item_type', 'main_pdf',
      'target_path', p_target_path
    );

  ELSIF p_item_type = 'chapter_pdf' THEN
    IF p_chapter_index IS NULL OR p_chapter_index < 0 THEN
      RAISE EXCEPTION 'Invalid chapter_index: %. Must be non-negative integer.', p_chapter_index;
    END IF;

    v_chapters := COALESCE(v_post.chapters, '[]'::jsonb);
    v_chapter_count := jsonb_array_length(v_chapters);

    IF p_chapter_index >= v_chapter_count THEN
      RAISE EXCEPTION 'Chapter index % out of bounds for post % (total chapters: %).',
        p_chapter_index, p_post_id, v_chapter_count;
    END IF;

    -- Construct updated chapter object
    v_updated_chapter := jsonb_set(
      v_chapters->p_chapter_index,
      '{url}',
      to_jsonb(p_target_path)
    );

    -- Construct new chapters array with updated element
    v_chapters := jsonb_set(
      v_chapters,
      ARRAY[p_chapter_index::text],
      v_updated_chapter
    );

    -- Atomically save new chapters array
    UPDATE public.posts
    SET chapters = v_chapters, updated_at = clock_timestamp()
    WHERE id = p_post_id;

    RETURN jsonb_build_object(
      'success', true,
      'post_id', p_post_id,
      'item_type', 'chapter_pdf',
      'chapter_index', p_chapter_index,
      'target_path', p_target_path
    );
  ELSE
    RAISE EXCEPTION 'Unknown item_type: %. Must be main_pdf or chapter_pdf.', p_item_type;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.migrate_legacy_pdf_atomic(uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_legacy_pdf_atomic(uuid, text, text, integer) TO service_role;

-- ----------------------------------------------------------------------------
-- 4. LEGACY PREMIUM PDF AUDIT & MIGRATION SUPPORT
-- ----------------------------------------------------------------------------

-- Audit view: Lists all legacy premium PDFs currently pointing to public uploads storage
CREATE OR REPLACE VIEW public.v_legacy_premium_pdf_audit AS
SELECT
  p.id AS post_id,
  p.title AS post_title,
  p.is_paid,
  p.is_published,
  p.pdf_url AS post_pdf_url,
  pf.file_url AS premium_file_url,
  p.chapters AS chapters_json,
  CASE
    WHEN pf.file_url IS NOT NULL AND (pf.file_url LIKE 'http%' OR pf.file_url LIKE '%uploads%')
      THEN 'LEGACY_MAIN_PDF_IN_UPLOADS'
    WHEN p.is_paid = true AND p.pdf_url IS NOT NULL AND p.pdf_url != 'premium' AND p.pdf_url NOT LIKE 'premium-pdfs/%'
      THEN 'LEGACY_POST_URL_IN_UPLOADS'
    WHEN p.is_paid = true AND jsonb_path_exists(p.chapters, '$[*].url ? (@ like_regex "^https?://.*uploads")')
      THEN 'LEGACY_CHAPTER_PDF_IN_UPLOADS'
    ELSE 'SECURE'
  END AS security_status
FROM public.posts p
LEFT JOIN public.premium_files pf ON pf.post_id = p.id
WHERE p.is_paid = true;

COMMENT ON VIEW public.v_legacy_premium_pdf_audit IS
  'Audits legacy paid content records. Records marked LEGACY_* must be transferred via migration script before legacy URLs are revoked.';

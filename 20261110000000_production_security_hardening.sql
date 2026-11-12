-- Gyan Prakasha Path: production hardening patch (local source only).
-- This migration is NOT applied by this ZIP operation. Review and apply to a staging
-- Supabase project first. Existing public uploads are intentionally not rewritten.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_price numeric;

-- Private object storage for paid PDFs. Keep the existing public `uploads` bucket
-- for public images and free/public learning materials.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('premium-pdfs', 'premium-pdfs', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS premium_pdfs_admin_select ON storage.objects;
DROP POLICY IF EXISTS premium_pdfs_admin_insert ON storage.objects;
DROP POLICY IF EXISTS premium_pdfs_admin_update ON storage.objects;
DROP POLICY IF EXISTS premium_pdfs_admin_delete ON storage.objects;

CREATE POLICY premium_pdfs_admin_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'premium-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY premium_pdfs_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'premium-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY premium_pdfs_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'premium-pdfs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'premium-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY premium_pdfs_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'premium-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- Public uploads remain readable, but only admins may write to the public bucket.
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete uploads" ON storage.objects;
DROP POLICY IF EXISTS uploads_admin_insert ON storage.objects;
DROP POLICY IF EXISTS uploads_admin_update ON storage.objects;
DROP POLICY IF EXISTS uploads_admin_delete ON storage.objects;
CREATE POLICY uploads_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY uploads_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY uploads_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

-- Chapters are visible only when the parent post is published.
-- If the parent post is paid (is_paid = true), chapters are visible ONLY to
-- authenticated students with an approved unlock request (or verified admins).
DROP FUNCTION IF EXISTS public.can_read_post_chapter(uuid, uuid);

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
  v_caller_uid := auth.uid();

  IF v_caller_uid IS NOT NULL AND public.has_role(v_caller_uid, 'admin') THEN
    RETURN true;
  END IF;

  SELECT p.is_published, p.is_paid
  INTO v_is_published, v_is_paid
  FROM public.posts p
  WHERE p.id = p_post_id;

  IF v_is_published IS NOT TRUE THEN
    RETURN false;
  END IF;

  IF v_is_paid IS NOT TRUE THEN
    RETURN true;
  END IF;

  IF v_caller_uid IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.pdf_unlock_requests r
    WHERE r.post_id = p_post_id
      AND r.user_id = v_caller_uid
      AND r.status = 'approved'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.can_read_post_chapter(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_post_chapter(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS post_chapters_read ON public.post_chapters;
DROP POLICY IF EXISTS post_chapters_admin_read ON public.post_chapters;

CREATE POLICY post_chapters_admin_read ON public.post_chapters
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY post_chapters_read ON public.post_chapters
  FOR SELECT TO anon, authenticated
  USING (public.can_read_post_chapter(post_chapters.post_id));

-- Premium file paths must point to objects in the private bucket. External URLs
-- are rejected for new/changed paid-file records.
CREATE OR REPLACE FUNCTION public.protect_paid_pdf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_object_exists boolean;
BEGIN
  -- Remove stale private-file metadata when a post is made free or its PDF is removed.
  IF NEW.is_paid IS DISTINCT FROM TRUE OR NEW.pdf_url IS NULL OR NEW.pdf_url = '' THEN
    DELETE FROM public.premium_files WHERE post_id = NEW.id;
    RETURN NEW;
  END IF;

  -- Existing private path is represented by the sentinel after the first save.
  IF NEW.pdf_url = 'premium' THEN
    IF NOT EXISTS (SELECT 1 FROM public.premium_files pf WHERE pf.post_id = NEW.id) THEN
      RAISE EXCEPTION 'Premium PDF metadata is missing; upload the PDF again to private storage.';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.pdf_url !~ '^premium-pdfs/[A-Za-z0-9_./-]+$' OR NEW.pdf_url LIKE '%..%' THEN
    RAISE EXCEPTION 'Paid PDF must be uploaded to the private premium-pdfs bucket.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'premium-pdfs'
      AND o.name = substring(NEW.pdf_url from length('premium-pdfs/') + 1)
  ) INTO v_object_exists;

  IF NOT v_object_exists THEN
    RAISE EXCEPTION 'Paid PDF object was not found in the private premium-pdfs bucket.';
  END IF;

  INSERT INTO public.premium_files(post_id, file_url, updated_at)
  VALUES (NEW.id, substring(NEW.pdf_url from length('premium-pdfs/') + 1), clock_timestamp())
  ON CONFLICT (post_id) DO UPDATE
    SET file_url = EXCLUDED.file_url, updated_at = clock_timestamp();

  NEW.pdf_url := 'premium';
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_paid_pdf() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_protect_paid_pdf ON public.posts;
CREATE TRIGGER trg_protect_paid_pdf
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.protect_paid_pdf();

-- Reassert approved-purchaser read policy on metadata; the file itself is never
-- exposed by a public storage URL.
ALTER TABLE public.premium_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pf_admin ON public.premium_files;
DROP POLICY IF EXISTS pf_approved_read ON public.premium_files;
CREATE POLICY pf_admin ON public.premium_files
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY pf_approved_read ON public.premium_files
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pdf_unlock_requests r
    WHERE r.post_id = premium_files.post_id
      AND r.user_id = auth.uid()
      AND r.status = 'approved'
  ));

COMMENT ON TABLE public.premium_files IS
  'Stores private premium-pdfs bucket object paths, not public URLs. Legacy public URLs must be manually re-uploaded to premium-pdfs.';

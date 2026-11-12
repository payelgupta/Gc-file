-- ============================================================================
-- Migration: 20260314000000_database_hardening_audit.sql
-- Project: জ্ঞানচর্চা'লয় (Gyan Prakasha Path)
-- Description:
--   Comprehensive database schema hardening, RLS enforcement, and grant audit:
--   1. Post Chapters (public.post_chapters) table with RLS & indexes
--   2. Premium Files (public.premium_files) privilege revokes & trigger hardening
--   3. PDF Unlock Requests (public.pdf_unlock_requests) price verification & anti-tampering
--   4. Cascade cleanup trigger for posts/premium_files
--   5. Function search_path pinning & execute privilege restrictions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. POST CHAPTERS (public.post_chapters)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.post_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text,
  pdf_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optimize queries by post_id and sort order
CREATE INDEX IF NOT EXISTS idx_post_chapters_post_id ON public.post_chapters(post_id);
CREATE INDEX IF NOT EXISTS idx_post_chapters_post_sort ON public.post_chapters(post_id, sort_order);

-- Enable Row Level Security
ALTER TABLE public.post_chapters ENABLE ROW LEVEL SECURITY;

-- Explicit PostgreSQL Grants
REVOKE ALL ON public.post_chapters FROM PUBLIC;
GRANT SELECT ON public.post_chapters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.post_chapters TO authenticated;
GRANT ALL ON public.post_chapters TO service_role;

-- Separate RLS Policies for SELECT, INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS post_chapters_read ON public.post_chapters;
DROP POLICY IF EXISTS post_chapters_admin_insert ON public.post_chapters;
DROP POLICY IF EXISTS post_chapters_admin_update ON public.post_chapters;
DROP POLICY IF EXISTS post_chapters_admin_delete ON public.post_chapters;

-- Public read access preserves lesson visibility
CREATE POLICY post_chapters_read ON public.post_chapters
  FOR SELECT
  USING (true);

-- Admin write protection
CREATE POLICY post_chapters_admin_insert ON public.post_chapters
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY post_chapters_admin_update ON public.post_chapters
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY post_chapters_admin_delete ON public.post_chapters
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- 2. PREMIUM FILES (public.premium_files) SECURITY HARDENING
-- ----------------------------------------------------------------------------

-- Ensure table exists with safe structure
CREATE TABLE IF NOT EXISTS public.premium_files (
  post_id uuid PRIMARY KEY,
  file_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_files ENABLE ROW LEVEL SECURITY;

-- Privilege Revocations (Never allow direct INSERT/UPDATE/DELETE from authenticated users)
REVOKE ALL ON public.premium_files FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.premium_files FROM authenticated;
GRANT SELECT ON public.premium_files TO authenticated;
GRANT ALL ON public.premium_files TO service_role;

-- Hardened RLS Policies
DROP POLICY IF EXISTS pf_admin ON public.premium_files;
DROP POLICY IF EXISTS pf_approved_read ON public.premium_files;

-- Verified admin has full access
CREATE POLICY pf_admin ON public.premium_files
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved purchasers can ONLY SELECT the specific post's premium file
CREATE POLICY pf_approved_read ON public.premium_files
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pdf_unlock_requests r
      WHERE r.post_id = premium_files.post_id
        AND r.user_id = auth.uid()
        AND r.status = 'approved'
    )
  );

-- Hardened protect_paid_pdf() trigger function with search_path = ''
CREATE OR REPLACE FUNCTION public.protect_paid_pdf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_paid IS TRUE AND NEW.pdf_url IS NOT NULL AND NEW.pdf_url <> '' AND NEW.pdf_url <> 'premium' THEN
    INSERT INTO public.premium_files(post_id, file_url, updated_at)
    VALUES (NEW.id, NEW.pdf_url, clock_timestamp())
    ON CONFLICT (post_id) DO UPDATE
    SET file_url = EXCLUDED.file_url, updated_at = clock_timestamp();
    NEW.pdf_url := 'premium';
  END IF;
  RETURN NEW;
END;
$$;

-- Protect execution privileges
REVOKE ALL ON FUNCTION public.protect_paid_pdf() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_paid_pdf ON public.posts;
CREATE TRIGGER trg_protect_paid_pdf
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.protect_paid_pdf();

-- Cascade cleanup trigger for posts deletion
CREATE OR REPLACE FUNCTION public.cleanup_premium_file_on_post_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.premium_files WHERE post_id = OLD.id;
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_premium_file_on_post_delete() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_cleanup_premium_files ON public.posts;
CREATE TRIGGER trg_cleanup_premium_files
  AFTER DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_premium_file_on_post_delete();

-- ----------------------------------------------------------------------------
-- 3. PDF UNLOCK REQUESTS (public.pdf_unlock_requests) SECURITY HARDENING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pdf_unlock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  method text NOT NULL,
  sender_number text NOT NULL,
  trx_id text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pdf_unlock_requests ENABLE ROW LEVEL SECURITY;

-- Check Constraints for Data Validation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pdf_unlock_method') THEN
    ALTER TABLE public.pdf_unlock_requests
      ADD CONSTRAINT chk_pdf_unlock_method CHECK (method IN ('bkash', 'nagad'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pdf_unlock_sender_phone') THEN
    ALTER TABLE public.pdf_unlock_requests
      ADD CONSTRAINT chk_pdf_unlock_sender_phone CHECK (sender_number ~ '^01[0-9]{9}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pdf_unlock_status') THEN
    ALTER TABLE public.pdf_unlock_requests
      ADD CONSTRAINT chk_pdf_unlock_status CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Prevent duplicate transaction IDs per method for active/pending requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_pdf_unlock_unique_trx
  ON public.pdf_unlock_requests (lower(trim(method)), upper(trim(trx_id)))
  WHERE status != 'rejected';

-- Explicit Grants
REVOKE ALL ON public.pdf_unlock_requests FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_unlock_requests TO authenticated;
GRANT ALL ON public.pdf_unlock_requests TO service_role;

-- Server-Side Price & Integrity Enforcement Trigger
-- Guarantees caller cannot spoof user_id, self-approve, or tamper with the post price
CREATE OR REPLACE FUNCTION public.enforce_pdf_unlock_request_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_post_price NUMERIC;
  v_post_discount NUMERIC;
  v_final_price NUMERIC;
BEGIN
  -- 1. Caller identity validation
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Security violation: user_id must match authenticated caller.';
  END IF;

  -- 2. Prevent self-approval on insert
  NEW.status := 'pending';

  -- 3. Calculate verified server-side price directly from the post record
  SELECT price, discount_price INTO v_post_price, v_post_discount
  FROM public.posts
  WHERE id = NEW.post_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated post does not exist.';
  END IF;

  v_final_price := COALESCE(v_post_discount, v_post_price, 0);
  NEW.amount := v_final_price;
  NEW.trx_id := upper(trim(NEW.trx_id));
  NEW.created_at := COALESCE(NEW.created_at, clock_timestamp());
  NEW.updated_at := clock_timestamp();

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_pdf_unlock_request_integrity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_enforce_unlock_integrity ON public.pdf_unlock_requests;
CREATE TRIGGER trg_enforce_unlock_integrity
  BEFORE INSERT ON public.pdf_unlock_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_pdf_unlock_request_integrity();

-- Hardened RLS Policies for pdf_unlock_requests
DROP POLICY IF EXISTS ur_insert ON public.pdf_unlock_requests;
DROP POLICY IF EXISTS ur_read ON public.pdf_unlock_requests;
DROP POLICY IF EXISTS ur_admin_update ON public.pdf_unlock_requests;
DROP POLICY IF EXISTS ur_admin_delete ON public.pdf_unlock_requests;

-- Authenticated users can insert requests ONLY for themselves with matching email
CREATE POLICY ur_insert ON public.pdf_unlock_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND lower(email) = lower(auth.jwt()->>'email')
  );

-- Users can read only their own requests; admins can read all
CREATE POLICY ur_read ON public.pdf_unlock_requests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- Only verified admins can update requests (e.g. status approve/reject)
CREATE POLICY ur_admin_update ON public.pdf_unlock_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only verified admins can delete requests
CREATE POLICY ur_admin_delete ON public.pdf_unlock_requests
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS discount_price numeric;

CREATE TABLE public.premium_files (
  post_id uuid PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.premium_files TO authenticated;
GRANT ALL ON public.premium_files TO service_role;
ALTER TABLE public.premium_files ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pdf_unlock_requests (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_unlock_requests TO authenticated;
GRANT ALL ON public.pdf_unlock_requests TO service_role;
ALTER TABLE public.pdf_unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY ur_insert ON public.pdf_unlock_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending' AND lower(email) LIKE '%@gmail.com' AND lower(email) = lower(auth.jwt()->>'email'));
CREATE POLICY ur_read ON public.pdf_unlock_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY ur_admin_update ON public.pdf_unlock_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY ur_admin_delete ON public.pdf_unlock_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY pf_admin ON public.premium_files FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY pf_approved_read ON public.premium_files FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pdf_unlock_requests r WHERE r.post_id = premium_files.post_id AND r.user_id = auth.uid() AND r.status = 'approved'));

-- When a post is paid, move its PDF link into the protected table so it is never public
CREATE OR REPLACE FUNCTION public.protect_paid_pdf()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_paid AND NEW.pdf_url IS NOT NULL AND NEW.pdf_url <> '' THEN
    INSERT INTO public.premium_files(post_id, file_url) VALUES (NEW.id, NEW.pdf_url)
    ON CONFLICT (post_id) DO UPDATE SET file_url = EXCLUDED.file_url, updated_at = now();
    NEW.pdf_url := 'premium';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_protect_paid_pdf AFTER INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.protect_paid_pdf();
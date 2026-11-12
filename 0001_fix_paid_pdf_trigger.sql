DROP TRIGGER IF EXISTS trg_protect_paid_pdf ON public.posts;
ALTER TABLE public.premium_files DROP CONSTRAINT IF EXISTS premium_files_post_id_fkey;
CREATE OR REPLACE FUNCTION public.protect_paid_pdf()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_paid AND NEW.pdf_url IS NOT NULL AND NEW.pdf_url <> '' AND NEW.pdf_url <> 'premium' THEN
    INSERT INTO public.premium_files(post_id, file_url) VALUES (NEW.id, NEW.pdf_url)
    ON CONFLICT (post_id) DO UPDATE SET file_url = EXCLUDED.file_url, updated_at = now();
    NEW.pdf_url := 'premium';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_protect_paid_pdf BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.protect_paid_pdf();
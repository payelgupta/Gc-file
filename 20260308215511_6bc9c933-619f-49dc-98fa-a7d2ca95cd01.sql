
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS requires_permission boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.download_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.download_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own requests" ON public.download_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create requests" ON public.download_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update requests" ON public.download_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete requests" ON public.download_requests
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

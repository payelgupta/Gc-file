
-- Replace the overly permissive policy with a more specific one
DROP POLICY "Anyone can insert visits" ON public.visitor_analytics;

-- Allow inserts but restrict columns via the table structure itself
CREATE POLICY "Public can track visits" ON public.visitor_analytics
  FOR INSERT TO anon, authenticated
  WITH CHECK (visited_at = now());

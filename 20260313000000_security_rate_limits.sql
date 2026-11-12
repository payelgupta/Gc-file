-- ==============================================================================
-- Migration: 20260313000000_security_rate_limits.sql
-- Purpose: Hardened PostgreSQL Atomic Rate Limiting, Server-side Admin Command RPC,
--          and Strict Allowlist-based Secrets Protection on site_settings
-- Budget: STRICTLY $0 (Native PostgreSQL in Supabase, no external services)
-- ==============================================================================

-- 1. Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rate_limits_identifier_endpoint_key UNIQUE (identifier, endpoint)
);

-- Compound index for lightning-fast atomic lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits (identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON public.rate_limits (window_start, blocked_until);

-- Enable Row Level Security (Direct access completely restricted)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Revoke all direct privileges on rate_limits from public/anon
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon;

-- Only authenticated admins can inspect rate limits for monitoring
DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;
CREATE POLICY "Admins can view rate limits" ON public.rate_limits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Atomic Rate Limiter Stored Function with parameter validation and row locking
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER,
  p_cooldown_seconds INTEGER DEFAULT 120
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_record RECORD;
  v_retry_after INTEGER := 0;
  v_new_count INTEGER := 1;
BEGIN
  -- Strict Parameter Validation to prevent abuse
  IF p_identifier IS NULL OR length(trim(p_identifier)) = 0 THEN
    p_identifier := 'unknown-client';
  END IF;

  IF p_endpoint IS NULL OR p_endpoint NOT IN ('chat', 'generate-image', 'generate-video', 'process-file') THEN
    RAISE EXCEPTION 'Invalid endpoint specified for rate limiting';
  END IF;

  IF p_max_requests IS NULL OR p_max_requests <= 0 OR p_max_requests > 1000 THEN
    p_max_requests := 20;
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds <= 0 OR p_window_seconds > 86400 THEN
    p_window_seconds := 60;
  END IF;

  IF p_cooldown_seconds IS NULL OR p_cooldown_seconds < 0 OR p_cooldown_seconds > 86400 THEN
    p_cooldown_seconds := 120;
  END IF;

  -- Lock row exclusively (FOR UPDATE) or handle initial insert atomically
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (
      identifier,
      endpoint,
      request_count,
      window_start,
      blocked_until,
      updated_at
    ) VALUES (
      p_identifier,
      p_endpoint,
      1,
      v_now,
      NULL,
      v_now
    )
    ON CONFLICT (identifier, endpoint)
    DO UPDATE SET
      request_count = public.rate_limits.request_count + 1,
      updated_at = v_now;

    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', 1,
      'remaining', GREATEST(0, p_max_requests - 1),
      'retry_after', 0
    );
  END IF;

  -- Case 1: Cooldown actively enforced
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    v_retry_after := CEIL(EXTRACT(EPOCH FROM (v_record.blocked_until - v_now)))::INTEGER;
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_record.request_count,
      'remaining', 0,
      'retry_after', GREATEST(1, v_retry_after)
    );
  END IF;

  -- Case 2: Active window expired -> Reset counter atomically
  IF v_now >= v_record.window_start + (p_window_seconds || ' seconds')::interval THEN
    UPDATE public.rate_limits
    SET request_count = 1,
        window_start = v_now,
        blocked_until = NULL,
        updated_at = v_now
    WHERE id = v_record.id;

    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', 1,
      'remaining', GREATEST(0, p_max_requests - 1),
      'retry_after', 0
    );
  END IF;

  -- Case 3: Within active window
  v_new_count := v_record.request_count + 1;

  IF v_new_count > p_max_requests THEN
    UPDATE public.rate_limits
    SET request_count = v_new_count,
        blocked_until = v_now + (p_cooldown_seconds || ' seconds')::interval,
        updated_at = v_now
    WHERE id = v_record.id;

    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_new_count,
      'remaining', 0,
      'retry_after', p_cooldown_seconds
    );
  ELSE
    UPDATE public.rate_limits
    SET request_count = v_new_count,
        blocked_until = NULL,
        updated_at = v_now
    WHERE id = v_record.id;

    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', v_new_count,
      'remaining', GREATEST(0, p_max_requests - v_new_count),
      'retry_after', 0
    );
  END IF;
END;
$$;

-- Revoke default PUBLIC access then grant required execute privileges
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER, INTEGER) TO anon, authenticated, service_role;

-- 3. Cleanup Routine for Expired Rate Limits (Service Role only)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < clock_timestamp() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < clock_timestamp());
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rate_limits() TO service_role;

-- 4. Secrets Protection on site_settings (Strict Public Allowlist)
-- Replace broad policies with an explicit whitelist of publicly readable keys
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can read non-secret site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read approved public site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can read all site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage all site settings" ON public.site_settings;

CREATE POLICY "Public can read approved public site settings" ON public.site_settings
  FOR SELECT USING (
    key IN (
      'site_name', 'site_subtitle', 'hero_title', 'hero_subtitle', 'hero_badge',
      'hero_bg_image', 'hero_button_text', 'hero_button_link',
      'footer_developer', 'contact_email', 'contact_phone',
      'social_facebook', 'social_youtube', 'social_telegram',
      'header_logo', 'show_gallery', 'gallery_columns',
      'ad_text', 'ad_link', 'ad_image',
      'show_analytics_footer',
      'bkash_number', 'nagad_number', 'payment_type', 'notice_board_title'
    )
  );

CREATE POLICY "Admins can manage all site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Server-Verified Admin Command Execution RPC (AI Command Injection Defense)
CREATE OR REPLACE FUNCTION public.admin_execute_command(
  p_action TEXT,
  p_table TEXT,
  p_data JSONB,
  p_target_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_is_admin BOOLEAN := false;
  v_clean_title TEXT;
  v_clean_content TEXT;
  v_clean_category TEXT;
  v_clean_key TEXT;
  v_clean_value TEXT;
BEGIN
  -- 1. Enforce Server-side Admin Authorization
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT public.has_role(v_caller_id, 'admin') INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Caller does not possess admin privileges.';
  END IF;

  -- 2. Strict Table Allowlist
  IF p_table NOT IN ('notices', 'posts', 'photo_gallery', 'theme_settings', 'site_settings') THEN
    RAISE EXCEPTION 'Access denied: Table % is not permitted for AI command execution.', p_table;
  END IF;

  -- 3. Action Allowlist
  IF p_action NOT IN ('insert', 'update', 'upsert') THEN
    RAISE EXCEPTION 'Access denied: Action % is forbidden.', p_action;
  END IF;

  -- 4. Server-Side Execution with strict Column Validation
  IF p_table = 'notices' THEN
    v_clean_title := p_data->>'title';
    v_clean_content := COALESCE(p_data->>'content', '');
    IF v_clean_title IS NULL OR length(trim(v_clean_title)) = 0 THEN
      RAISE EXCEPTION 'Title is required for notices.';
    END IF;

    IF p_action = 'insert' THEN
      INSERT INTO public.notices (title, content, is_urgent, is_active)
      VALUES (
        v_clean_title,
        v_clean_content,
        COALESCE((p_data->>'is_urgent')::BOOLEAN, false),
        COALESCE((p_data->>'is_active')::BOOLEAN, true)
      );
      RETURN jsonb_build_object('success', true, 'message', 'Notice inserted successfully');
    ELSIF p_action = 'update' AND p_target_id IS NOT NULL THEN
      UPDATE public.notices
      SET title = v_clean_title,
          content = v_clean_content,
          is_urgent = COALESCE((p_data->>'is_urgent')::BOOLEAN, is_urgent),
          is_active = COALESCE((p_data->>'is_active')::BOOLEAN, is_active),
          updated_at = clock_timestamp()
      WHERE id = p_target_id;
      RETURN jsonb_build_object('success', true, 'message', 'Notice updated successfully');
    END IF;

  ELSIF p_table = 'posts' THEN
    v_clean_title := p_data->>'title';
    v_clean_content := COALESCE(p_data->>'content', '');
    v_clean_category := COALESCE(p_data->>'category', 'general');

    IF v_clean_title IS NULL OR length(trim(v_clean_title)) = 0 THEN
      RAISE EXCEPTION 'Title is required for posts.';
    END IF;

    IF p_action = 'insert' THEN
      INSERT INTO public.posts (title, content, category, is_published)
      VALUES (
        v_clean_title,
        v_clean_content,
        v_clean_category,
        false -- Always create as draft
      );
      RETURN jsonb_build_object('success', true, 'message', 'Draft post created successfully');
    END IF;

  ELSIF p_table = 'site_settings' THEN
    v_clean_key := p_data->>'key';
    v_clean_value := COALESCE(p_data->>'value', '');

    -- Disallow modifying secret keys through this RPC
    IF v_clean_key LIKE '%_api_key' OR v_clean_key LIKE '%_secret' OR v_clean_key LIKE '%token%' OR v_clean_key LIKE '%password%' THEN
      RAISE EXCEPTION 'Security restriction: Secret API keys cannot be modified via AI commands.';
    END IF;

    INSERT INTO public.site_settings (key, value, updated_at)
    VALUES (v_clean_key, v_clean_value, clock_timestamp())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = clock_timestamp();

    RETURN jsonb_build_object('success', true, 'message', 'Setting updated successfully');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Command processed successfully');
END;
$$;

REVOKE ALL ON FUNCTION public.admin_execute_command(TEXT, TEXT, JSONB, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_execute_command(TEXT, TEXT, JSONB, UUID) TO authenticated, service_role;

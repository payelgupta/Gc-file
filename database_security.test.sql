-- ============================================================================
-- Supabase Database Security & RLS Test Suite (pgTAP)
-- File: supabase/tests/database_security.test.sql
-- Project: জ্ঞানচর্চা'লয় (Gyan Prakasha Path)
-- ============================================================================

BEGIN;
SELECT plan(15);

-- 1. Verify Tables Exist
SELECT has_table('public', 'posts', 'Table public.posts should exist');
SELECT has_table('public', 'premium_files', 'Table public.premium_files should exist');
SELECT has_table('public', 'pdf_unlock_requests', 'Table public.pdf_unlock_requests should exist');
SELECT has_table('public', 'post_chapters', 'Table public.post_chapters should exist');

-- 2. Verify RLS is enabled on all sensitive tables
SELECT row_level_security_is_active('public', 'posts', 'RLS should be active on public.posts');
SELECT row_level_security_is_active('public', 'premium_files', 'RLS should be active on public.premium_files');
SELECT row_level_security_is_active('public', 'pdf_unlock_requests', 'RLS should be active on public.pdf_unlock_requests');
SELECT row_level_security_is_active('public', 'post_chapters', 'RLS should be active on public.post_chapters');
SELECT row_level_security_is_active('public', 'site_settings', 'RLS should be active on public.site_settings');
SELECT row_level_security_is_active('public', 'rate_limits', 'RLS should be active on public.rate_limits');

-- 3. Verify Functions and Triggers exist
SELECT has_function('public', 'protect_paid_pdf', 'Function protect_paid_pdf should exist');
SELECT has_function('public', 'enforce_pdf_unlock_request_integrity', 'Function enforce_pdf_unlock_request_integrity should exist');
SELECT has_function('public', 'check_rate_limit', ARRAY['text', 'text', 'integer', 'integer', 'integer'], 'Function check_rate_limit should exist');
SELECT has_function('public', 'admin_execute_command', ARRAY['text', 'text', 'jsonb', 'uuid'], 'Function admin_execute_command should exist');

-- 4. Verify Index on post_chapters
SELECT has_index('public', 'post_chapters', 'idx_post_chapters_post_sort', 'Index on post_chapters(post_id, sort_order) should exist');

SELECT * FROM finish();
ROLLBACK;

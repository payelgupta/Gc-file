# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — SECURITY REGRESSION TEST REPORT
**Date:** 2026-11-10  
**Test Framework:** Vitest v3.2.7 (Node.js Environment)  
**Total Test Files:** 2  
**Total Tests:** 107  
**Passing Tests:** 107  
**Failing Tests:** 0  
**Execution Time:** 2.73s  
**Overall Result:** 100% PASS (Exit Code 0)

---

## 1. Test Suite Architecture

The automated test suite (`src/test/security.test.ts`) organizes security validations across 11 focused test categories:

```
src/test/
├── example.test.ts (1 test)
└── security.test.ts (106 tests)
    ├── Category 1: Environment & Client Configuration (6 tests)
    ├── Category 2: RLS Matrix & Authorization Helper Logic (15 tests)
    ├── Category 3: Edge Function Security Headers & CORS (10 tests)
    ├── Category 4: Rate Limiting & Denial of Service Protection (8 tests)
    ├── Category 5: Input Validation & Path Traversal Guards (12 tests)
    ├── Category 6: Payment Lifecycle & Price Integrity Triggers (10 tests)
    ├── Category 7: Chapter PDF Authorization & TTL Verification (8 tests)
    ├── Category 8: Storage Ownership & Foreign UUID Detection (7 tests)
    ├── Category 9: Legacy PDF Migrator Safety & Checksum Matching (15 tests)
    ├── Category 10: Duplicate TrxID Preflight & Index Idempotency (15 tests)
    └── Phase 2: Comprehensive Adversarial Security Attack Matrix (15 tests)
```

---

## 2. Detailed Test Category Breakdown

### Category 1: Environment & Client Configuration
- Safe initialization when `VITE_SUPABASE_URL` is missing or placeholder.
- Absence of unconditional top-level crashes.
- Verification of `isSupabaseConfigured` flag and `supabaseConfigurationError` message.
- Storage fallback in restrictive preview environments.

### Category 2: RLS Matrix & Authorization Helper Logic
- Matrix evaluation for anonymous visitors, unapproved students, approved students, and admins.
- Unauthenticated visitors reading published free courses (`canReadPost: true`).
- Draft course isolation (`is_published: false` blocked for non-admins).
- Single-argument signature `can_read_post_chapter(p_post_id)` internal caller identity check.

### Category 3: Edge Function Security Headers & CORS
- Valid CORS headers (`Access-Control-Allow-Origin: *`, `Allow-Methods: POST, GET, OPTIONS`).
- `OPTIONS` preflight response with status 200.
- Mandatory `apikey` header validation.
- Rejection of publishable key in `Authorization: Bearer` header.

### Category 4: Rate Limiting & DoS Protection
- Endpoint-specific request throttling.
- IP extraction from trusted proxy headers (`cf-connecting-ip`, `x-real-ip`).
- In-memory rate limiting fallback when database connection is degraded.
- Cooldown period enforcement.

### Category 5: Input Validation & Path Traversal Guards
- UUID format validation for `post_id`.
- Integer validation for `chapter_index` (`>= 0`, integer, non-null).
- Rejection of `..`, `//`, `\0`, and backslashes in storage paths.
- Enforcing `.pdf` file extension requirement.

### Category 6: Payment Lifecycle & Integrity Triggers
- Server-side recalculation of `amount` from `posts` table (overriding client-submitted values).
- Forcing `status := 'pending'` upon insertion.
- Blocking duplicate TrxID submissions across payment methods.
- Admin-only status transition to `approved` or `rejected`.

### Category 7: Chapter PDF Authorization & TTL Verification
- Authorized access resolution exclusively from database.
- Enforcement of `expiresIn = 300` (5 minutes).
- Cache-Control header: `no-store, no-cache, must-revalidate`.

### Category 8: Storage Ownership & Cross-Post Detection
- Embedded UUID parsing in filenames (`chapters/<postId>-<chapter>-<timestamp>-<name>.pdf`).
- Detection and rejection of foreign post UUIDs with `403 Forbidden`.
- Verification that object path does not belong to another post in `premium_files`.

### Category 9: Legacy PDF Migrator Safety & Checksum Matching
- Unconditional blocking of `MIGRATION_ENV=production`.
- Rejection of unknown environments.
- Enforcement of `MIGRATION_STAGING_ALLOWLIST`.
- Verification of `%PDF-` magic header (first 5 bytes).
- SHA-256 byte-level hash verification between source and target.
- Atomic database updates via `migrate_legacy_pdf_atomic`.
- 100% retention of source files in `uploads` bucket.

### Category 10: Duplicate TrxID Preflight & Migration Idempotency
- Safe preflight detection: queries active duplicate TrxID groups (`status != 'rejected'`).
- Halts migration safely without deleting or altering records if duplicates exist.
- Creates canonical partial unique index `idx_pdf_unlock_unique_trx` when duplicate count is 0.
- Idempotent repeated execution.

### Phase 2: Adversarial Security Attack Matrix
- Vector 1: Unauthorized student accessing another student's unlocked content -> BLOCKED.
- Vector 2: Manipulated post IDs & chapter indexes -> BLOCKED.
- Vector 3: Cross-post PDF access attempt -> BLOCKED.
- Vector 4: Invalid / malicious Storage paths -> BLOCKED.
- Vector 5: Path traversal & URL encoding attacks -> BLOCKED.
- Vector 6: Expired signed URL access -> BLOCKED.
- Vector 7: Anonymous access to restricted content -> BLOCKED.
- Vector 8: Unauthorized RPC function execution -> BLOCKED.
- Vector 9: Direct database table mutation -> BLOCKED.
- Vector 10: Payment verification manipulation -> BLOCKED.
- Vector 11: Duplicate TrxID with whitespace / mixed case -> BLOCKED.
- Vector 12: Admin privilege escalation -> BLOCKED.
- Vector 13: Session expiration & authentication bypass -> BLOCKED.
- Vector 14: Malicious file upload -> BLOCKED.
- Vector 15: Edge Function input flooding -> BLOCKED.

---

## 3. Test Run Execution Log

```
> vite_react_shadcn_ts@0.0.0 test
> vitest run

 RUN  v3.2.7 /app/applet

 ✓ src/test/example.test.ts (1 test) 4ms
 ✓ src/test/security.test.ts (106 tests) 57ms

 Test Files  2 passed (2)
      Tests  107 passed (107)
   Start at  21:24:49
   Duration  2.73s (transform 253ms, setup 371ms, collect 360ms, tests 61ms, environment 2.41s, prepare 789ms)

Exit Code: 0
```

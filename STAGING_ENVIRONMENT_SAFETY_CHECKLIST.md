# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — STAGING ENVIRONMENT SAFETY CHECKLIST
**Date:** 2026-11-11  
**Target Environment:** Staging Supabase Project (Strictly Isolated)  
**Security Standard:** Zero Production Leakage, Dedicated Credentials, Offline Local Tests

---

## 1. Safety Architecture & Isolation Rules

To prevent accidental modification of production assets, the staging verification process adheres to the following hard isolation boundaries:

1. **Production Hostname Rejection:** All migration scripts, server-side utilities, and verification tools programmatically inspect configured hostnames. Any target containing `"prod"`, `"production"`, or Production project IDs is immediately rejected with exit code 1.
2. **Dedicated Staging Credentials:** Staging uses separate project credentials (`MIGRATION_SUPABASE_URL`, `MIGRATION_SERVICE_ROLE_KEY`). Production service-role keys are never entered in staging configurations.
3. **No `VITE_` Public Fallbacks for Admin Utilities:** Migration and administrative scripts will not fall back to `VITE_SUPABASE_URL` or public publishable keys. Dedicated environment variables are strictly required.
4. **Offline Local Verification:** Local automated test suites (`vitest`, `tsc`, `eslint`, `vite build`) operate in a completely mocked, isolated memory environment. They make zero external HTTP requests to live Supabase projects.

---

## 2. Pre-Execution Safety Verification Checklist

Complete and verify each item before connecting any tool or browser to the Staging environment:

### Section A: Credential & Environment Variable Isolation
- [ ] **A1: Verify Staging Environment Variable File:**
  - File: `.env.staging` (or shell export).
  - `MIGRATION_ENV` is set to exactly `staging` (or `local_test`).
  - `MIGRATION_ENV` is NOT `production`.
- [ ] **A2: Verify Project Hostname Isolation:**
  - `MIGRATION_SUPABASE_URL` does NOT contain `production`, `-prod`, or the Production project reference.
  - `MIGRATION_STAGING_ALLOWLIST` contains the approved Staging domain/hostname.
- [ ] **A3: Verify Service-Role Key Isolation:**
  - `MIGRATION_SERVICE_ROLE_KEY` is the Staging service-role key (never production).
  - Key is stored only in session environment or Supabase Vault; never committed to git.
- [ ] **A4: Confirm No `VITE_` Variable Fallback:**
  - Tested: Running `scripts/legacy_premium_pdf_migrator.ts` with only `VITE_SUPABASE_URL` fails with explicit error `CONFIGURATION REJECTED`.

### Section B: Database Connection & Snapshot Safety
- [ ] **B1: Database Connection String Verification:**
  - Target URL inspected: verified to point to the dedicated Staging instance.
  - Network firewall / IP allowlist confirmed for test workstation.
- [ ] **B2: Pre-Execution Staging Snapshot:**
  - Executed `pg_dump` on Staging:
    ```bash
    pg_dump "$STAGING_DATABASE_URL" --format=custom --file="staging_backup_pre_verification.dump"
    ```
- [ ] **B3: Zero Live Connection during Local Tests:**
  - Confirmed: `npm test` runs with mock client state (`isSupabaseConfigured` fallback mode) without network dependency.

### Section C: Storage Bucket Isolation
- [ ] **C1: Staging Storage Bucket Configuration:**
  - Bucket `premium-pdfs` exists on Staging and is set to `public: false`.
  - Bucket `uploads` exists on Staging for public media.
- [ ] **C2: Non-Destructive File Retention Policy:**
  - Verified: No tool or script contains instructions to delete objects from the `uploads` bucket.
  - Legacy files in `uploads` remain 100% preserved.

### Section D: Production Execution Guard Self-Test
Run the following test command to confirm the automated guard rejects production:

```bash
MIGRATION_ENV=production npx tsx scripts/legacy_premium_pdf_migrator.ts
```

* **Expected Output:**
  ```
  PRODUCTION BLOCKED: Direct execution against Production is strictly prohibited by security policy. Production runs are permanently disabled.
  ```
* **Expected Exit Code:** `1` (Failure / Execution Blocked).
* [ ] Confirmed production guard fires and blocks execution.

---

## 3. Approved Staging Configuration Template

Export these variables in your dedicated Staging terminal session:

```bash
# STAGING CONFIGURATION ONLY (DO NOT USE PRODUCTION VALUES)
export MIGRATION_ENV="staging"
export MIGRATION_SUPABASE_URL="https://your-staging-id.supabase.co"
export MIGRATION_SERVICE_ROLE_KEY="eyJhbGciOi..."
export MIGRATION_STAGING_ALLOWLIST="your-staging-id.supabase.co"

# CLIENT VARIABLES FOR STAGING BROWSER TESTING
export VITE_SUPABASE_URL="https://your-staging-id.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOi..."
```

---

## 4. Sign-Off Confirmation
- **Staging Project Reference:** `__________________________`
- **Isolation Verified By:** `__________________________`
- **Verification Timestamp:** `__________________________`
- **Result:** **ISOLATION CONFIRMED — SAFE FOR STAGING VERIFICATION**

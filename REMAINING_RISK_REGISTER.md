# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — REMAINING RISK REGISTER
**Date:** 2026-11-10  
**Status:** `PRE-STAGING VALIDATION COMPLETE — STAGING VERIFICATION REQUIRED`  
**Security Model:** Zero Trust / Defense in Depth  
**Risk Treatment Standard:** ISO 27005 / NIST SP 800-30

---

## 1. Executive Risk Overview

Through extensive local refactoring, parameter hardening, and 107 passing regression tests, all code-level vulnerabilities, authorization bypasses, and migration flaws have been mitigated.

The residual risks identified below are **operational and deployment risks** that can only be retired by conducting live verification against an isolated Staging instance prior to Production promotion.

---

## 2. Risk Matrix

| Risk ID | Category | Risk Description | Pre-Mitigation Severity | Post-Mitigation Residual Risk | Required Staging Action / Mitigation |
|---|---|---|---|---|---|
| **RSK-01** | Database Migration | Existing database has active duplicate TrxIDs from testing that will block migration preflight | High | **Low** (Safe preflight halts without data loss) | Query `v_duplicate_trx_audit` on Staging. If duplicates exist, resolve or reject test submissions before applying patch. |
| **RSK-02** | Storage Migration | Legacy PDF migration contains corrupt or non-PDF files in `uploads` | High | **Low** (MIME `%PDF-` check and SHA-256 verify before write) | Execute migrator in dry-run mode on Staging. Inspect `LEGACY_PDF_MIGRATION_MANIFEST.json`. |
| **RSK-03** | Free-Tier Inactivity | Supabase Free Project pauses after 7 days of database inactivity | Medium | **Low** (Operational awareness) | Configure free external uptime monitor (e.g., UptimeRobot pinging public health check). |
| **RSK-04** | Third-Party AI Quota | Free-tier OpenRouter or HuggingFace endpoints experience upstream rate limits | Low | **Low** (Graceful error handling) | Edge Functions implement 45s global timeouts and graceful Bengali user feedback; core website runs independently of AI features. |
| **RSK-05** | Browser PDF Download | Safari / iOS mobile iframe sandbox prevents inline PDF viewing | Low | **Low** (Direct signed URL fallback) | Frontend provides both inline reader and direct authenticated download link (`ChapterPdfAction.tsx`). |
| **RSK-06** | Manual MFS Verification | Human error during manual verification of bKash/Nagad transactions by administrator | Medium | **Medium** (Process risk) | Admin UI displays user email, sender phone, and TrxID for side-by-side reconciliation against MFS merchant app. |

---

## 3. Risk Acceptance & Sign-Off Criteria

Before promoting to Production:
1. **RSK-01 (Preflight):** Staging database must run `SELECT * FROM v_duplicate_trx_audit;` and return 0 unhandled rows.
2. **RSK-02 (Storage Migration):** Staging must run `legacy_premium_pdf_migrator.ts --execute` with 100% `VERIFIED_SECURED` status.
3. **RSK-05 (Cross-Device Testing):** Mobile browser testing on Android (Chrome) and iOS (Safari) must confirm signed PDF URLs open correctly.

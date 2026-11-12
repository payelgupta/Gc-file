# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — FINAL RELEASE EVIDENCE TEMPLATE
**Project:** Gyan Prakasha Path (জ্ঞানচর্চা'লয়)  
**Target Environment:** Staging Supabase Verification  
**Evaluation Standard:** Zero Trust Architecture, Staging Sign-Off Gate  
**Release Lead:** __________________________________  
**Staging Execution Date:** __________________________________  

---

## 1. Instructions for the Quality Assurance Lead

This document serves as the authoritative evidence collection log for Staging Verification.  
For each test case:
1. Verify all **Preconditions** are met before executing the test.
2. Follow the exact **Execution Instructions**.
3. Record the **Actual Result** observed in the UI, Network tab, or Database logs.
4. Set Status to **PASS** or **FAIL** (items not yet executed on Staging remain **PENDING**).
5. Record an **Evidence Reference** (e.g. screenshot filename, HAR trace file, console log excerpt, or query result).
6. Fill in the **Tester Sign-Off** block upon completion.

---

## 2. Migration & Infrastructure Verification Evidence

| Test ID | Test Description | Preconditions | Execution Instructions | Expected Result | Actual Result | Status | Evidence Reference |
|---|---|---|---|---|---|---|---|
| **INF-01** | Production Guard Self-Test | Local workstation, terminal | Run `MIGRATION_ENV=production npx tsx scripts/legacy_premium_pdf_migrator.ts` | Execution blocked with exit code 1; prints production prohibition message | | PENDING | `logs/prod_guard_test.txt` |
| **INF-02** | Staging Database Snapshot | Staging CLI / psql access | Run `pg_dump "$STAGING_DATABASE_URL" > staging_backup.dump` | Dump file generated with non-zero size | | PENDING | `staging_backup.dump` |
| **INF-03** | Patch Migration & Preflight | Staging DB connection | Run `psql "$STAGING_DATABASE_URL" -f supabase/migrations/20261110010000_security_remediation_patch.sql` | Preflight verifies 0 duplicate TrxIDs; index and functions created | | PENDING | `logs/db_patch_apply.txt` |
| **INF-04** | Duplicate TrxID Audit View | Migration applied | Run `SELECT * FROM public.v_duplicate_trx_audit;` in SQL Editor | Returns 0 rows (no unresolved duplicate groups) | | PENDING | `queries/duplicate_audit.csv` |
| **INF-05** | Legacy Migrator Dry-Run | Staging environment variables configured | Run `npx tsx scripts/legacy_premium_pdf_migrator.ts` | Generates `LEGACY_PDF_MIGRATION_MANIFEST.json`; 0 writes | | PENDING | `manifests/dry_run_manifest.json` |
| **INF-06** | Legacy Migrator Live Migration | Dry-run verified | Run `npx tsx scripts/legacy_premium_pdf_migrator.ts --execute` | All files transferred to `premium-pdfs`; SHA-256 matched; DB updated atomically | | PENDING | `logs/LEGACY_PDF_MIGRATION_LOG.txt` |
| **INF-07** | Post-Migration Audit View | Migration executed | Run `SELECT * FROM public.v_legacy_premium_pdf_audit WHERE security_status != 'SECURE';` | Returns 0 rows (all paid items marked SECURE) | | PENDING | `queries/legacy_pdf_audit.csv` |

---

## 3. End-to-End User Journey Verification Evidence

| Test ID | Test Description | Preconditions | Execution Instructions | Expected Result | Actual Result | Status | Evidence Reference |
|---|---|---|---|---|---|---|---|
| **E2E-01** | Anonymous Free-Content Access | Incognito browser session | Navigate to `/classes`, open free course, read Lesson 1 | Lesson notes and video display; 0 console errors | | PENDING | `screenshots/E2E-01_free_lesson.png` |
| **E2E-02** | Student Registration & Login | Clean email address | Go to `/auth`, sign up with email/password, verify and log in | User session created; redirect to dashboard; header shows email | | PENDING | `screenshots/E2E-02_login_success.png` |
| **E2E-03** | Password Recovery | Registered account | Click "Forgot Password" on `/auth`, enter email, follow reset link | Password reset email received; new password saved successfully | | PENDING | `screenshots/E2E-03_pw_reset.png` |
| **E2E-04** | Paid-Content Authorization Guard | Authenticated student without purchase | Open paid course (e.g. HSC Math), inspect chapter list | Chapter PDFs locked; "কোর্সটি আনলক করুন" button shown; storage URLs hidden | | PENDING | `screenshots/E2E-04_paid_locked.png` |
| **E2E-05** | Payment Submission | Paid course modal open | Select bKash, enter `01711111111`, TrxID `TRX_STG_001`, submit | Success toast; status shows "অপেক্ষমাণ" in dashboard; server sets amount | | PENDING | `screenshots/E2E-05_payment_pending.png` |
| **E2E-06** | Admin Payment Approval | Request submitted | Admin logs in, goes to `/admin/unlock-requests`, approves `TRX_STG_001` | Status updates to `approved`; student dashboard reflects unlocked status | | PENDING | `screenshots/E2E-06_admin_approved.png` |
| **E2E-07** | Duplicate TrxID Rejection | `TRX_STG_001` already approved | Student attempts submitting `TRX_STG_001` with variations (`  trx_stg_001  `) | UI and database reject insertion with clear duplicate error message | | PENDING | `screenshots/E2E-07_dup_rejected.png` |
| **E2E-08** | Premium PDF Upload (Admin) | Admin session | Admin edits course at `/admin/posts`, uploads new chapter PDF | File uploaded to `premium-pdfs/chapters/<id>-<ch>-<ts>-<name>.pdf` | | PENDING | `screenshots/E2E-08_pdf_upload.png` |
| **E2E-09** | Authorized PDF Download | Approved student session | Click "PDF পড়ুন" on unlocked course chapter | `get-premium-pdf` returns signed URL (expiresIn=300); PDF reader opens | | PENDING | `screenshots/E2E-09_pdf_viewer.png` |
| **E2E-10** | Unauthorized PDF Denial | Non-purchaser session | Student calls `get-premium-pdf` directly for paid post | Edge function returns 403 Forbidden with Bengali error message | | PENDING | `network/E2E-10_403_denial.json` |
| **E2E-11** | Cross-Post Access Denial | Student approved for Post A only | Call `get-premium-pdf` passing Post B's ID | Function returns 403 Forbidden; Post B's PDF cannot be accessed | | PENDING | `network/E2E-11_crosspost_denial.json` |
| **E2E-12** | Admin Dashboard Protection | Regular user vs Admin | Non-admin visits `/admin` (redirects); Admin visits `/admin` (loads) | Non-admins blocked; Admin views moderation queues and metrics | | PENDING | `screenshots/E2E-12_admin_guard.png` |
| **E2E-13** | AI Educational Chatbot | Any user on `/` | Ask question: "নিউটনের ৩য় সূত্র কী?" | Chatbot responds in Bengali; no errors in console | | PENDING | `screenshots/E2E-13_ai_chat.png` |
| **E2E-14** | Educational Image Generation | Feature page | Request educational diagram | Diagram returned via free model fallback without paid API key | | PENDING | `screenshots/E2E-14_ai_image.png` |
| **E2E-15** | Video Lesson Streaming | Video catalog | Open `/videos`, filter subject, play video | Video player streams lecture smoothly; chapter markers clickable | | PENDING | `screenshots/E2E-15_video_player.png` |
| **E2E-16** | Mobile Navigation | Mobile viewport (375px) | Test mobile drawer, course cards, unlock modal, and reader | Layout adapts without horizontal scroll; touch targets responsive | | PENDING | `screenshots/E2E-16_mobile_view.png` |
| **E2E-17** | Desktop Navigation | Desktop viewport (1440px) | Test category filters, sidebar, high-res typography | Crisp fonts, clean Bengali rendering, flex layouts intact | | PENDING | `screenshots/E2E-17_desktop_view.png` |
| **E2E-18** | Session Expiry & Logout | Authenticated session | Click "লগআউট" or expire session token | Session cleared from memory; protected routes redirect to `/auth` | | PENDING | `screenshots/E2E-18_logout.png` |

---

## 4. Final Sign-Off & Release Gate Determination

All items above must be signed off by the QA Lead before the project is approved for Production rollout:

* **Total Staging Tests Planned:** 25  
* **Tests Passed:** _____ / 25  
* **Tests Failed:** _____ / 25  
* **Critical Defects Open:** _____  

### Sign-Off Approvals

| Role | Name | Signature | Date |
|---|---|---|---|
| **Security Engineer** | _______________________ | _______________________ | ______________ |
| **QA / Staging Lead** | _______________________ | _______________________ | ______________ |
| **Project Lead** | _______________________ | _______________________ | ______________ |

### Final Gate Status
- [ ] **STAGING VERIFICATION COMPLETE — APPROVED FOR PRODUCTION ROLLOUT**
- [ ] **STAGING FAILED — ISSUES REMAIN TO BE RESOLVED**

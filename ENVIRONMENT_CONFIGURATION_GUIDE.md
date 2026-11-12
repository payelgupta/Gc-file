# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — ENVIRONMENT CONFIGURATION GUIDE
**Document Version:** 1.0  
**Target Environment:** Staging & Production Preparation  
**Budget Policy:** Strict $0 Free-Tier Architecture  

---

## 1. Overview & Security Boundary Architecture

Gyan Prakasha Path enforces a strict boundary between public frontend environment variables and private server-side secrets:

```
[ Client Browser ]
      │
      │  VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY only
      ▼
[ Supabase Gateway ]
      │
      ├── Public Schema (RLS Enforced with can_read_post_chapter)
      │
      └── [ Edge Functions Runtime (Deno) ]
             ├── SUPABASE_SERVICE_ROLE_KEY (Private)
             ├── OPENROUTER_API_KEY (Free-tier AI fallback)
             ├── GEMINI_API_KEY (Free-tier Google GenAI)
             └── HF_API_KEY (Free-tier HuggingFace)
```

**Absolute Security Rule:** Secret keys (Service Role keys, database connection strings, AI vendor API tokens) **MUST NEVER** be prefixed with `VITE_` or committed to client bundles.

---

## 2. Environment Variables Specification

### A. Client-Side Variables (`.env`)
These variables are read by Vite at build/runtime and exposed in the browser bundle.

| Variable Name | Required? | Purpose | Default / Fallback Behavior |
|---|---|---|---|
| `VITE_SUPABASE_URL` | **REQUIRED** | Connects client to Supabase REST and Auth API. | Shows non-crashing `ConfigurationBanner` alert; graceful degraded UI. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **REQUIRED** | Client anonymous/publishable JWT for RLS queries. | Shows non-crashing `ConfigurationBanner` alert; graceful degraded UI. |
| `VITE_SUPABASE_PROJECT_ID` | Optional | Used for project referencing and metadata. | Safe empty string fallback. |

### B. Supabase Edge Function Secrets (Server-Side)
These variables are stored inside the Supabase Vault and are only accessible inside Edge Functions.

| Variable Name | Required? | Associated Feature | Provider / Free Tier Details |
|---|---|---|---|
| `SUPABASE_URL` | **REQUIRED** | Core Edge Functions | Auto-provisioned by Supabase Edge Functions runtime. |
| `SUPABASE_ANON_KEY` | **REQUIRED** | Auth Token Verification | Auto-provisioned by Supabase Edge Functions runtime. |
| `SUPABASE_SERVICE_ROLE_KEY` | **REQUIRED** | `get-premium-pdf` & Storage Administration | Required to generate 300s signed URLs for private `premium-pdfs` bucket and check approvals. |
| `OPENROUTER_API_KEY` | Optional | AI Chatbot Fallback | Free tier (`meta-llama/llama-3.3-70b-instruct:free`). 0 cost. |
| `GEMINI_API_KEY` | Optional | AI Chatbot & Document Processing | Google AI Studio free tier (Gemini 2.5 Flash). 0 cost. |
| `LOVABLE_API_KEY` | Optional | AI Gateway Proxy | Optional proxy for AI chat & image generations. |
| `HF_API_KEY` | Optional | Educational Video Generation | Free Hugging Face Inference API. 0 cost. |

### C. Migration & Operational Script Variables (Local / CI Only)
These variables are used only when running maintenance utilities like `scripts/legacy_premium_pdf_migrator.ts`.

| Variable Name | Allowed Values | Purpose | Security Guard |
|---|---|---|---|
| `MIGRATION_ENV` | `staging`, `local_test`, `production` | Declares execution environment. | **Refuses `production` by default.** Requires `--force-production-confirm`. |
| `MIGRATION_SUPABASE_URL` | Valid HTTPS URL | Target Supabase project for PDF migration. | Does not allow unconfirmed execution. |
| `MIGRATION_SERVICE_ROLE_KEY` | Supabase Service Role Key | Admin credentials to read `uploads` and write to `premium-pdfs`. | Kept exclusively in shell session or CI secret. |

---

## 3. Graceful Degradation & Blank Page Prevention

The client code in `src/integrations/supabase/client.ts` implements defensive configuration validation:

```typescript
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder-project") &&
  !supabaseAnonKey.includes("placeholder-anon-key")
);
```

- **If Supabase variables are missing or set to placeholders:**
  - The application **does not crash** or display a white screen of death.
  - A subtle `ConfigurationBanner` appears at the top informing administrators of the missing setup.
  - Public views render cached or static content gracefully without throwing uncaught runtime errors.
  - Forms display user-friendly toasts indicating configuration status rather than unhandled promise rejections.

---

## 4. Staging Configuration Setup Step-by-Step

### Step 1: Create Staging `.env` File
In the project root, create `.env` using `.env.example` as a template:
```bash
cp .env.example .env
```
Populate with your **Staging** project credentials:
```ini
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=your-staging-project
```

### Step 2: Set Server Secrets via Supabase CLI
```bash
supabase link --project-ref your-staging-project
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key
supabase secrets set OPENROUTER_API_KEY=your-free-openrouter-key
supabase secrets set GEMINI_API_KEY=your-free-gemini-key
```

### Step 3: Verify Secrets in Staging
```bash
supabase secrets list
```
Verify that `SUPABASE_SERVICE_ROLE_KEY` is present and active.

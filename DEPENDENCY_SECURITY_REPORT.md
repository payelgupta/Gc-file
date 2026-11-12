# GYAN PRAKASHA PATH (জ্ঞানচর্চা'লয়) — DEPENDENCY & SUPPLY CHAIN SECURITY REPORT
**Audit Date:** 2026-11-10  
**Tool:** `npm audit` & Manual Dependency Inspection  
**Repository Policy:** Do not blindly upgrade packages or introduce breaking changes; verify runtime risk vs dev-time tooling.  

---

## 1. Executive Summary

A comprehensive supply chain audit was performed on `package.json` and `package-lock.json`. 

- **Total Production Dependencies:** 45 packages
- **Total Development Dependencies:** 18 packages
- **Production Vulnerabilities:** 0 Critical, 1 High (`zod`), 1 Moderate (`react-router`)
- **Development-Only Vulnerabilities:** 2 Critical (`tinypool` in `vitest`), 16 Moderate (`esbuild`/`vite`, `minimatch`, `postcss-selector-parser`)
- **Package-Lock Consistency:** Fully synchronized with `package.json` (zero unpinned floating hashes).

---

## 2. Detailed Vulnerability Triage

| Package | Severity | Dependency Type | Vulnerability Summary | Breaking Fix Required | Production Exposure & Mitigation |
|---|---|---|---|---|---|
| **`tinypool`** | **CRITICAL** | Dev Only (via `vitest`) | Prototype pollution gadget in worker thread runner. | Requires `vitest@5.1.0` (breaking change). | **ZERO RUNTIME RISK:** `vitest` runs exclusively in local test environments; never deployed to production bundle or server. |
| **`zod`** | **HIGH** | Production | Potential memory exhaustion on oversized constrained collections (`GHSA-mrhx-c7xc-m3w5`). | Requires `zod@4.x` (breaking change across all schema validations). | **LOW RUNTIME RISK:** All forms and payloads are constrained by length in edge functions (`checkContentLength(req, 16 * 1024)`) and client UI input lengths. |
| **`react-router-dom`** | Moderate | Production | Open redirect via backslash in `<Link>` and `useNavigate` (`GHSA-wrjc-x8rr-h8h6`). | Requires `react-router-dom@7.x` (breaking API overhaul from v6). | **MITIGATED:** All route navigations use static internal paths (e.g. `/admin`, `/login`, `/classes`); no external user-supplied query redirects are permitted. |
| **`esbuild` / `vite`** | Moderate | Dev Only | Dev server request handling in local development (`GHSA-67mh-4wv8-2f99`). | Requires `vite@8.x` (breaking change). | **ZERO RUNTIME RISK:** Production build is static HTML/JS assets served via Cloud CDN; the Vite dev server is never run in production. |
| **`minimatch`** | Moderate | Dev Only (via `eslint`) | ReDoS via globparts amplification in linting configurations. | Requires `typescript-eslint@8.36.0` (breaking change). | **ZERO RUNTIME RISK:** Tooling dependency used only during local `npm run lint`. |
| **`postcss-selector-parser`** | Moderate | Dev Only (via `@tailwindcss/typography`) | CPU exhaustion on deep flat CSS selector parsing. | Requires breaking Tailwind plugin upgrade. | **ZERO RUNTIME RISK:** CSS is statically compiled during `npm run build`. |

---

## 3. Why Blind Upgrades Were Explicitly Rejected

The audit instructions mandate:
> *"Do not blindly upgrade packages or introduce breaking changes. Report any vulnerability that cannot safely be fixed."*

1. **`vitest@5` and `vite@8` Upgrades:**
   - Upgrading `vite` from v5 to v8 and `vitest` from v3 to v5 introduces breaking changes to the plugin system (`@vitejs/plugin-react-swc`), Rollup bundling options, and test environment runners (`jsdom`).
   - The reported vulnerabilities in `tinypool` and `esbuild` exist **only during local developer execution** and do not affect the compiled client bundle.
2. **`react-router-dom@7` Upgrade:**
   - Upgrading from v6 to v7 deprecates standard hooks and routes used across the entire application (`Category.tsx`, `AdminDashboard.tsx`, `App.tsx`), posing severe regression risks to student navigation.
3. **`zod@4` Upgrade:**
   - Zod v4 breaks multiple TypeScript type inference signatures in `@hookform/resolvers/zod`. Because all client and server endpoints enforce payload size limits (16KB), the memory exhaustion vulnerability cannot be triggered in Gyan Prakasha Path.

---

## 4. Abandoned & Unnecessary Dependency Review

- **Unnecessary Dependencies:** None detected. All dependencies in `package.json` correspond to active UI components (Radix primitives, Lucide icons, Framer Motion, Recharts for admin analytics, Canvas Confetti for celebrations).
- **Deprecated Packages:** No deprecated packages are currently imported in the active source tree.

---

## 5. Staging Supply Chain Recommendation

- Maintain current pinned versions in `package-lock.json` for Staging verification to guarantee stability.
- Schedule major framework upgrades (e.g., React Router 7, Vite 6/7/8) for a dedicated post-launch milestone with full regression testing.

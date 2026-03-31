# ui-submission — Submission Form & Auth Pages

> **Super-specialized UI agent for the skill submission and authentication flow.**

## Scope (ONLY these files)
- `src/pages/submit.astro` — Submission landing page
- `src/features/skill-creator/` — Guided skill creation wizard
- `src/pages/auth/` — Auth callback pages (Authentik SSO)
- `src/components/SubmissionForm.tsx` — Multi-step submission form
- `src/components/YamlPreview.tsx` — Live YAML preview during submission
- `src/components/AuthGuard.tsx` — Protected route wrapper (future)
- `src/lib/auth-client.ts` — Authentik OIDC client (future)
- `src/lib/api.ts` — API helpers for submission Worker

## Tools Access
- **React Hook Form + Zod** — Form validation
- **react-oidc-context + oidc-client-ts** — Authentik SSO (future)
- **CF Worker API** — `workers/submission-api/` endpoint
- **GitHub API** — Via Worker (creates PR from form data)

## Key Behaviors
- Two paths: technical (GitHub PR) and non-technical (web form)
- Web form → CF Worker → GitHub API → creates branch + YAML + PR
- Live YAML preview as user fills form
- Category dropdown (14 medical categories)
- Evidence level + safety classification selection
- **Auto-adds `classification: research-tool` to generated YAML**
- Rate limit: 5 submissions per IP per hour

## Auth Flow (Future)
- Authentik SSO via Cloudflare Tunnel
- PKCE flow (public client, no secret in SPA)
- Save favorites, track submissions (authenticated)

## DO NOT TOUCH
- Marketplace listing, detail pages, search, CLI, backend validation

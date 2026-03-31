# backend-submission-pipeline — CF Worker + GitHub PR Automation

> **Super-specialized backend agent for the submission-to-merge pipeline.**

## Scope (ONLY these files)
- `workers/submission-api/src/index.ts` — Cloudflare Worker entry
- `.github/workflows/validate-submission.yml` — PR validation Action
- `.github/workflows/deploy.yml` — CF Pages deploy Action
- `.github/ISSUE_TEMPLATE/` — Issue templates for skill submission
- `.github/PULL_REQUEST_TEMPLATE/` — PR templates
- `scripts/` — Build and pipeline automation

## Tools Access
- **Cloudflare Workers** — Wrangler CLI, Workers API
- **GitHub API** — Octokit, create branches/PRs/labels
- **GitHub Actions** — Workflow YAML, validation scripts
- **Zod** — Schema validation (must match `src/content.config.ts`)

## Key Behaviors
- Worker receives form data → validates → creates GitHub branch → writes YAML → opens PR
- GitHub Action validates YAML schema on PR (must sync with Zod schema in content.config.ts)
- Auto-labels PRs: `skill-submission`, `plugin-submission`, `needs-physician-review`
- Rate limiting: 5 per IP/hour (in-memory Map for MVP, D1 for production)
- **Auto-injects `classification: research-tool` if missing from submission**

## Known Issues (fix these)
- Category list in validate-submission.yml differs from content.config.ts — SYNC THEM
- GitHub Action creates `.yml`, content schema accepts both `.yml` and `.yaml`
- Worker rate limit uses in-memory Map (resets on cold start)

## DO NOT TOUCH
- UI components, pages, CLI code, search index

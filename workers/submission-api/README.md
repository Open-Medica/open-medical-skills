# OMS Submission API - Cloudflare Worker

Serverless API that converts web form submissions into GitHub pull requests for the Open Medical Skills marketplace.

## Features

- **POST /api/submit** endpoint with CORS support
- **Input validation** - required fields, category enum, kebab-case names, valid URLs
- **Input sanitization** - HTML stripping, length limits, YAML-safe escaping
- **Rate limiting** - 5 submissions per IP per hour (in-memory Map for MVP)
- **GitHub integration** - creates branch, commits YAML file, opens PR via Octokit
- **Security** - no secrets in code, CORS restricted to OMS domain

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Secrets

```bash
# GitHub fine-grained PAT with permissions:
# - Contents: Read & Write
# - Pull Requests: Read & Write
wrangler secret put GITHUB_TOKEN
```

### 3. Deploy

```bash
pnpm run deploy
```

## Development

```bash
# Run locally with hot reload
pnpm run dev

# Test with curl
curl -X POST http://localhost:8787/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-skill",
    "display_name": "Test Skill",
    "description": "A test medical AI skill",
    "author": "Dr. Test",
    "repository": "https://github.com/test/test-skill",
    "category": "education"
  }'
```

## API

### POST /api/submit

**Required fields:** `name`, `display_name`, `description`, `author`, `repository`, `category`

**Optional fields:** `tags`, `version`, `license`, `install`, `clinical_evidence`, `safety_guardrails`

**Valid categories:** clinical, diagnostic, administrative, research, education, pharmacology, radiology, pathology, surgery, mental-health, pediatrics, emergency-medicine, public-health, telemedicine

**Success (201):**
```json
{ "success": true, "pr_url": "https://github.com/gitjfmd/open-medical-skills/pull/42" }
```

**Validation error (400):**
```json
{ "success": false, "error": "Validation failed", "errors": ["name: Must be kebab-case"] }
```

**Rate limit (429):**
```json
{ "success": false, "error": "Rate limit exceeded. Maximum 5 submissions per hour." }
```

## Environment

Set in `wrangler.toml`:
- `GITHUB_OWNER` - GitHub user/org (default: "gitjfmd")
- `GITHUB_REPO` - Repository name (default: "open-medical-skills")
- `ALLOWED_ORIGIN` - CORS origin (default: "https://oms.jfmd.win")

Set via `wrangler secret put`:
- `GITHUB_TOKEN` - GitHub fine-grained access token

## Workflow

1. User fills out submission form on the OMS website
2. Frontend POSTs to `/api/submit`
3. Worker validates and sanitizes input
4. Worker generates YAML file content
5. Worker creates branch `submission/skill/{name}-{timestamp}` via Octokit
6. Worker commits `content/skills/{name}.yaml` to the branch
7. Worker opens PR with review checklist and labels
8. GitHub Actions runs validation workflow
9. Physician reviewers are notified
10. On approval and merge, site auto-deploys

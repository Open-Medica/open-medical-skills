# External Integrations

**Analysis Date:** 2026-03-22

## APIs & External Services

**GitHub:**
- **Service:** GitHub API v3 (REST)
  - **What it's used for:** Skill and plugin submissions → automated PR creation
  - **SDK/Client:** `@octokit/rest` v21
  - **Auth:** `GITHUB_TOKEN` (fine-grained PAT with `contents:write` and `pull_requests:write` scopes)
  - **Endpoints used:**
    - `GET /repos/:owner/:repo/git/refs/heads/:ref` - Get branch SHA
    - `POST /repos/:owner/:repo/git/refs` - Create submission branch
    - `PUT /repos/:owner/:repo/contents/:path` - Create YAML file on branch
    - `POST /repos/:owner/:repo/pulls` - Create pull request
    - `POST /repos/:owner/:repo/issues/:issue_number/labels` - Add labels
    - `GET /user` - Verify OAuth token validity
  - **Location:** `workers/submission-api/src/index.ts`

**GitHub OAuth 2.0:**
- **Service:** GitHub OAuth app for user authentication
  - **What it's used for:** Authenticate users before allowing skill submissions
  - **Client ID:** `GITHUB_CLIENT_ID` (secret)
  - **Client Secret:** `GITHUB_CLIENT_SECRET` (secret)
  - **Redirect URI:** `OAUTH_REDIRECT_URI` (from wrangler.toml)
  - **Token exchange endpoint:** `https://github.com/login/oauth/access_token`
  - **User info endpoint:** `https://api.github.com/user`
  - **Location:** `workers/submission-api/src/index.ts` (routes: `/auth/github/callback`, `/auth/user`)

## Data Storage

**Databases:**

**PostgreSQL 17 (K8s):**
- **Connection:** Via MCP Toolbox at `http://100.120.120.20:30500/mcp`
- **Database name:** `oms_tracker`
- **User:** `oms` (credentials in K8s secret `oms-postgres`)
- **Tables:**
  - `skill_tracker` - Track skill metadata, status, and versioning
  - `upstream_repos` - Track upstream repository information
- **ORM/Client:** MCP Toolbox (REST API proxy to PostgreSQL)
- **Access:** Via `.mcp.json` MCP server configuration

**Supabase PostgreSQL:**
- **Connection:** PostgREST API via `SUPABASE_URL`
- **What it's used for:** Structured filtering and pagination for tools catalog
- **API Key:** `SUPABASE_KEY` (optional, uses apikey header)
- **Tables:** `tools` (read-only access for search)
- **Client:** Native `fetch` API (PostgREST REST endpoints)
- **Location:** `workers/search-api/src/handlers/structured.ts`

**Vector Database (Qdrant):**
- **Connection:** HTTP REST API at `QDRANT_URL` (default: `http://localhost:6333`)
- **Collection name:** `tu_tools_nomic` (nomic embeddings)
- **What it's used for:** Semantic similarity search for skills/tools
- **Endpoints:**
  - `POST /collections/:collection/points/search` - Vector similarity search
- **Client:** Native `fetch` API
- **Location:** `workers/search-api/src/handlers/semantic.ts`

**Graph Database (SurrealDB):**
- **Connection:** HTTP endpoint at `SURREALDB_URL` (default: `http://localhost:8000`)
- **What it's used for:** Planned for graph-based tool relationships and traversal
- **Current status:** Configured but not actively used in current codebase
- **Location:** `workers/search-api/wrangler.toml` (environment variable)

**File Storage:**
- **Type:** Local filesystem (committed to git)
- **Locations:**
  - `content/skills/` - YAML skill definitions (49 files)
  - `content/plugins/` - YAML plugin definitions (5 files)
  - `skills/` - Full skill source code (49 directories with `SKILL.md`)
  - `plugins/` - Full plugin source code (5 directories with source + README + LICENSE)
- **No external CDN or object storage integration**

**Caching:**
- **Type:** None detected in production
- **Cloudflare Pages:** Uses Cloudflare's built-in HTTP caching for static assets
- **Local dev:** Astro dev server caching

## Authentication & Identity

**Auth Provider:** Custom (GitHub OAuth only)
- **Implementation:** GitHub OAuth 2.0 in Submission API Worker
- **Flow:**
  1. User clicks "Sign in with GitHub" on submission form
  2. Client redirects to GitHub authorize endpoint
  3. User grants permissions
  4. Client receives authorization code
  5. Client sends code to `/auth/github/callback` on Submission API
  6. Worker exchanges code for access token (keeps secret server-side)
  7. Worker returns token to client for future authenticated requests
  8. Client calls `/auth/user` to verify token is valid
- **Scopes:** Default GitHub app scopes (read user profile, public repos)
- **Token storage:** Client-side localStorage (JSON Web Token format expected)
- **Session timeout:** Not enforced at API level; relies on GitHub token expiration

**Authorization:**
- **Type:** GitHub user context only (no role-based access control)
- **Rules:**
  - Any authenticated GitHub user can submit a skill
  - Submissions go to `dev` branch via new PR
  - Physician review required before merge to `main`

## Monitoring & Observability

**Error Tracking:**
- **Type:** None detected
- **Approach:** Console logging only in Workers (`console.error()`)

**Logs:**
- **Cloudflare Workers:** Worker logs available in Cloudflare dashboard
- **GitHub Actions:** Workflow logs in GitHub Actions tab
- **Application logs:** Not centralized; check individual service logs

**Metrics:**
- **Cloudflare Pages:** Deployment status and basic metrics in Cloudflare dashboard
- **GitHub Actions:** Workflow execution times and pass/fail status

## CI/CD & Deployment

**Hosting:**
- **Website:** Cloudflare Pages (auto-deploy from `main` or `dev` branch)
- **Submission API:** Cloudflare Workers (deployed via `wrangler deploy`)
- **Search API:** Cloudflare Workers (deployed via `wrangler deploy`)

**CI Pipeline:**
- **GitHub Actions** (6 workflows)
  - `deploy.yml` - Build and deploy to Cloudflare Pages (on push to main/dev or manual trigger)
  - `validate-submission.yml` - YAML validation, schema checks, repo accessibility tests (on PR)
  - `ci.yml` - Likely basic linting and build checks
  - `branch-guard.yml` - Enforce branch protection rules
  - `compliance-gate.yml` - Security and compliance checks
  - `generate-claude-md.yml` - Auto-generate documentation

**Deployment Process:**
1. On PR to `dev`: Run `validate-submission.yml` (YAML validation, duplicate checks)
2. On PR approval and merge to `dev`: CI passes
3. On push to `main`: Build site with `pnpm build`, deploy via `wrangler pages deploy`
4. Post-deployment: Close related issues, notify contributors, generate deployment summary

**Build Environment:**
- **Node.js:** 22
- **Package manager:** pnpm with frozen lockfile
- **Build command:** `pnpm build` (Astro build to `dist/`)
- **Deploy command:** `wrangler pages deploy dist --project-name=open-medical-skills`

**Secrets Management:**
- **Method:** GitHub Secrets (set via web UI or `gh secret set`)
- **Key secrets:**
  - `CF_API_TOKEN` - Cloudflare API token
  - `CF_ACCOUNT_ID` - Cloudflare account ID
  - `GITHUB_TOKEN` - GitHub PAT (for workflow automation)
  - Worker secrets: `GITHUB_TOKEN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (set via `wrangler secret put`)

## Environment Configuration

**Required env vars (Submission API):**
- `GITHUB_OWNER` - Repository owner
- `GITHUB_REPO` - Repository name
- `GITHUB_TOKEN` - GitHub PAT (secret)
- `GITHUB_CLIENT_ID` - OAuth app client ID (secret)
- `GITHUB_CLIENT_SECRET` - OAuth app client secret (secret)
- `ALLOWED_ORIGIN` - CORS allowed origin
- `OAUTH_REDIRECT_URI` - OAuth callback redirect

**Required env vars (Search API):**
- `QDRANT_URL` - Vector database endpoint
- `SUPABASE_URL` - Supabase REST API endpoint
- `OLLAMA_URL` - Embeddings server endpoint
- `QDRANT_COLLECTION` - Collection name for vectors
- `EMBED_MODEL` - Embedding model name
- `ALLOWED_ORIGIN` - CORS allowed origin

**Secrets location:**
- Development: `.env` file (git-ignored)
- GitHub Actions: GitHub Secrets (encrypted environment variables)
- Workers: `wrangler.toml` `[vars]` section (public) + `wrangler secret put` (private)

## Webhooks & Callbacks

**Incoming:**
- **GitHub Webhooks:** Not currently configured
- **Submission form POST:** `POST /api/submit` on Submission API Worker
- **OAuth callback:** `POST /auth/github/callback` on Submission API Worker
- **Auth verification:** `GET /auth/user` on Submission API Worker

**Outgoing:**
- **GitHub PR creation:** Submission API creates PR via GitHub API
- **GitHub issue closure:** Deploy workflow closes related GitHub issues on successful merge
- **GitHub comments:** Auto-comment on PRs and issues from GitHub Actions workflows
- **Deployment notifications:** Cloudflare Pages deployment summary to GitHub Actions

## External AI/ML Services

**Embeddings:**
- **Service:** Ollama (local or remote)
- **Model:** `nomic-embed-text` (embedding model)
- **Endpoint:** `OLLAMA_URL` (default: `http://localhost:11434`)
- **What it's used for:** Generate embeddings for semantic search queries
- **Location:** `workers/search-api/src/lib/embed.ts`
- **Client:** Native `fetch` API

**LLM Provider (Skill Creator):**
- **Services supported:** Ollama, LMStudio, vLLM, OpenAI-compatible APIs
- **Environment variable:** `LLM_PROVIDER` (default: `ollama`)
- **Configuration:** `LLM_BASE_URL` and `LLM_MODEL`
- **What it's used for:** Generate skill metadata and structure from natural language prompts
- **Location:** `src/features/skill-creator/llm-proxy.ts` (client-side)

## Rate Limiting

**Submission API:**
- **Rate limit:** 5 submissions per IP per hour
- **Implementation:** In-memory Map (single-instance MVP)
- **Production note:** Should migrate to Cloudflare KV for persistence across instances
- **Location:** `workers/submission-api/src/index.ts` (lines 13-53)

**Search API:**
- **Rate limit:** Not explicitly configured (relies on Cloudflare rate limiting)

## Data Validation & Sanitization

**Submission API:**
- **Input sanitization:** HTML tags stripped, length limits enforced
- **YAML schema validation:** Required fields checked, category enum validated
- **Repository URL validation:** URL format checked via `new URL()`
- **Name format validation:** Kebab-case validation (lowercase, hyphens only)
- **YAML output:** Special characters escaped for safe inclusion in YAML strings

**Search API:**
- **Input validation:** Query parameters validated (q, limit, threshold, etc.)
- **Limit capping:** Search results capped at 100 (user-requested limit is min'd with 100)

---

*Integration audit: 2026-03-22*

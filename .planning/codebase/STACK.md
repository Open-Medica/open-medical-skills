# Technology Stack

**Analysis Date:** 2026-03-22

## Languages

**Primary:**
- **TypeScript** 5.x - Main language for Cloudflare Workers and source code
- **JavaScript (ES2020+)** - Astro framework, Node.js CLI, GitHub Actions scripts
- **Python** 3.13 - Build validation, YAML parsing in GitHub workflows

**Secondary:**
- **YAML** - Content definitions (skills, plugins) in `content/skills/` and `content/plugins/`
- **Bash** - Shell scripts for automation

## Runtime

**Environment:**
- **Node.js** 22.x (primary development and CLI runtime)
- **Cloudflare Workers** (Edge runtime for submission-api and search-api)
- **Browser** (Astro static output + React islands)

**Package Manager:**
- **pnpm** 10.29.3 (monorepo package manager)
- **Lockfile:** `pnpm-lock.yaml` present

## Frameworks

**Core:**
- **Astro** 5.18.0 - Static site generation with islands architecture
  - Output: `static` (fully pre-rendered HTML/CSS/JS)
  - Base path: `/open-medical-skills`
  - Site URL: `https://openmedica.us`

**UI:**
- **React** 19.2.4 - Interactive islands (form components, skill creator)
- **React DOM** 19.2.4 - DOM rendering

**Build/Dev:**
- **@tailwindcss/vite** 4.2.1 - Vite plugin for Tailwind CSS 4 (not @astrojs/tailwind)
- **@astrojs/react** 4.4.2 - React integration for Astro
- **@astrojs/sitemap** 3.7.0 - Auto-generated sitemap at build time

**Content & Validation:**
- **Zod** (via Astro Content Layer) - Schema validation for skills/plugins YAML files
- **js-yaml** 4.1.1 - YAML parsing (client-side in skill creator)
- **react-markdown** 10.1.0 - Markdown rendering in UI components

**Search & Discovery:**
- **Pagefind** 1.4.0 - Client-side full-text search (build-time indexed)

**CLI:**
- **Commander** 13.1.0 - CLI argument parsing
- **Chalk** 5.4.1 - Terminal color output

## Workers & Serverless

**Submission API (Cloudflare Worker):**
- **Framework:** Cloudflare Workers (edge computing runtime)
- **Main language:** TypeScript 5
- **Package:** `workers/submission-api/`
- **Entry:** `src/index.ts`
- **Configuration:** `wrangler.toml`
- **Dependencies:**
  - `@octokit/rest` 21.x - GitHub API client for PR creation
  - `wrangler` 4.x - Cloudflare CLI

**Search API (Cloudflare Worker):**
- **Framework:** Cloudflare Workers (edge computing runtime)
- **Main language:** TypeScript 5
- **Package:** `workers/search-api/`
- **Entry:** `src/index.ts`
- **Configuration:** `wrangler.toml`
- **Dependencies:**
  - `@cloudflare/workers-types` 4.0.0 - Type definitions
  - `wrangler` 4.0.0 - Cloudflare CLI
  - `typescript` 5.7.0 - Type checking

## Key Dependencies

**Critical:**
- `astro` 5.18.0 - Why it matters: Core SSG framework for the website
- `react` 19.2.4 - Why it matters: Interactive UI islands (skill creator, forms)
- `tailwindcss` 4.2.1 - Why it matters: CSS framework via `@tailwindcss/vite` plugin
- `@octokit/rest` 21.x - Why it matters: GitHub API integration for skill submissions (PR creation)
- `wrangler` 4.x - Why it matters: Cloudflare Workers deployment CLI

**Infrastructure:**
- `pagefind` 1.4.0 - Client-side search indexing at build time
- `js-yaml` 4.1.1 - YAML parsing for skill definitions and CLI operations
- `zod` (Astro built-in) - Schema validation for content collections
- `commander` 13.1.0 - CLI argument parsing for the OMS CLI tool
- `chalk` 5.4.1 - Terminal color output for CLI

**Development:**
- `@types/react` 19.2.14 - TypeScript types for React
- `@types/react-dom` 19.2.3 - TypeScript types for React DOM
- `@types/js-yaml` 4.0.9 - TypeScript types for js-yaml

## Configuration

**Environment:**
- **Local dev:** Uses `.env` (see `.env.example` for template)
- **Production:** Secrets via Wrangler (`wrangler secret put`)
- **Build environment:** `NODE_ENV=production` set in CI/CD

**Environment Variables (Submission API):**
- `GITHUB_OWNER` - Repository owner (default: `gitjfmd`)
- `GITHUB_REPO` - Repository name (default: `open-medical-skills`)
- `GITHUB_TOKEN` - GitHub PAT (secret, required for PR creation)
- `GITHUB_CLIENT_ID` - GitHub OAuth App client ID (secret)
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App client secret (secret)
- `ALLOWED_ORIGIN` - CORS origin (dev: `http://localhost:4321`, prod: `https://openmedica.us`)
- `OAUTH_REDIRECT_URI` - OAuth callback URL

**Environment Variables (Search API):**
- `QDRANT_URL` - Qdrant vector database endpoint (default: `http://localhost:6333`)
- `SURREALDB_URL` - SurrealDB graph database endpoint (default: `http://localhost:8000`)
- `SUPABASE_URL` - Supabase REST API endpoint (default: `http://localhost:8000`)
- `OLLAMA_URL` - Ollama embeddings server (default: `http://localhost:11434`)
- `QDRANT_COLLECTION` - Qdrant collection name (default: `tu_tools_nomic`)
- `EMBED_MODEL` - Embedding model (default: `nomic-embed-text`)
- `ALLOWED_ORIGIN` - CORS origin

**Astro Build:**
- `astro.config.mjs` - Astro configuration
- `tsconfig.json` - TypeScript strict config (extends `astro/tsconfigs/strict`)
- `tailwind.config.ts` - NOT used; Tailwind 4 uses CSS `@theme {}` instead

**Workers Build:**
- `wrangler.toml` - Cloudflare Workers configuration (submission-api and search-api)
- `tsconfig.json` per worker - TypeScript configuration

## Platform Requirements

**Development:**
- **Node.js** ≥ 18.0.0 (CLI), 22.x recommended for dev server
- **pnpm** 10.29.3
- **Python** 3.x (for YAML validation in GitHub Actions)
- **PostgreSQL** 17 (optional, for local testing against K8s database)
- **Qdrant** 1.x (optional, for local semantic search testing)
- **Ollama** (optional, for local embeddings testing)

**Production:**
- **Deployment targets:**
  - `Cloudflare Pages` - Static website hosting (Astro output)
  - `Cloudflare Workers` - Submission API and Search API
  - `GitHub Actions` - CI/CD pipelines for validation and deployment
  - `K3s cluster` - PostgreSQL (for OMS tracker table), Qdrant (for vector search)

**Infrastructure Deployment:**
- **Static site:** Cloudflare Pages (auto-deploys on push to `main` or `dev`)
- **APIs:** Cloudflare Workers with environment bindings for Qdrant, Supabase, Ollama
- **Database:** PostgreSQL 17 on K8s (namespace: `oms`, NodePort: 30500)
- **MCP Toolbox:** K8s service for database queries (NodePort: 30500)

---

*Stack analysis: 2026-03-22*

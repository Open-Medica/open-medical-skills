# Codebase Structure

**Analysis Date:** 2026-03-22

## Directory Layout

```
open-medical-skills/
├── .github/                             # GitHub Actions, templates
│   ├── workflows/                       # CI/CD pipelines
│   │   ├── deploy.yml                   # Auto-deploy to CF Pages on push to main
│   │   ├── validate-submission.yml      # Validate skill YAML in PRs
│   │   ├── branch-guard.yml             # Enforce branch protection rules
│   │   └── compliance-gate.yml          # Security/type checks
│   ├── ISSUE_TEMPLATE/                  # GitHub issue templates
│   │   ├── submit-plugin.yml            # Template for plugin submissions
│   │   └── submit-skill.yml             # Template for skill submissions
│   └── PULL_REQUEST_TEMPLATE/           # PR templates
│       ├── skill-submission.md          # Template for skill PR checklist
│       └── dev-to-main.md               # Template for dev→main release PRs
├── .planning/                           # GSD (Goal-Structured Development) planning
│   └── codebase/                        # Codebase analysis documents
│       ├── ARCHITECTURE.md              # Architecture patterns (this project)
│       ├── STRUCTURE.md                 # Directory structure (this file)
│       ├── CONVENTIONS.md               # Code style and patterns
│       ├── TESTING.md                   # Test patterns
│       ├── STACK.md                     # Technology stack
│       ├── INTEGRATIONS.md              # External APIs and services
│       └── CONCERNS.md                  # Technical debt and issues
├── cli/                                 # CLI tool (distribute skills locally)
│   ├── bin/                             # CLI entrypoint
│   │   └── oms.js                       # Main entry point (#!/usr/bin/env node)
│   ├── lib/                             # CLI commands and utilities
│   │   ├── skills.js                    # Fetch and list skills (GitHub API)
│   │   ├── api-client.js                # API client for OMS endpoints
│   │   ├── config.js                    # Config file management (~/.oms/config)
│   │   ├── installer.js                 # Download/install skills locally
│   │   ├── banner.js                    # CLI banner and formatting
│   │   ├── disclaimer.js                # Medical disclaimer text
│   │   └── format.js                    # Output formatting (table, list, color)
│   ├── data/                            # CLI data files
│   │   └── skills.json                  # Generated index (run `npm run generate-index`)
│   └── package.json                     # CLI dependencies (commander, chalk)
├── content/                             # Content data (YAML definitions)
│   ├── skills/                          # 49 skill YAML files
│   │   └── *.yaml                       # Format: name, display_name, category, evidence_level, etc.
│   └── plugins/                         # 5 plugin YAML files
│       └── *.yaml                       # Format: same as skills + requires/provides fields
├── docs/                                # Documentation (gitignored in some cases)
├── logo/                                # Brand assets
│   └── *.svg                            # Wordmark, shield, variations
├── plugins/                             # Full plugin source code (5 plugins)
│   ├── aws-healthlake-fhir/             # AWS HealthLake + FHIR integration
│   ├── healthcare-mcp-comprehensive/    # MCP server for healthcare tools
│   ├── holy-bio-research-suite/         # Bioinformatics research tools
│   ├── medikode-medical-coding-platform/ # ICD-10/CPT coding assistant
│   └── openemr-integration/             # OpenEMR API integration
├── public/                              # Static assets (copied as-is to dist/)
│   ├── favicon.svg                      # Browser favicon
│   ├── logo-shield.svg                  # OG image, social cards
│   └── *.svg                            # Other brand assets
├── scripts/                             # Build and automation scripts
│   ├── generate-cli-index.js            # Generate skills.json from content/skills/
│   ├── sync-to-public.sh                # Sync to public repo (gitignored)
│   ├── bulk-dedup-report.py             # Duplicate detection (research)
│   └── dedup-check.js                   # Dedup validation in GitHub Action
├── skills/                              # Full skill source code (49 skills)
│   ├── prior-authorization-review/      # Example: single skill dir
│   │   └── SKILL.md                     # Markdown documentation with YAML front matter
│   └── [48 other skill directories]
├── src/                                 # Website source code (Astro 5)
│   ├── components/                      # Reusable UI components (Astro + React)
│   │   ├── Header.astro                 # Navigation header
│   │   ├── Footer.astro                 # Footer with links
│   │   ├── SkillCard.astro              # Card component for skill preview
│   │   ├── SkillGrid.astro              # Grid layout for cards
│   │   ├── SearchBar.tsx                # Search input (React island)
│   │   ├── CategoryFilter.tsx           # Category buttons (React island)
│   │   ├── SubmissionForm.tsx           # Skill submission form (React island)
│   │   ├── SubmitAuthBanner.tsx         # GitHub auth required banner
│   │   ├── ThemeToggle.tsx              # Dark/light mode toggle (React island)
│   │   ├── AuthButton.tsx               # "Sign in with GitHub" button (React)
│   │   ├── CookieBanner.tsx             # Cookie consent (React island)
│   │   ├── InstallCommands.astro        # Render install methods
│   │   ├── SkillSocialBar.astro         # Share/star buttons
│   │   ├── SkillFileViewer.astro        # Display SKILL.md content
│   │   ├── AgentActions.astro           # Cursor/Claude quick actions
│   │   └── (14 total components)
│   ├── content.config.ts                # Astro Content Layer API schema definitions
│   │                                    # ├─ Zod schemas for skills and plugins
│   │                                    # ├─ 14-category enum (diagnosis, treatment, etc.)
│   │                                    # └─ Evidence/safety classification enums
│   ├── features/                        # Feature modules (complex features)
│   │   ├── skill-creator/               # Chat-to-create-skill feature
│   │   │   ├── components/              # UI components (SkillCreatorApp, ChatInterface, etc.)
│   │   │   ├── lib/                     # Core logic (llm-proxy, skill-assembler, validators)
│   │   │   ├── prompts/                 # System prompts per section
│   │   │   ├── types.ts                 # TypeScript interfaces
│   │   │   └── CLAUDE.md                # Feature documentation
│   │   ├── fda-tools/                   # FDA tools feature (drug shortage, enforcement)
│   │   │   └── [components/lib]
│   │   ├── search/                      # Search feature (Pagefind integration)
│   │   └── [other features]
│   ├── layouts/                         # Astro layouts
│   │   └── BaseLayout.astro             # Root layout (meta, header, footer, theme script)
│   ├── lib/                             # Shared utilities
│   │   ├── categories.ts                # Category labels and styling (14 medical categories)
│   │   ├── auth.ts                      # GitHub OAuth helpers (client-side)
│   │   └── [other utilities]
│   ├── pages/                           # Astro routing (file-based)
│   │   ├── index.astro                  # Homepage (/)
│   │   ├── about.astro                  # /about page
│   │   ├── contribute.astro             # /contribute page
│   │   ├── submit.astro                 # /submit (skill submission form)
│   │   ├── create-skill.astro           # /create-skill (chat-to-create UI)
│   │   ├── fda-tools.astro              # /fda-tools (FDA tools hub)
│   │   ├── privacy.astro                # /privacy policy
│   │   ├── terms.astro                  # /terms of use
│   │   ├── skills/                      # Skills collection
│   │   │   ├── index.astro              # /skills (list of all skills)
│   │   │   └── [slug].astro             # /skills/[skill-name] (detail page)
│   │   ├── plugins/                     # Plugins collection
│   │   │   ├── index.astro              # /plugins (list)
│   │   │   └── [slug].astro             # /plugins/[plugin-name] (detail)
│   │   └── auth/                        # Auth pages
│   │       └── callback.astro           # /auth/callback (OAuth redirect)
│   ├── styles/                          # Global styles
│   │   └── global.css                   # TailwindCSS 4 + @theme definitions
│   └── content.config.ts                # Content collections config
├── workers/                             # Cloudflare Workers (serverless APIs)
│   ├── submission-api/                  # Form submission → GitHub PR
│   │   ├── src/index.ts                 # Main Worker (POST /api/submit, /auth/github/callback)
│   │   ├── src/types.ts                 # TypeScript types (SubmissionData, Env)
│   │   ├── package.json                 # Octokit, @wrangler
│   │   └── wrangler.toml                # Cloudflare configuration
│   ├── search-api/                      # Search proxy (semantic, graph, structured)
│   │   ├── src/index.ts                 # Main Worker (GET /api/search, /dedup, /validate)
│   │   ├── src/lib/                     # Utilities (errors, types)
│   │   ├── src/handlers/                # Route handlers (semantic, graph, validate, dedup)
│   │   ├── package.json
│   │   └── wrangler.toml
│   └── router/                          # Request router (future multi-endpoint routing)
├── .astro/                              # Astro build cache
├── .claude/                             # Claude Code config (local project settings)
│   ├── skills/                          # Reusable agent skills (21 skills)
│   │   ├── tailwind-css-patterns/
│   │   ├── react-patterns/
│   │   ├── frontend-design/
│   │   └── [18 other skills]
│   ├── commands/                        # Custom Claude commands (if any)
│   └── worktrees/                       # Git worktree locations
├── .mcp.json                            # MCP server configuration
│   │                                    # ├─ kubernetes server (K3s cluster access)
│   │                                    # └─ oms-postgres server (PostgreSQL via HTTP proxy)
├── .github/                             # GitHub (see above)
├── .internal/                           # Internal project files (gitignored)
│   ├── errors/                          # Error documentation
│   ├── research/                        # R&D findings
│   ├── k8s/                             # Kubernetes manifests (dev only)
│   └── web-design-examples/             # Design inspiration
├── astro.config.mjs                     # Astro configuration
│   │                                    # ├─ site: https://openmedica.us
│   │                                    # ├─ base: /open-medical-skills
│   │                                    # ├─ integrations: [@astrojs/react, @astrojs/sitemap]
│   │                                    # └─ vite: [@tailwindcss/vite plugin]
├── tsconfig.json                        # TypeScript strict mode + React JSX
├── package.json                         # Root dependencies (pnpm)
│   │                                    # ├─ astro, react, react-dom, @astrojs/* packages
│   │                                    # ├─ tailwindcss, pagefind for search
│   │                                    # └─ DevDeps: @tailwindcss/vite
└── [other files]
```

## Directory Purposes

**`content/`:**
- Purpose: YAML definitions of skills and plugins (source of truth for metadata)
- Contains: 49 `*.yaml` skill files, 5 `*.yaml` plugin files
- Key files: `content/skills/prior-authorization-review.yaml` (example with all fields)
- Schema: Enforced by Zod in `src/content.config.ts`

**`src/`:**
- Purpose: Website source code (Astro 5 static site generator)
- Contains: Pages, components, layouts, styles, features
- Build output: `dist/` (static HTML, CSS, JS)

**`src/pages/`:**
- Purpose: Astro file-based routing
- Contains: Top-level routes (index.astro, about.astro, submit.astro) + dynamic routes ([slug].astro)
- Pattern: `[slug].astro` files render dynamic pages from content collections

**`src/components/`:**
- Purpose: Reusable UI components (Astro + React islands)
- Contains: Atomic components (Header, Footer, SkillCard) + interactive islands (SearchBar, ThemeToggle)
- Pattern: `.astro` files = static HTML, `.tsx` files = React hydrated on client

**`src/features/`:**
- Purpose: Complex features split into isolated modules
- Contains: skill-creator (chat UI), fda-tools (drug data), search (integration)
- Pattern: Each feature has `components/`, `lib/`, `types.ts`, `CLAUDE.md` for internal docs

**`src/lib/`:**
- Purpose: Shared utilities and configuration
- Contains: `categories.ts` (14 medical categories + styling), `auth.ts` (GitHub OAuth)
- Key patterns: Category enums + TailwindCSS class mappings

**`workers/`:**
- Purpose: Cloudflare Workers (serverless edge functions)
- submission-api: Form submission + OAuth (routes: POST /api/submit, POST /auth/github/callback)
- search-api: Search proxy (routes: GET /api/search, /dedup, /validate, /graph)

**`skills/`:**
- Purpose: Full source code for each skill (documentation + implementation)
- Contains: 49 directories, each with `SKILL.md` file
- Format: SKILL.md has YAML front matter (name, description) + markdown body

**`plugins/`:**
- Purpose: Full source code for plugins (integration modules)
- Contains: 5 directories with complete source, README, LICENSE
- Examples: AWS HealthLake integration, MCP healthcare server, OpenEMR integration

**`cli/`:**
- Purpose: CLI tool for distributing skills (npm package `@openmedicalskills/cli`)
- bin/: Entry point (`oms` command)
- lib/: Command implementations (list, search, install)
- data/: Generated index (skills.json from `npm run generate-index`)

**`.claude/`:**
- Purpose: Claude Code project configuration (local)
- skills/: 21 reusable agent skills (copied from vps69 catalog)
- Commands: Custom Claude commands (if defined)

**`.internal/`:**
- Purpose: Internal project files (gitignored, not committed)
- Contains: Error docs, research findings, K8s manifests, design examples

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (this directory)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

## Key File Locations

**Entry Points:**
- `src/pages/index.astro`: Homepage (loads all skills/plugins, renders featured + search UI)
- `cli/bin/oms.js`: CLI entry point (#!/usr/bin/env node)
- `workers/submission-api/src/index.ts`: Submission API Worker
- `workers/search-api/src/index.ts`: Search API Worker

**Configuration:**
- `astro.config.mjs`: Astro settings (site, base path, integrations)
- `src/content.config.ts`: Content schema (Zod definitions for skills/plugins)
- `tsconfig.json`: TypeScript configuration (strict mode, React JSX)
- `package.json`: Root dependencies and build scripts
- `cli/package.json`: CLI package metadata and dependencies
- `workers/submission-api/wrangler.toml`: Worker configuration
- `.mcp.json`: MCP server endpoints

**Core Logic:**
- `src/lib/categories.ts`: 14 medical categories, labels, colors, styles
- `src/lib/auth.ts`: GitHub OAuth client-side flow
- `src/features/skill-creator/lib/llm-proxy.ts`: LLM provider abstraction
- `src/features/skill-creator/lib/skill-assembler.ts`: Generate SKILL.md + YAML
- `workers/submission-api/src/index.ts`: Validation, GitHub PR creation

**Styling:**
- `src/styles/global.css`: TailwindCSS 4 + @theme variables (category colors, fonts)
- `src/layouts/BaseLayout.astro`: Root layout (imports global CSS)

**Testing:**
- `scripts/dedup-check.js`: Duplicate skill detection (run in GitHub Actions)
- `scripts/generate-cli-index.js`: CLI index generation
- `.github/workflows/validate-submission.yml`: GitHub Action for PR validation

## Naming Conventions

**Files:**
- Astro pages: `kebab-case.astro` (index.astro, about.astro, create-skill.astro)
- React components: `PascalCase.tsx` (SearchBar.tsx, ThemeToggle.tsx)
- Astro components: `PascalCase.astro` (Header.astro, Footer.astro)
- Utilities: `kebab-case.ts` (categories.ts, skill-assembler.ts, llm-proxy.ts)
- YAML content files: `kebab-case.yaml` (prior-authorization-review.yaml)
- SKILL.md files: Always `SKILL.md` (standard naming for skill source)

**Directories:**
- Feature modules: `kebab-case` (skill-creator, fda-tools, search)
- Skill directories: Match skill name in kebab-case (prior-authorization-review/)
- Plugin directories: Match plugin name (healthcare-mcp-comprehensive/)
- Component directories: Named after component (Header/, Footer/)

**Variables/Functions:**
- React components: PascalCase (SkillCreatorApp, SearchBar)
- Functions: camelCase (getCollection, assembleSkillOutput, validateSubmission)
- Constants: SCREAMING_SNAKE_CASE (MAX_NAME_LENGTH, VALID_CATEGORIES, RATE_LIMIT_MAX)
- Astro props: camelCase (title, description, skills)

**CSS Classes:**
- TailwindCSS utility classes: kebab-case (bg-primary, text-slate-900, dark:bg-slate-800)
- Custom classes: kebab-case with descriptive prefix (.card-header, .skill-badge)
- Animation names: kebab-case (@keyframes slide-up, .animate-slide-up)

## Where to Add New Code

**New Skill:**
- Create `content/skills/[skill-name].yaml` with metadata (name, category, evidence_level, etc.)
- Create `skills/[skill-name]/SKILL.md` with implementation (markdown + YAML front matter)
- GitHub Action will validate the YAML on PR

**New Page:**
- Add `src/pages/[route-name].astro` (file-based routing)
- Import `BaseLayout` for consistent header/footer/styling
- Can include React island components with `client:load` or `client:idle`

**New React Island Component:**
- Create `src/components/[ComponentName].tsx` in PascalCase
- Import in `.astro` page with `client:load` or `client:idle` directive
- Use TailwindCSS classes for styling (no CSS-in-JS)

**New Feature Module:**
- Create `src/features/[feature-name]/` directory
- Subdirs: `components/`, `lib/`, `prompts/` (if applicable)
- Create `types.ts` for TypeScript interfaces
- Create `CLAUDE.md` for internal documentation
- Example: `src/features/skill-creator/` pattern

**New CLI Command:**
- Add command handler to `cli/lib/` (e.g., `cli/lib/search.js`)
- Register in `cli/bin/oms.js` with Commander.js
- Document in CLI help text

**New API Endpoint (Worker):**
- Add handler function in `workers/[api-name]/src/index.ts`
- Register route in Worker fetch handler (if statement on URL path)
- Follow error handling pattern: return `jsonError(message, status)` on failure
- Add CORS headers to all responses

**Utilities:**
- Shared helpers: `src/lib/` (e.g., `src/lib/helpers.ts`)
- Feature-specific helpers: `src/features/[name]/lib/` (e.g., `src/features/skill-creator/lib/validators.ts`)

## Special Directories

**`.astro/`:**
- Purpose: Astro build cache
- Generated: Auto-created during build
- Committed: No (gitignored)

**`dist/`:**
- Purpose: Build output (static HTML, CSS, JS)
- Generated: `pnpm build` → outputs to dist/
- Committed: No (gitignored, deployed to Cloudflare Pages)

**`.internal/`:**
- Purpose: Internal project files (research, errors, K8s manifests)
- Generated: Manual (notes, findings)
- Committed: No (gitignored per CLAUDE.md)

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: `pnpm install`
- Committed: No (gitignored)

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (created by gsd:map-codebase)
- Generated: Manually by orchestrator
- Committed: Yes (reference for future phases)


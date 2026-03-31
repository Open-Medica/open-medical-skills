# Architecture

**Analysis Date:** 2026-03-22

## Pattern Overview

**Overall:** Multi-tier static site + serverless APIs (jamstack + Cloudflare Workers)

**Key Characteristics:**
- Static site generation (Astro 5 with React island components)
- Content-driven (YAML-based skill/plugin definitions in `content/`)
- Client-side rendering for interactive features (search, filtering, form submission)
- Serverless APIs for dynamic operations (GitHub OAuth, skill submission, semantic search)
- Edge-deployed on Cloudflare Pages + Workers

## Layers

**Presentation Layer (Frontend):**
- Purpose: Render skill/plugin marketplace with filtering, search, and skill creation UI
- Location: `src/pages/`, `src/components/`, `src/layouts/`
- Contains: Astro pages, React islands, static components
- Depends on: Content collections (Astro Content Layer API), auth library, category utilities
- Used by: Web browsers, crawlers (for SEO via sitemap)

**Content Layer (Static):**
- Purpose: Define skills and plugins as queryable YAML data with schema validation
- Location: `content/skills/`, `content/plugins/`
- Contains: YAML files (49 skills, 5 plugins) loaded via glob loader
- Depends on: Zod schema definitions (`src/content.config.ts`)
- Used by: Astro pages (via `getCollection()`), CLI (dynamic index generation)

**API Layer (Edge Workers):**
- Purpose: Handle dynamic operations (OAuth, form submission, search, validation)
- Location: `workers/submission-api/src/index.ts`, `workers/search-api/src/index.ts`
- Contains: Cloudflare Worker functions (request routing, validation, GitHub API calls)
- Depends on: Environment variables (secrets, GitHub token, auth config)
- Used by: Client-side code (fetch requests), GitHub API, LLM backends

**CLI Layer:**
- Purpose: Distribute skills locally, manage installations, index generation
- Location: `cli/bin/oms.js`, `cli/lib/`
- Contains: Commander.js command definitions, skill fetching, formatting
- Depends on: NPM packages, GitHub raw content
- Used by: Terminal users, IDEs (Cursor, VS Code)

**Feature Modules:**
- **Skill Creator**: Interactive chat-based skill authoring in `src/features/skill-creator/`
- **Search**: Full-text + semantic search proxy in `workers/search-api/`
- **FDA Tools**: Drug shortage tracker, enforcement tracking in `src/features/fda-tools/`

## Data Flow

**Homepage Browse Flow:**
1. User visits `/`
2. Astro fetches all skills + plugins via `getCollection("skills")` and `getCollection("plugins")`
3. Renders static HTML with featured grid (sorted by published status, verified, date)
4. Embeds search/filter React islands with client-side state
5. Browser hydrates `SearchBar` and `CategoryFilter` components
6. User filters/searches, JavaScript toggles card visibility (no new requests)

**Skill Detail Flow:**
1. User clicks skill card or visits `/skills/[slug]`
2. Astro renders `src/pages/skills/[slug].astro`
3. Fetches individual skill entry via `getEntryBySlug("skills", slug)`
4. Renders YAML metadata as HTML (category badge, evidence level, safety, install commands)
5. Links to GitHub repository, displays reviewer info

**Submission Flow (Web Form):**
1. User navigates to `/submit`
2. `SubmissionForm` component (React island) renders
3. User fills form (name, description, category, etc.)
4. Clicks "Submit"
5. Form sends POST to `https://api.openmedicalskills.org/api/submit` (Submission Worker)
6. Worker validates input (sanitizes, checks schema against VALID_CATEGORIES)
7. Generates YAML file and creates GitHub PR (via Octokit)
8. Returns PR URL to user

**Skill Creator Flow (Chat):**
1. User navigates to `/create-skill`
2. Astro renders page with `SkillCreatorApp` React island (client:only)
3. User selects section in sidebar, types content, clicks Magic Button
4. App sends user content + section system prompt to configured LLM endpoint
5. LLM refines content (client-side or via Cloudflare Worker proxy)
6. Content appears in preview pane as markdown
7. User accepts/edits/regenerates
8. After all sections complete, user clicks "Generate Skill"
9. App generates SKILL.md (with YAML front matter) and content YAML
10. Modal shows files with download/submit options

**State Management:**
- Homepage filters: URL query params (`?category=diagnosis`) + client-side DOM filtering
- Skill Creator: React useReducer state + localStorage auto-save by skill name
- Auth: localStorage tokens (`oms_github_token`, `oms_github_user`)

## Key Abstractions

**Skill/Plugin Collection (Astro Content):**
- Purpose: Define and validate skill/plugin metadata with a shared Zod schema
- Examples: `content/skills/prior-authorization-review.yaml`, `content/plugins/healthcare-mcp-comprehensive/index.yaml`
- Pattern: Glob loader (`glob({ pattern: '**/*.{yaml,yml}', base: './content/skills' })`) + Zod validation in `src/content.config.ts`
- Shared schema fields: `name`, `display_name`, `description`, `author`, `repository`, `category` (14 enums), `evidence_level`, `safety_classification`, `status` (published/draft/coming-soon), `verified`

**Category System:**
- Purpose: Organize skills across 14 medical domains and provide consistent styling
- Location: `src/lib/categories.ts`
- Maps: category slug → display label, TailwindCSS color classes (bg, text, border), evidence styles, safety styles
- Used by: Content schema (enum), filtering UI, skill cards, category badges

**LLM Proxy:**
- Purpose: Abstract away LLM provider differences (OpenAI, DeepSeek, local Ollama, etc.)
- Location: `src/features/skill-creator/lib/llm-proxy.ts`
- Pattern: Config object with `baseUrl`, `apiKey`, `modelId`; functions `refineSection()` and `streamRefineSection()` send POST to `/v1/chat/completions` (OpenAI-compatible API)

**GitHub OAuth Auth Flow:**
- Purpose: Authenticate users without exposing client secrets
- Location: `src/lib/auth.ts`, `workers/submission-api/src/index.ts` (POST `/auth/github/callback`)
- Pattern: Client obtains authorization code from GitHub → sends to Worker → Worker exchanges code for access token using client secret (never exposed to browser) → Worker returns token to client → client stores in localStorage

**Section Validators:**
- Purpose: Client-side validation of skill creator sections before submission
- Location: `src/features/skill-creator/lib/section-validators.ts`
- Pattern: Zod schemas per section, validates structure/length/format before sending to LLM or generating output

**Skill Assembler:**
- Purpose: Combine section content into final SKILL.md and content YAML artifacts
- Location: `src/features/skill-creator/lib/skill-assembler.ts`
- Pattern: Takes AppState (all sections + metadata) → generates SKILL.md with YAML front matter + generates content/skills/[name].yaml

## Entry Points

**Web Browser (Homepage):**
- Location: `src/pages/index.astro`
- Triggers: User visits `/` or domain root
- Responsibilities: Fetch all skills/plugins, render hero + stats, featured grid, search/filter UI, display all items

**Web Browser (Skill Detail):**
- Location: `src/pages/skills/[slug].astro`
- Triggers: User visits `/skills/prior-authorization-review` (dynamic route)
- Responsibilities: Fetch individual skill, render metadata + install instructions + links

**Web Browser (Submit Form):**
- Location: `src/pages/submit.astro`
- Triggers: User clicks "Submit a Skill" or visits `/submit`
- Responsibilities: Render submission form (React island), handle validation errors, show success with PR link

**Web Browser (Create Skill):**
- Location: `src/pages/create-skill.astro`
- Triggers: User visits `/create-skill`
- Responsibilities: Render `SkillCreatorApp` in full-screen, manage state, generate output files

**Cloudflare Worker (Submission API):**
- Location: `workers/submission-api/src/index.ts`
- Triggers: POST to `api.openmedicalskills.org/api/submit` or `https://api.openmedicalskills.org/auth/github/callback`
- Responsibilities: Validate skill submission, sanitize input, generate YAML, create GitHub PR, exchange OAuth code for token

**Cloudflare Worker (Search API):**
- Location: `workers/search-api/src/index.ts`
- Triggers: GET `/api/search?q=term`, `/api/search/graph?tool=id`, `/api/dedup?q=description`, `/api/validate?skill=name`
- Responsibilities: Route search requests to backend services (Qdrant, SurrealDB, Supabase), return results

**CLI (Terminal):**
- Location: `cli/bin/oms.js`
- Triggers: `oms list`, `oms search query`, `oms install owner/skill-name`
- Responsibilities: List available skills, search by category/tag, fetch and display skill details, provide install instructions

## Error Handling

**Strategy:** Fail fast with clear user-facing messages, log server-side errors

**Patterns:**
- Form validation: Display field-level errors on submit (Submission Worker returns `{ success: false, errors: [...] }`)
- API failures: JSON error response with HTTP status code and `error` message (Search/Submission Workers)
- Client-side: Try-catch with fallback UI (SearchBar catches fetch errors, displays "Search unavailable")
- LLM refinement: Show error message in chat interface, allow user to retry or manually edit
- GitHub operations: Octokit throws on auth failure or API errors; Worker catches and returns 400/502/500 with message

## Cross-Cutting Concerns

**Logging:**
- Server-side (Workers): `console.error()` for unexpected errors (caught by Cloudflare dashboard)
- Client-side: Browser console; no sensitive data logged
- GitHub API errors: Logged in Worker

**Validation:**
- Input validation in Submission Worker: Sanitization (HTML strip, length limits), regex (kebab-case names, URLs), schema (category enum)
- Content validation in Skill Creator: Zod schemas per section, required field checks
- Rate limiting: In-memory Map in Submission Worker (5 requests per IP per hour for MVP)

**Authentication:**
- GitHub OAuth with CSRF protection (state parameter generated/verified per RFC 6749)
- Submission Worker validates code format before GitHub exchange
- Auth tokens stored in browser localStorage, sent via Authorization header (Bearer scheme)

**CORS:**
- Submission/Search Workers respond with `Access-Control-Allow-Origin` from env var `ALLOWED_ORIGIN`
- Preflight (OPTIONS) requests handled explicitly
- All responses include CORS headers even on error


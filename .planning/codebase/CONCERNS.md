# Codebase Concerns

**Analysis Date:** 2026-03-22

## Tech Debt

**In-Memory Rate Limiting (Submission API):**
- Issue: `workers/submission-api/src/index.ts` uses in-memory Map for rate limiting (lines 14-53). Resets on worker restart, doesn't persist across instances.
- Files: `workers/submission-api/src/index.ts` (lines 21-53)
- Impact: Multiple submissions per hour per IP possible during worker redeploys, hitting GitHub API quota limits faster than intended.
- Fix approach: Replace `rateLimitMap` with Cloudflare KV storage. Update `checkRateLimit()` to use async KV calls. Requires adding KV binding to `wrangler.toml`.

**Category Validation Sync Across 3 Sources:**
- Issue: Medical category enum (14 values) defined in 3 separate places: Zod schema, CF Worker type, GitHub Action bash validation. Risk of divergence.
- Files:
  - `src/content.config.ts` (lines 12-27, 67-82)
  - `workers/submission-api/src/types.ts` (VALID_CATEGORIES array)
  - `.github/workflows/validate-submission.yml` (line 119)
- Impact: If category added in one place but not others, submissions will pass some validations but fail later steps.
- Fix approach: Create shared canonical list in `.github/workflows/` or publish as API endpoint. GitHub Action references both Zod and Worker list as source of truth.

**Feature Branch with 13 New Files (Chat-to-Create-Skill):**
- Issue: Unmerged feature branch `feature/chat-to-create-skill` adds 13 React/TypeScript files to the `/create-skill` route. Context split between main and feature branches.
- Files: `src/features/skill-creator/` (13 component/utility files)
- Impact: Duplicated maintenance effort, diverging from main. If main has bug fixes, feature branch doesn't receive them automatically.
- Fix approach: Merge or rebase feature branch to main after code review. If waiting on approval, keep rebased onto latest main daily.

**Payload Size Limits Not Enforced:**
- Issue: Submission API validates individual field lengths but no aggregate payload size limit. User could submit large `clinical_evidence` or `safety_guardrails` fields (up to 2000 chars each).
- Files: `workers/submission-api/src/index.ts` (lines 85-94)
- Impact: Malicious or accidental large payloads could exceed Cloudflare Worker request size limits (100MB theoretical, but 1MB practical for JSON).
- Fix approach: Add `MAX_PAYLOAD_SIZE = 100000` constant. Check `JSON.stringify(submission).length` before creating PR.

## Known Bugs

**GitHub Action YAML File Extension Mismatch:**
- Symptoms: GitHub Action creates `.yml` files (line 559 in validate-submission.yml), but content schema glob pattern expects both `.yaml` and `.yml`. Could cause parsing inconsistencies.
- Files: `.github/workflows/validate-submission.yml` (line 559), `src/content.config.ts` (line 5)
- Trigger: When issue-based submission converts to PR, file created as `.yml`. Astro Content Layer loads both, but filename convention becomes inconsistent.
- Workaround: Rename all generated files to `.yaml` in GitHub Action, or standardize glob to `.yml` only.

**K8s ConfigMap Hardcoded Pod IP:**
- Symptoms: MCP Toolbox ConfigMap references postgres pod IP `10.42.0.69` directly. If postgres pod restarts (node failure, upgrade), pod IP changes, and Toolbox becomes unable to query database.
- Files: K8s ConfigMap `toolbox-config` in `oms` namespace (not in source repo, only in memory)
- Trigger: K3s node restart, postgres pod eviction, cluster upgrade
- Workaround: Use K8s DNS service name `oms-postgres.oms.svc.cluster.local` instead of pod IP. Requires updating Toolbox deployment and restarting.

**CORS Allow-Origin Hard-Coded:**
- Symptoms: Submission API hardcodes `ALLOWED_ORIGIN` to `http://localhost:4321` in code (workers/submission-api/wrangler.toml line 9). Production should be different domain.
- Files: `workers/submission-api/wrangler.toml` (line 9)
- Trigger: Deploy to production with localhost origin → cross-origin requests fail or expose API to wrong domain.
- Workaround: Environment-specific config already in place (line 18), but requires explicit `--env production` flag when deploying.

## Security Considerations

**GitHub OAuth State Validation Missing on Callback:**
- Risk: `src/lib/auth.ts` generates state parameter (lines 83-94) and stores in sessionStorage, but callback page doesn't validate it. Vulnerable to CSRF if attacker can forge callback URL.
- Files: `src/lib/auth.ts` (lines 60-78, 83-94), `src/pages/auth/callback.astro` (callback handler not reviewed)
- Current mitigation: GitHub validates redirect_uri server-side (good), but client-side state validation missing.
- Recommendations: In callback page, verify `state` param matches stored state before exchanging code. Return 400 if state is missing or mismatched.

**localStorage Storing GitHub Access Token:**
- Risk: GitHub access token stored in plain text in localStorage (auth.ts lines 40-41). XSS attack can steal token and impersonate user for 30 days (GitHub default token lifetime).
- Files: `src/lib/auth.ts` (STORAGE_KEY_TOKEN)
- Current mitigation: Token only has `read:user` scope (minimal permission), but still a risk.
- Recommendations: (1) Use sessionStorage instead (expires when tab closes), (2) Set explicit token expiration, (3) Implement token refresh flow with shorter-lived tokens, (4) Add httpOnly cookie option if moving to server-side auth.

**Sanitization in Submission API Incomplete:**
- Risk: `yamlEscape()` function (line 106-111 in submission-api/index.ts) escapes basic YAML special chars but doesn't handle all edge cases. YAML allows unquoted strings that could break schema.
- Files: `workers/submission-api/src/index.ts` (lines 106-111, 216-256)
- Current mitigation: All fields wrapped in double quotes after escape.
- Recommendations: Use yaml library to generate YAML instead of string concatenation. Or add validation: disallow newlines in single-line fields, reject strings with unquoted special chars.

**Rate Limiting on Auth Callback but not Token Validation:**
- Risk: `/auth/user` endpoint (src/index.ts line 598) validates GitHub token without rate limiting. Attacker can brute-force token validation.
- Files: `workers/submission-api/src/index.ts` (lines 454-511)
- Current mitigation: GitHub API has its own rate limits (60 req/min per token).
- Recommendations: Add rate limiting to `/auth/user` endpoint similar to submission endpoint. Use per-token rate limit to prevent enumeration.

**CLI Timeout Not Configurable:**
- Risk: `cli/lib/api-client.js` hardcodes 10-second timeout (line 3) for all API calls. Network-slow users or large responses timeout without recourse.
- Files: `cli/lib/api-client.js` (line 3)
- Current mitigation: Error caught and CLI falls back to local search.
- Recommendations: Make timeout configurable via env var `OMS_API_TIMEOUT`. Default 10s, allow user to override.

## Performance Bottlenecks

**Large Component: SkillCreatorApp (578 lines):**
- Problem: `src/features/skill-creator/components/SkillCreatorApp.tsx` is 578 lines with multiple responsibilities: state management, form handling, LLM proxying, YAML generation.
- Files: `src/features/skill-creator/components/SkillCreatorApp.tsx`
- Cause: Component grew organically without refactor. Lack of custom hooks to extract logic.
- Improvement path: Extract state management into `useSkillCreator()` hook, LLM logic into `useLLMProxy()` hook, YAML generation into `useSkillAssembler()` hook. Reduces main component to ~250 lines.

**System Prompts File (425 lines):**
- Problem: `src/features/skill-creator/prompts/system-prompts.ts` is 425 lines of hardcoded prompt strings. Each edit requires rebuild. No version control or A/B testing.
- Files: `src/features/skill-creator/prompts/system-prompts.ts`
- Cause: Prompts stored as code for simplicity. Works for MVP but doesn't scale.
- Improvement path: Move prompts to JSON/YAML files in `content/prompts/`, load at build time. Enables version control, A/B testing, faster iteration.

**Search Across 3 Backends (No Caching):**
- Problem: Semantic search route (`/api/search`) queries Qdrant vector DB on every request (search-api/src/handlers/semantic.ts). No caching layer.
- Files: `workers/search-api/src/index.ts` (lines 42-55)
- Cause: Real-time queries needed for accuracy, but popular queries repeat.
- Improvement path: Add Cloudflare Cache API for 5-min TTL on popular queries. Or use Cloudflare KV for 1-hour cache of top 1000 queries.

**CLI Search Falls Back to Local Index (Slow):**
- Problem: If search API unavailable, CLI falls back to `searchSkillsLocal()` which loads entire skills index into memory, linear scans every record.
- Files: `cli/lib/skills.js` (lines 41-62, 86-99)
- Cause: MVP optimization — works for 49 skills but will degrade with 1000+.
- Improvement path: Precompile local index with trie or inverted index structure. Or use SQLite for local search instead of JSON array.

## Fragile Areas

**GitHub Action Bash Parsing (Shell Parsing Edge Cases):**
- Files: `.github/workflows/validate-submission.yml` (lines 54-137)
- Why fragile: Bash parsing of YAML via regex and grep is brittle. YAML keys can have spaces, special chars, quoted values. Regex like `^category:` fails if there's leading whitespace.
- Safe modification: Use Python YAML parser (lines 67-94 already does this via Python inline script) instead of bash grep. Migrate all field extraction to Python block.
- Test coverage: No unit tests for GitHub Action validation logic. Add test fixtures (valid/invalid YAML) and run locally with `act` GitHub Actions emulator.

**LLM Proxy Client-Side (Unvalidated Input):**
- Files: `src/features/skill-creator/lib/llm-proxy.ts` (lines 1-340)
- Why fragile: Sends raw user input to LLM API (LMStudio, Ollama, DeepSeek) without validation. If user's LLM instance is compromised or returns malicious content, YAML generator blindly accepts it.
- Safe modification: (1) Validate LLM response matches schema (has required fields, categories valid), (2) Sandbox LLM input with length limits, (3) Log all LLM interactions for audit.
- Test coverage: Add integration tests mocking various LLM responses (valid, invalid, partial, malicious).

**OAuth Token Flow Missing State Verification:**
- Files: `src/lib/auth.ts` (lines 64-78), callback page implementation unclear
- Why fragile: State parameter generated but not verified. Callback page acceptance of any auth code susceptible to CSRF.
- Safe modification: Add state verification in callback handler before code exchange. Fail with 403 if state doesn't match or is missing.
- Test coverage: Unit test for `verifyState()`, integration test simulating CSRF attack.

**Zod Schema Not Enforced in CLI:**
- Files: `cli/lib/skills.js` (skill searching/loading) doesn't validate against Zod schema
- Why fragile: CLI accepts any JSON from index file without schema validation. If content schema changes, CLI could fail silently or display garbage.
- Safe modification: Export Zod types as JSON schema, CLI loads and validates skills against it.
- Test coverage: Add snapshot tests comparing CLI output against expected schema structure.

## Scaling Limits

**In-Memory Rate Limiter Doesn't Scale:**
- Current capacity: Single Cloudflare Worker instance, in-memory Map. No cross-instance coordination.
- Limit: ~1000 entries in Map before memory pressure. If 10k users submit/hour, each with unique IP, Map fills and becomes useless.
- Scaling path: Migrate to Cloudflare KV (100MB free, millions of keys possible). Use composite key `ip:endpoint` to isolate rate limits per route.

**Skills Index as JSON (No Search Scaling):**
- Current capacity: 49 skills × ~500 bytes each = 25KB. Pagefind client-side index ~50KB. Acceptable.
- Limit: At 10,000 skills, index becomes 5MB+. Client-side search degrades. Pagefind still works but slow.
- Scaling path: Keep local index for CLI, build server-side search API for web. Qdrant already in place, just needs to be indexed with all 10k skills.

**PostgreSQL Skill Tracker Schema (Not Used):**
- Current capacity: Schema defined but no data. Database tables `skill_tracker`, `upstream_repos` empty.
- Limit: Once populated, tracker could hit query limits with 10k+ records and complex joins.
- Scaling path: Add indexing strategy upfront. Index on (skill_name, status, date_added), composite index on (category, evidence_level). Plan for partitioning by date_added.

**GitHub API Rate Limits on PR Creation:**
- Current capacity: 5000 requests/hour per token. Each submission PR uses ~5 API calls (create branch, write file, create PR, add labels, request review). 1000 submissions/hour uses 5000 quota.
- Limit: Burst of submissions can exhaust quota. GitHub becomes unavailable for PRs until hour resets.
- Scaling path: Implement submission queue (K8s job or SQS). Batch submissions during off-peak hours. Use GitHub App with higher rate limits (15k req/hour).

## Dependencies at Risk

**Astro 5 + React 19 (Cutting Edge):**
- Risk: Astro 5 and React 19 are recent (2025). New versions may introduce breaking changes. Community size smaller than Next.js.
- Impact: Breaking changes in minor releases require immediate fixes. Community support for edge cases limited.
- Migration plan: Maintain lock file strictly, test all updates in CI before merging. Consider pinning to patch version (e.g., `astro@5.18.0` not `^5`). Evaluate Next.js if Astro breaks frequently.

**Cloudflare Workers (Vendor Lock-In):**
- Risk: Submission API and Search API both depend on Cloudflare Workers. Vendor lock-in to Cloudflare's V8 runtime and APIs.
- Impact: Difficult to migrate to other serverless (AWS Lambda, Deno Deploy). Worker-specific APIs (KV, Durable Objects) don't have 1:1 equivalents elsewhere.
- Migration plan: Wrap worker APIs in abstraction layer. Use standard fetch API only where possible. Keep business logic in non-worker libraries.

**@octokit/rest (GitHub API Dependency):**
- Risk: GitHub API client used in submission-api. If GitHub API changes, Octokit must update. PR creation logic tightly coupled to GitHub API.
- Impact: Any GitHub API deprecation or breaking change requires immediate fix.
- Migration plan: Wrap Octokit calls in adapter. Use only stable API endpoints. Monitor GitHub API deprecation notices.

**Pagefind (Client-Side Search):**
- Risk: Pagefind is smaller project (maintainer: jgraber). If project abandoned, no updates for new Astro versions.
- Impact: Client-side search could break with new Astro major version.
- Migration plan: Keep fallback to server-side search API. Test Pagefind with every Astro major upgrade. Evaluate MiniSearch as alternative (more active community).

## Missing Critical Features

**No Data Persistence Between Submissions:**
- Problem: Skills submitted via web form or API go straight to GitHub PR. No database of submitted skills yet. Skill Tracker table empty.
- Blocks: Analytics (how many submissions/day?), deduplication (is this skill already submitted?), status tracking (is submission still in review?).
- Priority: High — analytics needed to understand submission funnel. Dedup prevents duplicate listings.

**No Skill Usage Analytics:**
- Problem: No tracking of which skills are popular, installed, or used. CLI doesn't report install counts.
- Blocks: Ranking skills by usage, identifying dead skills, trending features.
- Priority: Medium — nice to have for curating "Featured" skills, but not blocking.

**No Version Control for Skill YAML:**
- Problem: When skill is updated (e.g., evidence level bumped), entire YAML file replaced. No git history of changes within a skill.
- Blocks: Audit trail (who changed what when?), rollback capability, changelog generation.
- Priority: Medium — can be solved by treating YAML files like code (already in git), but needs better UI for viewing history.

**No Medical Content Review Checklist:**
- Problem: GitHub Action flags submissions for "physician review", but no structured checklist or approval process. Relies on manual review in PR.
- Blocks: Consistent medical validation, compliance audit trail, FDA SaMD boundary verification.
- Priority: High — critical for maintaining medical credibility. Should be formalized as CHECKLIST in PR template.

## Test Coverage Gaps

**Submission API Validation Logic:**
- What's not tested: Edge cases in `sanitize()`, `yamlEscape()`, `validateSubmission()`, YAML generation. SQL injection via skill name, XSS in description field.
- Files: `workers/submission-api/src/index.ts` (no test file found)
- Risk: Malicious input could break YAML generation or GitHub API calls. Untested edge cases.
- Priority: High — security-critical. Add unit tests for all validation functions, fuzz testing for user inputs.

**GitHub Action Validation Bash Scripts:**
- What's not tested: Regex parsing of YAML with edge cases (leading whitespace, quoted values, special chars). No test fixtures.
- Files: `.github/workflows/validate-submission.yml`
- Risk: Validation could miss malformed YAML or give false positives, letting bad submissions through.
- Priority: High — gateway to production content. Requires test fixtures and `act` local testing.

**LLM Proxy Response Handling:**
- What's not tested: Malformed LLM responses, timeouts, API errors. No mocks for different LLM providers.
- Files: `src/features/skill-creator/lib/llm-proxy.ts`
- Risk: Bad LLM response could generate invalid YAML, crash UI, or silently lose user input.
- Priority: High — impacts user experience and data integrity. Add error handling tests and mock responses.

**CLI Fallback Logic (API Down → Local Search):**
- What's not tested: Network timeout scenarios, partial API failures, stale local index.
- Files: `cli/lib/skills.js` (lines 41-62)
- Risk: Fallback logic could mask API problems, users don't know if they're searching live data or stale index.
- Priority: Medium — can be tested with network mocking. Add integration tests with `node --experimental-network`.

**OAuth Flow (State Validation, CSRF):**
- What's not tested: CSRF attacks, state mismatch, token exchange failures, expired tokens.
- Files: `src/lib/auth.ts`, callback page
- Risk: Security vulnerability if state validation missing. Tokens could be stolen or used by wrong user.
- Priority: High — security-critical. Add unit tests for state generation/verification, integration tests simulating attacks.

**Content Schema (Zod):**
- What's not tested: Invalid category enum values, URL validation, length limits. No invalid fixture test.
- Files: `src/content.config.ts` (Zod schema)
- Risk: If content doesn't match schema, build fails silently or Astro Content Layer skips files.
- Priority: Medium — can be tested by creating invalid YAML fixtures and running build.

---

*Concerns audit: 2026-03-22*

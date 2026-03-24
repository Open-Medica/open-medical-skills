# Phase 3: Content Sync via Submodule - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

The private repo (`gitjfmd/oms-site`) consumes public content (`Open-Medica/open-medical-skills`) through a git submodule. Astro builds successfully with zero missing pages. Dev server works. Both `main` and `dev` branches have the submodule configured.

This phase does NOT set up CI/CD or cross-repo dispatch — those are Phases 5 and 6.

</domain>

<decisions>
## Implementation Decisions

### Submodule configuration
- **D-01:** Submodule path is `content-repo/` (locked in roadmap success criteria)
- **D-02:** Submodule URL is `https://github.com/Open-Medica/open-medical-skills.git`
- **D-03:** Submodule tracks `main` branch (stable, physician-approved content only)
- **D-04:** Add submodule via `git submodule add -b main <url> content-repo`

### Content path updates
- **D-05:** `content.config.ts` line 5: `base: './content/skills'` → `base: './content-repo/content/skills'`
- **D-06:** `content.config.ts` line 60: `base: './content/plugins'` → `base: './content-repo/content/plugins'`
- **D-07:** `scripts/generate-cli-index.js` line 6: update path if it reads from `content/skills/` directly
- **D-08:** `workers/submission-api/src/index.ts` line 293: keep `content/skills/${submission.name}.yaml` as-is — this references the PUBLIC repo path (where PRs are created), not the local filesystem
- **D-09:** `submit.astro` and `contribute.astro` hardcoded `content/skills/` strings are UI text telling users where to add files in the public repo — keep as-is

### Private repo setup (REPO-03)
- **D-10:** The private repo IS the current working directory (`gitjfmd/oms-site` which is this repo). It already has all Astro source, React components, CF Workers, deployment config
- **D-11:** After adding the submodule, the local `content/` directory becomes redundant — remove it to avoid confusion (content now comes from `content-repo/content/`)
- **D-12:** Also remove local `skills/` and `plugins/` source dirs — they live in the public repo now
- **D-13:** Keep `cli/` locally for now — it was already pushed to the public repo in Phase 1, and the private repo may reference it

### Post-build validation (SYNC-07)
- **D-14:** Create a post-build validation script that counts HTML output files for skills and plugins
- **D-15:** Expected counts: 49 skill pages + 5 plugin pages = 54 content pages minimum
- **D-16:** Script runs after `pnpm build` and exits non-zero if counts don't match — this becomes a CI step in Phase 6

### Dev branch (REPO-05)
- **D-17:** Configure submodule on a feature branch, test build, then merge to `dev`
- **D-18:** The `dev` branch must build cleanly with the submodule before this phase is complete

### Claude's Discretion
- Post-build validation script implementation details (shell script vs node script)
- Whether to use symlinks as a compatibility layer during transition
- Exact git commands for submodule initialization
- How to handle the `skills/` and `plugins/` source directories (they contain SKILL.md files referenced by some pages)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Content loading (critical — the core of this phase)
- `src/content.config.ts` — Lines 5 and 60 define glob base paths. MUST change from `./content/skills` to `./content-repo/content/skills` (and plugins equivalent)

### Files that reference content paths
- `src/pages/submit.astro` line 43 — UI text referencing `content/skills/` (public repo path, keep as-is)
- `src/pages/contribute.astro` line 49 — UI text referencing `content/skills/` (public repo path, keep as-is)
- `scripts/generate-cli-index.js` line 6 — Reads YAML from `content/skills/` (may need path update)
- `workers/submission-api/src/index.ts` line 293 — Creates file at `content/skills/` in GitHub API call (public repo path, keep as-is)

### Build system
- `astro.config.mjs` — Static output config, site URL, base path
- `package.json` — Build commands (`pnpm build`, `pnpm dev`)

### Phase 1 research (submodule strategy)
- `.planning/phases/01-public-repository-creation/01-RESEARCH.md` — Documents that CF Pages native git cannot clone submodules; GHA + wrangler direct upload is the correct deploy approach

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `content.config.ts`: Well-structured Zod schemas for both skills and plugins. Only the `base` path in `glob()` calls needs updating — schemas stay identical.
- Post-build: Astro outputs to `dist/` directory. Skill pages at `dist/open-medical-skills/skills/[slug]/index.html`. Plugin pages at `dist/open-medical-skills/plugins/[slug]/index.html` (based on `base: '/open-medical-skills'` in astro.config.mjs).

### Established Patterns
- Astro Content Layer API with `glob()` loader — the standard way to load YAML content
- Static output mode — no server-side rendering, pure HTML files in `dist/`
- `base: '/open-medical-skills'` — all output paths are prefixed

### Integration Points
- `src/pages/skills/[slug].astro` — Dynamic route using `getCollection('skills')`. Works with any glob base path as long as content loads.
- `src/pages/plugins/[slug].astro` — Same pattern for plugins.
- `src/pages/index.astro` — Loads both collections for the homepage grid.
- CI workflows (Phase 6) will need `submodules: recursive` in checkout step.

</code_context>

<specifics>
## Specific Ideas

- Phase 1 research found CF Pages native git cannot clone submodules — deploy workflow must use `wrangler pages deploy` with explicit submodule checkout (Phase 6 concern, not this phase)
- Astro glob silently returns empty on wrong paths — the post-build validation script (SYNC-07) is the safety net against this
- The `skills/` directory contains SKILL.md source files that are NOT loaded by Astro (only `content/skills/*.yaml` is loaded) — check if any page references `skills/` directly before removing

</specifics>

<deferred>
## Deferred Ideas

- `repository_dispatch` on public push to trigger private rebuild — Phase 5/6
- `update-content.yml` receiver workflow — Phase 6 (SCI-08)
- CI `submodules: recursive` checkout — Phase 6
- Removing `scripts/sync-to-public.sh` — Phase 10

</deferred>

---

*Phase: 03-content-sync-via-submodule*
*Context gathered: 2026-03-24*

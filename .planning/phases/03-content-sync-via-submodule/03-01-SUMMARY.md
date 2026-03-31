---
phase: 03-content-sync-via-submodule
plan: 01
subsystem: infra
tags: [git-submodule, astro, content-collections, build-validation, two-repo-architecture]

# Dependency graph
requires:
  - phase: 01-public-repository-creation
    provides: Public repo Open-Medica/open-medical-skills with 49 skills and 5 plugins
provides:
  - Private repo consumes public content via git submodule at content-repo/
  - Updated content.config.ts glob paths point to submodule content
  - Post-build validation script (scripts/validate-build.sh) catches empty collections
  - CLI index generation updated to read from submodule path
  - Dev branch configured with submodule on gitjfmd/oms-site
affects: [04-cross-repo-authentication, 05-public-repo-cicd, 06-private-repo-cicd, 10-private-repo-cleanup]

# Tech tracking
tech-stack:
  added: [git-submodules]
  patterns: [content-via-submodule, post-build-validation, two-repo-content-sync]

key-files:
  created:
    - .gitmodules (submodule config pointing to Open-Medica/open-medical-skills main)
    - scripts/validate-build.sh (post-build page count validator)
  modified:
    - src/content.config.ts (glob base paths to content-repo/)
    - scripts/generate-cli-index.js (SKILLS_DIR to content-repo/)

key-decisions:
  - "Submodule tracks main branch of public repo (branch = main in .gitmodules)"
  - "Content paths use relative ./content-repo/ prefix for Astro glob loader"
  - "Validation script uses find with mindepth/maxdepth for reliable page counting"
  - "Redundant local content/, skills/, plugins/ dirs removed; cli/ preserved locally"

patterns-established:
  - "Content sync: private repo reads content exclusively from content-repo/ submodule"
  - "Build validation: always run scripts/validate-build.sh after pnpm build to catch silent empty collections"
  - "CLI index: generate-cli-index.js reads from content-repo/content/skills/"

requirements-completed: [SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-07, REPO-03, REPO-05]

# Metrics
duration: 8min
completed: 2026-03-25
---

# Phase 3 Plan 1: Content Sync via Submodule Summary

**Git submodule wiring from private repo to public content with updated Astro glob paths, post-build validation, and verified 49-skill + 5-plugin builds**

## Performance

- **Duration:** ~8 min (across two sessions with checkpoint)
- **Started:** 2026-03-25T04:10:00Z
- **Completed:** 2026-03-25T04:21:57Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 6 (in private repo gitjfmd/oms-site)

## Accomplishments
- Wired private repo (gitjfmd/oms-site) to consume public content from Open-Medica/open-medical-skills via git submodule at content-repo/
- Updated content.config.ts glob base paths and generate-cli-index.js SKILLS_DIR to read from submodule
- Created scripts/validate-build.sh post-build validator confirming 49 skill pages and 5 plugin pages
- Removed redundant local content/, skills/, and plugins/ directories (cli/ preserved)
- Build verified: 64 pages in 2.70s, validation passed (Skills 49/49, Plugins 5/5)
- CLI index generation confirmed: 49 skills indexed from submodule path
- Dev branch merged and pushed to gitjfmd/oms-site with full submodule configuration
- User verified dev server renders all content pages correctly from submodule

## Task Commits

Each task was committed atomically (in private repo gitjfmd/oms-site):

1. **Task 1: Clone private repo, add submodule, update content paths, create validation script, remove redundant dirs** - `7710029` (feat)
2. **Task 2: Build, validate, merge to dev, push to private repo** - `7dc48aa` (feat, merge to dev)
3. **Task 3: Verify dev server renders content from submodule** - checkpoint:human-verify (APPROVED, no commit needed)

## Files Created/Modified

All files in private repo (gitjfmd/oms-site):

- `.gitmodules` - Submodule config: content-repo -> Open-Medica/open-medical-skills (branch: main)
- `content-repo/` - Submodule directory containing public repo content (49 skill YAMLs, 5 plugin YAMLs)
- `src/content.config.ts` - Updated glob base paths from `./content/skills` to `./content-repo/content/skills` (and plugins)
- `scripts/generate-cli-index.js` - Updated SKILLS_DIR from `content/skills` to `content-repo/content/skills`
- `scripts/validate-build.sh` - New post-build validator (expects 49 skills, 5 plugins, exits 1 on mismatch)
- `content/` - Removed (redundant, now in submodule)
- `skills/` - Removed (redundant, now in submodule)
- `plugins/` - Removed (redundant, now in submodule)

## Decisions Made

1. **Submodule tracks main branch** - The .gitmodules config sets `branch = main` so the submodule always points to the latest released content from the public repo
2. **Relative content-repo/ prefix** - All content paths use `./content-repo/content/...` relative to project root, compatible with both Astro glob loader and Node.js path.join
3. **Validation uses find counting** - The validate-build.sh script counts subdirectories under dist/skills/ and dist/plugins/ using find with mindepth/maxdepth, which is more reliable than globbing
4. **cli/ preserved locally** - Per plan decision D-13, the CLI directory stays in the private repo even though it also exists in the public repo

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all steps completed without errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Content sync mechanism is fully operational between the two repos
- Private repo dev branch builds cleanly with submodule content
- Ready for Phase 4 (Cross-Repo Authentication) which will set up PATs and secrets for dispatch and deploy
- Note: repository_dispatch receiver (update-content.yml) must be committed to main in private repo before the public repo dispatch workflow is configured (Phase 5/6 concern, flagged as blocker in STATE.md)

## Self-Check: PASSED

All claims verified:
- Commits 7710029 and 7dc48aa found in private repo
- All created/modified files exist with correct content
- Submodule contains 49 skills and 5 plugins
- Redundant directories removed, cli/ preserved
- Content paths correctly updated in content.config.ts and generate-cli-index.js

---
*Phase: 03-content-sync-via-submodule*
*Completed: 2026-03-25*

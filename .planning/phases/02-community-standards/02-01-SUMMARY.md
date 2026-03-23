---
phase: 02-community-standards
plan: 01
subsystem: infra
tags: [github, pr-templates, gitignore, community-standards, compliance]

# Dependency graph
requires:
  - phase: 01-public-repository-creation
    provides: "Public repo Open-Medica/open-medical-skills with content, license, disclaimer, issue templates"
provides:
  - "Fixed skill-submission PR template referencing content.config.ts instead of broken docs/schema.md"
  - "dev-to-main PR template with physician-review compliance checklist"
  - ".gitignore protecting .planning/, private infra, and agent config from public repo"
  - "All 5 COM requirements verified on public repo via GitHub API"
affects: [03-content-sync-submodule, 05-ci-public-repo, 06-branch-protection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PR template references: point to actual source files (content.config.ts) not documentation copies"
    - "CI-first validation: reference automated CI checks instead of local validation scripts"

key-files:
  created:
    - ".github/PULL_REQUEST_TEMPLATE/dev-to-main.md"
    - ".gitignore"
  modified:
    - ".github/PULL_REQUEST_TEMPLATE/skill-submission.md"

key-decisions:
  - "Replaced docs/schema.md reference with src/content.config.ts (single source of truth for schema)"
  - "Replaced local validate-submission.js step with CI validation note (contributors should not need local tooling)"
  - ".gitignore scoped for public repo only -- no private-repo-specific paths like workers/ or src/"

patterns-established:
  - "Schema references: always point to content.config.ts as canonical schema definition"
  - "Validation: CI-based validation preferred over local scripts for contributor experience"
  - "Public repo safety: .gitignore includes .planning/, .internal/, CLAUDE.local.md as safety nets"

requirements-completed: [COM-01, COM-02, COM-03, COM-04, COM-05]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 2 Plan 1: Community Standards Summary

**Fixed PR template broken references, added dev-to-main compliance template and .gitignore, verified all 5 COM requirements on Open-Medica/open-medical-skills**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T04:34:21Z
- **Completed:** 2026-03-23T04:36:07Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Fixed skill-submission.md PR template: replaced broken docs/schema.md with content.config.ts, replaced validate-submission.js with CI validation note
- Created .gitignore with public repo exclusions (.planning/, .internal/, CLAUDE.local.md, node_modules/, .env, dist/, agent configs)
- Pushed all 3 files to public repo Open-Medica/open-medical-skills (main and dev branches)
- Verified all 5 COM requirements via GitHub API (LICENSE MIT, DISCLAIMER.md, issue templates, PR templates, .gitignore)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix skill-submission PR template and create .gitignore** - `4fbb770` (feat) -- local private repo commit
2. **Task 2: Push to public repo and verify COM requirements** - `617f0f3` (feat) -- pushed to Open-Medica/open-medical-skills main + dev

## Files Created/Modified

All files below exist in both the private repo and the **public** repo `Open-Medica/open-medical-skills`:

- `.github/PULL_REQUEST_TEMPLATE/skill-submission.md` - Fixed broken schema reference (D-08) and validation script reference (D-09)
- `.github/PULL_REQUEST_TEMPLATE/dev-to-main.md` - New compliance checklist for dev-to-main releases (physician-review-approved label required)
- `.gitignore` - Public repo exclusions: dependencies, build output, env files, .planning/, private infrastructure, agent configs

## Decisions Made
- Replaced docs/schema.md with src/content.config.ts as the schema reference -- content.config.ts is the actual Zod schema source of truth, docs/schema.md does not exist
- Replaced local validate-submission.js with CI validation note -- contributors should not need to run local validation scripts; CI handles this automatically
- .gitignore scoped specifically for the public repo -- does not include private-repo-specific paths (workers/, src/) since those do not exist in the public repo

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Public repo now has complete community standards (LICENSE, DISCLAIMER.md, issue templates, PR templates, .gitignore)
- Both main and dev branches are in sync (both at commit 617f0f3)
- Ready for Phase 3+ (content sync, CI pipelines, branch protection)

## Self-Check: PASSED

All claims verified:
- SUMMARY.md exists: FOUND
- skill-submission.md exists: FOUND
- dev-to-main.md exists: FOUND
- .gitignore exists: FOUND
- Local commit 4fbb770: FOUND
- Remote commit 617f0f3: verified (main and dev branches updated)
- COM-01 (LICENSE MIT): PASSED
- COM-02 (DISCLAIMER.md): PASSED (from Phase 1)
- COM-03 (Issue templates): PASSED (from Phase 1)
- COM-04 (PR templates): PASSED (skill-submission.md + dev-to-main.md)
- COM-05 (.gitignore): PASSED

---
*Phase: 02-community-standards*
*Completed: 2026-03-23*

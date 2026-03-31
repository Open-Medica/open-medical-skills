# Roadmap: OpenMedica Platform Launch

## Overview

This roadmap takes Open Medical Skills from a monorepo to a two-repo architecture (public content + private site), rebrands to "OpenMedica", sets up two-tier CI/CD (heavy dev PR testing, minimal main PR with auto-deploy), branch protection, and community documentation. Phases 1-3 established the repo split and submodule sync. Phases 4-8 rebrand, configure CI/CD, and finalize for launch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Public Repository Creation** - Create the Open-Medica/open-medical-skills repo with content, CLI, and scripts
- [ ] **Phase 2: Community Standards** - License, disclaimer, issue/PR templates, .gitignore for the public repo
- [ ] **Phase 3: Content Sync via Submodule** - Wire private repo to consume public content through git submodule with verified builds
- [ ] **Phase 4: Fix Distribution URLs** - Fix all repo URLs across 5 distribution channels, create constants.ts, regenerate CLI index
- [ ] **Phase 5: Automate Index Sync** - CI auto-regenerates skills-index.json and SQL seed on content changes
- [ ] **Phase 6: Deploy REST API** - Seed D1 database, deploy API worker, configure custom domain
- [ ] **Phase 7: Make MCP Server Work** - Replace 7 stub tools with real D1 queries, deploy MCP worker
- [ ] **Phase 8: Rebrand to OpenMedica** - Display text, base path, logo, package names across 200+ files
- [ ] **Phase 9: Private Repo Setup** - Rename gitjfmd/oms-site to openmedica-site, verify submodule
- [ ] **Phase 10: CI/CD Pipeline** - Two-tier CI (heavy dev, light main), auto-deploy, preview deploys
- [ ] **Phase 11: Branch Protection** - Hard enforcement on main and dev for both repos
- [ ] **Phase 12: Documentation** - README, CONTRIBUTING, SECURITY, CODEOWNERS, CLAUDE.md updates

## Phase Details

### Phase 1: Public Repository Creation
**Goal**: The public repo exists at Open-Medica/open-medical-skills with all content, skill/plugin source, CLI, and supporting files
**Depends on**: Nothing (first phase)
**Requirements**: REPO-01, REPO-02, REPO-04
**Success Criteria** (what must be TRUE):
  1. `Open-Medica/open-medical-skills` exists on GitHub with MIT license and is publicly visible
  2. All 49 skill YAMLs, 5 plugin YAMLs, skill source dirs, plugin source dirs, CLI, logo, and scripts are present in the repo
  3. The repo has a `dev` branch created from `main`
**Plans:** 1 plan
Plans:
- [x] 01-01-PLAN.md — Complete public repo with content, CLI, logo, scripts, docs, LICENSE fix, and dev branch

### Phase 2: Community Standards
**Goal**: The public repo meets GitHub community standards and is ready for external contributors
**Depends on**: Phase 1
**Requirements**: COM-01, COM-02, COM-03, COM-04, COM-05
**Success Criteria** (what must be TRUE):
  1. Public repo root has LICENSE (MIT), DISCLAIMER.md (medical content disclaimer), and a properly configured .gitignore
  2. Issue templates for submit-skill and submit-plugin are functional (can create new issue from template)
  3. PR templates for skill-submission and dev-to-main are present and render correctly
**Plans:** 1 plan
Plans:
- [x] 02-01-PLAN.md — Fix PR template references, add dev-to-main template, create .gitignore, push to public repo

### Phase 3: Content Sync via Submodule
**Goal**: The private repo consumes public content through a git submodule and builds successfully with zero missing pages
**Depends on**: Phase 1
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-07, REPO-03, REPO-05
**Success Criteria** (what must be TRUE):
  1. Private repo has public repo as submodule at `content-repo/` and `content.config.ts` glob paths point to `./content-repo/content/skills` and `./content-repo/content/plugins`
  2. `pnpm build` completes successfully and post-build validation confirms all 49 skill pages and 5 plugin pages exist in output
  3. `pnpm dev` serves all skill and plugin pages correctly from submodule content
  4. Private repo `dev` branch has the submodule configured and builds cleanly
**Plans:** 1 plan
Plans:
- [x] 03-01-PLAN.md — Add content submodule, update paths, create validation script, build and verify, merge to dev

### Phase 4: Fix Distribution URLs
**Goal**: Every distribution channel (website, CLI, npx, API, MCP) points to `Open-Medica/open-medical-skills`
**Depends on**: Phase 3
**Requirements**: SUB-01, SUB-02
**Success Criteria** (what must be TRUE):
  1. `grep -r 'gitjfmd/oms-site' content/ skills/ plugins/ cli/` returns zero matches
  2. `grep -r 'gitjfmd/open-medical-skills' content/ skills/ plugins/ cli/ src/` returns zero matches
  3. `oms inspect acls-protocol-assistant` shows `Open-Medica/open-medical-skills` in repository URL
  4. `npx skills add Open-Medica/open-medical-skills --skill acls-protocol-assistant -a claude-code` resolves the skill
**Plans**: TBD

### Phase 5: Automate Index Sync
**Goal**: CLI index and D1 seed auto-regenerate on content changes via CI
**Depends on**: Phase 4
**Success Criteria** (what must be TRUE):
  1. GitHub Action `sync-index.yml` runs on push to main/dev when content changes
  2. CI fails if committed `skills-index.json` is stale vs. generated version
**Plans**: TBD

### Phase 6: Deploy REST API
**Goal**: REST API serves real skill data from D1 database
**Depends on**: Phase 5
**Success Criteria** (what must be TRUE):
  1. `curl api.openmedica.us/api/skills/acls-protocol-assistant` returns real skill data
  2. D1 database has all 49 skills populated
**Plans**: TBD

### Phase 7: Make MCP Server Work
**Goal**: All 7 MCP tools return real data from D1 instead of stubs
**Depends on**: Phase 6
**Success Criteria** (what must be TRUE):
  1. MCP `inspect_skill` tool returns real data for any skill name
  2. MCP `list_skills` returns all 49 skills
**Plans**: TBD

### Phase 8: Rebrand to OpenMedica
**Goal**: Every user-visible reference says "OpenMedica", base path is `/skills`, logos updated
**Depends on**: Phase 4
**Success Criteria** (what must be TRUE):
  1. `grep -r 'Open Medical Skills' src/` returns zero matches in user-facing text
  2. `astro.config.mjs` has `base: '/skills'`
  3. `pnpm build` passes and all pages render at `/skills/` prefix
**Plans**: TBD

### Phase 9: Private Repo Setup
**Goal**: Private website repo is at gitjfmd/openmedica-site and builds cleanly
**Depends on**: Phase 8
**Success Criteria** (what must be TRUE):
  1. `gh repo view gitjfmd/openmedica-site --json visibility` returns `PRIVATE`
  2. `pnpm build` passes in private repo with submodule content
**Plans**: TBD

### Phase 10: CI/CD Pipeline
**Goal**: Two-tier CI with heavy dev testing and minimal main with auto-deploy
**Depends on**: Phase 9
**Success Criteria** (what must be TRUE):
  1. Dev PR CI runs 5 jobs: vuln-scan, code-integrity, content-validation, functional-tests, prompt-injection
  2. Main PR CI runs 3 jobs: branch-guard, build-check, compliance-gate
  3. Merge to main triggers auto-deploy to CF Pages
**Plans**: TBD

### Phase 11: Branch Protection
**Goal**: Hard enforcement on main and dev for both repos
**Depends on**: Phase 10
**Success Criteria** (what must be TRUE):
  1. Direct push to main rejected in both repos
  2. Force push blocked on main and dev in both repos
**Plans**: TBD

### Phase 12: Documentation
**Goal**: Both repos have complete, accurate docs for contributors and AI agents
**Depends on**: All phases
**Success Criteria** (what must be TRUE):
  1. Public repo has README.md, CONTRIBUTING.md, SECURITY.md, CODEOWNERS
  2. Private repo has CLAUDE.md, README.md reflecting OpenMedica brand
**Plans**: TBD

## Progress

**Execution Order:**
Phases 1-4 sequential, then 5+8 parallel, 6→7 sequential, 9→10→11→12 sequential.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Public Repository Creation | 1/1 | ✓ Complete | 2026-03-22 |
| 2. Community Standards | 1/1 | ✓ Complete | 2026-03-22 |
| 3. Content Sync via Submodule | 1/1 | ✓ Complete | 2026-03-25 |
| 4. Fix Distribution URLs | ad-hoc | ✓ Complete (ad-hoc) | 2026-03-25 |
| 5. Automate Index Sync | 1/1 | ◆ Executed (pending commit) | - |
| 6. Deploy REST API | 0/? | ○ Not started | - |
| 7. Make MCP Server Work | 0/? | ○ Not started | - |
| 8. Rebrand to OpenMedica | 0/4 | ◆ Planned (4 plans, ready to execute) | - |
| 9. Private Repo Setup | 0/? | ○ Not started | - |
| 10. CI/CD Pipeline | 0/? | ○ Not started | - |
| 11. Branch Protection | 0/? | ○ Not started | - |
| 12. Documentation | 0/? | ○ Not started | - |

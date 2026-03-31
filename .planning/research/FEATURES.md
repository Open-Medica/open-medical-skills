# Feature Research

**Domain:** Multi-repo open-source medical AI skills marketplace with public content repo, private website repo, CI/CD infrastructure, and contributor submission pipeline
**Researched:** 2026-03-22
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that contributors, maintainers, and downstream consumers expect from a well-structured open-source content repository with separate code/content repos. Missing any of these makes the project feel amateur or untrustworthy.

#### 1. Public Content Repo Community Standards

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Comprehensive README.md | First thing contributors see; mission, install, contribute, categories, badges | LOW | Must explain content-only nature of this repo; link to website for rendered view |
| CONTRIBUTING.md | Contributors need clear "how to add a skill" guide; Homebrew, VS Code marketplace all have this | LOW | Already exists at `docs/CONTRIBUTING.md` -- needs update for new repo structure and branch model |
| CODE_OF_CONDUCT.md | Community standard; GitHub community profile scores it; signals inclusive project | LOW | Use Contributor Covenant v2.1 (industry standard) |
| LICENSE file | Legal requirement for open-source; contributors need to know terms before contributing | LOW | Already MIT; must be in root of public repo |
| SECURITY.md | GitHub community profile requirement; tells people how to report vulnerabilities responsibly | LOW | Critical for medical domain -- must specify no PHI reporting via GitHub issues |
| CODEOWNERS file | Auto-assigns reviewers; prevents unreviewed merges to content paths; Homebrew uses this extensively | LOW | `content/skills/**` owned by physician-review team, `cli/**` by engineering team |
| Issue templates (skill + plugin submission) | Contributors expect structured forms; reduces back-and-forth; already exists | LOW | Already have `submit-skill.yml` and `submit-plugin.yml` -- need update for new org/repo references |
| PR templates (submission + dev-to-main) | Standardize review checklists; already exist; must reflect new branch model | LOW | Already have both -- update paths and branch references |
| `good-first-issue` and `help-wanted` labels | New contributors look for these labels; GitHub surfaces them in contributor discovery | LOW | Create label set during repo setup; tag easy YAML fixes as good-first-issue |
| Category guide / schema documentation | Contributors need to know valid categories, evidence levels, safety classifications | LOW | Already exists at `docs/CATEGORY-GUIDE.md` and `docs/SKILL-FORMAT.md` |
| CHANGELOG.md | Users expect to know what changed between releases; critical for CLI consumers | MEDIUM | Auto-generate from PR titles on merge to main; or manual curated format |

#### 2. Automated Content Validation (CI)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| YAML syntax validation on PR | Contributors expect fast feedback; broken YAML must not merge | LOW | Already exists in `validate-submission.yml` -- validate with Python `yaml.safe_load()` |
| Schema validation against Zod-equivalent | Content must match defined schema (required fields, valid enums, URL formats) | MEDIUM | Already exists but uses 3 divergent sources (Zod, Worker, GH Action). Must consolidate to single canonical JSON Schema file |
| Duplicate detection | Same skill name or repo URL should not be submitted twice | LOW | Already partially exists in validation workflow; needs cross-file check on `name` and `repository` fields |
| Auto-labeling on PR | PRs touching `content/skills/` get `skill` label; `content/plugins/` get `plugin` label; categories get category labels | LOW | Use `actions/labeler@v5` with path-based rules; category label from YAML content parsing |
| Physician review flagging | Restricted safety or high-risk categories auto-flagged for physician review | LOW | Already exists in compliance gate; must run on PRs to `dev` not just `main` |
| Link/URL validation | Repository URLs must be reachable and public | LOW | HTTP HEAD check on `repository` field; fail if 404 or private |
| YAML lint (formatting) | Consistent formatting across all content files | LOW | Use `yamllint` with relaxed config (allow long lines for descriptions) |

#### 3. Cross-Repo Sync (Submodule + repository_dispatch)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Git submodule in private repo consuming public content | Private site must render latest approved content; submodule is deterministic and build-tool agnostic | MEDIUM | Submodule at `content-repo/` pointing to public repo `main`; Astro glob paths update from `./content/` to `./content-repo/content/` |
| Auto-update submodule on public repo push to main | When content merges to main in public repo, private repo should auto-rebuild | MEDIUM | Public repo: `peter-evans/repository-dispatch@v3` on push to main. Private repo: `on: repository_dispatch` workflow updates submodule ref, commits, pushes, triggers build |
| Local dev works with submodule | Developer clones private repo, runs `git submodule update --init`, `pnpm dev` works | LOW | Document in private repo README; add `postinstall` script that runs submodule init if missing |
| Submodule ref pinned to specific commit | Builds are reproducible; no surprise content changes during deploy | LOW | This is default git submodule behavior -- just document it |

#### 4. Branch Protection and Compliance Gates

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Branch guard (dev -> main only) | Prevents accidental direct pushes; enforces review flow | LOW | Already exists as `branch-guard.yml`; replicate in both repos |
| Required status checks on PR to dev | YAML validation must pass before merge; prevents broken content | LOW | Configure GitHub branch protection to require `validate-pr-submission` job |
| Required status checks on PR to main | Compliance gate + branch guard must pass | LOW | Configure GitHub branch protection to require `compliance-checks` and `check-source-branch` jobs |
| Medical disclaimer check on merge to main | Every SKILL.md must contain research-tool disclaimers | LOW | Already exists in `compliance-gate.yml` -- check for "not a substitute for professional medical judgment" |
| CDS/FDA claim scanner on merge to main | Content must not claim FDA approval, clinical decision support, or medical certification | LOW | Already exists in `compliance-gate.yml` -- regex scan for prohibited terms |
| Safety classification validation | Restricted safety skills require physician-review-approved label | MEDIUM | Already partially exists; needs label check integration with GitHub API |
| Block force pushes to main and dev | Protects history integrity; required for audit trail | LOW | GitHub branch protection rule -- no code needed |
| Require 1 approval for PR to main | Physician or maintainer must explicitly approve before release | LOW | GitHub branch protection rule |

#### 5. Submission Pipeline

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Issue-to-PR conversion (non-technical users) | Physician without GitHub skills fills out issue form -> GH Action creates PR with YAML file on `dev` branch | MEDIUM | Already exists in `validate-submission.yml` (lines 139-600+); needs `GITHUB_OWNER` update to `Open-Medica` |
| Web form submission (CF Worker -> GitHub PR) | Non-GitHub users submit via website form -> Worker creates PR to public repo `dev` | MEDIUM | Already exists in `workers/submission-api/`; update `GITHUB_OWNER`, target repo, and target branch |
| Direct PR submission (technical users) | Fork public repo, add YAML + SKILL.md, open PR to `dev` | LOW | Standard GitHub workflow; document in CONTRIBUTING.md |
| Submission status tracking (labels) | Submitter can see `pending-review`, `physician-review`, `approved`, `changes-requested` label progression | LOW | Define label set; auto-apply `pending-review` on submission; maintainers advance manually |
| Automated PR comment with validation results | After CI runs, bot comments on PR with pass/fail details and next steps | MEDIUM | Already partially exists; improve with structured markdown report showing each check |

### Differentiators (Competitive Advantage)

Features that set OMS apart from generic content registries. These align with the medical domain and physician-curation mission.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Medical compliance gate (CDS/FDA scan) | No other open-source skill registry has automated regulatory boundary enforcement; prevents accidental FDA SaMD classification | LOW | Already built; unique to medical domain. Scans for "clinical decision support", "FDA cleared/approved/certified" |
| Three-tier physician review workflow | Community -> Verified -> Certified progression with physician attestation at each level; builds trust like Homebrew's maintainer review but for medical content | MEDIUM | Requires label-based workflow: `community` (auto), `verified` (maintainer review), `certified` (physician review). Not yet implemented as formal tiers |
| Evidence-level and safety classification system | 4 evidence levels + 3 safety classes with color-coded badges; no other AI skill registry has clinical evidence grading | LOW | Already in schema and rendering. Unique differentiator -- makes medical authority visible |
| Canonical JSON Schema as single source of truth | One `schemas/skill.schema.json` file validates in CI, CF Worker, CLI, and Astro Content Layer; eliminates category sync bugs | MEDIUM | Currently 3 divergent sources. Consolidating to JSON Schema eliminates the #1 tech debt item in CONCERNS.md |
| Cross-repo auto-sync with compliance gates | Content changes in public repo trigger private website rebuild only after compliance passes; most projects do manual deploys | MEDIUM | `repository_dispatch` + submodule update + auto-deploy pipeline. Professional infrastructure pattern |
| CLI with offline fallback | `@openmedicalskills/cli` works when API is down via local index; most marketplaces require online access | LOW | Already built. Differentiator for physicians in hospital environments with restricted internet |
| Structured medical attestation in PR template | Submitters must attest: no PHI exposure, research-tool only, includes disclaimers, open-source repository. Legal protection built into contribution flow | LOW | Already in PR template. Unique to medical domain |
| DISCLAIMER.md with regulatory positioning | Explicit "research and learning tool" positioning with FDA SaMD boundary language; protects both project and contributors | LOW | Already exists. Must be in root of public repo |

### Anti-Features (Deliberately NOT Building)

Features that seem useful but create problems for this scope. Explicitly excluded.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| npm package for content distribution | "Let consumers `npm install` content" | Adds npm publishing CI, versioning complexity, registry maintenance; git submodule is simpler and sufficient for single consumer (private website) | Git submodule with `repository_dispatch` auto-update. If multiple consumers emerge later, revisit |
| Monorepo tooling (Turborepo/Nx) | "Coordinate builds across repos" | Only 2 repos; monorepo tools add massive config overhead for minimal benefit; `repository_dispatch` is lighter | Simple cross-repo dispatch with GitHub Actions. No build orchestrator needed |
| Real-time content preview in public repo | "See rendered skill page before merge" | Requires deploying preview environments from public repo; exposes infrastructure; preview is private repo's job | Contributors see YAML validation pass/fail in CI. Maintainers preview locally by updating submodule to PR branch |
| AI-powered auto-review of medical content | "Use LLM to validate medical accuracy" | LLMs hallucinate medical facts; false confidence in automated medical review; physician review is the whole point | Keep physician review manual and human. LLM can assist with formatting/schema checks only |
| Automated merge on CI pass | "If all checks pass, auto-merge" | Medical content must have human review; auto-merge bypasses physician oversight; regulatory risk | Require manual approval. Auto-merge only for non-content changes (CI config, typo fixes) with explicit label |
| Content versioning with SemVer | "Version each skill individually" | 49+ skills with individual version tracking creates massive maintenance burden; git history already tracks changes | Use git commit history as version trail. Add `last_updated` field to YAML if needed |
| Third worker repo | "Separate API infrastructure" | Workers have secrets, deployment config tightly coupled to private website repo; third repo adds coordination overhead | Workers stay in private repo. They deploy alongside the website |
| Public repo deploy pipeline | "Auto-deploy from public repo too" | Public repo is content-only; it should never deploy anything; deployment is private repo's responsibility | Public repo only runs validation CI. Private repo handles all deployment |
| CLA (Contributor License Agreement) bot | "Require CLA before accepting contributions" | Adds friction for physician contributors who are not lawyers; MIT license is sufficient; OMS is fully open-source | MIT license + DCO (Developer Certificate of Origin) sign-off is lighter. Add DCO check if IP concerns arise later |
| GraphQL API for content queries | "Rich querying over skills" | Over-engineered for current scale (49 skills); Pagefind + simple search API covers use cases | Keep Pagefind for client-side, existing search API for programmatic access. Revisit at 1000+ skills |

## Feature Dependencies

```
[Git Submodule Setup]
    |
    +--requires--> [Public Repo Created on Open-Medica org]
    |                  |
    |                  +--requires--> [Content + CLI migrated to public repo]
    |                  |
    |                  +--requires--> [Issue/PR templates updated with new org refs]
    |
    +--enables--> [Cross-Repo Auto-Sync (repository_dispatch)]
                      |
                      +--enables--> [Auto-Deploy on Content Change]

[Canonical JSON Schema]
    |
    +--enables--> [Single-source YAML validation in CI]
    |
    +--enables--> [CF Worker validation uses same schema]
    |
    +--enables--> [CLI validation uses same schema]
    |
    +--eliminates--> [Category sync divergence tech debt]

[Branch Protection Rules]
    |
    +--requires--> [Branch Guard Workflow]
    |
    +--requires--> [Validation Workflow (status checks)]
    |
    +--requires--> [Compliance Gate Workflow]
    |
    +--enables--> [Trusted merge path: dev -> main only]

[Community Standard Files]
    |
    +--independent--> [README, LICENSE, CODE_OF_CONDUCT, SECURITY, CODEOWNERS]
    |
    +--enhances--> [Contributor onboarding experience]
    |
    +--enhances--> [GitHub community profile score]

[Submission Pipeline Updates]
    |
    +--requires--> [Public repo exists with correct org/repo name]
    |
    +--requires--> [CF Worker GITHUB_OWNER updated]
    |
    +--requires--> [Issue-to-PR workflow targets correct repo/branch]

[Medical Compliance Gate]
    |
    +--independent--> [CDS/FDA scanner, disclaimer checker, safety validator]
    |
    +--enhances--> [Branch protection (required status check)]
    |
    +--blocks--> [Merge to main without compliance pass]
```

### Dependency Notes

- **Git Submodule requires Public Repo**: Cannot set up submodule until the public repo exists at `Open-Medica/open-medical-skills` with content migrated
- **Cross-Repo Sync requires Submodule**: `repository_dispatch` workflow only makes sense after submodule relationship is established
- **Canonical JSON Schema enables all validation**: Single schema file must exist before consolidating CI, Worker, and CLI validation
- **Branch Protection requires CI Workflows**: Cannot mark status checks as required until the workflow jobs exist and run successfully at least once
- **Submission Pipeline requires Public Repo Identity**: CF Worker and issue-to-PR workflows need correct `GITHUB_OWNER` and `GITHUB_REPO` values
- **Community Standard Files are independent**: Can be created at any time; no technical dependencies; do first for immediate contributor benefit
- **Medical Compliance Gate is independent but enhances Branch Protection**: Works standalone but most valuable when configured as required status check

## MVP Definition

### Launch With (v1) -- Repo Split Milestone

Minimum viable for the repo split to be functional and contributor-ready.

- [ ] **Public repo created** at `Open-Medica/open-medical-skills` with content, skills, plugins, CLI, docs migrated -- foundation for everything else
- [ ] **Community standard files** -- README.md, CONTRIBUTING.md (updated), CODE_OF_CONDUCT.md, LICENSE, SECURITY.md, CODEOWNERS -- contributor trust from day one
- [ ] **YAML validation CI** on PR to `dev` -- contributors get immediate feedback; prevents broken content from merging
- [ ] **Branch guard** on PR to `main` (dev -> main only) -- enforces review flow in both repos
- [ ] **Compliance gate** on PR to `main` -- medical disclaimers, CDS scan, safety classification validation -- regulatory boundary protection
- [ ] **Branch protection rules** configured in GitHub -- required status checks, 1 approval for main, block force pushes
- [ ] **Git submodule** in private repo at `content-repo/` pointing to public repo `main` -- private site renders public content
- [ ] **Astro content paths updated** -- `src/content.config.ts` glob base changed from `./content/` to `./content-repo/content/`
- [ ] **Submission API Worker** updated with `GITHUB_OWNER: "Open-Medica"` -- web form submissions target correct repo
- [ ] **Issue-to-PR workflow** updated with correct org/repo -- non-technical submissions work in new repo
- [ ] **Auto-labeling** on PRs (skill/plugin/category labels) -- reduces maintainer triage burden

### Add After Validation (v1.x) -- Automation Layer

Features to add once core split is working and first external contributions are received.

- [ ] **Cross-repo auto-sync** (`repository_dispatch` + submodule update) -- when content merges to main in public repo, private repo auto-rebuilds and redeploys
- [ ] **Canonical JSON Schema** file replacing 3 divergent validation sources -- eliminates tech debt and enables consistent validation everywhere
- [ ] **Automated PR comment** with structured validation report -- better contributor experience than raw CI logs
- [ ] **CHANGELOG.md generation** from PR titles -- automated release notes on merge to main
- [ ] **Good-first-issue labeling** and contributor onboarding improvements -- attract external contributors
- [ ] **Three-tier certification labels** (Community -> Verified -> Certified) -- formalize physician review progression

### Future Consideration (v2+) -- Scale and Polish

Features to defer until the split is stable and contribution volume justifies investment.

- [ ] **Submission queue with deduplication** -- prevents GitHub API rate limit exhaustion at scale (relevant at 1000+ submissions/hour)
- [ ] **Skill usage analytics** (install counts, popularity ranking) -- requires CLI telemetry and API tracking
- [ ] **GitHub App with elevated rate limits** -- replaces PAT for submission pipeline at scale (15k req/hour vs 5k)
- [ ] **Search API caching** (CF Cache API or KV) -- needed when semantic search volume grows
- [ ] **CLI schema validation against JSON Schema** -- CLI validates downloaded skills against canonical schema
- [ ] **Automated medical content review checklist** in PR body -- structured physician review beyond labels

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Public repo creation + content migration | HIGH | MEDIUM | P1 |
| Community standard files (README, CONTRIBUTING, etc.) | HIGH | LOW | P1 |
| YAML validation CI on PR to dev | HIGH | LOW | P1 |
| Branch guard + compliance gate workflows | HIGH | LOW | P1 |
| Branch protection rules in GitHub | HIGH | LOW | P1 |
| Git submodule setup in private repo | HIGH | MEDIUM | P1 |
| Astro content path update | HIGH | LOW | P1 |
| Submission API + issue-to-PR repo updates | HIGH | LOW | P1 |
| Auto-labeling on PRs | MEDIUM | LOW | P1 |
| Cross-repo auto-sync (repository_dispatch) | HIGH | MEDIUM | P2 |
| Canonical JSON Schema (single source of truth) | HIGH | MEDIUM | P2 |
| Automated PR comment with validation report | MEDIUM | MEDIUM | P2 |
| CHANGELOG.md auto-generation | MEDIUM | LOW | P2 |
| Three-tier certification labels | MEDIUM | LOW | P2 |
| Good-first-issue labeling + onboarding | MEDIUM | LOW | P2 |
| Submission queue + deduplication | LOW | HIGH | P3 |
| Skill usage analytics | LOW | HIGH | P3 |
| GitHub App for elevated rate limits | LOW | MEDIUM | P3 |
| Search API caching layer | LOW | MEDIUM | P3 |
| CLI JSON Schema validation | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for repo split launch -- blocks contributor workflow or compliance
- P2: Should have within 2-4 weeks post-split -- improves DX and maintainer efficiency
- P3: Nice to have -- defer until scale demands it (500+ skills or 100+ contributors)

## Competitor/Analogous Feature Analysis

| Feature | Homebrew (homebrew-core) | VS Code MCP Registry | ToolUniverse (Harvard) | OMS Approach |
|---------|--------------------------|----------------------|------------------------|--------------|
| Content/code separation | Yes -- formulae repo separate from brew CLI repo | Yes -- registry separate from VS Code | Single repo with tool definitions | Yes -- public content repo + private website repo |
| Submission flow | Fork + PR with formula file | GitHub + npmjs registry | Python API registration | 3 paths: direct PR, issue form, web form |
| Automated validation | BrewTestBot builds + tests formula on CI | Publisher verification | Schema validation | YAML schema + medical compliance + CDS scan |
| Human review | 1 maintainer approval required | Publisher trust model | Peer review (academic) | Physician review required for main merge |
| Categories | Formula types (library, service, app) | Extension categories | Tool types (ML, API, dataset) | 14 medical categories with evidence + safety levels |
| Compliance gates | License check, binary provenance | Marketplace policies | Academic citation | Medical disclaimer, CDS/FDA scan, safety classification |
| Search | `brew search` (local + API) | Marketplace search in VS Code | Keyword + embedding + LLM search | Pagefind (client) + Qdrant API + CLI offline fallback |
| Cross-repo sync | Tap system (git clone on demand) | npm publish triggers | N/A (single repo) | Git submodule + repository_dispatch auto-update |
| CLI tool | `brew` (core product) | `code` CLI extensions | Python SDK | `oms` CLI (search, install, list) |
| Community files | Full set (CONTRIBUTING, CODE_OF_CONDUCT, etc.) | Minimal (MS-owned) | Academic standard (LICENSE, README) | Full set needed -- currently missing CODE_OF_CONDUCT, SECURITY |

## Sources

- [OpenSSF Source Code Management Best Practices](https://best.openssf.org/SCM-BestPractices/)
- [GitHub Docs: Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [Cross-Repository Workflows in GitHub Actions](https://oneuptime.com/blog/post/2025-12-20-cross-repository-workflows-github-actions/view)
- [Git Version Control for FDA and IEC 62304 Compliance](https://intuitionlabs.ai/articles/git-workflows-fda-compliance)
- [Homebrew/homebrew-core Maintainer Guide](https://docs.brew.sh/Homebrew-homebrew-core-Maintainer-Guide)
- [Automatically Updating Git Submodules with GitHub Actions](https://tommoa.me/blog/github-auto-update-submodules/)
- [peter-evans/repository-dispatch](https://github.com/marketplace/actions/cross-repo-dispatch)
- [GitHub Docs: CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Git Submodules Complete Guide 2026](https://devtoolbox.dedyn.io/blog/git-submodules-complete-guide)
- [Security and the Homebrew Contribution Model](https://workbrew.com/blog/security-and-the-homebrew-contribution-model)
- [YAML Schema Validator GitHub Action](https://github.com/marketplace/actions/validate-yaml-schema)
- [ToolUniverse (Harvard MIMS Lab)](https://github.com/mims-harvard/ToolUniverse)
- [Open Source Guides: Best Practices for Maintainers](https://opensource.guide/best-practices/)
- [GitHub Actions Deployment Gates](https://oneuptime.com/blog/post/2025-12-20-deployment-gates-github-actions/view)

---
*Feature research for: OMS Repository Split and CI/CD Infrastructure*
*Researched: 2026-03-22*

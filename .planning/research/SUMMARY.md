# Research Summary: OMS Repository Split & CI/CD Infrastructure

**Domain:** Monorepo-to-multi-repo split with CI/CD infrastructure
**Researched:** 2026-03-22
**Overall confidence:** HIGH

## Executive Summary

The OMS repository split from a single monorepo into public content + private site repos is a well-understood infrastructure pattern with mature tooling. All five research domains (repo split, submodule management, branch protection, cross-repo triggers, CF Pages deployment) are solvable using standard GitHub Actions ecosystem tools without introducing new frameworks or services.

The most critical finding is that Cloudflare Pages' native git integration does NOT support private submodules, but OMS already uses GitHub Actions + `wrangler pages deploy` (direct upload), which completely bypasses this limitation. The existing deploy pipeline architecture is correct and only needs a `submodules: recursive` parameter added to the checkout step.

The second key finding is that GitHub Rulesets have matured into the recommended replacement for classic branch protection rules. They offer API-first management (Infrastructure as Code), enforcement states, and stacking behavior. The existing `branch-guard.yml` workflow complements (not replaces) rulesets -- keep both.

For cross-repo synchronization, the `peter-evans/repository-dispatch@v4` action is the de facto standard. When content merges to `main` in the public repo, it fires a `repository_dispatch` event to the private repo, which updates its submodule, rebuilds, and deploys. Authentication should start with a fine-grained PAT and migrate to a GitHub App for production.

## Key Findings

**Stack:** Use `actions/checkout@v4` + `peter-evans/repository-dispatch@v4` + `cloudflare/wrangler-action@v3` + GitHub Rulesets API. No new npm dependencies needed.
**Architecture:** Public repo dispatches to private repo on content merge. Private repo has public repo as git submodule. Astro glob paths update from `./content/` to `./content-repo/content/`.
**Critical pitfall:** `repository_dispatch` ONLY triggers workflows on the default branch. The receiving workflow must be committed to `main` in the private repo before the first dispatch.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 1: Repository Setup & Content Migration** - Create public repo, populate with content, set up submodule in private repo
   - Addresses: REPO-01, REPO-02, REPO-03, SYNC-01
   - Avoids: Content path mismatch pitfall by updating `content.config.ts` immediately
   - Low risk, well-understood operations

2. **Phase 2: CI/CD Pipeline Configuration** - Set up workflows in both repos, configure cross-repo dispatch
   - Addresses: CI-01 through CI-05, SYNC-02
   - Avoids: repository_dispatch default-branch pitfall by committing receiver workflow to main first
   - Medium risk, needs careful secret management

3. **Phase 3: Branch Protection & Rulesets** - Configure rulesets via API, verify enforcement
   - Addresses: BP-01, BP-02, BP-03
   - Avoids: Double-enforcement pitfall by using rulesets (not classic protection) from the start
   - Low risk, can be done independently

4. **Phase 4: Submission Pipeline Update** - Update CF Worker GITHUB_OWNER, test end-to-end submission flow
   - Addresses: SUB-01 through SUB-04
   - Avoids: Broken submission pipeline by testing against dev branch first
   - Medium risk, touches live submission flow

5. **Phase 5: Documentation & Cleanup** - Write CLAUDE.md files, README updates, retire sync script
   - Addresses: DOC-01 through DOC-05
   - Low risk, documentation only

**Phase ordering rationale:**
- Phase 1 must come first because all other phases depend on both repos existing with the submodule link
- Phase 2 before Phase 3 because branch protection requires CI status check names that must exist first
- Phase 4 after Phase 2 because the submission pipeline needs the public repo and its CI workflows operational
- Phase 5 last because documentation should reflect the final state

**Research flags for phases:**
- Phase 2: Likely needs deeper research on GitHub App setup if chosen over fine-grained PAT
- Phase 4: May need testing research for the submission API Worker changes (GITHUB_OWNER swap)
- Phases 1, 3, 5: Standard patterns, unlikely to need additional research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All tools verified against official docs and current releases. Version numbers confirmed. |
| Features | HIGH | Requirements are clearly defined in PROJECT.md. No ambiguity in what needs to be built. |
| Architecture | HIGH | Submodule + dispatch + direct upload is a standard pattern. CF Pages limitation confirmed. |
| Pitfalls | HIGH | Known issues documented by GitHub community, CF community, and action maintainers. |

## Gaps to Address

- GitHub App setup details: If production auth is chosen, the App creation, installation, and key management process needs documentation during Phase 2
- Submission API Worker testing: The GITHUB_OWNER change from `gitjfmd` to `Open-Medica` needs integration testing with the OAuth flow
- CF Pages project reconfiguration: Whether the existing CF Pages project needs to be disconnected from git integration and reconnected as direct upload
- Issue template migration: How GitHub issue templates in the public repo will interact with the issue-to-PR workflow when the YAML files need to go to the public repo but the deployment happens from the private repo

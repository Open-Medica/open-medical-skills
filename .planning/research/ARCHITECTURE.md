# Architecture Research: OMS Monorepo Split

**Domain:** Cross-repo content sync for static site generation (Astro 5 + Cloudflare Pages)
**Researched:** 2026-03-22
**Confidence:** HIGH

## System Overview

```
                         CONTENT SUBMISSION FLOW
                         =======================

     Web Form              Issue Template          Direct PR
        |                      |                      |
        v                      v                      v
  CF Worker API       GitHub Action parses    Fork + YAML file
  (POST /api/submit)  (validate-submission)   (contributor)
        |                      |                      |
        +----------+-----------+----------------------+
                   |
                   v
    +---------------------------------+
    |  PUBLIC REPO (Open-Medica/      |
    |  open-medical-skills)           |
    |                                 |
    |  content/skills/*.yaml  (49+)   |
    |  content/plugins/*.yaml (5+)    |
    |  skills/*/SKILL.md              |
    |  plugins/*/                     |
    |  cli/                           |
    |  docs/                          |
    |  .github/workflows/             |
    |    validate-submission.yml      |
    |    compliance-gate.yml          |
    |    branch-guard.yml             |
    |    notify-site-repo.yml  [NEW]  |
    +---------+----------+------------+
              |          |
   merge to   |          | repository_dispatch
   main       |          | (on push to main)
              |          |
              v          v
    +---------------------------------+
    |  PRIVATE REPO (gitjfmd/         |
    |  oms-site)                      |
    |                                 |
    |  content-repo/  [git submodule] |
    |    -> Open-Medica/              |
    |       open-medical-skills@SHA   |
    |                                 |
    |  src/                           |
    |    content.config.ts            |
    |    components/                  |
    |    pages/                       |
    |    layouts/                     |
    |    features/                    |
    |    lib/                         |
    |    styles/                      |
    |  workers/                       |
    |    submission-api/              |
    |    search-api/                  |
    |  astro.config.mjs               |
    |  package.json                   |
    |  .github/workflows/            |
    |    deploy.yml                   |
    |    update-content.yml    [NEW]  |
    +---------+-----------------------+
              |
              | wrangler pages deploy
              | (on merge to main)
              v
    +---------------------------------+
    |  CLOUDFLARE PAGES               |
    |  (openmedica.us)                |
    |                                 |
    |  Static HTML + JS               |
    |  Pagefind index                 |
    +---------------------------------+
```

## Decision: Git Submodule (Not Subtree)

**Recommendation: Git submodule** because it matches the architectural intent and deployment model.

### Why Submodule Wins

| Criterion | Submodule | Subtree | Verdict |
|-----------|-----------|---------|---------|
| **Deterministic builds** | Pins exact commit SHA | Merged into tree, no pinning | Submodule -- reproducible builds critical for medical content |
| **Content boundary** | Separate git history, clear ownership | Mixed history, hard to attribute | Submodule -- public content repo has its own contribution history |
| **CI simplicity** | `actions/checkout` with `submodules: true` | No special checkout, but push-back is complex | Submodule -- one-line checkout config |
| **Contributor experience** | Contributors work in public repo only | Contributors would need to understand subtree merges | Submodule -- contributors never touch site repo |
| **Update control** | Explicit submodule update = explicit content version | Auto-merged on pull | Submodule -- site deploys specific content versions |
| **CF Pages compatibility** | Using GHA `wrangler pages deploy` (not CF native build), so no issue | N/A | Submodule -- GHA handles checkout, not CF build system |
| **Rollback** | Point submodule at previous SHA | Revert subtree merge (messy) | Submodule -- trivial rollback |

**Confidence: HIGH** -- this is a well-documented pattern for content-site separation. The submodule is public, so no PAT needed for checkout in CI.

### Why Not Subtree

Subtrees merge the external repository's files directly into the consuming repo's tree. This creates mixed git history, makes it harder to attribute changes to the content repo, and complicates the "which version of content is deployed?" question. For a medical content marketplace where auditability and deterministic builds matter, the slight extra friction of submodules is worth the clarity.

## Component Boundaries

### Public Repo: `Open-Medica/open-medical-skills`

| Component | Contents | Rationale |
|-----------|----------|-----------|
| **Content YAML** | `content/skills/*.yaml`, `content/plugins/*.yaml` | Community-contributed, publicly visible |
| **Skill Source** | `skills/*/SKILL.md` | Full skill definitions, downloadable |
| **Plugin Source** | `plugins/*/` (full code, README, LICENSE) | Full plugin implementations |
| **CLI** | `cli/` (Node.js, published to npm) | Community tool, needs public repo for npm publish |
| **Docs** | `docs/`, `CONTRIBUTING.md`, `DISCLAIMER.md` | Community-facing documentation |
| **Issue Templates** | `.github/ISSUE_TEMPLATE/` | Submission templates for contributors |
| **PR Templates** | `.github/PULL_REQUEST_TEMPLATE/` | Submission and dev-to-main templates |
| **Validation Workflows** | `validate-submission.yml`, `compliance-gate.yml`, `branch-guard.yml` | Content validation runs in content repo |
| **Dispatch Workflow** | `notify-site-repo.yml` [NEW] | Triggers site repo rebuild on content merge |
| **Logo Assets** | `logo/` | Brand assets for community use |
| **CLAUDE.md** | Auto-generated, sanitized | Public project overview (no infra details) |

### Private Repo: `gitjfmd/oms-site`

| Component | Contents | Rationale |
|-----------|----------|-----------|
| **Submodule Mount** | `content-repo/` -> `Open-Medica/open-medical-skills@SHA` | Content consumption point |
| **Astro Source** | `src/` (pages, components, layouts, features, lib, styles) | Proprietary site implementation |
| **Content Config** | `src/content.config.ts` | Glob paths point to `content-repo/content/` |
| **Workers** | `workers/submission-api/`, `workers/search-api/` | Contain secrets, internal infra access |
| **Astro Config** | `astro.config.mjs` | Build configuration |
| **Deploy Workflow** | `deploy.yml` | CF Pages deployment (has CF secrets) |
| **Content Update Workflow** | `update-content.yml` [NEW] | Listens for dispatch, updates submodule |
| **Package Config** | `package.json`, `pnpm-lock.yaml`, `tsconfig.json` | Build dependencies |
| **CLAUDE.md** | Full tech stack, dev setup | Internal development guide |
| **CLAUDE.local.md** | Orchestration rules, agent routing, infra | Internal only (gitignored) |

### What Does NOT Move

| Component | Stays In | Reason |
|-----------|----------|--------|
| `workers/` | Private repo | Contains secrets (GITHUB_TOKEN, CLIENT_SECRET, API keys) |
| `src/` | Private repo | Site implementation, deployment config |
| `astro.config.mjs` | Private repo | Build configuration |
| `public/` (favicons, logos) | Private repo | Site-specific static assets |
| `scripts/` (build automation) | Private repo | Internal tooling |
| `.github/workflows/deploy.yml` | Private repo | CF API credentials |

## Data Flow

### Content Submission Flow (Post-Split)

```
Contributor submits skill
    |
    +--[Web Form]---> CF Worker (private repo secrets)
    |                     |
    |                     v
    |                 POST github.com/Open-Medica/open-medical-skills
    |                 Creates branch + YAML + PR to dev
    |
    +--[Issue Template]--> Public repo issue
    |                         |
    |                         v
    |                     validate-submission.yml
    |                     Parses issue -> creates branch + YAML + PR to dev
    |
    +--[Direct PR]-------> Fork -> PR to dev
    |
    v
PR to dev (public repo)
    |
    v
validate-submission.yml runs:
  - YAML syntax validation
  - Schema validation (required fields, category enum)
  - Duplicate name check
  - Repository URL accessibility check
  - Auto-label (skill/plugin, category)
  - Flag for physician review
    |
    v
Physician review (manual)
    |
    v
Merge PR to dev
    |
    v
PR from dev to main (public repo)
    |
    v
compliance-gate.yml runs:
  - Medical disclaimer check
  - Safety classification review
  - CDS/FDA claims scan
  - License compatibility check
  - Physician-review-approved label check
    |
    v
branch-guard.yml verifies source is dev
    |
    v
CEO approves, merge to main
    |
    v
notify-site-repo.yml fires repository_dispatch
    |
    v
update-content.yml in private repo:
  - Receives dispatch event
  - Updates submodule to latest main
  - Commits submodule pointer update
  - Pushes to dev branch
  - Creates PR from dev to main
    |
    v
deploy.yml in private repo:
  - Checkout with submodules: recursive
  - pnpm install + astro build
  - wrangler pages deploy
    |
    v
Live on Cloudflare Pages
```

### Content Build Flow (Astro)

```
src/content.config.ts
    |
    | glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/skills' })
    | glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/plugins' })
    |
    v
Astro Content Layer
    |
    | Zod schema validation (14 categories, evidence levels, safety)
    |
    v
getCollection("skills"), getCollection("plugins")
    |
    v
Pages render (index.astro, skills/[slug].astro, plugins/index.astro)
    |
    v
Pagefind indexes rendered HTML
    |
    v
Static output in dist/
```

## Critical Path: content.config.ts Change

This is the highest-risk change in the entire split. The glob loader's `base` parameter must change from relative-to-monorepo-root to relative-to-submodule-mount.

### Current (Monorepo)

```typescript
// src/content.config.ts (current)
const skills = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content/skills' }),
  schema: z.object({ /* ... */ }),
});

const plugins = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content/plugins' }),
  schema: z.object({ /* ... */ }),
});
```

### After Split (Submodule at `content-repo/`)

```typescript
// src/content.config.ts (after split)
const skills = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/skills' }),
  schema: z.object({ /* ... */ }),
});

const plugins = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/plugins' }),
  schema: z.object({ /* ... */ }),
});
```

**Confidence: HIGH** -- Astro's glob loader `base` is documented as "a relative path or URL to the directory from which to resolve the pattern." The `base` is relative to the project root (where `astro.config.mjs` lives), not to the content.config.ts file. A submodule directory is just a regular directory on the filesystem after checkout, so `./content-repo/content/skills` resolves identically to `./content/skills` from the glob loader's perspective.

### Verification Required

Before the split, verify this with a local test:
1. Create a symlink: `ln -s content content-repo/content` (simulating the submodule mount)
2. Change content.config.ts to use `./content-repo/content/skills`
3. Run `pnpm build` -- if it builds with all 49 skills, the path change is valid

## Repository Dispatch Architecture

### Flow: Public Repo Notifies Private Repo

**Step 1: Public repo fires dispatch (new workflow)**

```yaml
# .github/workflows/notify-site-repo.yml (in PUBLIC repo)
name: Notify Site Repo

on:
  push:
    branches: [main]
    paths:
      - 'content/**'
      - 'skills/**'
      - 'plugins/**'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger site rebuild
        run: |
          curl -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${{ secrets.SITE_REPO_DISPATCH_TOKEN }}" \
            "https://api.github.com/repos/gitjfmd/oms-site/dispatches" \
            -d '{
              "event_type": "content-updated",
              "client_payload": {
                "sha": "${{ github.sha }}",
                "ref": "${{ github.ref }}",
                "sender": "${{ github.actor }}"
              }
            }'
```

**Step 2: Private repo receives dispatch and updates submodule (new workflow)**

```yaml
# .github/workflows/update-content.yml (in PRIVATE repo)
name: Update Content Submodule

on:
  repository_dispatch:
    types: [content-updated]

permissions:
  contents: write
  pull-requests: write

jobs:
  update-submodule:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout site repo
        uses: actions/checkout@v4
        with:
          submodules: recursive
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update submodule to latest
        run: |
          cd content-repo
          git fetch origin main
          git checkout ${{ github.event.client_payload.sha }}
          cd ..
          git add content-repo

      - name: Check for changes
        id: check
        run: |
          if git diff --staged --quiet; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Commit and push
        if: steps.check.outputs.changed == 'true'
        run: |
          git config user.name "oms-bot[bot]"
          git config user.email "oms-bot@users.noreply.github.com"
          git commit -m "chore: update content submodule to ${{ github.event.client_payload.sha }}"
          git push origin dev

      - name: Create PR to main
        if: steps.check.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr create \
            --title "Content update: $(date +%Y-%m-%d)" \
            --body "Auto-generated content update from public repo commit ${{ github.event.client_payload.sha }}" \
            --base main \
            --head dev \
            || echo "PR already exists"
```

### Token Requirements

| Token | Scope | Stored In | Used By |
|-------|-------|-----------|---------|
| `SITE_REPO_DISPATCH_TOKEN` | PAT with `repo` scope for `gitjfmd/oms-site` | Public repo secrets | `notify-site-repo.yml` to trigger dispatch |
| `GITHUB_TOKEN` | Default token (auto-provided) | Private repo (auto) | `update-content.yml` to commit + push |
| `CF_API_TOKEN` | CF API token for Pages deploy | Private repo secrets | `deploy.yml` for wrangler |
| `CF_ACCOUNT_ID` | CF account identifier | Private repo secrets | `deploy.yml` for wrangler |

**Security note:** The `SITE_REPO_DISPATCH_TOKEN` is a fine-grained PAT that only needs `contents:write` permission on `gitjfmd/oms-site`. It is stored as a secret in the public repo. This is the ONLY secret the public repo needs (besides GITHUB_TOKEN for its own workflows).

## CI/CD Pipeline Architecture

### Public Repo Pipelines

```
PR to dev
    |
    +-> validate-submission.yml
    |     - YAML syntax + schema validation
    |     - Duplicate name check
    |     - Repository URL check
    |     - Auto-label
    |     - Physician review flag
    |
    +-> branch-guard.yml (only on PRs to main)
    |     - Verify source is dev
    |
    +-> compliance-gate.yml (only on PRs to main from dev)
          - Medical disclaimers
          - Safety classifications
          - CDS/FDA claims scan
          - License compatibility
          - Physician-review-approved label

Push to main (after merge)
    |
    +-> notify-site-repo.yml
          - Fires repository_dispatch to private repo
```

### Private Repo Pipelines

```
repository_dispatch (content-updated)
    |
    +-> update-content.yml
          - Update submodule pointer
          - Commit to dev
          - Create PR dev -> main

PR to dev (submodule update or site changes)
    |
    +-> build-check.yml
          - Checkout with submodules: recursive
          - pnpm install
          - astro check (type checking)
          - astro build (verify build succeeds)
          - (Optional) security scan

Push to main (after merge)
    |
    +-> deploy.yml
          - Checkout with submodules: recursive
          - pnpm install + build
          - Validate content YAML
          - wrangler pages deploy
          - Post-deploy notifications
```

### Deploy Workflow Change (Critical)

The existing `deploy.yml` must add submodule checkout:

```yaml
# BEFORE (current)
- name: Checkout repository
  uses: actions/checkout@v4

# AFTER (post-split)
- name: Checkout repository with content submodule
  uses: actions/checkout@v4
  with:
    submodules: recursive
```

Since the public content repo is PUBLIC, no PAT is needed for checkout. The default `GITHUB_TOKEN` can clone public submodules.

**Confidence: HIGH** -- verified via GitHub Actions documentation and community reports. Public submodules do not require additional tokens.

## Submission Worker Update (wrangler.toml)

The submission API worker creates PRs in the content repo. Post-split, the target changes:

```toml
# BEFORE (current)
[vars]
GITHUB_OWNER = "gitjfmd"
GITHUB_REPO = "open-medical-skills"

# AFTER (post-split)
[vars]
GITHUB_OWNER = "Open-Medica"
GITHUB_REPO = "open-medical-skills"
```

The worker's `GITHUB_TOKEN` secret must also be updated to a PAT with `contents:write` and `pull_requests:write` on the `Open-Medica/open-medical-skills` repo (not the private site repo).

## Build Order (Phase Sequence)

The split must happen in a specific order to avoid breaking the live site.

### Phase 1: Prepare (No Breaking Changes)

1. Create `Open-Medica/open-medical-skills` repo (empty, with dev + main branches)
2. Set up branch protection on both branches
3. Create the `notify-site-repo.yml` workflow (but don't push content yet)
4. Create `SITE_REPO_DISPATCH_TOKEN` PAT and add to public repo secrets
5. Test: Verify dispatch can reach private repo (dry run)

### Phase 2: Content Migration

1. Copy content files to public repo dev branch:
   - `content/skills/`, `content/plugins/`
   - `skills/`, `plugins/`
   - `cli/`
   - `docs/`
   - `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE/`
   - `.github/workflows/` (validate, compliance, branch-guard, notify)
   - `logo/`, `README.md`, `LICENSE`, `DISCLAIMER.md`, `CONTRIBUTING.md`
   - Sanitized `CLAUDE.md`
2. PR dev -> main in public repo
3. Verify all CI workflows run correctly on the PR
4. Merge to main

### Phase 3: Site Repo Restructure

1. Add submodule: `git submodule add https://github.com/Open-Medica/open-medical-skills.git content-repo`
2. Update `src/content.config.ts` glob base paths:
   - `./content/skills` -> `./content-repo/content/skills`
   - `./content/plugins` -> `./content-repo/content/plugins`
3. Update any other references to `content/` paths (build scripts, etc.)
4. Add `update-content.yml` workflow
5. Update `deploy.yml` with `submodules: recursive`
6. Run `pnpm build` -- verify all 49 skills + 5 plugins render
7. Remove old `content/`, `skills/`, `plugins/`, `cli/`, `docs/` from private repo
8. Remove `scripts/sync-to-public.sh` (retired)
9. Commit all changes to dev, PR to main

### Phase 4: Worker Updates

1. Update `workers/submission-api/wrangler.toml`:
   - `GITHUB_OWNER = "Open-Medica"`
2. Update or create new `GITHUB_TOKEN` PAT for submission worker (scoped to public repo)
3. Deploy worker: merge to main triggers `deploy.yml`

### Phase 5: Verify End-to-End

1. Submit a test skill via web form -- verify PR lands in public repo
2. Merge test skill to dev, then to main in public repo
3. Verify `repository_dispatch` fires
4. Verify `update-content.yml` updates submodule
5. Verify `deploy.yml` builds and deploys with new content
6. Verify live site shows the new skill
7. Clean up test skill

## Anti-Patterns to Avoid

### Anti-Pattern 1: CF Pages Native Build with Submodules

**What people do:** Use CF Pages' built-in git integration to build from a repo with submodules.
**Why it's wrong:** CF Pages has documented issues with submodule cloning (especially private repos, but also intermittent failures with public ones). Multiple community reports of "Failed: error occurred while updating repo submodules."
**Do this instead:** Build in GitHub Actions, deploy dist/ via `wrangler pages deploy`. This is already the current pattern -- keep it.

### Anti-Pattern 2: Subtree for "Simplicity"

**What people do:** Use `git subtree` because it avoids `submodule init/update` friction.
**Why it's wrong:** Subtrees merge external history into your tree. You lose the ability to pin a specific content version, rollback is messy, and contributor attribution gets mixed. For a medical content marketplace where audit trail matters, this is unacceptable.
**Do this instead:** Use submodules with automated CI updates. The "friction" is one `submodules: recursive` flag in checkout.

### Anti-Pattern 3: Direct Push to Private Repo on Content Change

**What people do:** Have the dispatch workflow push directly to main in the private repo.
**Why it's wrong:** Bypasses branch protection, skips build verification, breaks the dev -> main flow. A broken content YAML could take down the live site.
**Do this instead:** Dispatch workflow commits to dev, creates PR to main. PR triggers build-check. CEO approves merge to main. Deploy happens only after verification.

### Anti-Pattern 4: Sharing Secrets Across Repos

**What people do:** Store CF API tokens, OAuth secrets in both repos.
**Why it's wrong:** Public repo should have ZERO deployment secrets. Only the private repo deploys.
**Do this instead:** Public repo has only `SITE_REPO_DISPATCH_TOKEN` (PAT for dispatch). All deployment, OAuth, and API secrets stay in private repo only.

### Anti-Pattern 5: Hardcoding Submodule Path

**What people do:** Scatter `content-repo/content/skills` throughout the codebase.
**Why it's wrong:** If the submodule mount point changes, you have to update many files.
**Do this instead:** Define the content base path once in `content.config.ts`. Pages and components use `getCollection()` which abstracts the path away. Only `content.config.ts` needs to know the physical path.

## Integration Points

### External Services

| Service | Integration Pattern | Post-Split Change |
|---------|---------------------|-------------------|
| GitHub API (submissions) | CF Worker uses Octokit | `GITHUB_OWNER` changes to `Open-Medica` |
| GitHub OAuth | CF Worker exchanges code for token | No change (OAuth app stays the same) |
| Cloudflare Pages | `wrangler pages deploy dist/` | Add `submodules: recursive` to checkout step |
| Pagefind | Build-time indexing of `dist/` | No change (indexes rendered HTML, not source) |
| Qdrant/SurrealDB (search) | Search API Worker queries backends | No change (search indexes are independent) |

### Internal Boundaries

| Boundary | Communication | Critical Detail |
|----------|---------------|-----------------|
| Public repo -> Private repo | `repository_dispatch` event via GitHub API | Requires `SITE_REPO_DISPATCH_TOKEN` PAT |
| Private repo -> Public repo | Submodule reference (SHA pointer in `.gitmodules`) | Public repo, no token needed for read |
| CF Worker -> Public repo | Octokit API calls (create branch, file, PR) | `GITHUB_TOKEN` secret scoped to public repo |
| Astro build -> Content | `glob()` loader reads `content-repo/content/` | Path change in `content.config.ts` is the critical item |

## Local Development Setup

Post-split, developers working on the site need:

```bash
# Clone with submodule
git clone --recursive https://github.com/gitjfmd/oms-site.git

# Or if already cloned without --recursive
git submodule init
git submodule update

# Update content to latest
git submodule update --remote content-repo

# Dev server
pnpm install
pnpm dev
```

The Astro dev server reads from `content-repo/content/` just like it currently reads from `content/`. Hot reload works because the glob loader watches the filesystem, regardless of whether the directory is a submodule or not.

## Sources

- [Astro Content Loader API Reference](https://docs.astro.build/en/reference/content-loader-reference/) -- glob() loader base parameter documentation
- [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) -- collection definition patterns
- [GitHub Actions Checkout](https://github.com/actions/checkout) -- submodule checkout configuration
- [Cross-Repository Workflows in GitHub Actions](https://oneuptime.com/blog/post/2025-12-20-cross-repository-workflows-github-actions/view) -- repository_dispatch patterns
- [Sync Git Submodules with GitHub Actions](https://binhong.me/blog/2025-08-08-sync-git-submodules-github-action/) -- automated submodule update workflows
- [Checkout Submodules with Least Privilege](https://www.micah.soy/posts/checkout-submodules-github-actions-least-privilege/) -- PAT scoping for submodule checkout
- [Git Subtree vs Submodule comparison](https://adam-p.ca/blog/2022/02/git-submodule-subtree/) -- trade-off analysis
- [CF Pages Git Integration](https://developers.cloudflare.com/pages/configuration/git-integration/) -- CF Pages submodule limitations
- [CF Community: Submodule Build Errors](https://community.cloudflare.com/t/pages-build-error-failed-error-occurred-while-updating-repo-submodules/356890) -- documented CF Pages submodule issues

---
*Architecture research for: OMS monorepo split into public content + private site repos*
*Researched: 2026-03-22*

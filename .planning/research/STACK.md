# Stack Research

**Domain:** Monorepo-to-multi-repo split with CI/CD infrastructure for medical AI skills marketplace
**Researched:** 2026-03-22
**Confidence:** HIGH (all recommendations verified against official docs and current releases)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `git-filter-repo` | 2.47.0 | Extract subdirectories from monorepo into new repos with preserved history | Git project's official recommendation over deprecated `git-filter-branch`. Fast, safe, supports `--path`, `--path-rename`, `--subdirectory-filter`. Install via `pip install git-filter-repo`. |
| GitHub Rulesets API | `2026-03-10` | Branch protection enforcement via REST API as code | Modern replacement for classic branch protection rules. Multiple rulesets stack (most restrictive wins), visible to all readers (not just admins), support enforcement states (active/disabled/evaluate), and have first-class REST API for IaC management. |
| `peter-evans/repository-dispatch` | v4.0.1 | Cross-repo workflow triggers from public to private repo | De facto standard for `repository_dispatch` events. Supports fine-grained PATs, matrix dispatch to multiple repos, and JSON `client-payload` for passing context (commit SHA, branch, etc.). |
| `actions/checkout` | v4.3.1 | Repository checkout with submodule support in CI | Use v4 (NOT v6) for now. v6 changed credential persistence behavior and has had edge-case issues. v4 is battle-tested. Set `submodules: recursive` and `token: ${{ secrets.PAT }}` for private submodule access. |
| `cloudflare/wrangler-action` | v3 | Deploy static site and workers to Cloudflare | Official CF action, actively maintained. Supports `pages deploy` command, `workingDirectory` for monorepos, and `packageManager` auto-detection. v3 dropped Wrangler v1 and global API key auth. |
| `actions/create-github-app-token` | v3 | Generate scoped tokens for cross-repo operations | Security best practice over PATs: tokens expire in 1 hour, scoped to specific repos, auto-revoked after job completion. Install GitHub App on both repos, generate token at runtime. |
| GitHub Actions Workflows | N/A | CI/CD pipeline orchestration | Already in use. No framework migration needed. All 5 research domains (repo split, submodules, branch protection, cross-repo triggers, CF Pages deploy) are solvable within GitHub Actions. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pnpm/action-setup` | v4 | Install pnpm in CI | Every workflow that runs `pnpm install` or `pnpm build`. Auto-detects version from `packageManager` field in package.json. |
| `actions/setup-node` | v4 | Install Node.js in CI | Pair with `pnpm/action-setup`. Set `node-version: "22"` and `cache: pnpm` for fast installs. |
| `actions/upload-artifact` / `download-artifact` | v4 | Pass build artifacts between jobs | When build job and deploy job are separate (already in use in deploy.yml). |
| `tj-actions/changed-files` | v47 | Detect changed files in PR | Already in use (v44). Upgrade to v47 for submodule support and improved glob matching. Use `files` parameter with glob patterns to scope to content directories. |
| `actions/github-script` | v7 | Inline JavaScript for GitHub API calls | Already in use. Stay on v7 (NOT v8 yet -- v8 requires Node 24 and Actions Runner v2.327.1+ which may not be guaranteed on all runners). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `gh` CLI | Manage rulesets, create PATs, configure repos | Use `gh api` for ruleset creation/management. Use `gh auth token` for scripting. |
| `git submodule` | Link public content repo into private site repo | Use HTTPS URLs (not SSH) in `.gitmodules` for CI compatibility. Set `branch = main` for tracking. |
| `wrangler` CLI (v4.x) | Local CF Workers development and deployment | Already installed. Used for `wrangler pages deploy` and `wrangler secret put`. |

## Installation

```bash
# For the one-time repo split (developer machine only)
pip install git-filter-repo

# No new npm dependencies needed -- all tooling is GitHub Actions + git
# Existing stack (Astro 5, React 19, TailwindCSS 4, pnpm) is unchanged
```

## Domain-Specific Research

### 1. Monorepo Split: git-filter-repo

**Confidence:** HIGH (official Git recommendation, verified on PyPI)

**Strategy for OMS:** The monorepo contains two logical units:
- **Public content** (content/, skills/, plugins/, cli/, docs/, .github/ISSUE_TEMPLATE/)
- **Private site** (src/, workers/, public/, scripts/, astro.config.mjs, etc.)

**Recommended approach:** Keep the private repo as-is (it is the original monorepo) and extract content into a new public repo. Do NOT split-and-reconstruct both sides.

```bash
# Clone the monorepo into a temporary directory for extraction
git clone --no-local /path/to/oms-site /tmp/oms-public-extract
cd /tmp/oms-public-extract

# Extract only public-facing directories with history
git filter-repo \
  --path content/ \
  --path skills/ \
  --path plugins/ \
  --path cli/ \
  --path docs/ \
  --path .github/ISSUE_TEMPLATE/ \
  --path .github/PULL_REQUEST_TEMPLATE/ \
  --path README.md \
  --path LICENSE \
  --path DISCLAIMER.md \
  --path CONTRIBUTING.md

# Add new remote and push
git remote add origin https://github.com/Open-Medica/open-medical-skills.git
git push -u origin main
```

**Why NOT git subtree split:** `git subtree split` only works with a single prefix directory. OMS needs multiple directories extracted. `git-filter-repo` with multiple `--path` flags handles this cleanly.

**Why NOT fresh start (no history):** PROJECT.md says "Content history migration to public repo -- fresh start acceptable, history preserved in private repo." A fresh start is simpler and avoids filter-repo complexity. The decision is pending. Both approaches are viable. Fresh start is recommended for speed; filter-repo is available if history preservation becomes a requirement.

**Recommended decision:** Fresh start for public repo. Simply copy current content files into a new repo with an initial commit. History is preserved in the private repo. This avoids the complexity of `git-filter-repo` and makes the public repo cleaner for open-source contributors.

### 2. Git Submodule Management in CI/CD

**Confidence:** HIGH (verified against actions/checkout docs, CF Pages docs, and community reports)

**Architecture:**
```
oms-site (private)
  |-- content-repo/  (git submodule -> Open-Medica/open-medical-skills)
  |     |-- content/
  |     |     |-- skills/
  |     |     |-- plugins/
  |     |-- skills/
  |     |-- plugins/
  |     |-- cli/
  |-- src/
  |-- workers/
  |-- astro.config.mjs
```

**Adding the submodule:**
```bash
cd oms-site
git submodule add -b main https://github.com/Open-Medica/open-medical-skills.git content-repo
git commit -m "feat: add public content repo as submodule"
```

**Critical: `.gitmodules` must use HTTPS, not SSH:**
```ini
[submodule "content-repo"]
    path = content-repo
    url = https://github.com/Open-Medica/open-medical-skills.git
    branch = main
```

**CI checkout with private submodule access:**

The public content repo is public, so no special auth is needed for the submodule. The GITHUB_TOKEN scoped to the private repo is sufficient to check out public submodules.

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
    # No token override needed -- content repo is public
```

If the content repo were private, you would need:
```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
    token: ${{ secrets.CROSS_REPO_PAT }}  # PAT with repo scope on both repos
```

**Submodule update in local dev:**
```bash
git submodule update --init --recursive        # First clone
git submodule update --remote --merge          # Pull latest content
```

**Astro content config change:**
```typescript
// src/content.config.ts -- update glob base paths
const skills = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml}", base: "./content-repo/content/skills" }),
  schema: skillSchema,
});
```

**CRITICAL GOTCHA -- Cloudflare Pages native git integration does NOT support private submodules:**
Cloudflare Pages' built-in git integration cannot clone private submodules (it fails with auth errors). However, this project already uses GitHub Actions + `wrangler pages deploy` (direct upload), which bypasses CF's git integration entirely. The GitHub Actions workflow handles checkout + submodule init + build + upload. This is the correct architecture and requires no change.

### 3. GitHub Rulesets for Branch Protection

**Confidence:** HIGH (verified against GitHub REST API docs, version 2026-03-10)

**Why Rulesets over classic Branch Protection:**
- Rulesets are API-first, manageable as Infrastructure as Code
- Multiple rulesets stack (most restrictive wins) -- classic rules are singular per branch
- Rulesets support enforcement states (active/disabled/evaluate) -- can be toggled without deletion
- Rulesets are visible to all repo readers, not just admins
- GitHub is actively developing rulesets; classic branch protection is in maintenance mode

**Creating rulesets via API (recommended for automation):**

```bash
# Public repo: main branch ruleset
gh api repos/Open-Medica/open-medical-skills/rulesets \
  --method POST \
  --field name="main-protection" \
  --field enforcement="active" \
  --field target="branch" \
  --input - <<'EOF'
{
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
    }},
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "Validate PR Skill/Plugin YAML" },
          { "context": "Medical Compliance Checks" },
          { "context": "Verify PR comes from dev" }
        ]
    }},
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ],
  "bypass_actors": []
}
EOF

# Public repo: dev branch ruleset
gh api repos/Open-Medica/open-medical-skills/rulesets \
  --method POST \
  --field name="dev-protection" \
  --field enforcement="active" \
  --field target="branch" \
  --input - <<'EOF'
{
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/dev"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
    }},
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Validate PR Skill/Plugin YAML" }
        ]
    }},
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ],
  "bypass_actors": []
}
EOF
```

**Coexistence note:** Rulesets work alongside classic branch protection rules. No migration required -- you can add rulesets on top of existing protection and remove classic rules later.

**GitHub Actions enforcement workflow (branch-guard.yml):**
The existing `branch-guard.yml` enforces "PRs to main must come from dev" at the workflow level. This is complementary to rulesets -- rulesets enforce merge requirements, the workflow enforces source branch policy. Keep both.

### 4. repository_dispatch Cross-Repo Triggers

**Confidence:** HIGH (verified against peter-evans/repository-dispatch v4.0.1 docs and GitHub API docs)

**Architecture:**
```
Public repo push to main
  --> triggers repository_dispatch to private repo
    --> private repo updates submodule
      --> private repo builds and deploys
```

**Public repo workflow (trigger on content merge to main):**
```yaml
# .github/workflows/notify-site-repo.yml (in public repo)
name: Notify Site Repo

on:
  push:
    branches: [main]
    paths:
      - "content/**"
      - "skills/**"
      - "plugins/**"
      - "cli/**"

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger site rebuild
        uses: peter-evans/repository-dispatch@v4
        with:
          token: ${{ secrets.SITE_REPO_PAT }}
          repository: gitjfmd/oms-site
          event-type: content-updated
          client-payload: >-
            {
              "ref": "${{ github.ref }}",
              "sha": "${{ github.sha }}",
              "actor": "${{ github.actor }}",
              "message": "${{ github.event.head_commit.message }}"
            }
```

**Private repo workflow (receive dispatch, update submodule, deploy):**
```yaml
# .github/workflows/content-sync.yml (in private repo)
name: Sync Content & Deploy

on:
  repository_dispatch:
    types: [content-updated]

jobs:
  sync-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update submodule to latest
        run: |
          git submodule update --remote --merge content-repo
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content-repo
          if ! git diff --cached --quiet; then
            git commit -m "chore: update content submodule to ${{ github.event.client_payload.sha }}"
            git push
          else
            echo "Submodule already up to date"
          fi

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm

      - name: Install and build
        run: |
          pnpm install --frozen-lockfile
          pnpm build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy dist --project-name=open-medical-skills --branch=main
```

**Authentication options (ranked by security):**

| Method | Security | Complexity | Recommendation |
|--------|----------|------------|----------------|
| GitHub App + `actions/create-github-app-token@v3` | Best (1hr expiry, scoped, auditable) | Medium (create App, install on both repos) | Use for production |
| Fine-grained PAT | Good (scoped to repos, has expiry) | Low (create once, store as secret) | Use for MVP/initial setup |
| Classic PAT with `repo` scope | Worst (broad access, no expiry required) | Lowest | Avoid |

**GitHub App approach (recommended for production):**
```yaml
# In public repo workflow
- uses: actions/create-github-app-token@v3
  id: app-token
  with:
    app-id: ${{ vars.OMS_APP_ID }}
    private-key: ${{ secrets.OMS_APP_PRIVATE_KEY }}
    owner: ${{ github.repository_owner }}
    repositories: "oms-site"

- uses: peter-evans/repository-dispatch@v4
  with:
    token: ${{ steps.app-token.outputs.token }}
    repository: gitjfmd/oms-site
    event-type: content-updated
    client-payload: '...'
```

**CRITICAL CONSTRAINT:** `repository_dispatch` events ONLY trigger workflows on the default branch. The receiving workflow MUST be committed to `main` (or whatever the default branch is) in the private repo. It will NOT trigger if the workflow only exists on a feature branch.

### 5. Cloudflare Pages Deployment with Submodules

**Confidence:** HIGH (verified against CF docs, wrangler-action docs, and community reports)

**Key finding:** Do NOT use Cloudflare Pages' built-in git integration for repos with submodules (especially private ones). Use GitHub Actions + `wrangler pages deploy` (direct upload) instead.

**The existing deploy.yml already does this correctly.** It:
1. Checks out the repo
2. Builds with `pnpm build`
3. Deploys `dist/` via `cloudflare/wrangler-action@v3` with `pages deploy`

**Required changes for submodule support:**
```yaml
# In deploy.yml, add submodules to checkout step
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    submodules: recursive  # <-- ADD THIS

# Rest of the workflow stays the same
```

**Disconnect CF Pages from git integration:**
Since deployment is handled by GitHub Actions, the CF Pages project should be set up as a "Direct Upload" project (not connected to GitHub). This prevents double-deploys and eliminates the submodule auth issue entirely.

To convert an existing git-connected CF Pages project to direct upload:
1. Go to Cloudflare Dashboard > Pages > your project > Settings > Builds & Deployments
2. Disconnect the git repository
3. Deployments will only happen via `wrangler pages deploy` from GitHub Actions

**`.gitmodules` in build output:**
Cloudflare Pages serves the `.gitmodules` file by default if it ends up in the output directory. Add to `public/_headers` or handle in astro config to prevent serving it. Since Astro builds to `dist/` and `.gitmodules` is at the repo root (not in `dist/`), this is not an issue for OMS.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Git submodule | npm package (publish content as `@openmedica/content`) | If content needs semver versioning independent of repo. Adds npm publish step + registry dependency. Overkill for this use case. |
| Git submodule | Git subtree | If you want content merged into repo history (no `.gitmodules`). Harder to update, messy history, no standard CI tooling. Avoid. |
| `repository_dispatch` | GitHub webhook + external service | If you need non-GitHub targets (Slack, Discord, custom API). Adds infrastructure. Unnecessary here. |
| `repository_dispatch` | Polling (cron schedule) | If dispatch is unreliable. Adds latency (up to cron interval). Use as fallback only. |
| GitHub Rulesets | Classic Branch Protection | If you need branch protection on GitHub Free plan (rulesets require Free for public repos or Team/Enterprise for private repos). Both are available for this project. |
| `actions/checkout@v4` | `actions/checkout@v6` | When v6 stabilizes further. v6 changed credential persistence to `$RUNNER_TEMP` -- more secure but has caused edge cases with submodules. v4 is safer for now. |
| `peter-evans/repository-dispatch@v4` | Raw `curl` to GitHub API | If you want zero action dependencies. More verbose, same result. Use the action for readability. |
| Fine-grained PAT (MVP) | GitHub App (production) | Start with fine-grained PAT for speed. Migrate to GitHub App when the setup stabilizes. GitHub App is more secure (1hr token expiry, org-level management, audit trail). |
| Fresh repo start (public) | `git-filter-repo` extraction | If history preservation in the public repo is required by stakeholders. Fresh start is simpler, cleaner for open-source contributors, and PROJECT.md marks it as acceptable. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Cloudflare Pages git integration (for repos with submodules) | Cannot authenticate to private submodules. Even public submodules can fail with auth errors in some configurations. | GitHub Actions + `wrangler pages deploy` (direct upload). Already in use. |
| `git-filter-branch` | Deprecated by Git project. Slow, dangerous, creates backup refs. | `git-filter-repo` (if history extraction is needed). |
| Classic Branch Protection API | Maintenance mode. No enforcement states, no stacking, admin-only visibility. | GitHub Rulesets API (`/repos/{owner}/{repo}/rulesets`). |
| Classic PAT with `repo` scope | Too broad. Full access to all repos the user can access. If compromised, blast radius is entire account. | Fine-grained PAT (scoped to specific repos) or GitHub App token. |
| `actions/checkout@v6` (for now) | Changed credential persistence behavior. Edge cases with submodules reported in 2025. | `actions/checkout@v4` (v4.3.1 is latest v4 maintenance release). Upgrade to v6 when submodule issues are fully resolved. |
| `cloudflare/pages-action` | Deprecated. Cloudflare recommends `wrangler-action` instead. | `cloudflare/wrangler-action@v3`. |
| Monorepo tools (Turborepo, Nx, Lerna) | Only 2 repos with a submodule link. Monorepo tools add build system complexity for zero benefit. | Git submodule + `repository_dispatch` for sync. |
| SSH URLs in `.gitmodules` | GitHub Actions runners convert SSH to HTTPS anyway. SSH in `.gitmodules` can cause auth failures in CI when no SSH key is configured. | HTTPS URLs in `.gitmodules`. |

## Stack Patterns by Variant

**If using fine-grained PAT (MVP / initial setup):**
- Create one fine-grained PAT scoped to both repos with `contents: read & write` and `metadata: read`
- Store as `CROSS_REPO_PAT` in both repos' secrets
- Set expiration to 90 days, create a reminder to rotate
- Use directly in `peter-evans/repository-dispatch@v4`

**If using GitHub App (production):**
- Create a GitHub App in the `Open-Medica` org (or user account)
- Install on both `open-medical-skills` (public) and `oms-site` (private)
- Grant `contents: read & write` permission
- Store App ID as `vars.OMS_APP_ID` and private key as `secrets.OMS_APP_PRIVATE_KEY`
- Use `actions/create-github-app-token@v3` to generate scoped tokens at runtime
- Tokens auto-expire in 1 hour and auto-revoke after job completion

**If content repo is public (current plan):**
- No special auth needed for submodule checkout in private repo CI
- Standard `actions/checkout@v4` with `submodules: recursive` works
- Only the `repository_dispatch` trigger needs cross-repo auth (PAT or App token)

**If content repo were private:**
- Submodule checkout would require PAT or GitHub App token in `actions/checkout`
- CF Pages native git integration would be completely unusable
- All deployment must go through GitHub Actions direct upload

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `actions/checkout@v4` | `submodules: recursive` + public submodule | Works with default `github.token`. No PAT needed for public submodules. |
| `actions/checkout@v4` | `pnpm/action-setup@v4` + `actions/setup-node@v4` | Standard CI trio. pnpm action-setup reads `packageManager` from package.json. |
| `peter-evans/repository-dispatch@v4` | Fine-grained PAT or GitHub App token | Fine-grained PAT needs `contents: read & write` + `metadata: read` on target repo. |
| `cloudflare/wrangler-action@v3` | Wrangler v4.x | Auto-installs wrangler. Supports `pages deploy`. Requires `CF_API_TOKEN` and `CF_ACCOUNT_ID`. |
| `actions/create-github-app-token@v3` | `peter-evans/repository-dispatch@v4` | Generate token in one step, pass to dispatch in next step. Token scoped to target repo. |
| `tj-actions/changed-files@v47` | `actions/checkout@v4` with `fetch-depth: 0` | Needs full history for accurate diff. Use `files` parameter for glob filtering. |
| Astro 5.18.0 | `content.config.ts` with submodule paths | Change glob base from `./content/skills` to `./content-repo/content/skills`. Works transparently. |

## GitHub Actions Version Matrix (Current Recommended)

| Action | Recommended Version | Latest Available | Notes |
|--------|---------------------|------------------|-------|
| `actions/checkout` | **v4** (4.3.1) | v6.0.2 | Stay on v4 for submodule stability. v6 available when credential changes stabilize. |
| `actions/setup-node` | **v4** | v4 | Current latest. Stable. |
| `pnpm/action-setup` | **v4** | v4 | Current latest. Reads `packageManager` from package.json. |
| `actions/upload-artifact` | **v4** | v4 | Current latest. |
| `actions/download-artifact` | **v4** | v4 | Current latest. |
| `actions/github-script` | **v7** | v8 | Stay on v7. v8 requires Node 24 + Runner v2.327.1+. |
| `cloudflare/wrangler-action` | **v3** | v3 | Current latest major. Semantic versioning supported. |
| `peter-evans/repository-dispatch` | **v4** (4.0.1) | v4.0.1 | Current latest. |
| `actions/create-github-app-token` | **v3** | v3 | Current latest. |
| `tj-actions/changed-files` | **v47** | v47.0.5 | Upgrade from v44. Adds submodule support. |

## Secrets and Variables Required

### Public Repo (`Open-Medica/open-medical-skills`)

| Name | Type | Purpose |
|------|------|---------|
| `SITE_REPO_PAT` (MVP) or `OMS_APP_PRIVATE_KEY` (prod) | Secret | Auth for `repository_dispatch` to private repo |
| `OMS_APP_ID` (prod only) | Variable | GitHub App ID for token generation |

### Private Repo (`gitjfmd/oms-site`)

| Name | Type | Purpose |
|------|------|---------|
| `CF_API_TOKEN` | Secret | Cloudflare API token (already exists) |
| `CF_ACCOUNT_ID` | Secret | Cloudflare account ID (already exists) |
| `GITHUB_TOKEN` | Secret (auto) | Default token, sufficient for public submodule checkout |

## Sources

- [peter-evans/repository-dispatch](https://github.com/peter-evans/repository-dispatch) -- v4.0.1 release, usage docs, cross-repo dispatch patterns (HIGH confidence)
- [actions/checkout releases](https://github.com/actions/checkout/releases) -- v4.3.1 and v6.0.2 release notes, submodule parameters (HIGH confidence)
- [actions/create-github-app-token](https://github.com/actions/create-github-app-token) -- v3, cross-repo token generation (HIGH confidence)
- [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action) -- v3, Pages deployment, workingDirectory (HIGH confidence)
- [CF Pages direct upload docs](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) -- GitHub Actions CI/CD pattern (HIGH confidence)
- [CF Pages git integration docs](https://developers.cloudflare.com/pages/configuration/git-integration/) -- Submodule limitations (HIGH confidence)
- [GitHub Rulesets REST API](https://docs.github.com/en/rest/repos/rules) -- Endpoint format, parameters, version 2026-03-10 (HIGH confidence)
- [GitHub Rulesets overview](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) -- Rulesets vs branch protection comparison (HIGH confidence)
- [GitHub fine-grained PAT announcement](https://github.blog/security/application-security/introducing-fine-grained-personal-access-tokens-for-github/) -- PAT scoping, permissions (HIGH confidence)
- [CF community: submodule issues](https://community.cloudflare.com/t/pages-build-error-failed-error-occurred-while-updating-repo-submodules/356890) -- Private submodule failures confirmed (MEDIUM confidence)
- [git-filter-repo on PyPI](https://pypi.org/project/git-filter-repo/) -- v2.47.0, installation (HIGH confidence)
- [tj-actions/changed-files](https://github.com/marketplace/actions/changed-files) -- v47, submodule support (HIGH confidence)
- [GitHub blog: ruleset exemptions](https://github.blog/changelog/2025-09-10-github-ruleset-exemptions-and-repository-insights-updates/) -- Sept 2025 update (MEDIUM confidence)
- [Cross-repo sync patterns](https://www.notesoncloudcomputing.com/posts/2025-01-25-synchronizing-git-private-projects-with-public-repositories/) -- Private submodule CI patterns (MEDIUM confidence)

---
*Stack research for: Monorepo split + CI/CD infrastructure for OMS*
*Researched: 2026-03-22*

# Pitfalls Research

**Domain:** Monorepo split with git submodules, cross-repo CI/CD, Cloudflare Pages deployment
**Researched:** 2026-03-22
**Confidence:** HIGH (verified against official docs, community reports, and codebase analysis)

## Critical Pitfalls

### Pitfall 1: Cloudflare Pages Cannot Clone Private Submodules

**What goes wrong:**
Cloudflare Pages' built-in Git integration does not support private submodules. When the private website repo (`gitjfmd/oms-site`) has a submodule pointing to `Open-Medica/open-medical-skills` (which is public, so this specific case is fine), or any private repo, the Cloudflare Pages build system fails during the clone stage with `error occurred while updating repo submodules`. This is a well-documented, years-long limitation. Even public submodules have historically caused sporadic failures on CF Pages' built-in build system.

**Why it happens:**
Cloudflare Pages' Git integration uses its own GitHub App installation token during clone. This token only has access to the single repository connected to the Pages project. It cannot authenticate against other repositories, even within the same GitHub org. There is no way to provide additional credentials to the CF Pages build environment for submodule access.

**How to avoid:**
Do NOT use Cloudflare Pages' built-in Git integration for building. Instead, deploy via GitHub Actions using `wrangler pages deploy` with direct upload. The GitHub Actions workflow handles checkout (with PAT for submodule access) and build, then uploads the `dist/` directory to CF Pages. This is exactly what the current `deploy.yml` already does with `cloudflare/wrangler-action@v3`. The workflow just needs the `actions/checkout@v4` step updated with `submodules: 'recursive'` and a cross-repo PAT token.

**Warning signs:**
- CF Pages dashboard shows "Failed: error occurred while updating repo submodules"
- Build logs show `fatal: could not read Username for 'https://github.com/'`
- Builds succeed locally but fail on CF Pages

**Phase to address:**
Phase 1 (Repo Split) -- configure CI-driven deployment from day one. Never connect the private repo to CF Pages Git integration directly. Use GitHub Actions + `wrangler pages deploy dist/` exclusively.

---

### Pitfall 2: `repository_dispatch` Only Triggers on Default Branch

**What goes wrong:**
After content merges to `main` in the public repo, a `repository_dispatch` event is sent to the private repo to update the submodule and rebuild. But `repository_dispatch` events ONLY trigger workflows that exist on the repository's default branch. If the workflow file does not exist on `main` in the private repo, or if you want to trigger a rebuild on `dev`, the dispatch silently does nothing. No error, no log, no indication of failure.

**Why it happens:**
This is a GitHub platform limitation, not a configuration error. The API returns `204 No Content` regardless of whether a workflow was actually triggered, making it impossible to know if the dispatch was received. Developers assume the dispatch worked because the API call succeeded.

**How to avoid:**
1. The `repository_dispatch`-triggered workflow MUST exist on the private repo's default branch (`main`) before the first dispatch.
2. The workflow on `main` receives the dispatch, then uses `actions/checkout` with `ref: dev` (or the target branch from `client_payload`) to operate on the correct branch.
3. The workflow should: (a) checkout `dev`, (b) update the submodule pointer, (c) commit to `dev`, (d) optionally create a PR from `dev` to `main`.
4. Add a health check: after dispatching, the public repo workflow should poll the private repo's workflow runs via `gh api` to confirm the run started.

**Warning signs:**
- Content merged to public repo's `main` but website never rebuilds
- `repository_dispatch` API call returns 204 but no workflow run appears in the private repo
- Works when manually triggered via `workflow_dispatch` but not via dispatch

**Phase to address:**
Phase 2 (CI/CD Setup) -- set up the dispatch receiver workflow on `main` first, test end-to-end before relying on it.

---

### Pitfall 3: Astro Glob Loader Paths Break When Content Moves to Submodule

**What goes wrong:**
The current `content.config.ts` uses `base: './content/skills'` and `base: './content/plugins'` in the glob loaders. After the split, content lives at `content-repo/content/skills/` (submodule path). If this path change is not updated perfectly, Astro's Content Layer silently returns zero collections. No error -- just empty pages. The build succeeds with zero skills displayed.

**Why it happens:**
Astro's glob loader does not throw errors when the base path exists but contains no matching files, or when the base path does not exist. It silently returns an empty collection. The build "succeeds" because Astro generates pages for zero items. The site deploys with no content. This is particularly dangerous because `astro build` exits with code 0.

**How to avoid:**
1. Update `content.config.ts` to use the submodule path: `base: './content-repo/content/skills'`.
2. Add a post-build validation step in CI that checks the build output: `if [ $(find dist/skills -name "*.html" | wc -l) -lt 10 ]; then echo "FATAL: Fewer than 10 skill pages built"; exit 1; fi`. The current count is 49 skills; anything below 10 indicates a path resolution failure.
3. Add a symlink `content/` -> `content-repo/content/` for local development so paths work both locally (without submodule) and in CI (with submodule). Test both code paths.

**Warning signs:**
- Build succeeds but site has no skills listed
- `astro build` output shows `0 pages` for skills/plugins routes
- Local dev works (content at `./content/`) but CI build shows empty site

**Phase to address:**
Phase 1 (Repo Split) -- this is the first thing that breaks after the split. Must be validated before any CI pipeline is trusted.

---

### Pitfall 4: PAT Token Expiration Silently Breaks All Cross-Repo Operations

**What goes wrong:**
Fine-grained PATs have a maximum lifetime of one year. The entire cross-repo infrastructure (submodule checkout, repository_dispatch, submission API creating PRs in the public repo) depends on these tokens. When a PAT expires, the submission form stops working (PRs fail silently), the submodule update workflow fails (no rebuild), and CI checkout fails (build breaks). There is no notification from GitHub when a PAT is about to expire unless you configure one.

**Why it happens:**
PATs are created during setup and then forgotten. GitHub does not aggressively notify about expiring tokens. Fine-grained PATs cannot be set to "never expire" (unlike classic PATs, which can but should not). The failure mode is silent -- API calls return 401 but error handling in workflows often does not surface this clearly.

**How to avoid:**
1. Use a GitHub App instead of PATs for cross-repo operations. GitHub App installation tokens are auto-renewed and never expire. The App needs `contents:read` on the public repo (for submodule checkout) and `contents:write` + `pull-requests:write` on the public repo (for submission PRs).
2. If PATs are used, create a GitHub Actions workflow that runs monthly and checks token validity by making an authenticated API call. If it fails, open an issue titled "PAT expiring soon" with assignee.
3. Store token expiration dates in a calendar/reminder system.
4. Name secrets clearly: `CROSS_REPO_PAT_EXPIRES_2027_03` so the expiration date is visible.

**Warning signs:**
- Submission form returns "Unable to create PR" errors
- GitHub Actions logs show `401 Unauthorized` or `403 Forbidden`
- Submodule checkout step fails with "repository not found" (misleading error for expired tokens)
- Everything worked yesterday but stopped today

**Phase to address:**
Phase 2 (CI/CD Setup) -- evaluate GitHub App vs PAT during initial token setup. If PAT, add the monitoring workflow immediately.

---

### Pitfall 5: Submission API GITHUB_OWNER Change Breaks OAuth Redirect Flow

**What goes wrong:**
The current `wrangler.toml` has `GITHUB_OWNER = "gitjfmd"` and `GITHUB_REPO = "open-medical-skills"`. Changing `GITHUB_OWNER` to `"Open-Medica"` (the org) means PRs now target a different org. But the GitHub OAuth App is registered under the user account or a different org. The OAuth redirect URI, client ID, and client secret all reference the original registration. If the OAuth App is not re-registered or updated for the Open-Medica org, the entire authenticated submission flow breaks. Users authenticate, but the token they receive does not have permissions to create branches in `Open-Medica/open-medical-skills`.

**Why it happens:**
GitHub OAuth Apps are scoped to the account/org that created them. A user OAuth token from an app registered under `gitjfmd` may not have write access to `Open-Medica/open-medical-skills` unless the user is a member of the org. The GITHUB_TOKEN secret used by the Worker (the PAT for creating PRs) also needs to be issued by an account with push access to the new org repo.

**How to avoid:**
1. Register the OAuth App under the `Open-Medica` organization, not the personal account.
2. Update OAuth redirect URIs for all environments (localhost:4321 for dev, openmedica.us or openmedicalskills.org for prod).
3. The PAT or GitHub App token stored as `GITHUB_TOKEN` in Wrangler secrets must belong to an account with `contents:write` and `pull-requests:write` on `Open-Medica/open-medical-skills`.
4. Test the full flow end-to-end: submit form -> OAuth login -> create PR -> PR appears in Open-Medica org repo.

**Warning signs:**
- OAuth login succeeds but PR creation returns 404 or 403
- Users can authenticate but see "Not Found" when the Worker tries to create a branch
- CORS errors if redirect URI doesn't match the new domain
- Works for org admins but fails for external contributors

**Phase to address:**
Phase 1 (Repo Split) -- OAuth App must be configured for the correct org before the submission API goes live. Otherwise the public-facing form is broken.

---

### Pitfall 6: Branch Protection Status Checks Reference Non-Existent Workflow Names

**What goes wrong:**
Branch protection rules require specific status check names to pass before merging. After the repo split, the workflow files are split between two repos. If branch protection on the public repo requires a status check called "Build Site" (which was the workflow job name in the monorepo), but that workflow now only exists in the private repo, the status check will never pass. PRs to `main` in the public repo become permanently unmergeable.

**Why it happens:**
Status check names in branch protection are string-matched against the `jobs.<job_id>.name` field in GitHub Actions workflows. When workflows are reorganized during a repo split, job names change or move to a different repo. Branch protection rules reference the old names. The mismatch is not detected until someone tries to merge a PR.

**How to avoid:**
1. Before enabling branch protection on either repo, list all workflow job names that will run in that repo. Use those exact names in status check requirements.
2. For the public repo: required checks should be `Validate PR Skill/Plugin YAML`, `Verify PR comes from dev`, `Medical Compliance Checks`.
3. For the private repo: required checks should be `Build Site`, `Deploy to Cloudflare Pages`, type-check, etc.
4. Do NOT copy-paste branch protection rules from the monorepo to both new repos. Each repo gets only the checks that run there.
5. Test by creating a dummy PR in each repo and verifying all required status checks appear and can pass.

**Warning signs:**
- PRs show "Required status check 'X' is expected" but X never appears
- Status checks show as "Pending" forever
- PRs can never be merged even when all visible checks pass

**Phase to address:**
Phase 2 (CI/CD Setup) -- configure branch protection AFTER all workflows are confirmed working in each repo.

---

### Pitfall 7: Detached HEAD in Submodule Prevents Content Updates

**What goes wrong:**
Git submodules are always checked out in detached HEAD state. When the GitHub Actions workflow tries to update the submodule pointer (after receiving `repository_dispatch` from the public repo), running `git submodule update --remote` in the private repo updates the submodule to the latest commit on the public repo's default branch. But if the public repo's default branch is `main` while content PRs merge to `dev` first, the submodule always points to `main` and misses content that is only on `dev`. The website only shows content that has been promoted to `main` in the public repo.

**Why it happens:**
`git submodule update --remote` defaults to tracking the branch configured in `.gitmodules` (which defaults to the remote's HEAD, usually `main`). Developers often forget to configure the tracked branch. Additionally, the detached HEAD means any accidental commits made inside the submodule during CI are lost on the next update.

**How to avoid:**
1. In `.gitmodules`, explicitly set the branch to track: `branch = main`. This is correct for the OMS use case because only content promoted to `main` in the public repo should trigger a site rebuild.
2. The workflow should be: content PR merges to public `dev` (no rebuild), content PR from `dev` to `main` in public repo (triggers rebuild via dispatch).
3. Document this clearly: "Website only reflects content that has been promoted to the public repo's `main` branch."
4. Never make commits inside the submodule directory. All content changes go through PRs to the public repo.

**Warning signs:**
- New skills merged to public `dev` but not showing on website
- `git submodule status` shows a commit hash that doesn't match public repo `main`
- Submodule is "modified" in private repo but nobody changed it

**Phase to address:**
Phase 1 (Repo Split) -- configure `.gitmodules` correctly during initial submodule setup.

---

### Pitfall 8: Content Validation Workflows Reference Wrong File Paths After Split

**What goes wrong:**
The `validate-submission.yml` workflow uses path triggers (`paths: content/skills/**, content/plugins/**`) and inline validation that reads files from those paths. After the split, this workflow lives in the public repo where the paths are correct. But the `compliance-gate.yml` references `content/**`, `skills/**`, and `plugins/**` with `git diff` comparisons against `origin/main`. If the compliance gate workflow is accidentally duplicated in the private repo (where content lives at `content-repo/content/`), all path references break.

**Why it happens:**
During repo splits, developers tend to copy all workflow files to both repos "just in case." Workflows with hardcoded file paths silently fail validation when paths don't match the new repo structure.

**How to avoid:**
1. Map each workflow to exactly one repo during planning:
   - Public repo: `validate-submission.yml`, `compliance-gate.yml`, `branch-guard.yml`
   - Private repo: `deploy.yml`, `submodule-update.yml` (new)
2. Delete workflows that don't belong in each repo.
3. Update `deploy.yml` in the private repo: the content validation step (`find content/skills content/plugins`) must use the submodule path (`find content-repo/content/skills content-repo/content/plugins`).
4. The deploy workflow's python YAML validation also references `content/skills` and `content/plugins` -- update to submodule paths.

**Warning signs:**
- Workflows run but validate zero files (all checks pass vacuously)
- Content validation shows "All content files valid" but there are actually invalid files
- `find` commands in CI return no results

**Phase to address:**
Phase 2 (CI/CD Setup) -- audit every workflow file path reference when assigning workflows to repos.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using PATs instead of GitHub App | 5 minutes to create vs 30 minutes for App setup | Annual token rotation, silent failures on expiration, broader scope than needed | Never for production -- use GitHub App. PAT acceptable for initial testing only. |
| Symlink `content/` -> `content-repo/content/` for local dev | Avoids changing content.config.ts paths, works without submodule initialized | Two code paths to maintain, symlink not portable to Windows, can mask path bugs | MVP only -- should resolve to single canonical path before Phase 3 |
| Hardcoding `GITHUB_OWNER = "Open-Medica"` in wrangler.toml vars | Simple, explicit | Cannot test against personal fork, requires code change to switch orgs | Acceptable if `[env.staging]` section uses personal account for testing |
| In-memory rate limiting in submission Worker | No external dependency, works for MVP | Resets on worker restart, no cross-instance coordination, exploitable during deploys | Only acceptable until KV binding is added (should be Phase 2 or 3) |
| Copying all 49 skill YAML files to new public repo instead of migrating git history | Clean slate, simple process | Lose blame/history for who added each skill, when, and why | Acceptable -- history preserved in private repo. Document this decision. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Actions + Submodule checkout | Using default `GITHUB_TOKEN` which can only access the current repo | Use PAT or GitHub App token via `token: ${{ secrets.CROSS_REPO_PAT }}` with `submodules: 'recursive'` |
| `repository_dispatch` cross-repo | Assuming dispatch works on any branch, not checking if workflow file exists on default branch | Ensure workflow file exists on `main` of target repo. Use `client_payload.ref` to specify which branch to operate on within the workflow. |
| Cloudflare Pages + submodules | Using CF Pages Git integration which cannot authenticate submodule repos | Deploy via GitHub Actions with `wrangler pages deploy dist/` (direct upload). Never use CF Pages Git integration. |
| Octokit PR creation to different org | Using `owner/repo:branch` format for `head` parameter | Use `username:branch` format. Ensure token has write access to target org repo. Test with a non-admin account. |
| GitHub OAuth App + org migration | Keeping OAuth App on personal account when PRs target org repo | Register OAuth App under target org. Update all redirect URIs. Test with external contributor account. |
| Branch protection + status checks | Requiring status checks before any workflow has ever run (check names don't exist yet) | First: push workflows and let them run at least once. Then: configure branch protection with the exact job names from successful runs. |
| `wrangler secret put` across environments | Setting secrets only for default environment, not production | Run `wrangler secret put GITHUB_TOKEN --env production` separately. Verify with `wrangler secret list --env production`. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Submodule update workflow triggers full site rebuild every time | Every content PR merge triggers a 3-5 minute rebuild even for typo fixes | Add content-hash check: only rebuild if submodule pointer actually changed from previous build | Not a scaling issue but a CI cost issue at >10 content PRs/day |
| `git submodule update --init --recursive` in every CI job | Adds 15-30 seconds to every workflow run, clones entire content repo each time | Use shallow clone: `git submodule update --init --depth 1`. Cache the submodule across runs with `actions/cache`. | Noticeable when content repo grows past 1000 files |
| Dispatch-triggered rebuild races with manual pushes | Two workflows run simultaneously: one from dispatch, one from a manual push. Both try to commit submodule updates, one fails with merge conflict. | Use `concurrency` groups in GitHub Actions: `concurrency: { group: submodule-update, cancel-in-progress: true }` | Any time content updates and code changes happen within the same 5-minute window |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing cross-repo PAT with `repo` scope | PAT can access ALL repos the user owns, not just the two OMS repos | Use fine-grained PAT scoped to only `Open-Medica/open-medical-skills` and `gitjfmd/oms-site`. Or use GitHub App with installation-level permissions. |
| Putting `GITHUB_TOKEN` PAT in public repo secrets | Anyone with write access to public repo's Actions can exfiltrate the token via a malicious workflow | Store cross-repo tokens ONLY in the private repo. Public repo workflows should never need to write to the private repo. The dispatch goes public->private, and the private repo's workflow uses its own secrets. |
| Not validating `repository_dispatch` source | Any authenticated user with `repo` scope can send `repository_dispatch` to the private repo, triggering builds | Validate `client_payload.repository` against an allowlist in the workflow. Only accept dispatches from `Open-Medica/open-medical-skills`. |
| OAuth redirect URI mismatch allows token theft | If `OAUTH_REDIRECT_URI` is set to `http://localhost:4321` in production, attacker could intercept tokens | Environment-specific redirect URIs are already in `wrangler.toml` (line 18), but verify `[env.production]` includes `OAUTH_REDIRECT_URI` pointing to production domain. Currently missing from production vars. |
| Secrets from private repo leaked via public PR comments | Compliance gate or deploy workflows might expose internal URLs, tokens, or config in PR comments | Audit all `github-script` steps that post comments. Ensure no `secrets.*` values are interpolated into comment bodies. Use `process.env` only for non-secret values. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Content merged to public `dev` but website doesn't update | Contributors think their skill was accepted but it's not visible. They open issues asking "where is my skill?" | Add a comment to merged PRs explaining: "Your skill will be visible on the website after the next release cycle (dev -> main promotion)." Auto-close the related issue only after main merge + deploy. |
| Submission form creates PR in org repo but user can't see it | If public repo is under `Open-Medica` org, the PR URL in the success message points to a repo the submitter may not follow | Include the full PR URL in the success response. Add a note: "You can track your submission at [PR link]." Ensure public repo is public (not internal). |
| CLI `oms search` returns stale results after repo split | CLI's local index may still reference `gitjfmd/open-medical-skills` instead of `Open-Medica/open-medical-skills` for repository URLs | Update CLI's default API endpoint and fallback index URL. Publish a new CLI version that points to the new org. Backward-compatible: check both old and new URLs. |

## "Looks Done But Isn't" Checklist

- [ ] **Submodule in private repo:** Often missing `.gitmodules` branch tracking config -- verify `git config -f .gitmodules submodule.content-repo.branch` returns `main`
- [ ] **CF Pages deployment:** Often still connected via Git integration in dashboard -- verify CF Pages project settings show "Direct Upload" not "Connected to GitHub repo"
- [ ] **Branch protection on both repos:** Often missing on one repo -- verify `gh api repos/Open-Medica/open-medical-skills/branches/main/protection` and `gh api repos/gitjfmd/oms-site/branches/main/protection` both return 200
- [ ] **Submission API owner change:** Often only changed in `wrangler.toml` but not in secrets -- verify `wrangler secret list` shows `GITHUB_TOKEN` exists and test by submitting a skill
- [ ] **OAuth redirect URI in production:** Often only localhost URI set -- verify `wrangler secret list --env production` and test OAuth flow on production domain
- [ ] **Cross-repo dispatch:** Often workflow exists on a feature branch but not on `main` in private repo -- verify workflow file exists at `main` branch of private repo
- [ ] **Content path in deploy workflow:** Often still references `content/skills/` instead of submodule path -- verify `grep -r "content/skills" .github/workflows/` in private repo shows updated paths
- [ ] **Public repo visibility:** Often repo created as private by default -- verify `gh repo view Open-Medica/open-medical-skills --json visibility` returns `"PUBLIC"`
- [ ] **Status check names in branch protection:** Often reference monorepo job names -- verify by creating test PR and confirming all required checks appear
- [ ] **wrangler.toml production vars:** `ALLOWED_ORIGIN` set to `https://openmedica.us` (line 18) but `OAUTH_REDIRECT_URI` is NOT set for production -- verify both exist in `[env.production]`

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CF Pages submodule clone failure | LOW | Switch to GitHub Actions direct upload (already partially configured). Disconnect Git integration from CF Pages dashboard. |
| PAT expired, all cross-repo broken | LOW | Create new PAT with same scopes, update secrets in both repos, verify all workflows run. Takes 15 minutes but causes downtime. |
| Astro glob paths wrong, empty site deployed | MEDIUM | Revert deploy (CF Pages has rollback). Fix paths in `content.config.ts`. Add build validation step. Redeploy. Site is empty for ~10 minutes. |
| Status checks block all PRs | LOW | Temporarily disable branch protection via `gh api -X DELETE`. Fix workflow names. Re-enable with correct check names. |
| Dispatch not triggering (wrong branch) | LOW | Manually run `gh workflow run submodule-update.yml` on private repo. Cherry-pick workflow file to `main`. Future dispatches work. |
| Submission API creating PRs in wrong repo | MEDIUM | Update `GITHUB_OWNER` in wrangler.toml and redeploy Worker. Close any PRs created in wrong repo. Test with real submission. |
| Content validation passing vacuously (no files found) | HIGH | Audit all merged PRs since the empty-validation started. Manually validate any content that was merged without real validation. Fix paths. This could have let bad content through. |
| OAuth flow broken after org migration | MEDIUM | Register new OAuth App under org, update client ID and secret in Wrangler secrets, update redirect URIs. Users may need to re-authenticate. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CF Pages can't clone private submodules | Phase 1 (Repo Split) | `wrangler pages deploy` works from GitHub Actions; CF Pages dashboard shows "Direct Upload" |
| `repository_dispatch` only fires on default branch | Phase 2 (CI/CD) | Merge content to public `main`, verify private repo workflow triggers within 60 seconds |
| Astro glob paths break after submodule move | Phase 1 (Repo Split) | `pnpm build` in private repo with submodule produces 49+ skill pages in `dist/` |
| PAT expiration kills cross-repo ops | Phase 2 (CI/CD) | GitHub App created and installed on both repos; or PAT with monitoring workflow deployed |
| Submission API GITHUB_OWNER breaks OAuth | Phase 1 (Repo Split) | End-to-end test: submit skill via web form, verify PR appears in `Open-Medica/open-medical-skills` |
| Branch protection references wrong status checks | Phase 2 (CI/CD) | Dummy PR in each repo shows all required checks, all pass, PR can be merged |
| Detached HEAD submodule tracks wrong branch | Phase 1 (Repo Split) | `.gitmodules` has `branch = main`; `git submodule update --remote` pulls latest from public `main` |
| Workflow file paths reference old content locations | Phase 2 (CI/CD) | `grep -r "content/skills" .github/workflows/` in private repo returns only submodule-relative paths |

## Sources

- [Cloudflare Community: Pages build error with submodules](https://community.cloudflare.com/t/pages-build-error-failed-error-occurred-while-updating-repo-submodules/356890) -- Confidence: HIGH
- [GitHub Community: repository_dispatch only triggers default branch](https://github.com/orgs/community/discussions/24657) -- Confidence: HIGH
- [GitHub Community: Checkout private submodules](https://github.com/orgs/community/discussions/25516) -- Confidence: HIGH
- [Micah Henning: Submodule checkout with least privilege](https://www.micah.soy/posts/checkout-submodules-github-actions-least-privilege/) -- Confidence: HIGH
- [OneUptime: Cross-repository workflows](https://oneuptime.com/blog/post/2025-12-20-cross-repository-workflows-github-actions/view) -- Confidence: MEDIUM
- [GitHub Community: Cross-repo PR creation issues](https://github.com/orgs/community/discussions/40034) -- Confidence: HIGH
- [GitHub Docs: repository_dispatch](https://docs.github.com/actions/using-workflows/triggering-a-workflow) -- Confidence: HIGH
- [GitHub Docs: Branch protection REST API](https://docs.github.com/en/rest/branches/branch-protection) -- Confidence: HIGH
- [Astro Docs: Content collections](https://docs.astro.build/en/guides/content-collections/) -- Confidence: HIGH
- [Tim Hutt: Reasons to avoid submodules](https://blog.timhutt.co.uk/against-submodules/) -- Confidence: MEDIUM
- Codebase analysis: `wrangler.toml`, `content.config.ts`, `deploy.yml`, `compliance-gate.yml`, `sync-to-public.sh` -- Confidence: HIGH (direct observation)

---
*Pitfalls research for: OMS monorepo split with git submodules and cross-repo CI/CD*
*Researched: 2026-03-22*

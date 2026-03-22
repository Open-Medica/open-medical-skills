# Phase 1: Public Repository Creation - Research

**Researched:** 2026-03-22
**Domain:** GitHub repository management, git operations, content migration
**Confidence:** HIGH

## Summary

Phase 1 is about **completing** the public repo `Open-Medica/open-medical-skills`, not creating it from scratch. The repo already exists as a public repository under the Open-Medica GitHub organization with 49 skill source directories, 5 plugin source directories, `.github/` templates, `README.md`, `CONTRIBUTING.md`, `LICENSE`, and `public/`. However, it is missing four critical content groups: `content/` (49 skill YAMLs + 5 plugin YAMLs), `cli/` (the Node.js CLI tool), `logo/` (brand SVG assets), and public-safe `scripts/` (CLI index generator, dedup checker). It also lacks a `dev` branch and has a license detection issue (GitHub shows "NOASSERTION" instead of "MIT").

The technical approach is straightforward: clone the public repo, copy missing files from the local private repo, push to `main`, fix the license detection, and create a `dev` branch from `main`. All operations use standard `git` and `gh` CLI commands. The user has admin access to the repo. The main risk is accidentally pushing private/infrastructure files (secrets, vault policies, internal scripts) to the public repo.

**Primary recommendation:** Clone `Open-Medica/open-medical-skills` to a temporary worktree, copy the four missing content groups from the local private repo, fix the LICENSE file to use standard MIT text (move medical disclaimer to DISCLAIMER.md which already exists), push to `main`, then create `dev` branch from `main` using the GitHub API.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REPO-01 | Public repo `Open-Medica/open-medical-skills` created with MIT license | Repo EXISTS and is PUBLIC. License file contains MIT text but GitHub detects "NOASSERTION" due to appended medical disclaimer. Fix: separate LICENSE (pure MIT) from DISCLAIMER.md (medical text). |
| REPO-02 | Public repo contains content YAML (skills + plugins), skill/plugin source dirs, CLI, docs, logo, scripts | Skill/plugin source dirs present (49+5). MISSING: `content/` (49 skill YAMLs + 5 plugin YAMLs), `cli/` (Node.js CLI), `logo/` (2 SVGs), `scripts/` (public-safe subset), `docs/` (3 markdown files). All exist locally and are ready to copy. |
| REPO-04 | Public repo has `dev` branch created from `main` | Currently only `main` branch exists. Create `dev` from `main` via `gh api` or `git push origin main:dev`. |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `git` | 2.x | Clone, commit, push, branch operations | Standard VCS |
| `gh` | 2.x | GitHub API operations (repo info, branch creation, verification) | Official GitHub CLI |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `rsync` or `cp -r` | Copy content directories from private to public repo clone | During content population step |
| `gh api` | Create `dev` branch via refs API, verify repo state | Branch creation, verification steps |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local clone + push | GitHub API file creation (`gh api repos/.../contents`) | API is per-file, impractical for 100+ files. Clone+push is faster. |
| `git push origin main:dev` | `gh api /repos/.../git/refs` | Both work. `git push` is simpler if you have a local clone. |

**No npm dependencies needed for this phase.** All operations are git/shell.

## Architecture Patterns

### Recommended Approach: Worktree Clone Strategy

```
1. Clone public repo to temporary worktree
2. Copy missing content from private repo
3. Commit and push to main
4. Create dev branch from main
5. Verify all success criteria
```

### Pattern 1: Content Filtering (What Goes Public)

**What:** Not all files in the private repo belong in the public repo. Scripts containing hardcoded paths, vault policies, and secrets infrastructure must stay private.

**When to use:** Every time content is copied from private to public.

**Public-safe scripts (copy these):**
| Script | Purpose | Private Content? |
|--------|---------|-----------------|
| `generate-cli-index.js` | Generates CLI skill index from YAML | No |
| `dedup-check.js` | CI duplicate detection | No |
| `generate-skill-dirs.py` | Generate skill/plugin dirs from YAML | No |
| `clone-third-party-skills.sh` | Clone skills from 3rd party repos | No |

**Private-only scripts (DO NOT copy):**
| Script | Reason |
|--------|--------|
| `sync-to-public.sh` | Contains hardcoded private paths, will be retired (REPO-07) |
| `secrets-sync.sh` | 168 references to secrets/vault/tokens |
| `secrets-manifest.json` | Secrets inventory |
| `vault-policies/` | HashiCorp Vault policies |
| `extract_and_push.py` | Contains private repo references |
| `generate-claude-md.sh` | Internal orchestration script |
| `worktree-dev.sh` | Internal development script |
| `embed-oms-skills.py` | Embedding pipeline (internal infra) |
| `bulk-dedup-report.py` | Internal bulk reporting (uses search API) |

### Pattern 2: LICENSE File Fix

**What:** GitHub's license detection (powered by `licensee` gem) requires the LICENSE file to match a known SPDX template with high confidence. The current file appends a "MEDICAL DISCLAIMER" paragraph after the MIT text, which causes detection to fail (`NOASSERTION`).

**Fix:** Remove the medical disclaimer from `LICENSE`. It already exists in `DISCLAIMER.md` at the repo root (which is the correct location). The LICENSE file should contain ONLY the standard MIT License text.

**Source:** [licensee/licensee issue #392](https://github.com/licensee/licensee/issues/392), [GitHub Docs: Licensing a repository](https://docs.github.com/articles/licensing-a-repository)

### Pattern 3: Branch Creation via API

**What:** Create `dev` branch from `main` using the Git refs API.

**Command:**
```bash
# Get main branch SHA
SHA=$(gh api repos/Open-Medica/open-medical-skills/git/ref/heads/main --jq '.object.sha')

# Create dev branch pointing to same commit
gh api --method POST repos/Open-Medica/open-medical-skills/git/refs \
  -f "ref=refs/heads/dev" \
  -f "sha=$SHA"
```

**Alternative (if local clone exists):**
```bash
git push origin main:dev
```

### Anti-Patterns to Avoid
- **Pushing the entire private repo tree:** Only copy the specific directories/files needed. Never `cp -r .` or `rsync` without exclusion lists.
- **Using `git filter-repo` for history migration:** The roadmap explicitly marks this as out of scope. Fresh commits in public repo, history preserved in private.
- **Committing node_modules:** The `cli/node_modules/` directory exists locally. Ensure `.gitignore` excludes it before pushing.
- **Pushing `.planning/`, `CLAUDE.local.md`, `.internal/`:** These are private orchestration artifacts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Branch creation on remote | Custom API scripts | `gh api` or `git push origin main:dev` | One-liner, no error handling needed |
| File content verification | Manual `curl` checks | `gh api repos/.../contents/<path>` | Handles auth, pagination, JSON parsing |
| License detection fix | Custom SPDX tooling | Remove disclaimer from LICENSE file | GitHub re-scans automatically on next push |

## Common Pitfalls

### Pitfall 1: Accidentally Pushing Private Content to Public Repo
**What goes wrong:** Scripts with hardcoded private paths (`/home/jfmd/...`), vault policies, secrets manifests, or internal orchestration files get pushed to the public repo.
**Why it happens:** Bulk copy operations (`rsync -av --delete`, `cp -r scripts/`) include everything without filtering.
**How to avoid:** Copy only the explicit allowlist of public-safe files. Never copy `scripts/` as a whole directory -- copy individual files. Review `git diff --stat` before pushing.
**Warning signs:** `git diff --stat` shows files like `secrets-sync.sh`, `vault-policies/`, `CLAUDE.local.md`, `.internal/`.

### Pitfall 2: CLI node_modules Pushed to Public Repo
**What goes wrong:** The `cli/node_modules/` directory (with `commander`, `chalk`, `js-yaml` packages) gets committed and pushed. This bloats the repo and is bad practice.
**Why it happens:** The public repo may not have a `.gitignore` yet (community standards are Phase 2), or the existing one does not cover `cli/node_modules/`.
**How to avoid:** Check that `.gitignore` includes `node_modules/` before staging `cli/`. Or manually exclude: `git add cli/ -- ':!cli/node_modules'`.
**Warning signs:** `git status` shows dozens of files under `cli/node_modules/`.

### Pitfall 3: LICENSE Detection Still Shows NOASSERTION After Fix
**What goes wrong:** After editing the LICENSE file, GitHub still shows "Other" or "NOASSERTION" for the license.
**Why it happens:** GitHub's license detection caches results. It re-scans on push, but the scan is async. Also, even small deviations from the template (extra blank lines, different copyright format) can cause detection failure.
**How to avoid:** Use the exact MIT License template from [choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/). Only change the year and copyright holder name. No other text.
**Warning signs:** `gh api repos/Open-Medica/open-medical-skills --jq '.license.spdx_id'` still returns `"NOASSERTION"` after push. Wait a few minutes and re-check; if still broken, compare LICENSE byte-for-byte against the template.

### Pitfall 4: `docs/` Directory Contains Website-Specific Content
**What goes wrong:** `docs/` files reference website features, internal APIs, or deployment details that don't belong in the public repo.
**Why it happens:** Documentation was written for the monorepo context where website and content coexisted.
**How to avoid:** Review `docs/CATEGORY-GUIDE.md`, `docs/CONTRIBUTING.md`, and `docs/SKILL-FORMAT.md` before copying. These three files are content-focused guides and are public-safe. But verify no internal URLs or infrastructure references leaked in.
**Warning signs:** `grep -r "localhost\|100\.\|oms-site\|wrangler\|cloudflare" docs/` returns matches.

## Code Examples

### Clone and Populate Public Repo
```bash
# Clone public repo to worktree
git clone https://github.com/Open-Medica/open-medical-skills.git /tmp/oms-public
cd /tmp/oms-public

# Copy missing directories from private repo
PRIVATE="/home/jfmd/.jfmd/projects/INTELMEDICA-COMP/open-medical-skills"

# Content YAMLs (49 skills + 5 plugins)
cp -r "$PRIVATE/content/" ./content/

# CLI tool (exclude node_modules)
rsync -av --exclude='node_modules' "$PRIVATE/cli/" ./cli/

# Logo assets
cp -r "$PRIVATE/logo/" ./logo/

# Public-safe scripts only
mkdir -p scripts/
cp "$PRIVATE/scripts/generate-cli-index.js" scripts/
cp "$PRIVATE/scripts/dedup-check.js" scripts/
cp "$PRIVATE/scripts/generate-skill-dirs.py" scripts/
cp "$PRIVATE/scripts/clone-third-party-skills.sh" scripts/

# Documentation
cp -r "$PRIVATE/docs/" ./docs/

# Verify no private content leaked
grep -r "/home/jfmd\|vault\|secret\|CLAUDE.local" . --include="*.sh" --include="*.js" --include="*.py" --include="*.md" || echo "Clean - no private content found"

# Review and commit
git add -A
git diff --stat --staged  # Review what's being committed
git commit -m "feat: add content YAMLs, CLI, logo, scripts, and documentation"
git push origin main
```

### Fix LICENSE Detection
```bash
# Write clean MIT license (no medical disclaimer appended)
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 IntelMedica.ai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

git add LICENSE
git commit -m "fix: use standard MIT license text for GitHub detection"
git push origin main
```

### Create dev Branch
```bash
# Option A: From local clone
git push origin main:dev

# Option B: Via API (no local clone needed)
SHA=$(gh api repos/Open-Medica/open-medical-skills/git/ref/heads/main --jq '.object.sha')
gh api --method POST repos/Open-Medica/open-medical-skills/git/refs \
  -f "ref=refs/heads/dev" \
  -f "sha=$SHA"
```

### Verification Commands
```bash
# REPO-01: Verify repo is public with MIT license
gh api repos/Open-Medica/open-medical-skills --jq '{visibility: .visibility, license: .license.spdx_id}'
# Expected: {"visibility":"public","license":"MIT"}

# REPO-02: Verify all content exists
gh api repos/Open-Medica/open-medical-skills/contents/content/skills --jq '. | length'
# Expected: 49
gh api repos/Open-Medica/open-medical-skills/contents/content/plugins --jq '. | length'
# Expected: 5
gh api repos/Open-Medica/open-medical-skills/contents/cli --jq '.[].name'
# Expected: bin, lib, data, package.json, package-lock.json
gh api repos/Open-Medica/open-medical-skills/contents/logo --jq '.[].name'
# Expected: oms-icon.svg, oms-logo.svg
gh api repos/Open-Medica/open-medical-skills/contents/scripts --jq '.[].name'
# Expected: generate-cli-index.js, dedup-check.js, generate-skill-dirs.py, clone-third-party-skills.sh
gh api repos/Open-Medica/open-medical-skills/contents/docs --jq '.[].name'
# Expected: CATEGORY-GUIDE.md, CONTRIBUTING.md, SKILL-FORMAT.md

# REPO-04: Verify dev branch exists
gh api repos/Open-Medica/open-medical-skills/branches --jq '.[].name'
# Expected: main, dev
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `sync-to-public.sh` manual sync | Git submodule + CI dispatch (coming in Phase 3) | Phase 1 starts transition | sync script retired in Phase 10 |
| License + disclaimer in one file | Separate LICENSE and DISCLAIMER.md | This phase | GitHub detects MIT correctly |
| Single branch (main only) | Two-branch model (main + dev) | This phase | Enables PR-based workflow for Phase 2+ |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Shell commands (`gh api`, `git`) -- no test framework needed |
| Config file | None -- infrastructure phase, not code |
| Quick run command | `gh api repos/Open-Medica/open-medical-skills --jq '.visibility'` |
| Full suite command | See verification commands in Code Examples section |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REPO-01 | Repo is public with MIT license | smoke | `gh api repos/Open-Medica/open-medical-skills --jq '{v:.visibility,l:.license.spdx_id}'` | N/A (CLI) |
| REPO-02 | All content groups present | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/content/skills --jq '. \| length'` (expect 49) | N/A (CLI) |
| REPO-02 | CLI directory present | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/cli --jq '. \| length'` (expect >0) | N/A (CLI) |
| REPO-02 | Logo directory present | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/logo --jq '. \| length'` (expect 2) | N/A (CLI) |
| REPO-02 | Scripts directory present | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/scripts --jq '. \| length'` (expect >=2) | N/A (CLI) |
| REPO-02 | Docs directory present | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/docs --jq '. \| length'` (expect 3) | N/A (CLI) |
| REPO-04 | dev branch exists | smoke | `gh api repos/Open-Medica/open-medical-skills/branches/dev --jq '.name'` (expect "dev") | N/A (CLI) |

### Sampling Rate
- **Per task commit:** Run relevant verification command after each push
- **Per wave merge:** Run all verification commands
- **Phase gate:** All 7 verification commands return expected values

### Wave 0 Gaps
None -- this phase uses `gh` CLI for verification, no test framework needed. All tests are smoke tests against live GitHub API.

## Current Repo State (Verified 2026-03-22)

### What EXISTS in `Open-Medica/open-medical-skills`
| Item | Status | Count |
|------|--------|-------|
| Repository | PUBLIC, under Open-Medica org | 1 |
| Default branch | `main` | 1 |
| `skills/` source dirs | Present | 49 |
| `plugins/` source dirs | Present | 5 |
| `.github/workflows/validate-submission.yml` | Present | 1 |
| `.github/ISSUE_TEMPLATE/` | Present (submit-skill.yml, submit-plugin.yml) | 2 |
| `.github/PULL_REQUEST_TEMPLATE/skill-submission.md` | Present | 1 |
| `README.md` | Present | 1 |
| `CONTRIBUTING.md` | Present | 1 |
| `LICENSE` | Present (MIT text + medical disclaimer) | 1 |
| `public/` (favicon, logo SVG) | Present | 2 files |

### What is MISSING
| Item | Local Path | Files to Copy |
|------|-----------|---------------|
| `content/skills/` | `content/skills/*.yaml` | 49 YAML files |
| `content/plugins/` | `content/plugins/*.yaml` | 5 YAML files |
| `cli/` | `cli/` (exclude node_modules) | bin/, lib/, data/, package.json, package-lock.json |
| `logo/` | `logo/` | oms-icon.svg, oms-logo.svg |
| `scripts/` (public-safe only) | `scripts/` | generate-cli-index.js, dedup-check.js, generate-skill-dirs.py, clone-third-party-skills.sh |
| `docs/` | `docs/` | CATEGORY-GUIDE.md, CONTRIBUTING.md, SKILL-FORMAT.md |
| `dev` branch | N/A | Create from main |

### What NEEDS FIXING
| Item | Issue | Fix |
|------|-------|-----|
| LICENSE detection | Shows "NOASSERTION" due to appended medical disclaimer | Remove disclaimer from LICENSE; it already exists in DISCLAIMER.md |

### Permissions Verified
- User `gitjfmd` has admin access to `Open-Medica/open-medical-skills`
- Org members: `gitjfmd`, `devsecsols`

## Open Questions

1. **DISCLAIMER.md already in public repo?**
   - What we know: `DISCLAIMER.md` exists locally. The sync-to-public.sh script was copying it. Need to verify if it's already in the remote.
   - What's unclear: Whether it was part of the initial transfer.
   - Recommendation: Check via `gh api repos/Open-Medica/open-medical-skills/contents/DISCLAIMER.md`. If missing, include it in the content push.

2. **Should `docs/CONTRIBUTING.md` be duplicated at root?**
   - What we know: `CONTRIBUTING.md` already exists at root. `docs/CONTRIBUTING.md` is the source. The sync script was copying `docs/CONTRIBUTING.md` to root `CONTRIBUTING.md`.
   - What's unclear: Whether these are identical or diverged.
   - Recommendation: Push `docs/` as-is. Root `CONTRIBUTING.md` may get updated in Phase 9 (Documentation). Don't duplicate effort now.

3. **Which `scripts/` are truly public-safe?**
   - What we know: `generate-cli-index.js` and `dedup-check.js` are explicitly mentioned in requirements. `generate-skill-dirs.py` and `clone-third-party-skills.sh` are content-focused utilities with no private content.
   - What's unclear: Whether `bulk-dedup-report.py` and `embed-oms-skills.py` should be public (they reference the search API but contain no secrets).
   - Recommendation: Start with the confirmed-safe 4 scripts. Add more in later phases if needed. Minimize public attack surface.

## Sources

### Primary (HIGH confidence)
- **GitHub API verification** -- direct `gh api` calls confirming repo state, branch list, contents, permissions
- **Local filesystem verification** -- `ls`, `wc`, `grep` confirming file counts and content safety
- **GitHub Docs: Licensing a repository** -- https://docs.github.com/articles/licensing-a-repository
- **licensee/licensee issues** -- https://github.com/licensee/licensee/issues/392 (license detection with additional text)

### Secondary (MEDIUM confidence)
- **GitHub Community: license detection** -- https://github.com/orgs/community/discussions/81440
- **GitHub CLI docs** -- https://cli.github.com/manual/

### Tertiary (LOW confidence)
- None -- all findings verified against live repo state

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all tools are standard git/gh CLI, verified working
- Architecture: HIGH - clone-copy-push is the simplest possible pattern for this task
- Pitfalls: HIGH - verified against actual repo state; private content filtering confirmed by grep
- Current state: HIGH - every claim verified via live `gh api` calls

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable -- repo state changes slowly)

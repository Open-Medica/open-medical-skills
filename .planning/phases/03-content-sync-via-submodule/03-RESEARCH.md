# Phase 3: Content Sync via Submodule - Research

**Researched:** 2026-03-24
**Domain:** Git submodules, Astro 5 Content Layer glob loader, post-build validation
**Confidence:** HIGH

## Summary

Phase 3 wires the private repo (`gitjfmd/oms-site`) to consume public content (`Open-Medica/open-medical-skills`) through a git submodule at `content-repo/`. The technical approach is well-defined: add the submodule tracking `main`, update two glob `base` paths in `content.config.ts`, update one path in `generate-cli-index.js`, remove redundant local content directories, create a post-build validation script, and verify both `pnpm build` and `pnpm dev` work.

The Astro 5 glob loader explicitly supports loading content "from anywhere on the filesystem" via its `base` parameter, which accepts any relative path from the project root. Changing `base: './content/skills'` to `base: './content-repo/content/skills'` is the only code change needed to redirect content loading. The Zod schemas remain identical. No symlinks or Vite `preserveSymlinks` configuration is needed when using a direct path -- symlinks are only needed if you create link aliases to content directories, which is unnecessary here.

The primary risk is Astro's glob loader silently returning empty collections when a path is wrong (no error, just zero results). The post-build validation script is the critical safety net: it counts HTML output directories in `dist/skills/` and `dist/plugins/` and fails if counts do not match expectations (49 skills, 5 plugins).

**Primary recommendation:** Work in the private repo `gitjfmd/oms-site`. Add the submodule, update 3 file paths, remove 3 redundant directories, create a validation script, verify build and dev server, then merge to `dev`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Submodule path is `content-repo/` (locked in roadmap success criteria)
- D-02: Submodule URL is `https://github.com/Open-Medica/open-medical-skills.git`
- D-03: Submodule tracks `main` branch (stable, physician-approved content only)
- D-04: Add submodule via `git submodule add -b main <url> content-repo`
- D-05: `content.config.ts` line 5: `base: './content/skills'` -> `base: './content-repo/content/skills'`
- D-06: `content.config.ts` line 60: `base: './content/plugins'` -> `base: './content-repo/content/plugins'`
- D-07: `scripts/generate-cli-index.js` line 6: update path if it reads from `content/skills/` directly
- D-08: `workers/submission-api/src/index.ts` line 293: keep as-is (references public repo path, not local filesystem)
- D-09: `submit.astro` and `contribute.astro` hardcoded `content/skills/` strings are UI text (keep as-is)
- D-10: The private repo IS the existing `gitjfmd/oms-site` (already contains Astro source, React components, CF Workers)
- D-11: After adding the submodule, remove local `content/` directory (content now comes from submodule)
- D-12: Remove local `skills/` and `plugins/` source dirs (they live in the public repo now)
- D-13: Keep `cli/` locally for now
- D-14: Create a post-build validation script that counts HTML output files
- D-15: Expected counts: 49 skill pages + 5 plugin pages = 54 content pages minimum
- D-16: Script runs after `pnpm build` and exits non-zero if counts don't match
- D-17: Configure submodule on a feature branch, test build, then merge to `dev`
- D-18: The `dev` branch must build cleanly with the submodule before this phase is complete

### Claude's Discretion
- Post-build validation script implementation details (shell script vs node script)
- Whether to use symlinks as a compatibility layer during transition
- Exact git commands for submodule initialization
- How to handle the `skills/` and `plugins/` source directories (they contain SKILL.md files referenced by some pages)

### Deferred Ideas (OUT OF SCOPE)
- `repository_dispatch` on public push to trigger private rebuild -- Phase 5/6
- `update-content.yml` receiver workflow -- Phase 6 (SCI-08)
- CI `submodules: recursive` checkout -- Phase 6
- Removing `scripts/sync-to-public.sh` -- Phase 10
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SYNC-01 | Private repo has public repo as git submodule at `content-repo/` | `git submodule add -b main https://github.com/Open-Medica/open-medical-skills.git content-repo` -- creates `.gitmodules` and clones content. Verified via git docs. |
| SYNC-02 | `content.config.ts` glob base paths updated to `./content-repo/content/skills` and `./content-repo/content/plugins` | Astro glob loader `base` parameter accepts any relative path from project root. Change 2 lines in `content.config.ts`. Zod schemas unchanged. |
| SYNC-03 | `pnpm build` succeeds in private repo with content from submodule (zero missing pages) | Build outputs to `dist/skills/[slug]/index.html` and `dist/plugins/[slug]/index.html`. Post-build validation counts these directories. |
| SYNC-04 | `pnpm dev` serves all pages correctly with submodule content | Astro dev server resolves glob base paths at startup. Content from `content-repo/content/` will be loaded. May need dev server restart after submodule updates. |
| SYNC-07 | Post-build validation counts output HTML files to catch silent empty collections | Shell script counts directories in `dist/skills/` and `dist/plugins/`, compares to expected 49 and 5. Exits non-zero on mismatch. |
| REPO-03 | Private repo contains Astro source, React components, CF Workers, deployment config | `gitjfmd/oms-site` already exists as a private repo with all infrastructure. This phase adds the submodule and removes redundant content. |
| REPO-05 | Private repo has `dev` branch with submodule configured | Work on feature branch, merge to `dev` after validation. `dev` branch already exists in `gitjfmd/oms-site`. |
</phase_requirements>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `git` | 2.x | Submodule add, init, update | Standard VCS, submodule is a native git feature |
| `gh` | 2.x | Private repo operations, PR creation | Official GitHub CLI |
| Astro glob loader | 5.18.0 (built-in) | Content collection loading from submodule path | Already in use, only `base` path changes |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `bash` | Post-build validation script | After `pnpm build` to count output pages |
| `pnpm` | 10.29.3 | Build and dev server commands | Already in use |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Git submodule | npm package of content | Submodule is simpler, no publish step, locked in roadmap |
| Shell validation script | Node.js validation script | Shell is simpler for file counting, no dependencies. Node would allow import of expected counts from content.config.ts but is overkill. |
| Direct path in glob | Symlinks to content dirs | Direct path works with Astro glob loader. Symlinks add complexity and require Vite `preserveSymlinks` config. Not recommended. |

**No new npm dependencies needed for this phase.**

## Architecture Patterns

### Recommended Project Structure (After Phase 3)

```
gitjfmd/oms-site/                    # Private repo
├── content-repo/                    # Git submodule -> Open-Medica/open-medical-skills
│   ├── content/
│   │   ├── skills/                  # 49 YAML files (loaded by Astro)
│   │   └── plugins/                 # 5 YAML files (loaded by Astro)
│   ├── skills/                      # 49 source dirs with SKILL.md
│   ├── plugins/                     # 5 source dirs with full code
│   ├── cli/                         # CLI tool
│   ├── scripts/                     # Public scripts
│   └── ...                          # Other public repo content
├── src/                             # Website source (unchanged)
│   ├── content.config.ts            # Updated base paths only
│   ├── components/
│   ├── pages/
│   └── ...
├── workers/                         # CF Workers (unchanged)
├── scripts/
│   └── validate-build.sh            # NEW: post-build validation
├── cli/                             # Kept locally (D-13)
├── .gitmodules                      # NEW: submodule config
├── astro.config.mjs                 # Unchanged
└── package.json                     # Unchanged
```

**Removed directories** (content now comes from submodule):
- `content/` -- YAML skill/plugin definitions
- `skills/` -- Skill source directories with SKILL.md files
- `plugins/` -- Plugin source directories with full code

### Pattern 1: Git Submodule Configuration

**What:** Add the public repo as a submodule tracking `main`.

**When to use:** One-time setup during this phase.

**Implementation:**
```bash
# In the private repo working directory
git submodule add -b main https://github.com/Open-Medica/open-medical-skills.git content-repo
```

**Resulting `.gitmodules`:**
```ini
[submodule "content-repo"]
	path = content-repo
	url = https://github.com/Open-Medica/open-medical-skills.git
	branch = main
```

**After cloning (for other developers or CI):**
```bash
git clone https://github.com/gitjfmd/oms-site.git
cd oms-site
git submodule update --init --recursive
```

### Pattern 2: Content Path Update in content.config.ts

**What:** Change the glob loader `base` parameter from local paths to submodule paths.

**Exactly 2 lines change:**
```typescript
// Line 5: BEFORE
loader: glob({ pattern: '**/*.{yaml,yml}', base: './content/skills' }),
// Line 5: AFTER
loader: glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/skills' }),

// Line 60: BEFORE
loader: glob({ pattern: '**/*.{yaml,yml}', base: './content/plugins' }),
// Line 60: AFTER
loader: glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/plugins' }),
```

**Source:** [Astro Content Loader API Reference](https://docs.astro.build/en/reference/content-loader-reference/) -- glob loader `base` is "a relative path or URL to the directory from which to resolve the pattern."

### Pattern 3: Script Path Update in generate-cli-index.js

**What:** Update the `SKILLS_DIR` constant to point to the submodule content path.

**1 line change:**
```javascript
// Line 20: BEFORE
const SKILLS_DIR = join(ROOT, 'content', 'skills');
// Line 20: AFTER
const SKILLS_DIR = join(ROOT, 'content-repo', 'content', 'skills');
```

### Pattern 4: Post-Build Validation Script

**What:** A shell script that counts built HTML output pages and fails if counts are wrong.

**Recommended: Shell script** (simpler, no dependencies, runs in any CI environment).

```bash
#!/usr/bin/env bash
# scripts/validate-build.sh
# Validates that Astro build produced all expected content pages.
# Exit 1 if any count is wrong -- catches silent empty collections.

set -euo pipefail

DIST_DIR="${1:-dist}"
EXPECTED_SKILLS=49
EXPECTED_PLUGINS=5

# Count directories (each skill/plugin gets its own dir with index.html)
# Exclude index.html which is the listing page
skill_count=$(find "$DIST_DIR/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
plugin_count=$(find "$DIST_DIR/plugins" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)

echo "Build validation:"
echo "  Skills:  $skill_count / $EXPECTED_SKILLS"
echo "  Plugins: $plugin_count / $EXPECTED_PLUGINS"

errors=0

if [ "$skill_count" -lt "$EXPECTED_SKILLS" ]; then
  echo "ERROR: Expected at least $EXPECTED_SKILLS skill pages, found $skill_count"
  errors=$((errors + 1))
fi

if [ "$plugin_count" -lt "$EXPECTED_PLUGINS" ]; then
  echo "ERROR: Expected at least $EXPECTED_PLUGINS plugin pages, found $plugin_count"
  errors=$((errors + 1))
fi

if [ "$errors" -gt 0 ]; then
  echo "FAILED: $errors validation errors"
  exit 1
fi

echo "PASSED: All content pages present"
```

### Pattern 5: Submodule Update Workflow

**What:** How to update the submodule pointer when public repo has new content.

**Manual update (this phase):**
```bash
cd content-repo
git pull origin main
cd ..
git add content-repo
git commit -m "chore: update content submodule to latest"
```

**Automated update (Phase 6, deferred):**
```bash
git submodule update --remote content-repo
git add content-repo
git commit -m "chore: auto-update content submodule"
```

### Anti-Patterns to Avoid

- **Using symlinks when direct paths work:** The glob loader accepts `./content-repo/content/skills` directly. Adding symlinks (`ln -s content-repo/content/skills content/skills`) creates maintenance burden and requires Vite `preserveSymlinks: true`. Do not use symlinks.

- **Forgetting to remove local content directories:** If both `content/` and `content-repo/content/` exist, Astro will read from whichever path `content.config.ts` points to. The local `content/` will be stale and confusing. Remove it after submodule is working.

- **Removing `cli/` from the private repo prematurely:** D-13 says keep it. The private repo's `package.json` has a `generate-cli-index` script that runs locally. The CLI needs the skills content which now comes from the submodule.

- **Changing `base` in `astro.config.mjs`:** The `base: '/open-medical-skills'` setting is for URL path prefixing. It does NOT affect the output directory structure. Do not confuse it with the glob loader's `base` parameter.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Content path resolution | Custom Vite plugin for path aliasing | Change glob `base` parameter directly | Astro's glob loader already supports arbitrary paths |
| Submodule management | Custom shell scripts for content sync | `git submodule` commands | Native git feature, well-understood by CI systems |
| Build output counting | Complex AST parsing of Astro pages | `find` + `wc -l` in shell script | Counting directories is trivial, no framework needed |
| Symlink compatibility layer | `ln -s` with Vite config | Direct path in glob base | Symlinks add complexity; direct paths work |

## Common Pitfalls

### Pitfall 1: Glob Loader Silently Returns Empty Collections

**What goes wrong:** After changing the `base` path, Astro builds successfully but with 0 skill pages and 0 plugin pages. No error is thrown. The site loads but has no content.

**Why it happens:** The Astro glob loader does not throw an error when the base path does not exist or contains no matching files. It simply returns an empty collection.

**How to avoid:** The post-build validation script (SYNC-07) catches this. Run `scripts/validate-build.sh` after every `pnpm build`. In CI (Phase 6), this becomes a required check.

**Warning signs:** Build log shows "0 pages" or unexpectedly fast build time. Homepage renders but shows no skills.

### Pitfall 2: Submodule Not Initialized After Clone

**What goes wrong:** A developer clones the private repo and runs `pnpm build`. The `content-repo/` directory is empty. Build fails or produces 0 content pages.

**Why it happens:** `git clone` does not automatically initialize submodules. Developers must run `git submodule update --init --recursive` or use `git clone --recurse-submodules`.

**How to avoid:** Document the setup steps in README (Phase 9). Add a pre-build check that verifies `content-repo/content/skills/` exists and is non-empty. In CI (Phase 6), use `actions/checkout` with `submodules: recursive`.

**Warning signs:** `content-repo/` directory exists but is empty. `git submodule status` shows a `-` prefix (uninitialized).

### Pitfall 3: Submodule Detached HEAD Confusion

**What goes wrong:** After `git submodule update`, the submodule is in a detached HEAD state. Developers try to make changes inside `content-repo/` and lose commits.

**Why it happens:** Submodules always check out a specific commit (pinned in the superproject), not a branch. Even when tracking a branch, `update` checks out the commit at detached HEAD.

**How to avoid:** Never edit content inside `content-repo/` in the private repo. All content changes go to the public repo directly. The submodule is read-only in the private repo context.

**Warning signs:** `git status` inside `content-repo/` shows "HEAD detached at <sha>".

### Pitfall 4: `generate-cli-index.js` Path Not Updated

**What goes wrong:** The `pnpm generate-cli-index` script fails or generates an empty index because it still reads from `content/skills/` which has been removed.

**Why it happens:** The script constructs `SKILLS_DIR` as `join(ROOT, 'content', 'skills')` (line 20). After removing the local `content/` directory, this path no longer exists.

**How to avoid:** Update line 20 to `join(ROOT, 'content-repo', 'content', 'skills')`. Test by running `pnpm generate-cli-index` after the path change.

**Warning signs:** Script outputs "Error: Skills directory not found at ..." or generates `cli/data/skills-index.json` with 0 entries.

### Pitfall 5: `skills/` Source Directories Referenced by Components

**What goes wrong:** After removing local `skills/` and `plugins/` directories, some component generates broken links or missing content.

**Why it happens:** The `skill-assembler.ts` generates install commands that reference `skills/${metadata.name}` in the public repo URL. The `contribute.astro` page tells users to "Create a matching directory in `skills/` with a `SKILL.md` file."

**How to avoid:** These are all URL references to the public repo (e.g., `https://github.com/gitjfmd/open-medical-skills/tree/main/skills/${name}`), NOT local filesystem references. They will still work after removing local directories. The content for Astro pages comes only from `content/skills/*.yaml` via the glob loader, not from the `skills/` source directories.

**Verification:** After removing `skills/` and `plugins/`, run `pnpm build` and check that all 49 skill pages and 5 plugin pages render correctly. The SKILL.md content is embedded in the YAML files via the `skill_md` field, not read from the filesystem.

### Pitfall 6: Build Output Path Assumption Wrong

**What goes wrong:** The post-build validation script looks for pages at `dist/open-medical-skills/skills/` but they are actually at `dist/skills/`.

**Why it happens:** The `astro.config.mjs` has `base: '/open-medical-skills'` which is often assumed to affect the output directory structure. It does NOT. The `base` config only affects URL prefixing in generated HTML (href attributes, asset paths). The output directory structure is always `dist/[page-path]/index.html`.

**How to avoid:** Validate against `dist/skills/` and `dist/plugins/`, not `dist/open-medical-skills/skills/`.

**Verification:** Current build output confirmed: `dist/skills/` contains 49 directories + `index.html`, `dist/plugins/` contains 5 directories + `index.html`.

## Code Examples

### content.config.ts (Full Updated File)

```typescript
// Source: Current file with updated base paths
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const skills = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/skills' }),
  schema: z.object({
    // ... existing schema unchanged ...
  }),
});

const plugins = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content-repo/content/plugins' }),
  schema: z.object({
    // ... existing schema unchanged ...
  }),
});

export const collections = { skills, plugins };
```

### generate-cli-index.js (Updated Path)

```javascript
// Line 20: Updated path
const SKILLS_DIR = join(ROOT, 'content-repo', 'content', 'skills');
```

### .gitmodules (Expected Content)

```ini
[submodule "content-repo"]
	path = content-repo
	url = https://github.com/Open-Medica/open-medical-skills.git
	branch = main
```

### Submodule Setup Commands

```bash
# 1. Add submodule tracking main branch
git submodule add -b main https://github.com/Open-Medica/open-medical-skills.git content-repo

# 2. Verify submodule was added
git submodule status
# Expected: <sha> content-repo (heads/main)

# 3. Verify content exists
ls content-repo/content/skills/ | wc -l
# Expected: 49

# 4. Update content.config.ts (2 lines)
# 5. Update scripts/generate-cli-index.js (1 line)

# 6. Remove redundant local directories
rm -rf content/
rm -rf skills/
rm -rf plugins/

# 7. Build and validate
pnpm build
bash scripts/validate-build.sh

# 8. Test dev server
pnpm dev
# Visit http://localhost:4321/open-medical-skills/skills/ -- should show all 49 skills
```

### Post-Clone Setup (for README / CI)

```bash
git clone --recurse-submodules https://github.com/gitjfmd/oms-site.git
cd oms-site
pnpm install
pnpm build
```

**Or if already cloned without submodules:**
```bash
git submodule update --init --recursive
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `sync-to-public.sh` manual rsync | Git submodule (this phase) | Phase 3 | Content flows from public repo automatically |
| `content/` directory in monorepo | `content-repo/content/` via submodule | Phase 3 | Single source of truth in public repo |
| Local `skills/` and `plugins/` dirs | Source dirs live in public repo only | Phase 3 | Private repo is website-only, no content duplication |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Shell commands + Astro build (no test framework) |
| Config file | None -- infrastructure phase |
| Quick run command | `pnpm build && bash scripts/validate-build.sh` |
| Full suite command | `pnpm build && bash scripts/validate-build.sh && pnpm dev` (verify dev server) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-01 | Submodule exists at `content-repo/` | smoke | `git submodule status \| grep content-repo` | N/A (CLI) |
| SYNC-02 | glob base paths updated | smoke | `grep 'content-repo/content/skills' src/content.config.ts` | N/A (CLI) |
| SYNC-03 | Build succeeds with all pages | integration | `pnpm build && bash scripts/validate-build.sh` | Wave 0: `scripts/validate-build.sh` |
| SYNC-04 | Dev server works | manual | `pnpm dev` then visit `/open-medical-skills/skills/` | manual-only: requires browser verification |
| SYNC-07 | Post-build validation catches empty collections | unit | `bash scripts/validate-build.sh` (after valid build) | Wave 0: `scripts/validate-build.sh` |
| REPO-03 | Private repo has infrastructure | smoke | `ls src/ workers/ astro.config.mjs package.json` | N/A (CLI) |
| REPO-05 | dev branch has submodule | smoke | `git checkout dev && git submodule status` | N/A (CLI) |

### Sampling Rate
- **Per task commit:** `pnpm build && bash scripts/validate-build.sh`
- **Per wave merge:** Full build + validation + dev server check
- **Phase gate:** All 7 verification commands pass, dev branch builds clean

### Wave 0 Gaps
- [ ] `scripts/validate-build.sh` -- post-build validation script (must be created in this phase)

## Repo Context Clarification

**Critical finding:** The current working directory (`/home/jfmd/.jfmd/projects/INTELMEDICA-COMP/open-medical-skills`) has its `origin` remote pointing to `Open-Medica/open-medical-skills` (the public repo). The private repo `gitjfmd/oms-site` exists separately with the same codebase and branches.

**Work location:** Phase 3 work MUST happen in the private repo (`gitjfmd/oms-site`). This likely means either:
1. Cloning `gitjfmd/oms-site` to a separate directory, or
2. Adding `gitjfmd/oms-site` as a remote to the current directory and working from there, or
3. Using a git worktree

The planner must account for this -- the submodule is added to the PRIVATE repo, not the public repo. The public repo is the content SOURCE that the submodule points TO.

## Files That DO NOT Need Changes

These files reference `content/skills/` or `skills/` but in the context of the PUBLIC repo, not the local filesystem. They must NOT be changed:

| File | Line(s) | Context | Why Keep As-Is |
|------|---------|---------|----------------|
| `src/pages/submit.astro` | 43 | UI text: "Add a YAML file to `content/skills/`" | Telling users where to add files in public repo |
| `src/pages/contribute.astro` | 49, 53 | UI text about public repo structure | Public repo paths for contributors |
| `workers/submission-api/src/index.ts` | 293 | GitHub API: `content/skills/${name}.yaml` | Creates files in public repo via API |
| `src/features/skill-creator/lib/skill-assembler.ts` | 91-101 | Install commands referencing public repo URLs | Public repo URLs, not local paths |
| `src/components/AuthButton.tsx` | 149 | GitHub PR link to public repo | URL reference |
| `src/components/AgentActions.astro` | 10 | Repo reference for agent actions | URL reference (but NOTE: still uses `gitjfmd/open-medical-skills`, should be updated to `Open-Medica/open-medical-skills` in a future phase) |

**Note discovered during research:** Multiple source files still reference `gitjfmd/open-medical-skills` instead of `Open-Medica/open-medical-skills`. This is a separate concern from Phase 3 -- these are URL references to the public repo and should be updated when the repo org migration is finalized. This could be addressed in Phase 9 (Documentation) or a dedicated cleanup.

## Open Questions

1. **Private repo work location**
   - What we know: The private repo `gitjfmd/oms-site` exists separately. Current directory tracks the public repo.
   - What's unclear: Whether the implementer should clone the private repo to a new directory, use a worktree, or reconfigure remotes.
   - Recommendation: Clone `gitjfmd/oms-site` to a temporary working directory for this phase. Do not modify the current directory's remote configuration.

2. **Dev server file watching for submodule content**
   - What we know: Astro's glob loader loads content at build/startup time. The Astro docs do not explicitly document file watching behavior for content outside `src/`.
   - What's unclear: Whether changes in `content-repo/content/` during `pnpm dev` will trigger hot reload. Submodule content rarely changes during dev, so this is low priority.
   - Recommendation: Accept that dev server may need restart after `git submodule update --remote`. This is acceptable behavior -- content changes are infrequent.

3. **`cli/` directory path for generate-cli-index**
   - What we know: The script reads from `content/skills/` and writes to `cli/data/skills-index.json`. Both the private and public repo have `cli/`.
   - What's unclear: Whether the CLI index generation should run in the private repo (reading from submodule) or only in the public repo.
   - Recommendation: Update the path in the private repo's copy. The public repo has its own copy of the script that reads from its local `content/skills/` directly. The two copies diverge at this point, which is expected.

## Sources

### Primary (HIGH confidence)
- [Astro Content Loader API Reference](https://docs.astro.build/en/reference/content-loader-reference/) -- glob loader `base` parameter accepts relative path to any directory
- [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) -- glob loader works with YAML, loads "from anywhere on the filesystem"
- [Git Submodule Documentation](https://git-scm.com/docs/git-submodule) -- `add -b`, `update --init --recursive`, `.gitmodules` format
- [Git Book: Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) -- lifecycle, detached HEAD behavior, CI considerations
- Local filesystem verification -- `dist/` output structure confirmed (49 skill dirs, 5 plugin dirs at `dist/skills/` and `dist/plugins/`)
- GitHub API verification -- `gitjfmd/oms-site` confirmed as existing private repo with `dev` and `main` branches

### Secondary (MEDIUM confidence)
- [Symlink content in Astro](https://www.eliostruyf.com/symlink-content-astro-portability/) -- confirms submodule + symlink approach works, but direct path is simpler
- [Git Submodules Guide 2026](https://devtoolbox.dedyn.io/blog/git-submodules-guide) -- best practices for branch tracking and CI

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or local filesystem

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, only path changes in existing config
- Architecture: HIGH - submodule is a well-understood git feature, glob loader path change is trivial
- Pitfalls: HIGH - verified against actual build output and local file references
- Validation: HIGH - build output structure confirmed from actual `dist/` directory

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- Astro glob loader API and git submodule semantics are mature)

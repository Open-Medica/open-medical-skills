#!/usr/bin/env bash
# Syncs public-safe content from private repo to public clone
# Usage: ./scripts/sync-to-public.sh

set -euo pipefail

PRIVATE_REPO="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_REPO="/home/jfmd/.jfmd/projects/INTELMEDICA-COMP/worktrees/oms-public"

if [[ ! -d "$PUBLIC_REPO/.git" ]]; then
  echo "Error: Public repo not found at $PUBLIC_REPO"
  echo "Clone it first: git clone https://github.com/Open-Medica/open-medical-skills.git $PUBLIC_REPO"
  exit 1
fi

echo "Syncing content from private -> public repo..."

# Sync content directories
rsync -av --delete "$PRIVATE_REPO/content/" "$PUBLIC_REPO/content/"
rsync -av --delete "$PRIVATE_REPO/skills/" "$PUBLIC_REPO/skills/"
rsync -av --delete "$PRIVATE_REPO/plugins/" "$PUBLIC_REPO/plugins/"
rsync -av --delete "$PRIVATE_REPO/cli/" "$PUBLIC_REPO/cli/"

# Sync documentation
rsync -av --delete "$PRIVATE_REPO/docs/" "$PUBLIC_REPO/docs/"

# Sync issue templates
rsync -av --delete "$PRIVATE_REPO/.github/ISSUE_TEMPLATE/" "$PUBLIC_REPO/.github/ISSUE_TEMPLATE/"

# Sync individual files
cp "$PRIVATE_REPO/README.md" "$PUBLIC_REPO/README.md"
cp "$PRIVATE_REPO/LICENSE" "$PUBLIC_REPO/LICENSE" 2>/dev/null || true
cp "$PRIVATE_REPO/DISCLAIMER.md" "$PUBLIC_REPO/DISCLAIMER.md"

# Link CONTRIBUTING.md from docs to root
cp "$PRIVATE_REPO/docs/CONTRIBUTING.md" "$PUBLIC_REPO/CONTRIBUTING.md" 2>/dev/null || true

# Generate sanitized CLAUDE.md
if [[ -x "$PRIVATE_REPO/scripts/generate-claude-md.sh" ]]; then
  echo "Generating sanitized CLAUDE.md..."
  (cd "$PRIVATE_REPO" && bash scripts/generate-claude-md.sh > "$PUBLIC_REPO/CLAUDE.md")
fi

# Commit and push
cd "$PUBLIC_REPO"
git add -A
if ! git diff --staged --quiet; then
  git commit -m "chore: sync content from private repo $(date +%Y-%m-%d)"
  echo "Changes committed. Run 'cd $PUBLIC_REPO && git push' to publish."
else
  echo "No changes to sync."
fi

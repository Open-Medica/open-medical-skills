#!/usr/bin/env python3
"""
Extract skill implementation scripts and documentation from YAML files
and push them to the public GitHub repo Open-Medica/open-medical-skills
as a SINGLE commit using the GitHub Git Data API.

For each YAML file in content/skills/:
  - Extract script_content -> skill.<ext> (if substantial, >100 chars)
  - Extract skill_md -> instructions.md (if substantial, >50 chars)
  - Remove old script.<ext> files (renamed to skill.<ext>)

Uses the Git Trees API to batch all changes into one commit.
"""

import yaml
import os
import subprocess
import json
import base64
import sys

YAML_DIR = "/home/jfmd/.jfmd/projects/open-medical-skills/content/skills"
REPO = "Open-Medica/open-medical-skills"
BRANCH = "main"
COMMIT_MESSAGE = "Add skill implementation scripts and instructions for all skills\n\nExtracted script_content and skill_md from YAML definitions.\nRenamed script.py -> skill.py for consistency.\nAdded instructions.md documentation for skills with detailed descriptions."

# Map script_language to file extension
LANG_EXT = {
    "python": "py",
    "javascript": "js",
    "typescript": "ts",
    "bash": "sh",
    "shell": "sh",
}


def gh_api_json(endpoint, method="GET", input_data=None):
    """Call GitHub API via gh CLI, return parsed JSON."""
    cmd = ["gh", "api", endpoint]
    if method != "GET":
        cmd.extend(["--method", method])
    stdin_data = None
    if input_data:
        cmd.extend(["--input", "-"])
        stdin_data = json.dumps(input_data)
    result = subprocess.run(cmd, input=stdin_data, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"API ERROR [{method} {endpoint}]: {result.stderr[:300]}", file=sys.stderr)
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return result.stdout


def get_current_commit_sha():
    """Get the SHA of the current HEAD commit on main."""
    data = gh_api_json(f"repos/{REPO}/git/refs/heads/{BRANCH}")
    if data and "object" in data:
        return data["object"]["sha"]
    return None


def get_commit_tree_sha(commit_sha):
    """Get the tree SHA for a commit."""
    data = gh_api_json(f"repos/{REPO}/git/commits/{commit_sha}")
    if data and "tree" in data:
        return data["tree"]["sha"]
    return None


def get_tree_recursive(tree_sha):
    """Get the full recursive tree."""
    data = gh_api_json(f"repos/{REPO}/git/trees/{tree_sha}?recursive=1")
    if data and "tree" in data:
        return data["tree"]
    return []


def create_blob(content):
    """Create a blob in the repo. Returns blob SHA."""
    data = gh_api_json(
        f"repos/{REPO}/git/blobs",
        method="POST",
        input_data={
            "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
            "encoding": "base64",
        }
    )
    if data and "sha" in data:
        return data["sha"]
    return None


def create_tree(base_tree_sha, tree_items):
    """Create a new tree with the given items."""
    data = gh_api_json(
        f"repos/{REPO}/git/trees",
        method="POST",
        input_data={
            "base_tree": base_tree_sha,
            "tree": tree_items,
        }
    )
    if data and "sha" in data:
        return data["sha"]
    return None


def create_commit(tree_sha, parent_sha, message):
    """Create a new commit."""
    data = gh_api_json(
        f"repos/{REPO}/git/commits",
        method="POST",
        input_data={
            "message": message,
            "tree": tree_sha,
            "parents": [parent_sha],
        }
    )
    if data and "sha" in data:
        return data["sha"]
    return None


def update_ref(commit_sha):
    """Update the branch ref to point to new commit."""
    data = gh_api_json(
        f"repos/{REPO}/git/refs/heads/{BRANCH}",
        method="PATCH",
        input_data={
            "sha": commit_sha,
        }
    )
    return data is not None


def process_all_yamls():
    """Process all YAML files and return tree items for the commit."""
    yaml_files = sorted([
        os.path.join(YAML_DIR, f)
        for f in os.listdir(YAML_DIR)
        if f.endswith(".yaml")
    ])

    print(f"Found {len(yaml_files)} YAML files to process")

    tree_items = []  # Items to add/modify
    files_to_delete = set()  # Old script.py paths to remove
    stats = {"skill_files": 0, "instructions": 0, "renames": 0, "skipped": 0}

    for yaml_path in yaml_files:
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)

        name = data.get("name", "")
        if not name:
            print(f"  SKIP {yaml_path}: no name field")
            continue

        script_content = data.get("script_content", "")
        script_language = data.get("script_language", "python")
        skill_md = data.get("skill_md", "")
        ext = LANG_EXT.get(script_language, "py")

        has_script = script_content and len(script_content.strip()) > 100
        has_docs = skill_md and len(skill_md.strip()) > 50

        if has_script:
            # Create blob for skill.<ext>
            content = script_content.strip() + "\n"
            blob_sha = create_blob(content)
            if blob_sha:
                skill_path = f"skills/{name}/skill.{ext}"
                tree_items.append({
                    "path": skill_path,
                    "mode": "100644",
                    "type": "blob",
                    "sha": blob_sha,
                })
                stats["skill_files"] += 1
                print(f"  [SCRIPT] {name} -> skill.{ext} ({len(content)} bytes)")

                # Mark old script.<ext> for deletion if it exists
                old_path = f"skills/{name}/script.{ext}"
                files_to_delete.add(old_path)
            else:
                print(f"  ERROR creating blob for {name} script")

        if has_docs:
            # Create blob for instructions.md
            content = skill_md.strip() + "\n"
            blob_sha = create_blob(content)
            if blob_sha:
                instr_path = f"skills/{name}/instructions.md"
                tree_items.append({
                    "path": instr_path,
                    "mode": "100644",
                    "type": "blob",
                    "sha": blob_sha,
                })
                stats["instructions"] += 1
                print(f"  [DOCS]   {name} -> instructions.md ({len(content)} bytes)")
            else:
                print(f"  ERROR creating blob for {name} instructions")

        if not has_script and not has_docs:
            stats["skipped"] += 1
            print(f"  [SKIP]   {name} (placeholder, no script_content or skill_md)")

    return tree_items, files_to_delete, stats


def main():
    print(f"Target repo: {REPO}")
    print(f"Branch: {BRANCH}")
    print("=" * 60)

    # Step 1: Get current state
    print("\n[1/6] Getting current commit...")
    commit_sha = get_current_commit_sha()
    if not commit_sha:
        print("FATAL: Could not get current commit SHA")
        sys.exit(1)
    print(f"  Current commit: {commit_sha[:12]}")

    tree_sha = get_commit_tree_sha(commit_sha)
    if not tree_sha:
        print("FATAL: Could not get tree SHA")
        sys.exit(1)
    print(f"  Current tree: {tree_sha[:12]}")

    # Step 2: Get existing tree to check for files to delete
    print("\n[2/6] Getting existing file tree...")
    existing_tree = get_tree_recursive(tree_sha)
    existing_paths = {item["path"] for item in existing_tree}
    print(f"  {len(existing_paths)} files in repo")

    # Step 3: Process YAML files
    print("\n[3/6] Processing YAML files and creating blobs...")
    tree_items, files_to_delete, stats = process_all_yamls()

    # Step 4: Handle deletions (old script.py -> skill.py renames)
    # To delete a file in a tree, we set its sha to null with mode "100644"
    # Actually, for Git Trees API, we need to build tree without those files
    # The simplest approach: add delete entries with sha pointing to null
    # But Git API doesn't support that directly with base_tree...
    # Instead, we just check which old script.py files actually exist
    actual_deletes = []
    for old_path in files_to_delete:
        if old_path in existing_paths:
            # Check if the new skill.py path is different from old script.py
            # (they use the same extension, just different name)
            new_path = old_path.replace("/script.", "/skill.")
            if new_path != old_path:
                # Mark for deletion by setting sha to a null tree entry
                actual_deletes.append(old_path)
                stats["renames"] += 1

    # For deletions with base_tree, we need to NOT include them but the
    # base_tree will keep them. We need a different approach.
    # Let's build the full tree without base_tree for the skills/ directory,
    # or use a simpler approach: just accept both script.py and skill.py exist
    # temporarily and delete the old ones in a subsequent tree.

    # Actually the cleanest approach: build tree items that include deletions
    # by using mode "100644" with sha set to the hash of an empty content
    # NO - the correct way is to NOT use base_tree and rebuild the full tree.
    # But that's complex for a large repo.

    # Simplest clean approach: two-step
    # 1. First commit: add all new files (skill.py, instructions.md)
    # 2. Second commit: delete old script.py files
    # OR: just use base_tree and accept both exist, then delete separately.

    # Let's go with: single commit that adds skill.py files. The old script.py
    # files will remain but that's OK as a first step. We can delete them after.
    # Actually NO - let me handle it properly with a full tree rebuild.

    # Better approach: use the tree API without base_tree, manually including
    # ALL existing files except the ones we want to delete, plus our new files.

    if actual_deletes:
        print(f"\n  Will delete {len(actual_deletes)} old script.* files:")
        for p in actual_deletes:
            print(f"    - {p}")

    # Step 5: Build the complete new tree
    print(f"\n[4/6] Building new tree...")
    print(f"  New files to add: {len(tree_items)}")
    print(f"  Files to delete: {len(actual_deletes)}")

    # Build full tree: existing files (minus deletions) + new files
    new_paths = {item["path"] for item in tree_items}
    delete_set = set(actual_deletes)

    full_tree_items = []

    # Keep all existing files except deletions and files we're replacing
    for item in existing_tree:
        if item["type"] == "tree":
            continue  # Skip directory entries, they're implicit
        if item["path"] in delete_set:
            continue  # Skip files being deleted
        if item["path"] in new_paths:
            continue  # Skip files being replaced by our new versions
        full_tree_items.append({
            "path": item["path"],
            "mode": item["mode"],
            "type": item["type"],
            "sha": item["sha"],
        })

    # Add our new files
    full_tree_items.extend(tree_items)

    print(f"  Total tree entries: {len(full_tree_items)}")

    # Create the new tree (WITHOUT base_tree since we're providing everything)
    new_tree_data = gh_api_json(
        f"repos/{REPO}/git/trees",
        method="POST",
        input_data={"tree": full_tree_items}
    )
    if not new_tree_data or "sha" not in new_tree_data:
        print(f"FATAL: Could not create new tree")
        print(f"  Response: {new_tree_data}")
        sys.exit(1)
    new_tree_sha = new_tree_data["sha"]
    print(f"  New tree SHA: {new_tree_sha[:12]}")

    # Step 6: Create commit
    print(f"\n[5/6] Creating commit...")
    new_commit_sha = create_commit(new_tree_sha, commit_sha, COMMIT_MESSAGE)
    if not new_commit_sha:
        print("FATAL: Could not create commit")
        sys.exit(1)
    print(f"  New commit: {new_commit_sha[:12]}")

    # Step 7: Update ref
    print(f"\n[6/6] Updating branch ref...")
    if update_ref(new_commit_sha):
        print(f"  Branch {BRANCH} updated to {new_commit_sha[:12]}")
    else:
        print("FATAL: Could not update branch ref")
        sys.exit(1)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print(f"  Skill scripts added:   {stats['skill_files']}")
    print(f"  Instructions added:    {stats['instructions']}")
    print(f"  Old scripts deleted:   {stats['renames']}")
    print(f"  Placeholder skills:    {stats['skipped']}")
    print(f"  Commit: {new_commit_sha}")
    print(f"  URL: https://github.com/{REPO}/commit/{new_commit_sha}")
    print("DONE!")


if __name__ == "__main__":
    main()

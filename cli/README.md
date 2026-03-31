# Open Medical Skills CLI (OMS)

Physician-reviewed AI agent skills for medical research and clinical documentation.

### `oms list` — List All Skills

Show all available skills with optional filtering.

```bash
# List all skills
oms list

# Filter by category
oms list --category emergency
oms list --category research
oms list --category education

# Limit results
oms list --limit 10

# JSON output
oms list --json
```

**Options:**
- `-c, --category <category>` — Filter by medical category
- `-l, --limit <n>` — Max results (default: 50)
- `--json` — Output as JSON

---

## Installation

```bash
npm install -g @openmedica/cli --prefix ~/.npm-global
```

Add to your shell config (`~/.bashrc`, `~/.zshrc`):

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
```

Then source your config:

```bash
source ~/.bashrc  # or ~/.zshrc
```

## Usage

### `oms find <query>` — Search Skills

Search for skills by semantic query. Uses API-backed search with local fallback.

```bash
# Find skills related to diabetes
oms find diabetes

# Find cardiology skills
oms find cardiology

# Find with category filter
oms find acute --category emergency

# Limit results
oms find treatment --limit 5

# JSON output
oms find diabetes --json
```

**Options:**
- `-c, --category <category>` — Filter by medical category
- `-l, --limit <n>` — Max results (default: 20)
- `--json` — Output as JSON

---

### `oms inspect <skill-name>` — View Skill Details

Show detailed information about a specific skill.

```bash
# Inspect a skill
oms inspect diabetes-management

# JSON output
oms inspect diabetes-management --json
```

---

### `oms install <skill-name>` — Install a Skill

Install a skill to your IDE/agent.

```bash
# Install for Claude Code (default)
oms install diabetes-management

# Install for specific agent
oms install diabetes-management --agent cursor
oms install diabetes-management --agent windsurf

# Dry run (show what would happen)
oms install diabetes-management --dry-run

# Install to global directory
oms install diabetes-management --global
```

**Options:**
- `-a, --agent <agent>` — Target agent: `claude-code`, `cursor`, `windsurf`, `manus`, `local`, `*` (default: `claude-code`)
- `-g, --global` — Install to global directory
- `--dry-run` — Show what would be installed

---

### `oms validate <skill-name>` — Validate Skill Health

Check if a skill's repository is accessible and YAML schema is valid.

```bash
# Validate a skill
oms validate diabetes-management

# JSON output
oms validate diabetes-management --json
```

---

### `oms relate <skill-name>` — Find Related Skills

Find skills related to a given skill via graph traversal.

```bash
# Find related skills
oms relate diabetes-management

# JSON output
oms relate diabetes-management --json
```

---

## Safety Classifications

Skills have safety classifications that are displayed during install:

- **Safe** — General research and learning tools
- **Caution** — Review outputs carefully before clinical application
- **Restricted** — Only for use under direct physician supervision

> **Disclaimer:** These are research tools, not clinical decision support. Always consult qualified healthcare professionals.

---

## Examples

```bash
# Search for diabetes-related skills
oms find diabetes

# Inspect a specific skill
oms inspect clinical-trial-protocol

# Install for Cursor IDE
oms install clinical-trial-protocol --agent cursor

# Check if skill is valid
oms validate prior-auth-review-skill

# Find related skills
oms relate medical-research
```

---

## Commands Overview

| Command | Description |
|---------|-------------|
| `oms list` | List all available skills |
| `oms find <query>` | Search skills by semantic query |
| `oms inspect <skill>` | Show detailed skill information |
| `oms install <skill>` | Install skill to IDE/agent |
| `oms validate <skill>` | Check skill health |
| `oms relate <skill>` | Find related skills |
| `oms --help` | Show help |

---

## License

MIT

## Links

- [OpenMedica](https://openmedica.us)
- [Open Medical Skills](https://openmedica.us/open-medical-skills)
- [GitHub](https://github.com/Open-Medica/om-cli)

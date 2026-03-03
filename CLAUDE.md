# Open Medical Skills (OMS)

> A curated marketplace of medical AI skills and plugins, compiled and maintained by physicians for physicians and the healthcare industry.

## Purpose

Open Medical Skills is a trusted hub for discovering, sharing, and installing medical AI agent skills and plugins. Unlike general-purpose skill marketplaces, every skill here is:

- **Physician-reviewed** - Vetted by medical professionals before listing
- **Evidence-informed** - Based on clinical guidelines and best practices
- **Safely designed** - With appropriate guardrails for medical use
- **Open source** - Transparent and auditable by the community

## Website Navigation

| Page | Purpose |
|------|---------|
| **Home** | Browse all skills & plugins, search, featured items, category filters |
| **About** | Mission statement, physician-maintained curation, legitimacy & trust |
| **Skills** | Filter and browse standalone agent skills only |
| **Plugins** | Filter and browse full plugins only |
| **How to Submit** | Submission pipeline for technical & non-technical users |

## Installation Methods Supported

- `npx` install (like skillsmp.com)
- `wget` / `curl` download
- Direct GitHub clone
- One-click install buttons on web

## Submission Workflow

1. **Technical (GitHub users)**: Issue template or direct PR submission
2. **Non-Technical (Web form)**: Guided form that auto-generates a correctly formatted PR for review

All submissions are reviewed by physician maintainers before being listed.

## Directory Structure

```
open-medical-skills/
├── .claude/                  # Claude Code project settings
├── .internal/                # Internal assets, screenshots (gitignored)
├── AGENTS/                   # Specialist agent definitions
│   ├── claude/               # Claude Code agents (Opus 4.6, Sonnet 4.5)
│   ├── gemini/               # Gemini CLI agents (3 Flash, 2.5 Pro)
│   ├── codex/                # Codex CLI agents (GPT-5.3, GPT-5.2)
│   └── opencode/             # OpenCode CLI agents (Ollama, Copilot)
├── CLAUDE.md                 # THIS FILE - project purpose & structure
├── CLAUDE.local.md           # Dev methodology & orchestration (gitignored)
├── AGENTS.md                 # Points to CLAUDE.local.md
├── GEMINI.md                 # Points to CLAUDE.local.md
├── instructions.md           # Points to CLAUDE.local.md
├── src/                      # Website source code
│   ├── components/           # UI components
│   ├── pages/                # Page routes
│   ├── layouts/              # Page layouts
│   ├── styles/               # Global styles
│   └── lib/                  # Utilities, API helpers
├── content/                  # Skills & plugins data (YAML/JSON/MD)
│   ├── skills/               # Individual skill definitions
│   └── plugins/              # Individual plugin definitions
├── public/                   # Static assets (images, icons)
├── scripts/                  # Build scripts, PR pipeline automation
│   ├── validate-submission.js
│   └── generate-pr.js
├── .github/                  # GitHub Actions, issue/PR templates
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE/
└── docs/                     # User-facing documentation
```

## Content Format (Skills)

Each skill is defined as a YAML/Markdown file in `content/skills/`:

```yaml
name: "skill-name"
display_name: "Skill Display Name"
description: "Brief description"
author: "author-name"
repository: "github.com/owner/repo"
category: "clinical|diagnostic|administrative|research|education"
tags: ["tag1", "tag2"]
install:
  npx: "npx skills add owner/repo@skill"
  wget: "wget https://..."
  git: "git clone https://..."
verified: true
reviewer: "Dr. Name, MD"
date_added: "2026-03-02"
```

## Maintained By

Compiled and maintained by a physician, for physicians and the healthcare industry.
Licensed under [TBD].

# Open Medical Skills (OMS)

> A curated marketplace of medical AI skills and plugins, compiled and maintained by physicians for physicians and the healthcare industry.

## Purpose

Open Medical Skills is a trusted hub for discovering, sharing, and installing medical AI agent skills and plugins. Unlike general-purpose skill marketplaces, every skill here is:

- **Physician-reviewed** - Vetted by medical professionals before listing
- **Evidence-informed** - Based on clinical guidelines and best practices
- **Safely designed** - With appropriate guardrails for medical use
- **Open source** - Transparent and auditable by the community

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Astro 5 (static output, islands architecture) |
| **UI** | React 19 islands (interactive), `.astro` (static) |
| **Styling** | TailwindCSS 4 via `@tailwindcss/vite` |
| **Search** | Pagefind (client-side, build-time index) |
| **Content** | YAML files in `content/skills/` and `content/plugins/` |
| **Submission API** | Cloudflare Worker (`workers/submission-api/`) |
| **CLI** | Node.js CLI tool (`cli/`) |
| **Database** | PostgreSQL 17 on K8s (`oms` namespace) |
| **DB MCP** | MCP Toolbox for Databases (Google) on K8s |
| **Package Manager** | pnpm 10.x |
| **Deployment** | Cloudflare Pages (static) + CF Workers (API) |
| **Infrastructure** | K3s cluster, Tailscale mesh networking |

## Website Navigation

| Page | Purpose |
|------|---------|
| **Home** | Browse all skills & plugins, search, featured items, category filters |
| **About** | Mission statement, physician-maintained curation, legitimacy & trust |
| **Skills** | Filter and browse standalone agent skills only |
| **Plugins** | Filter and browse full plugins only |
| **How to Submit** | Submission pipeline for technical & non-technical users |
| **Privacy** | Privacy policy (IntelMedica.ai) |
| **Terms** | Terms of use (IntelMedica.ai) |

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
├── .claude/                     # Claude Code project settings
│   ├── commands/                # Slash commands
│   ├── skills/                  # 21 agent skills (copied from vps69 catalog)
│   └── settings.local.json      # MCP permissions, allowed tools
├── .github/                     # GitHub Actions, issue/PR templates
│   ├── workflows/
│   │   ├── deploy.yml           # CF Pages auto-deploy
│   │   └── validate-submission.yml  # PR validation
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE/
├── .internal/                   # Internal assets, screenshots (gitignored)
├── .mcp.json                    # Project MCP server config (K8s, Postgres)
├── AGENTS/                      # Specialist agent definitions
│   ├── claude/                  # Claude Code agents
│   ├── gemini/                  # Gemini CLI agents
│   ├── codex/                   # Codex CLI agents
│   └── opencode/                # OpenCode CLI agents
├── cli/                         # Node.js CLI tool
│   ├── bin/                     # CLI entrypoint
│   ├── lib/                     # CLI commands
│   ├── data/                    # CLI data files
│   └── package.json
├── content/                     # Content data (YAML)
│   ├── skills/                  # 49 skill definitions (.yaml)
│   └── plugins/                 # 5 plugin definitions (.yaml)
├── logo/                        # Brand assets (SVG)
├── plugins/                     # Full plugin source code
│   ├── aws-healthlake-fhir/
│   ├── healthcare-mcp-comprehensive/
│   ├── holy-bio-research-suite/
│   ├── medikode-medical-coding-platform/
│   └── openemr-integration/
├── public/                      # Static assets (favicon, logos, wordmark)
├── scripts/                     # Build & pipeline automation
├── skills/                      # Full skill source code (49 dirs, SKILL.md each)
├── src/                         # Website source code
│   ├── components/              # UI components (Astro + React islands)
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── SkillCard.astro
│   │   ├── SkillGrid.astro
│   │   ├── SkillFileViewer.astro
│   │   ├── SkillSocialBar.astro
│   │   ├── InstallCommands.astro
│   │   ├── AgentActions.astro
│   │   ├── SearchBar.tsx         # React island
│   │   ├── CategoryFilter.tsx    # React island
│   │   ├── SubmissionForm.tsx    # React island
│   │   ├── ThemeToggle.tsx       # React island
│   │   ├── AuthButton.tsx        # React island
│   │   └── SubmitAuthBanner.tsx  # React island
│   ├── content.config.ts        # Astro Content Layer API (Zod schemas)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/                     # Utilities, API helpers
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   ├── about.astro
│   │   ├── submit.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── skills/              # Skills listing + [slug] detail
│   │   ├── plugins/             # Plugins listing
│   │   └── auth/                # Auth callback pages
│   └── styles/
│       └── global.css           # TailwindCSS 4 @theme, design tokens
├── workers/                     # Cloudflare Workers
│   └── submission-api/          # Submission form → GitHub PR
│       └── src/index.ts
├── CLAUDE.md                    # THIS FILE
├── CLAUDE.local.md              # Dev methodology (gitignored)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## MCP Servers (Project)

Configured in `.mcp.json`:

| Server | Type | Purpose |
|--------|------|---------|
| **kubernetes** | stdio/npx | K8s cluster management (`mcp-server-kubernetes`) |
| **oms-postgres** | url/K8s | PostgreSQL via MCP Toolbox for Databases (NodePort 30500) |

## Content Schema

### 14 Medical Categories
`diagnosis`, `treatment`, `lab-imaging`, `pharmacy`, `emergency`, `surgery`, `nursing`, `pediatrics`, `mental-health`, `public-health`, `research`, `education`, `administrative`, `clinical-research-summarizing`

### Evidence Levels
`high` (green), `moderate` (amber), `low` (red), `expert-opinion` (gray)

### Safety Classifications
`safe` (green), `caution` (amber), `restricted` (red)

## Content Format (Skills)

Each skill is defined as a YAML file in `content/skills/`:

```yaml
name: "skill-name"
display_name: "Skill Display Name"
description: "Brief description"
author: "author-name"
repository: "github.com/owner/repo"
category: "diagnosis|treatment|lab-imaging|pharmacy|emergency|..."
tags: ["tag1", "tag2"]
evidence_level: "high|moderate|low|expert-opinion"
safety: "safe|caution|restricted"
install:
  npx: "npx skills add owner/repo@skill"
  wget: "wget https://..."
  git: "git clone https://..."
verified: true
reviewer: "Dr. Name, MD"
date_added: "2026-03-02"
```

## Infrastructure (K8s)

| Resource | Namespace | Node | Purpose |
|----------|-----------|------|---------|
| `oms-postgres` (Deployment) | oms | pmx2-101 | PostgreSQL 17 (1Gi PVC) |
| `oms-toolbox` (Deployment) | oms | pmx2-202 | MCP Toolbox for Databases |
| `oms-toolbox` (Service) | oms | — | NodePort 30500 → toolbox:5000 |
| `oms-tailscale-mcp` (StatefulSet) | oms | pmx2-202 | Tailscale MCP server |

Database: `oms_tracker` (tables: `skill_tracker`, `upstream_repos`)

## Maintained By

Compiled and maintained by a physician, for physicians and the healthcare industry.
**Organization**: IntelMedica.ai
Licensed under [TBD].

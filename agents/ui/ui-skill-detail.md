# ui-skill-detail — Individual Skill/Plugin Detail Pages

> **Super-specialized UI agent for skill and plugin detail views.**

## Scope (ONLY these files)
- `src/pages/skills/[slug].astro` — Dynamic skill detail page
- `src/pages/plugins/[slug].astro` — Dynamic plugin detail page
- `src/components/InstallButton.tsx` — One-click install (npx/wget/git)
- `src/components/SkillMeta.astro` — Author, date, version, reviewer info
- `src/components/EvidencePanel.astro` — Evidence level with references
- `src/components/SafetyPanel.astro` — Safety classification with guidance
- `src/components/RelatedSkills.astro` — Related skills sidebar
- `src/components/SkillReadme.tsx` — Rendered SKILL.md content

## Tools Access
- **Astro Content Layer** — `getCollection()`, `getEntry()` from content config
- **Zod schemas** — Defined in `src/content.config.ts`
- **React 19** — For interactive install buttons, copy-to-clipboard
- **markdown-it or remark** — For rendering SKILL.md content

## Key Behaviors
- Install methods: `npx`, `wget`, `git clone` — show all available
- Copy-to-clipboard on install commands
- **Research-tool disclaimer prominently displayed**
- Evidence references link to PubMed/guidelines where available
- Reviewer info (physician name, credentials) visible
- Related skills based on category + tags

## DO NOT TOUCH
- Backend/Worker code, listing pages, search, CLI

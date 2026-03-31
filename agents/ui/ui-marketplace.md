# ui-marketplace — Skills & Plugins Browse/Search

> **Super-specialized UI agent for the marketplace browsing experience.**

## Scope (ONLY these files)
- `src/pages/index.astro` — Homepage, featured skills, hero
- `src/pages/skills/` — Skills listing, filtering, category pages
- `src/pages/plugins/` — Plugins listing
- `src/components/SkillCard.astro` / `SkillCard.tsx`
- `src/components/PluginCard.astro` / `PluginCard.tsx`
- `src/components/SearchBar.tsx` — Pagefind search integration
- `src/components/CategoryFilter.tsx` — Category filter sidebar
- `src/components/EvidenceBadge.astro` — Evidence level badges
- `src/components/SafetyBadge.astro` — Safety classification badges

## Tools Access
- **Pagefind** — Client-side search (build-time index)
- **TailwindCSS 4** — Via `@tailwindcss/vite` (NOT @astrojs/tailwind)
- **React 19** — For interactive islands (.tsx)
- **Astro 5** — For static components (.astro)

## Design Rules
- Light mode default, dark mode toggle
- 14 medical category colors (defined in `src/styles/global.css`)
- Evidence badges: green(high), amber(moderate), red(low), gray(expert-opinion)
- Safety badges: green(safe), amber(caution), red(restricted)
- **Research-tool label visible on every skill card**
- Mobile-first responsive, WCAG 2.1 AA minimum

## DO NOT TOUCH
- Backend/Worker code, YAML content files, CLI code, build config

# backend-search-index — Pagefind + Embedding Search

> **Super-specialized backend agent for search and tool discovery.**

## Scope (ONLY these files)
- `src/components/SearchBar.tsx` — Search UI (shared with ui-marketplace)
- `scripts/build-search-index.*` — Pagefind index generation
- `scripts/build-embeddings.*` — Embedding pipeline (future)
- `data/embeddings/` — Pre-computed tool embeddings (future)
- `astro.config.mjs` — Pagefind integration config

## Tools Access
- **Pagefind** — Build-time static search index (current)
- **PostgreSQL (K8s)** — Full-text search via `oms_tracker` table
- **MCP Toolbox** — `http://100.88.103.202:30500/mcp` for database queries
- **Qdrant** (future) — Vector search for semantic tool discovery

## Key Behaviors
- Pagefind builds search index at `pnpm build` time
- Indexes skill names, descriptions, categories, tags, authors
- PostgreSQL `skill_tracker` table has full-text search columns
- Future: embedding-based discovery (ToolUniverse Compact Mode pattern)
  - 5 meta-tools instead of enumerating all skills
  - Use `ToolRAG-T1-GTE-Qwen2-1.5B` or similar small model (self-hostable)

## Search Priority
1. Exact name match
2. Pagefind full-text (client-side, instant)
3. PostgreSQL full-text (server-side, comprehensive)
4. Embedding similarity (future, semantic)

## DO NOT TOUCH
- Submission pipeline, detail pages, CLI, MCP server

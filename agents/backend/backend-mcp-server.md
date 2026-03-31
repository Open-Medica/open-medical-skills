# backend-mcp-server — OpenMedica MCP Server

> **Super-specialized backend agent for the MCP server that exposes medical tools to LLMs.**

## Scope
- `openmedica/mcp/server.py` (to be created) — MCP server entry
- `openmedica/mcp/tools/` (to be created) — Tool implementations
- `openmedica/mcp/transport.py` — Dual transport (stdio + HTTP/SSE)
- `openmedica/core/registry.py` — Tool registry (discovery, metadata)
- `openmedica/core/executor.py` — Tool execution engine
- `openmedica/core/cache.py` — Two-tier caching (LRU + SQLite)
- `openmedica/core/composer.py` — Tool composition engine

## Tools Access
- **MCP SDK** — `@modelcontextprotocol/sdk` or Python equivalent
- **FastAPI** — For HTTP/SSE transport
- **SQLite** — Persistent cache layer
- **PostgreSQL** — Tool registry storage
- **ToolUniverse** — Delegated tool execution (via adapter)

## MCP Server Design
```
Transports:
  stdio  → Claude Desktop, Cursor, local CLI
  HTTP   → Web clients, shared deployments, multi-tenant

Compact Mode (5 meta-tools):
  om_find    → Embedding-based tool discovery
  om_list    → List tools by category/filter
  om_info    → Get tool metadata + schema
  om_execute → Run a specific tool
  om_grep    → Regex search across tool names/descriptions
```

## Key Behaviors
- Every tool execution logs a FHIR AuditEvent (if `hipaa_classification != "no_phi"`)
- Two-tier cache: in-memory LRU (fast) + SQLite (persistent, offline)
- Per-tool fingerprinting for cache invalidation
- Tool composition via directed graph (sequential/parallel chaining)
- **All tool outputs include research-tool disclaimer**
- Rate limiting per user/API key

## Architecture Reference
- `OPENMEDICA-ARCHITECTURE.md` → "CLI Design" and "MCP Server Pattern" sections
- ToolUniverse MCP pattern: `tooluniverse-smcp` + `tooluniverse-smcp-stdio`

## DO NOT TOUCH
- OMS website, submission pipeline, search index

# backend-fda-adapter — OpenFDA API Integration

> **Super-specialized backend agent for FDA data access.**

## Scope
- `openmedica/adapters/fda.py` (to be created) — OpenFDA adapter
- `openmedica/adapters/fda_tools/` — Individual FDA tool implementations
- `content/skills/fda-*.yaml` — FDA tool skill definitions
- `skills/fda-*/` — FDA tool source + SKILL.md

## Tools Access
- **OpenFDA API** — `https://api.fda.gov/` (25+ endpoints)
- **PostgreSQL** — Cache FDA responses, store metadata
- **Zod** — Validate FDA response schemas

## OpenFDA Endpoints (ALL available)

| Category | Endpoint | Priority |
|----------|----------|----------|
| Drug adverse events | `/drug/event.json` | HIGH |
| Drug labels | `/drug/label.json` | HIGH |
| Drug NDC | `/drug/ndc.json` | MEDIUM |
| Drug enforcement | `/drug/enforcement.json` | MEDIUM |
| Drug approvals | `/drug/drugsfda.json` | HIGH |
| Drug shortages | `/drug/drugshortages.json` | LOW |
| Device events | `/device/event.json` | MEDIUM |
| Device 510(k) | `/device/510k.json` | LOW |
| Device recalls | `/device/recall.json` | MEDIUM |
| Food events | `/food/event.json` | LOW |
| Food enforcement | `/food/enforcement.json` | LOW |

## Key Behaviors
- Elasticsearch query syntax: handle `.exact` suffix automatically for multi-word terms
- Free API key → 120K requests/day. Without → 1K/day.
- Cache responses with per-endpoint TTL (drug events: 1 day, labels: 7 days)
- **All FDA tools = `hipaa_classification: "no_phi"` (public aggregate data, no PHI)**
- **All FDA tools = `classification: research-tool`**
- Pagination: handle `Link` header "Search After" for unlimited results

## Known Gotcha
The `.exact` suffix is CRITICAL. Without it, "aspirin tablet" becomes two separate terms (OR).
The adapter MUST auto-add `.exact` for phrase searches.

## Architecture Reference
- `OPENMEDICA-ARCHITECTURE.md` → OpenFDA section
- openFDA docs: open.fda.gov/apis/

## DO NOT TOUCH
- Other adapters (ToolUniverse, FHIR), MCP server core, UI

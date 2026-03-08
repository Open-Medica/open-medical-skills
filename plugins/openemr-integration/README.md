# OpenEMR Full EHR Integration

Model Context Protocol (MCP) server for OpenEMR -- connect any MCP-compatible AI assistant (Claude Desktop, Cursor, VS Code Copilot) directly to your OpenEMR instance.

> **Original source:** [shruti-jn/openemr-mcp](https://github.com/shruti-jn/openemr-mcp)
> **PyPI:** [openemr-mcp](https://pypi.org/project/openemr-mcp/)

## Features

17 MCP tools covering:

| Category | Tools |
|---|---|
| Patients | `openemr_patient_search` |
| Appointments | `openemr_appointment_list` |
| Medications | `openemr_medication_list`, `openemr_drug_interaction_check` |
| Providers | `openemr_provider_search` |
| FDA Safety | `openemr_fda_adverse_events`, `openemr_fda_drug_label` |
| Symptom Lookup | `openemr_symptom_lookup` |
| Drug Safety Flags | `openemr_drug_safety_flag_create/list/update/delete` |
| Clinical Trends | `openemr_lab_trends`, `openemr_vital_trends`, `openemr_questionnaire_trends` |
| Health Trajectory | `openemr_health_trajectory` |
| Visit Prep | `openemr_visit_prep` |

All tools work in **mock mode** out of the box -- no OpenEMR installation required for evaluation.

## Quick Start

### Install

```bash
pip install openemr-mcp
# or with uv:
uv add openemr-mcp
```

### Run (stdio transport)

```bash
# Mock mode -- no OpenEMR needed
OPENEMR_DATA_SOURCE=mock openemr-mcp

# Against a live OpenEMR FHIR API
OPENEMR_DATA_SOURCE=api \
  OPENEMR_API_BASE_URL=https://your-openemr/apis/default \
  OPENEMR_OAUTH_SITE=default \
  OPENEMR_OAUTH_CLIENT_ID=... \
  OPENEMR_OAUTH_CLIENT_SECRET=... \
  openemr-mcp
```

## Data Sources

| Source | Value | Description |
|---|---|---|
| Patient Data | `mock` (default) | Built-in curated demo data, 24 patients |
| Patient Data | `db` | Direct MySQL connection to OpenEMR |
| Patient Data | `api` | OpenEMR FHIR R4 REST API (recommended) |
| Drug Interactions | `mock` (default) | 10 built-in drug pairs |
| Drug Interactions | `openfda` | OpenFDA FAERS co-reporting |
| Symptom Checker | `mock` (default) | Curated local dataset |
| Symptom Checker | `infermedica` | Infermedica API |
| FDA Data | `mock` (default) | Built-in mock data |
| FDA Data | `live` | Live OpenFDA API |

## Architecture

```
src/openemr_mcp/
  server.py              # MCP server -- registers all 17 tools
  config.py              # Pydantic-settings configuration
  schemas.py             # All Pydantic response schemas
  auth.py                # OpenEMR OAuth2 token manager
  data_source.py         # Data source resolver
  tools/                 # 13 tool modules (17 MCP tools)
  repositories/          # Data access (MySQL, FHIR R4, SQLite)
  services/              # Business logic (OpenFDA, trajectory alerts, visit prep)
```

## License

MIT -- see [LICENSE](LICENSE).

## Full Source

For the complete source code with all tool modules, repositories, and services:
https://github.com/shruti-jn/openemr-mcp

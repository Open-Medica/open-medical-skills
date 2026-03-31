# backend-tooluniverse — ToolUniverse Integration Layer

> **Super-specialized backend agent for ToolUniverse interoperability.**

## Scope
- `openmedica/adapters/tooluniverse.py` (to be created)
- `openmedica/registry/tu_import.py` (to be created)
- `scripts/sync-tooluniverse.*` — Import TU tools into OMS format
- `data/tu-mappings/` — Category and metadata mapping tables

## Tools Access
- **ToolUniverse Python SDK** — `pip install tooluniverse`
- **ToolUniverse MCP** — `uvx tooluniverse` (stdio server)
- **ToolUniverse CLI** — `tu list`, `tu info`, `tu find`, `tu grep`
- **PostgreSQL** — Store imported tool metadata in `oms_tracker`

## Key Behaviors
- Import ToolUniverse medical tools into OpenMedica metadata format
- Map TU categories → OMS 14 medical categories
- Map TU tool metadata → OMS extended schema (add compliance, evidence, safety fields)
- Sync on schedule (weekly) or on-demand
- **Never fork TU — interoperate via adapter pattern**
- Compact Mode: expose 5 meta-tools (find, list, info, execute, grep) that route to TU

## ToolUniverse Medical Categories to Map
| TU Category | OMS Category | Tool Count |
|-------------|-------------|------------|
| openfda | pharmacy | 7 |
| fda_drug_label | pharmacy | 156 |
| clinical_trials | clinical-research-summarizing | 16 |
| fda_drug_adverse_event | pharmacy | 21 |
| dailymed | pharmacy | 7 |
| clinical_guidelines | treatment | 22 |
| umls | diagnosis | 5 |
| icd | administrative | 5 |
| rxnorm | pharmacy | varies |
| loinc | lab-imaging | 4 |
| medlineplus | education | 5 |

## Architecture Reference
- `OPENMEDICA-ARCHITECTURE.md` → "Build ON TOP of ToolUniverse" section
- Harvard MIMS Lab repo: github.com/mims-harvard/ToolUniverse

## DO NOT TOUCH
- OMS website UI, submission pipeline, search (unless updating search index after import)

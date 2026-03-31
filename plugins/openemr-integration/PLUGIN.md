# OpenEMR Full EHR Integration

Complete MCP plugin for OpenEMR, the world's most popular open-source EHR. Connects any MCP-compatible AI assistant to an OpenEMR instance for patient records, scheduling, medications, drug safety, clinical trends, and visit preparation. Works in mock mode for evaluation without OpenEMR installation.

## Plugin Type

mcp-server

## Category

administrative

## Specialty

health-informatics, primary-care

## Tags

mcp-plugin, ehr, openemr, patient-records, fhir, drug-safety, clinical-trends

## Safety Classification

Restricted

## Evidence Level

Moderate

## Tools (17 MCP tools)

- Patient search by name
- Appointment listing
- Medication list management
- Drug-drug interaction checking
- Provider search by specialty/location
- FDA adverse event queries (FAERS)
- FDA drug label retrieval
- Symptom lookup with urgency classification
- Drug safety flag CRUD (create, list, update, delete)
- Lab trends (A1c, LDL, eGFR)
- Vital sign trends (weight, BP)
- Questionnaire trends (PHQ-9)
- Health trajectory with drift alerts
- Visit prep briefing (risks, gaps, agenda)

## Author

shruti-jn (openemr-mcp contributors)

## Version

0.1.0

## License

MIT

## Original Repository

https://github.com/shruti-jn/openemr-mcp

## Installation

**Via pip:**
```bash
pip install openemr-mcp
```

**Via uv:**
```bash
uv add openemr-mcp
```

**Run in mock mode:**
```bash
OPENEMR_DATA_SOURCE=mock openemr-mcp
```

---

*This plugin is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

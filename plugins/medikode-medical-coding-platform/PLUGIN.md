# Medikode AI Medical Coding Platform

AI-driven medical coding platform for CPT/ICD-10 validation, quality assurance, EOB parsing, and RAF score calculation. Five integrated tools providing code validation against clinical documentation, coding QA with gap identification, structured EOB data extraction, RAF/HCC scoring, and composite workflow validation. Requires API key from Medikode.

## Plugin Type

mcp-server

## Category

administrative

## Specialty

medical-coding, health-information-management, revenue-cycle

## Tags

mcp-plugin, medical-coding, cpt, icd-10, raf-score, hcc, billing

## Safety Classification

Safe

## Evidence Level

Moderate

## Tools

- process_chart (ICD/CPT code suggestions from chart text)
- validate_codes (CPT/ICD-10 validation against documentation)
- calculate_raf (Risk Adjustment Factor / HCC scoring)
- qa_validate_codes (Comprehensive QA validation)
- parse_eob (EOB document parsing to structured data)

## Author

Medikode (raelango)

## Version

1.2.9

## License

ISC

## Original Repository

https://github.com/raelango/medikode-mcp-server

## Installation

**Via npx:**
```bash
npx @medikode/mcp-server
```

**Via npm:**
```bash
npm install -g @medikode/mcp-server
```

**Claude Desktop config:**
```json
{
  "mcpServers": {
    "medikode": {
      "command": "npx",
      "args": ["-y", "@medikode/mcp-server"],
      "env": { "MEDIKODE_API_KEY": "your_api_key_here" }
    }
  }
}
```

## Authentication

Requires a valid Medikode API key. Register at [medikode.ai](https://medikode.ai).

---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

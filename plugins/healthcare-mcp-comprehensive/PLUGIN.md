# Healthcare MCP Comprehensive Suite

Comprehensive MCP plugin providing AI assistants with access to FDA drug info, PubMed, medRxiv, NCBI Bookshelf, clinical trials, ICD-10, DICOM metadata, and medical calculators. 9 integrated tools with efficient caching and connection pooling.

## Plugin Type

mcp-server

## Category

diagnosis

## Specialty

multi-specialty

## Tags

mcp-plugin, fda, pubmed, clinical-trials, icd-10, dicom, comprehensive

## Safety Classification

Safe

## Evidence Level

High

## Tools

- FDA Drug Information with response parsing
- PubMed Research (medical literature search)
- Health Topics (Health.gov integration)
- Clinical Trials (ongoing and completed)
- Medical Terminology (ICD-10 code lookups)
- medRxiv Search (pre-print articles)
- Medical Calculator (BMI, etc.)
- NCBI Bookshelf Search
- DICOM Metadata Extraction

## Author

Cicatriiz (Forrest Babola)

## Version

2.1.1

## License

MIT

## Original Repository

https://github.com/Cicatriiz/healthcare-mcp-public

## Installation

**Via Smithery:**
```bash
npx -y @smithery/cli install @Cicatriiz/healthcare-mcp-public --client claude
```

**Via npm:**
```bash
npm install healthcare-mcp
npx healthcare-mcp
```

**From source:**
```bash
git clone https://github.com/Cicatriiz/healthcare-mcp-public.git
cd healthcare-mcp-public/server && npm install && npm start
```

## Data Sources

- FDA OpenFDA API
- PubMed E-utilities API
- Health.gov API v4
- ClinicalTrials.gov API v2
- NLM Clinical Table Search Service (ICD-10-CM)
- medRxiv API
- NCBI Bookshelf (E-utilities)

---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

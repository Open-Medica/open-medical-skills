# Healthcare MCP Comprehensive Suite

A Model Context Protocol (MCP) server providing AI assistants with access to healthcare data and medical information tools, including FDA drug info, PubMed, medRxiv, NCBI Bookshelf, clinical trials, ICD-10, DICOM metadata, and a medical calculator.

> **Original source:** [Cicatriiz/healthcare-mcp-public](https://github.com/Cicatriiz/healthcare-mcp-public)

## Features

- **FDA Drug Information**: Search and retrieve comprehensive drug information from the FDA database
- **PubMed Research**: Search medical literature from PubMed's database of scientific articles
- **Health Topics**: Access evidence-based health information from Health.gov (API v4)
- **Clinical Trials**: Search for ongoing and completed clinical trials from ClinicalTrials.gov
- **Medical Terminology**: Look up ICD-10 codes and medical terminology definitions
- **medRxiv Search**: Search for pre-print articles on medRxiv
- **Medical Calculator**: Calculate Body Mass Index (BMI)
- **NCBI Bookshelf Search**: Search the NCBI Bookshelf for biomedical books and documents
- **DICOM Metadata Extraction**: Extract metadata from DICOM files
- **Caching**: Efficient caching system with connection pooling to reduce API calls

## Installation

### Via Smithery
```bash
npx -y @smithery/cli install @Cicatriiz/healthcare-mcp-public --client claude
```

### Via npm
```bash
npm install healthcare-mcp
npx healthcare-mcp
```

### From Source
```bash
git clone https://github.com/Cicatriiz/healthcare-mcp-public.git
cd healthcare-mcp-public/server
npm install
npm start
```

## Configuration

Optional environment variables (`.env`):
```
FDA_API_KEY=your_fda_api_key_here
PUBMED_API_KEY=your_pubmed_api_key_here
CACHE_TTL=86400
PORT=8000
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `fda_drug_lookup` | Look up drug information from the FDA database |
| `pubmed_search` | Search medical literature in PubMed |
| `health_topics` | Get evidence-based health information |
| `clinical_trials_search` | Search clinical trials by condition/status |
| `lookup_icd_code` | Look up ICD-10 codes by code or description |
| `medrxiv_search` | Search pre-print articles on medRxiv |
| `calculate_bmi` | Calculate Body Mass Index |
| `ncbi_bookshelf_search` | Search NCBI Bookshelf |
| `extract_dicom_metadata` | Extract metadata from DICOM files |

## Data Sources

- [FDA OpenFDA API](https://open.fda.gov/apis/)
- [PubMed E-utilities API](https://www.ncbi.nlm.nih.gov/books/NBK25500/)
- [Health.gov API](https://health.gov/our-work/national-health-initiatives/health-literacy/consumer-health-content/free-web-content/apis-developers)
- [ClinicalTrials.gov API](https://clinicaltrials.gov/data-api/about-api)
- [NLM Clinical Table Search Service for ICD-10-CM](https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html)

## License

MIT License - Copyright (c) 2025 Forrest Babola

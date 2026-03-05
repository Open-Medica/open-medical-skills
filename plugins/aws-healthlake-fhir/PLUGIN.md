# AWS HealthLake FHIR Platform

Official AWS MCP server for HealthLake FHIR operations with 11 tools, automatic datastore discovery, and read-only security mode. Supports advanced search with chained parameters, patient-everything operations, and FHIR job management (import/export). 96% test coverage with SigV4 authentication.

## Plugin Type

mcp-server

## Category

administrative

## Specialty

health-informatics, enterprise-health-it

## Tags

mcp-plugin, aws, fhir, ehr, enterprise, cloud, healthlake

## Safety Classification

Restricted

## Evidence Level

High

## Tools

- 6 read-only FHIR tools (list datastores, get details, read resource, search, patient-everything, list jobs)
- 5 write FHIR tools (create, update, delete, import job, export job)
- Automatic datastore discovery via MCP Resources
- Advanced search (chained parameters, _include, _revinclude)
- Patient-everything operations
- FHIR job management (import/export)

## Author

Amazon Web Services (AWS Labs)

## Version

0.0.10

## License

Apache-2.0

## Original Repository

https://github.com/awslabs/mcp/tree/main/src/healthlake-mcp-server

## Installation

**Via uvx (recommended):**
```bash
uvx awslabs.healthlake-mcp-server@latest
```

**Via uv install:**
```bash
uv tool install awslabs.healthlake-mcp-server
```

**Via Docker:**
```bash
docker run -e AWS_ACCESS_KEY_ID=xxx -e AWS_SECRET_ACCESS_KEY=yyy awslabs/healthlake-mcp-server
```

---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

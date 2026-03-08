---
name: drugbank-search
description: >
  Access 17,430+ drugs (13,166 small molecules + 4,264 biotech drugs) with
  high-performance SQLite backend. Search by name, therapeutic category,
  elimination half-life, or molecular similarity.
---

# DrugBank Comprehensive Drug Database

Access detailed pharmacological data for over 17,430 drug entries -- including 13,166 small-molecule drugs and 4,264 biotech/biologic products -- through a high-performance SQLite-backed local database. This skill enables AI agents to search by drug name, therapeutic category, mechanism of action, elimination half-life, molecular weight, or structural similarity, providing clinicians and pharmacists with rapid access to comprehensive drug monograph data without relying on external API rate limits.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill drugbank-search
```

## What It Does

- **Drug monograph lookup** with detailed pharmacological profiles including mechanism of action, pharmacokinetics (absorption, distribution, metabolism, excretion), therapeutic indications, and contraindications
- **Multi-field search** by generic name, brand name, therapeutic category (ATC classification), molecular target, or DrugBank accession number with fuzzy matching support
- **Pharmacokinetic parameter queries** to find drugs by elimination half-life, protein binding percentage, volume of distribution, or bioavailability ranges
- **Drug classification browsing** through the Anatomical Therapeutic Chemical (ATC) hierarchy, enabling category-based exploration of drug classes
- **Local SQLite backend** for high-performance offline queries with sub-millisecond response times, no external API dependency, and no rate limiting

## Clinical Use Cases

- **Formulary comparison**: A hospital pharmacist evaluating therapeutic alternatives for a drug shortage can search all drugs within the same ATC class, compare half-lives and dosing intervals, and identify suitable substitutions with matching pharmacokinetic profiles.
- **Pharmacology education**: A medical student studying antihypertensives can browse the entire class hierarchy, compare mechanisms of action across ACE inhibitors vs ARBs vs calcium channel blockers, and review key PK parameters side-by-side.
- **Drug development research**: A pharmaceutical researcher can query the database for all approved kinase inhibitors, examine their molecular targets, and identify gaps in the therapeutic landscape for novel drug candidates.
- **Clinical pharmacokinetics consultation**: A clinical pharmacologist adjusting renal dosing can quickly look up the fraction of drug eliminated renally, protein binding, and active metabolite profiles to guide dosage modifications.

## Safety & Evidence

- **Safety Classification:** Safe -- This skill provides read-only access to curated drug reference data. It does not prescribe medications, calculate doses for individual patients, or interact with electronic health records. Drug information is sourced from peer-reviewed pharmacological databases.
- **Evidence Level:** High -- DrugBank is a widely cited, peer-reviewed pharmaceutical knowledge base (cited in over 18,000 publications). Data undergoes expert curation by pharmacists and pharmaceutical scientists at the University of Alberta.

## Example Usage

**Look up pharmacokinetic parameters for a specific drug:**
```
Search DrugBank for lisinopril. Show me its mechanism of action,
elimination half-life, protein binding, renal clearance percentage,
and all available brand names.
```

**Find drugs within a therapeutic category by half-life:**
```
Search for all beta-adrenergic blocking agents (ATC class C07)
with an elimination half-life greater than 12 hours. Sort by
half-life descending and include bioavailability data.
```

## Technical Details

- **Category:** Pharmacy
- **Author:** OMS Contributors (original: openpharma-org)
- **License:** MIT
- **Data Source:** DrugBank Open Data (CC BY-NC 4.0 for academic use)
- **Backend:** SQLite database with indexed columns for fast querying
- **Coverage:** 17,430+ drug entries, 13,166 small molecules, 4,264 biotech drugs
- **Dependencies:** SQLite3 client, Python (optional for advanced queries)

## References

- DrugBank Online: https://go.drugbank.com/
- Wishart DS, et al. "DrugBank 5.0: a major update to the DrugBank database." Nucleic Acids Research. 2018;46(D1):D1074-D1082. doi:10.1093/nar/gkx1037
- ATC/DDD Classification System (WHO): https://www.whocc.no/atc_ddd_index/
- DrugBank Open Data: https://go.drugbank.com/releases/latest#open-data

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

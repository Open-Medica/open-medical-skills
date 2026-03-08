# FDA Drug Information & Adverse Events

Access comprehensive U.S. Food and Drug Administration drug safety databases through the openFDA API. This skill provides AI agents with real-time access to the FDA Adverse Event Reporting System (FAERS), structured product labeling (SPL), the National Drug Code (NDC) directory, drug recalls and enforcement actions, drug shortage reports, and 510(k) medical device clearance data -- enabling pharmacovigilance, regulatory research, and patient safety workflows.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill fda-drug-information
```

## What It Does

- **Adverse event queries (FAERS)** to search millions of post-marketing safety reports by drug name, reaction term, patient demographics, seriousness outcome (death, hospitalization, disability), and reporting date range
- **Drug label retrieval** with access to full structured product labeling (SPL) including indications, dosage, warnings, black box warnings, contraindications, drug interactions, and pharmacology sections
- **NDC directory search** to look up drugs by National Drug Code, proprietary name, active ingredient, dosage form, route of administration, or labeler/manufacturer
- **Recall and enforcement monitoring** with real-time access to FDA enforcement reports including drug recalls, market withdrawals, product classification (Class I/II/III), and distribution patterns
- **Drug shortage tracking** to check current drug supply status, shortage reasons, estimated resolution dates, and therapeutic alternatives recommended by FDA

## Clinical Use Cases

- **Pharmacovigilance signal detection**: A drug safety officer can query FAERS for all serious adverse events reported for a new biologic in its first post-marketing year, stratify by event type and patient age group, and identify emerging safety signals before they appear in published literature.
- **Label-based prescribing support**: A physician unsure about contraindications for prescribing a medication to a patient with hepatic impairment can pull the complete FDA-approved label, review the hepatic dosing adjustments section, and check for any recent label changes or safety communications.
- **Drug shortage management**: A hospital pharmacy director can check the FDA shortage database for critical medications (e.g., IV saline, certain antibiotics), review the estimated resolution timeline, and identify FDA-recommended therapeutic alternatives.
- **Regulatory compliance research**: A medical affairs professional preparing a regulatory submission can retrieve the complete enforcement history for a drug class, review all Class I recalls in the past decade, and assess the regulatory landscape for competitive products.

## Safety & Evidence

- **Safety Classification:** Safe -- This skill queries official FDA public databases in read-only mode. It does not make prescribing recommendations, alter patient records, or replace clinical judgment. All data returned is from FDA-maintained regulatory databases.
- **Evidence Level:** High -- The openFDA API provides direct access to official U.S. government regulatory databases. FAERS is the primary post-marketing surveillance system used by FDA for drug safety monitoring, containing over 20 million adverse event reports.

## Example Usage

**Search for adverse events associated with a medication:**
```
Query the FDA adverse event database for all serious adverse events
reported for apixaban in the last 2 years. Group results by reaction
term and show the count of reports with outcomes of death or
hospitalization.
```

**Check for active drug recalls:**
```
Search FDA enforcement reports for any ongoing Class I or Class II
recalls involving metformin products. Include the recall reason,
classification, distribution pattern, and initiating firm.
```

## Technical Details

- **Category:** Pharmacy
- **Author:** OMS Contributors (original: Augmented-Nature)
- **License:** MIT
- **API:** openFDA API v2 (https://api.fda.gov)
- **Endpoints:** /drug/event, /drug/label, /drug/ndc, /drug/enforcement, /drug/drugsfda, /device/510k
- **Rate Limits:** 240 requests/minute without API key; 120,000 requests/day with free API key
- **Dependencies:** HTTP client (curl/fetch), JSON parser

## References

- openFDA API Documentation: https://open.fda.gov/apis/
- FDA Adverse Event Reporting System (FAERS): https://www.fda.gov/drugs/surveillance/questions-and-answers-fdas-adverse-event-reporting-system-faers
- FDA Drug Shortages Database: https://www.accessdata.fda.gov/scripts/drugshortages/
- FDA Recalls, Market Withdrawals & Safety Alerts: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts
- National Drug Code Directory: https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

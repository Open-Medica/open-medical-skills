# RAF Score & HCC Calculator

A Risk Adjustment Factor (RAF) score calculator with Hierarchical Condition Category (HCC) capture from encounter documentation, purpose-built for Medicare Advantage risk adjustment workflows. The skill analyzes clinical notes to identify HCC-eligible diagnoses, maps ICD-10 codes to HCC categories using the CMS-HCC risk adjustment model, and calculates expected RAF scores for individual patients and panel-level projections.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill raf-score-calculator
```

## What It Does

- **HCC condition identification**: Scans encounter documentation and problem lists to identify diagnoses that map to HCC categories, flagging conditions that are documented but not coded and conditions that are coded but lack supporting documentation
- **ICD-10 to HCC mapping**: Applies the current CMS-HCC risk adjustment model (V28) to translate ICD-10-CM diagnosis codes into their corresponding HCC categories, including hierarchical exclusions where higher-severity HCCs supersede lower ones
- **RAF score calculation**: Computes individual patient RAF scores incorporating demographic factors (age, sex, Medicaid dual eligibility, institutional status), new enrollee status, and the additive risk coefficients for each captured HCC
- **Recapture gap analysis**: Compares current-year HCC capture against prior-year conditions to identify chronic conditions (diabetes with complications, CKD, heart failure, COPD) that require annual re-documentation and recoding to maintain accurate risk scores
- **Panel-level analytics**: Aggregates RAF scores across a patient panel to project expected revenue, identify high-risk patients due for annual wellness visits, and quantify the financial impact of documentation improvement initiatives

## Clinical Use Cases

- **Annual wellness visit preparation**: Before a Medicare Advantage patient's annual visit, the skill reviews the prior year's HCC profile and generates a suspect list of conditions requiring re-assessment and re-documentation (e.g., "Diabetes with chronic kidney disease, Stage 3 — last documented 14 months ago; recapture recommended")
- **Post-encounter documentation review**: After a complex visit, the skill identifies HCC-eligible conditions that were discussed and managed but not captured in the assessment/plan, such as major depression that was addressed through medication refill but not listed as an active diagnosis
- **Value-based care reporting**: A medical group participating in MA risk-sharing arrangements uses the skill to project RAF-based revenue for their patient panel and identify which clinics or providers have the largest recapture gaps
- **Coding accuracy validation**: Compliance teams verify that submitted HCC codes are fully supported by clinical documentation, reducing risk of CMS RADV audit findings and potential payment recovery

## Safety & Evidence

- **Safety Classification:** Safe — The skill performs documentation analysis and risk score calculations without modifying patient records, submitting claims, or altering diagnoses. All HCC identifications and RAF projections are advisory outputs for review by qualified coding and clinical staff.
- **Evidence Level:** Moderate — RAF score calculations follow CMS-HCC risk adjustment model specifications (currently V28). ICD-10 to HCC mappings use the official CMS crosswalk files. However, documentation interpretation and condition identification involve clinical judgment that the skill supports but does not replace.

## Example Usage

**Individual patient RAF analysis:**
```
Calculate RAF score for:
Patient: 72-year-old female, community-dwelling, non-dual eligible
Active diagnoses:
- Type 2 diabetes with diabetic chronic kidney disease, stage 3 (E11.22)
- Major depressive disorder, recurrent, moderate (F33.1)
- COPD with acute exacerbation (J44.1)
- Essential hypertension (I10)
- Hypothyroidism (E03.9)
```
> **RAF Score Calculation (CMS-HCC V28):**
>
> | Diagnosis | ICD-10 | HCC | Coefficient |
> |-----------|--------|-----|-------------|
> | Diabetes w/ CKD Stage 3 | E11.22 | HCC 18 (Diabetes w/ Chronic Complications) | 0.302 |
> | Major Depression, Recurrent | F33.1 | HCC 155 (Major Depression) | 0.309 |
> | COPD w/ Acute Exacerbation | J44.1 | HCC 112 (COPD) | 0.335 |
> | Hypertension | I10 | No HCC mapping | 0.000 |
> | Hypothyroidism | E03.9 | No HCC mapping | 0.000 |
>
> Demographic baseline (F, 72, community): 0.476
> Disease HCC total: 0.946
> Disease interactions: +0.121
> **Total RAF Score: 1.543**
>
> Note: Hypertension and hypothyroidism do not map to HCC categories under V28 but should remain documented for clinical accuracy.

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Health Information Management, Value-Based Care

## References

- CMS-HCC Risk Adjustment Model, Version 28 (V28). Centers for Medicare & Medicaid Services.
- CMS ICD-10-CM to HCC Crosswalk (annual release)
- Pope GC, et al. "Risk adjustment of Medicare capitation payments using the CMS-HCC model." *Health Care Financ Rev*. 2004;25(4):119-141.
- CMS Risk Adjustment Data Validation (RADV) audit methodology
- 42 CFR Part 422, Subpart G — Medicare Advantage risk adjustment regulations

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

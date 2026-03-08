---
name: systematic-review-assistant
description: >
  Assists with systematic review methodology including PICO formulation,
  search strategy development, study selection, and quality assessment using
  PRISMA guidelines.
---

# Systematic Review & Meta-Analysis Assistant

A comprehensive assistant for conducting systematic reviews and meta-analyses following PRISMA 2020 guidelines. This skill supports the entire systematic review workflow from research question formulation through PICO framework development, search strategy construction, study screening and selection, quality assessment, data extraction, and evidence synthesis reporting.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill systematic-review-assistant
```

## What It Does

- **PICO formulation**: Structures clinical research questions into the Population, Intervention, Comparison, and Outcome (PICO) framework, generating search-optimized terminology with MeSH headings and free-text synonyms for each element
- **Search strategy development**: Builds comprehensive database search strategies for PubMed/MEDLINE, Embase, Cochrane CENTRAL, CINAHL, and PsycINFO using Boolean operators, proximity searching, and controlled vocabulary appropriate to each database's syntax
- **Study screening support**: Assists with title/abstract screening and full-text review by applying pre-defined inclusion/exclusion criteria, flagging studies that clearly meet or fail criteria and highlighting borderline cases for human reviewer adjudication
- **Quality assessment**: Applies validated risk of bias tools appropriate to study design: Cochrane Risk of Bias 2 (RoB 2) for randomized trials, ROBINS-I for non-randomized interventional studies, Newcastle-Ottawa Scale for observational studies, and QUADAS-2 for diagnostic accuracy studies
- **PRISMA flow diagram and reporting**: Generates PRISMA 2020 compliant flow diagrams, summary of findings tables, evidence profile tables (GRADE approach), and structured narrative synthesis text for the final review manuscript

## Clinical Use Cases

- **Guideline development support**: A clinical practice guideline committee commissioning a systematic review on the efficacy of SGLT2 inhibitors in heart failure uses the skill to develop the search strategy, screen the retrieved 3,000+ citations, and produce evidence tables with GRADE certainty ratings for each outcome
- **Academic research**: A resident preparing a systematic review for a thesis uses the skill to formulate the PICO question, build PubMed and Embase search strings, track the screening process with inter-rater reliability metrics, and generate the PRISMA checklist for manuscript submission
- **Health technology assessment**: A hospital pharmacy and therapeutics committee evaluating whether to add a new biologic to the formulary uses the skill to conduct a rapid systematic review of comparative effectiveness studies, producing a summary of findings table within days rather than months
- **Research proposal development**: An investigator applying for grant funding uses the skill to conduct a preliminary scoping review that identifies gaps in the existing literature, demonstrating the need for the proposed study and informing the sample size calculation based on effect sizes from prior trials

## Safety & Evidence

- **Safety Classification:** Safe — The skill assists with research methodology and evidence synthesis. It does not generate clinical recommendations, treat patients, or replace the judgment of trained systematic reviewers. All screening decisions, quality assessments, and evidence interpretations must be verified by qualified researchers.
- **Evidence Level:** High — The skill's methodology adheres to established systematic review standards: PRISMA 2020 reporting guidelines, Cochrane Handbook for Systematic Reviews of Interventions, GRADE approach for certainty of evidence assessment, and validated risk of bias tools developed by international methodological experts.

## Example Usage

**PICO formulation and search strategy:**
```
Develop a systematic review protocol for:
Research question: In adult patients with type 2 diabetes and chronic kidney disease,
does the addition of a GLP-1 receptor agonist to standard care, compared to standard
care alone, reduce the composite endpoint of major adverse kidney events?
```
> **PICO Framework:**
>
> | Element | Definition | Search Terms |
> |---------|-----------|-------------|
> | **P** (Population) | Adults with T2DM and CKD | "diabetes mellitus, type 2"[MeSH] OR "type 2 diabetes" OR "T2DM" AND "renal insufficiency, chronic"[MeSH] OR "chronic kidney disease" OR "CKD" OR "diabetic nephropathy" |
> | **I** (Intervention) | GLP-1 receptor agonist | "glucagon-like peptide 1"[MeSH] OR "GLP-1 receptor agonist" OR semaglutide OR liraglutide OR dulaglutide OR exenatide OR lixisenatide |
> | **C** (Comparison) | Standard care without GLP-1 RA | "standard of care" OR "usual care" OR placebo OR "standard treatment" |
> | **O** (Outcome) | Major adverse kidney events (MAKE) | "kidney failure" OR "renal replacement therapy" OR "dialysis" OR "kidney transplantation" OR "estimated glomerular filtration rate decline" OR "eGFR" OR "MAKE" |
>
> **Eligibility Criteria:**
> - Inclusion: RCTs and quasi-experimental studies; adults >=18 years; established T2DM and CKD (eGFR <60 mL/min/1.73m2); minimum 24-week follow-up
> - Exclusion: Type 1 diabetes; ESKD on dialysis at enrollment; pediatric populations; conference abstracts without full-text; non-English publications without available translation
>
> **Databases to search:** PubMed/MEDLINE, Embase, Cochrane CENTRAL, ClinicalTrials.gov (for unpublished trial data)
>
> **PubMed search string:**
> ```
> (("diabetes mellitus, type 2"[MeSH] OR "type 2 diabetes"[tiab] OR "T2DM"[tiab])
> AND ("renal insufficiency, chronic"[MeSH] OR "chronic kidney disease"[tiab] OR "CKD"[tiab] OR "diabetic nephropathy"[tiab])
> AND ("glucagon-like peptide 1"[MeSH] OR "GLP-1"[tiab] OR "semaglutide"[tiab] OR "liraglutide"[tiab] OR "dulaglutide"[tiab])
> AND ("randomized controlled trial"[pt] OR "clinical trial"[pt]))
> ```

## Technical Details

- **Category:** Research
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Research, Epidemiology

## References

- Page MJ, et al. "The PRISMA 2020 statement: an updated guideline for reporting systematic reviews." *BMJ*. 2021;372:n71.
- Higgins JPT, et al. *Cochrane Handbook for Systematic Reviews of Interventions*. Version 6.4, 2023. Cochrane.
- Sterne JAC, et al. "RoB 2: a revised tool for assessing risk of bias in randomised trials." *BMJ*. 2019;366:l4898.
- Guyatt GH, et al. "GRADE: an emerging consensus on rating quality of evidence and strength of recommendations." *BMJ*. 2008;336:924-926.
- Stroup DF, et al. "Meta-analysis of observational studies in epidemiology (MOOSE)." *JAMA*. 2000;283(15):2008-2012.

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

---
name: evidence-synthesis-ai
description: >
  Synthesizes clinical evidence from multiple sources including PubMed,
  Cochrane, and clinical guidelines. Generates evidence summaries with
  quality grading.
---

# Clinical Evidence Synthesis Tool

Synthesize clinical evidence from multiple biomedical sources -- including PubMed, the Cochrane Library, clinical practice guidelines, and systematic review databases -- into structured, quality-graded evidence summaries. This skill enables AI agents to perform rapid evidence appraisal, generate GRADE-framework evidence tables, assess risk of bias across studies, and produce actionable clinical evidence briefs that support guideline development, clinical question answering, and evidence-based practice at the point of care.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill evidence-synthesis-ai
```

## What It Does

- **Multi-source evidence aggregation** pulling relevant studies from PubMed, Cochrane Central Register of Controlled Trials (CENTRAL), WHO ICTRP, and published clinical practice guidelines (AHA, ACC, IDSA, NICE, WHO) for a given clinical question
- **Study quality appraisal** applying validated tools for risk-of-bias assessment: Cochrane RoB 2 for randomized trials, ROBINS-I for non-randomized studies, AMSTAR 2 for systematic reviews, and Newcastle-Ottawa Scale for observational studies
- **GRADE evidence profiling** generating Grading of Recommendations Assessment, Development and Evaluation (GRADE) evidence tables that rate certainty of evidence as high, moderate, low, or very low across outcomes, with transparent justification for up- or down-grading
- **Forest plot data extraction** identifying and structuring key quantitative data (effect sizes, confidence intervals, heterogeneity statistics, sample sizes) from systematic reviews and meta-analyses for rapid comparison
- **Evidence brief generation** producing concise, structured clinical evidence summaries formatted as PICO-based answers (Patient/Population, Intervention, Comparison, Outcome) with strength-of-recommendation ratings and key caveats

## Clinical Use Cases

- **Rapid clinical question answering**: An attending physician on rounds asks whether corticosteroids reduce mortality in community-acquired pneumonia. This skill searches PubMed and Cochrane for the latest meta-analyses, extracts the pooled effect estimate, assesses the GRADE certainty level, and generates a concise evidence brief within minutes -- providing a quality-appraised answer at the bedside.
- **Guideline development support**: A guideline committee tasked with updating anticoagulation recommendations for atrial fibrillation can use this skill to compile all relevant RCTs and systematic reviews published since the last guideline version, generate GRADE evidence profiles for each PICO question, and produce draft recommendation tables for committee deliberation.
- **Journal club preparation**: A resident preparing a journal club presentation on a landmark trial can use this skill to appraise the study using the Cochrane RoB 2 tool, contextualize the findings within the existing evidence base, and generate a structured critical appraisal summary with strengths, limitations, and implications for practice.
- **Health technology assessment (HTA)**: A payer organization evaluating coverage for a new medical device can use this skill to synthesize all available comparative effectiveness evidence, assess the certainty of evidence per GRADE, and generate a structured HTA brief that informs coverage decision-making.

## Safety & Evidence

- **Safety Classification:** Safe -- This skill aggregates and appraises published evidence but does not make treatment recommendations or clinical decisions. Evidence summaries are decision-support tools that must be interpreted by qualified clinicians in the context of individual patient circumstances, values, and preferences. The skill transparently reports certainty of evidence and limitations.
- **Evidence Level:** Moderate -- The evidence synthesis methodology follows internationally recognized frameworks (GRADE, Cochrane Handbook, PRISMA). However, automated evidence synthesis is a rapidly evolving field. AI-generated appraisals should be verified by trained methodologists, particularly for high-stakes guideline recommendations. The quality of output depends on the quality and completeness of source databases.

## Example Usage

**Synthesize evidence for a clinical question:**
```
Synthesize the evidence for the following PICO question:
P: Adults with type 2 diabetes and CKD stage 3-4
I: SGLT2 inhibitors (dapagliflozin, empagliflozin, canagliflozin)
C: Placebo or standard care
O: Progression to end-stage kidney disease, cardiovascular mortality,
   serious adverse events (DKA, amputation)

Search PubMed and Cochrane for RCTs and systematic reviews.
Generate a GRADE evidence profile table rating the certainty of
evidence for each outcome. Include the pooled effect estimates
from the most recent meta-analysis.
```

**Appraise a specific systematic review:**
```
Critically appraise the following Cochrane systematic review using
AMSTAR 2: "Vitamin D supplementation for prevention of mortality
in adults" (Cochrane Database Syst Rev 2014). Assess each of the
16 AMSTAR 2 domains, rate the overall confidence in the results,
and summarize the key methodological strengths and limitations.
```

## Technical Details

- **Category:** Clinical Research Summarizing
- **Author:** OMS Contributors (original: Healthcare MCP Public)
- **License:** MIT
- **Frameworks:** GRADE (Grading of Recommendations Assessment, Development and Evaluation), Cochrane Handbook for Systematic Reviews, PRISMA 2020
- **Quality Assessment Tools:** Cochrane RoB 2, ROBINS-I, AMSTAR 2, Newcastle-Ottawa Scale, QUADAS-2
- **Data Sources:** PubMed/MEDLINE, Cochrane CENTRAL, WHO ICTRP, published CPGs
- **Output Formats:** GRADE evidence profiles, PICO-formatted summaries, risk-of-bias summary tables, forest plot data tables
- **Dependencies:** HTTP client for database queries, JSON/XML parser, optional LaTeX for formatted evidence tables

## References

- GRADE Working Group: https://www.gradeworkinggroup.org/
- Cochrane Handbook for Systematic Reviews of Interventions: https://training.cochrane.org/handbook
- PRISMA 2020 Statement: Page MJ, et al. "The PRISMA 2020 statement: an updated guideline for reporting systematic reviews." BMJ. 2021;372:n71. doi:10.1136/bmj.n71
- Cochrane Risk of Bias Tool (RoB 2): https://methods.cochrane.org/bias/resources/rob-2-revised-cochrane-risk-bias-tool-randomized-trials
- AMSTAR 2: Shea BJ, et al. "AMSTAR 2: a critical appraisal tool for systematic reviews." BMJ. 2017;358:j4008. doi:10.1136/bmj.j4008
- GRADEpro GDT: https://gradepro.org/

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

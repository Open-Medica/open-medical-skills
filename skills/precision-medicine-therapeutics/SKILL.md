---
name: precision-medicine-therapeutics
description: >
  Generate personalized treatment plans based on pharmacogenomics, variant
  interpretation, and patient-specific data. Integrates ClinPGx and ClinVar
  databases for evidence-based precision therapeutics.
---

# Precision Medicine Treatment Planning

Generate personalized treatment plans driven by pharmacogenomics, somatic and germline variant interpretation, and patient-specific clinical data. This skill integrates the Clinical Pharmacogenetics Implementation Consortium (CPIC) guidelines, ClinVar pathogenicity annotations, and PharmGKB drug-gene relationships to translate raw genomic data into actionable therapeutic recommendations.

## Quick Install

```bash
npx skills add Open-Medica/open-medical-skills --skill precision-medicine-therapeutics
```

## What It Does

- **Pharmacogenomic dosing guidance**: Maps patient genotype results (e.g., CYP2D6 poor metabolizer, CYP2C19 rapid metabolizer) to CPIC-guideline dosing recommendations for over 400 drug-gene pairs
- **Variant-to-therapy matching**: Cross-references somatic tumor variants against FDA-approved companion diagnostics and NCCN-recommended targeted therapies (e.g., EGFR mutations to osimertinib, BRAF V600E to vemurafenib/cobimetinib)
- **ClinVar and ClinPGx integration**: Pulls current pathogenicity classifications and clinical significance annotations to contextualize genomic findings within treatment decisions
- **Multi-drug interaction overlay**: After selecting genotype-guided therapies, screens the resulting regimen for drug-drug interactions using pharmacogenomic metabolism data
- **Structured treatment output**: Produces treatment plans with gene-drug pairs, recommended dose adjustments, alternative agents, monitoring parameters, and supporting evidence citations

## Clinical Use Cases

- **Antidepressant selection**: A psychiatrist orders pharmacogenomic testing for a patient with treatment-resistant depression. The skill interprets CYP2D6 and CYP2C19 results and recommends escitalopram dose reduction for ultra-rapid CYP2C19 metabolizers or suggests switching to a non-CYP2D6-dependent agent
- **Oncology targeted therapy**: A medical oncologist receives next-generation sequencing results showing an ALK rearrangement in a non-small cell lung cancer patient. The skill maps the variant to FDA-approved ALK inhibitors (crizotinib, alectinib, lorlatinib) with tier-level evidence annotations
- **Cardiology: Clopidogrel response**: A cardiologist considering dual antiplatelet therapy post-PCI uses the skill to check CYP2C19 loss-of-function allele status and recommends prasugrel or ticagrelor for intermediate/poor metabolizers per CPIC guidelines
- **Pain management pharmacogenomics**: Guides opioid selection by interpreting CYP2D6 status; flags codeine as contraindicated in ultra-rapid metabolizers due to rapid morphine conversion risk

## Safety & Evidence

- **Safety Classification:** Caution — Genomic interpretation directly influences prescribing decisions. All recommendations must be validated by a qualified clinician before implementation. The skill flags variants of uncertain significance (VUS) distinctly from pathogenic/likely pathogenic findings and does not recommend treatment changes based on VUS alone.
- **Evidence Level:** High — Recommendations are grounded in CPIC guidelines (peer-reviewed, evidence-based), PharmGKB curated annotations, ClinVar submissions from expert clinical laboratories, and FDA pharmacogenomic labeling.

## Example Usage

**Pharmacogenomic dose adjustment:**
```
Patient genotype: CYP2D6 *4/*4 (poor metabolizer)
Current medication: codeine 30mg Q4H PRN for pain
Recommend adjustment.
```
> **Result:** CYP2D6 poor metabolizer status results in negligible conversion of codeine to its active metabolite morphine. Codeine will be ineffective for analgesia. CPIC guideline recommendation: avoid codeine entirely. Consider morphine, oxycodone (partially CYP2D6-dependent but has direct analgesic activity), or non-opioid alternatives based on pain severity.

**Tumor variant therapy matching:**
```
NGS results: BRAF V600E mutation detected in metastatic melanoma
No prior targeted therapy exposure
Recommend treatment options.
```
> **Result:** BRAF V600E is an FDA-approved companion diagnostic biomarker. Recommended regimens: (1) Encorafenib + binimetinib (COLUMBUS trial, PFS 14.9 months); (2) Dabrafenib + trametinib (COMBI-d trial, PFS 11.0 months); (3) Vemurafenib + cobimetinib (coBRIM trial, PFS 12.3 months). Single-agent BRAF inhibitor monotherapy is not recommended due to inferior outcomes and rapid resistance via MAPK pathway reactivation.

## Technical Details

- **Category:** Treatment
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Medical Genetics, Oncology, Pharmacology

## References

- Clinical Pharmacogenetics Implementation Consortium (CPIC) guidelines — cpicpgx.org
- PharmGKB: Pharmacogenomics Knowledge Base — pharmgkb.org
- ClinVar database (NCBI) — ncbi.nlm.nih.gov/clinvar/
- Relling MV, Klein TE. "CPIC: Clinical Pharmacogenetics Implementation Consortium of the Pharmacogenomics Research Network." *Clin Pharmacol Ther*. 2011;89(3):464-467.
- NCCN Clinical Practice Guidelines in Oncology (current edition)
- FDA Table of Pharmacogenomic Biomarkers in Drug Labeling

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

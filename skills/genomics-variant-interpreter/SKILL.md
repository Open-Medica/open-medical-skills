# Genomic Variant Interpretation

Interpret genomic variants by querying ClinVar, gnomAD, COSMIC, and other curated genomic databases. This skill provides ACMG/AMP-aligned pathogenicity classification, population frequency analysis, clinical significance assessment, and actionability evaluation for germline and somatic variants identified through clinical genomic testing.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill genomics-variant-interpreter
```

## What It Does

- **ACMG/AMP classification framework**: Applies the American College of Medical Genetics and Genomics (ACMG) / Association for Molecular Pathology (AMP) five-tier classification system (Pathogenic, Likely Pathogenic, Variant of Uncertain Significance, Likely Benign, Benign) with documented supporting criteria codes (PVS1, PS1-4, PM1-6, PP1-5, BA1, BS1-4, BP1-7)
- **Multi-database cross-referencing**: Queries ClinVar for curated pathogenicity assertions and review status, gnomAD for population allele frequencies across diverse ancestries, COSMIC for somatic mutation frequency in cancer types, and OMIM for gene-disease associations
- **Population frequency analysis**: Compares variant allele frequency across gnomAD populations (African, East Asian, European, Latino, South Asian) to identify ancestry-specific considerations and assess rarity using BA1 and BS1 frequency thresholds
- **Somatic variant annotation**: For tumor-derived variants, provides COSMIC prevalence data, known driver/passenger classification, associated cancer types, and tier-level evidence for therapeutic relevance using the AMP/ASCO/CAP somatic variant classification system
- **Clinical actionability assessment**: Links pathogenic/likely pathogenic variants to ClinGen-curated gene-disease validity classifications and actionability scores, identifying which findings warrant clinical intervention, surveillance, or cascade family testing

## Clinical Use Cases

- **Germline genetic testing interpretation**: A genetic counselor receives whole exome sequencing results for a patient with a family history of hereditary breast/ovarian cancer. The skill interprets a BRCA2 variant, pulling ClinVar consensus (pathogenic, 4-star review status), gnomAD frequency (<0.0001), and NCCN management recommendations
- **Tumor profiling analysis**: An oncologist receives next-generation sequencing results from a solid tumor panel. The skill classifies each somatic variant by AMP/ASCO/CAP tier, identifies Tier I variants with FDA-approved companion diagnostics, and flags Tier II variants with clinical trial eligibility
- **Pharmacogenomic variant interpretation**: A clinical pharmacologist needs to interpret CYP2D6 star allele combinations. The skill translates diplotype results into metabolizer phenotype predictions and links to CPIC dosing guidelines for affected medications
- **Variant reclassification monitoring**: A molecular diagnostics lab re-evaluates a VUS reported two years ago. The skill checks for new ClinVar submissions, published functional studies, and updated population frequency data that may support reclassification

## Safety & Evidence

- **Safety Classification:** Restricted — Genomic variant interpretation directly influences clinical decision-making including surgical prophylaxis (e.g., risk-reducing mastectomy for BRCA carriers), targeted therapy selection, reproductive planning, and cascade family testing. All interpretations must be reviewed and signed out by a board-certified molecular pathologist or clinical geneticist. Variants of uncertain significance must never be used as the sole basis for clinical action. This skill provides interpretive support, not final clinical reports.
- **Evidence Level:** High — Classification follows ACMG/AMP standards (Richards et al., 2015), somatic interpretation follows AMP/ASCO/CAP guidelines (Li et al., 2017), and all database annotations are sourced from expert-curated repositories (ClinVar, ClinGen, gnomAD). However, variant interpretation is an evolving field and classifications may change as new evidence emerges.

## Example Usage

**Germline variant interpretation:**
```
Interpret variant: NM_000059.4(BRCA2):c.5946delT (p.Ser1982ArgfsTer22)
Clinical context: 38-year-old female with family history of breast cancer
(mother diagnosed at 42, maternal aunt at 45)
```
> **Variant Interpretation:**
>
> **Variant:** BRCA2 c.5946delT (p.Ser1982ArgfsTer22)
> **Type:** Frameshift deletion causing premature termination codon
> **ACMG Classification:** Pathogenic
>
> **Evidence supporting pathogenicity:**
> - PVS1 (Very Strong): Null variant (frameshift) in BRCA2, a gene where loss of function is a known disease mechanism
> - PS1 (Strong): Same amino acid change previously established as pathogenic in ClinVar (87 submissions, 4-star review status, all concordant pathogenic)
> - PM2 (Moderate): Absent from gnomAD population databases (0/251,354 alleles)
> - PP1 (Supporting): Co-segregates with disease in multiple affected families in published literature
>
> **gnomAD frequency:** Not observed (0.000000)
> **ClinVar:** Pathogenic (4-star consensus, 87 submitters)
> **OMIM:** Associated with Hereditary Breast-Ovarian Cancer Syndrome (OMIM #612555)
>
> **Clinical actionability:**
> - Refer to cancer genetics for comprehensive risk assessment
> - NCCN recommends enhanced breast surveillance (annual MRI + mammography starting at age 25) and discussion of risk-reducing surgery
> - Cascade genetic testing recommended for at-risk first-degree relatives
> - Ovarian cancer risk management per NCCN guidelines

## Technical Details

- **Category:** Clinical Research Summarizing
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Medical Genetics, Genomics

## References

- Richards S, et al. "Standards and guidelines for the interpretation of sequence variants: a joint consensus recommendation of the ACMG and AMP." *Genet Med*. 2015;17(5):405-424.
- Li MM, et al. "Standards and Guidelines for the Interpretation and Reporting of Sequence Variants in Cancer: A Joint Consensus Recommendation of AMP, ASCO, and CAP." *J Mol Diagn*. 2017;19(1):4-23.
- ClinVar database (NCBI) — ncbi.nlm.nih.gov/clinvar/
- gnomAD (Genome Aggregation Database) — gnomad.broadinstitute.org
- ClinGen Clinical Genome Resource — clinicalgenome.org
- COSMIC (Catalogue of Somatic Mutations in Cancer) — cancer.sanger.ac.uk/cosmic

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

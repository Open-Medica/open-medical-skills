---
name: hipaa-compliance-checker
description: >
  Clinical de-identification pipeline that detects 30+ PHI entity types.
  Provides masked and obfuscated output modes for HIPAA compliance. Runs
  locally with data never leaving secure environment.
---

# HIPAA Compliance & De-identification

A clinical de-identification pipeline capable of detecting and removing 30+ Protected Health Information (PHI) entity types from clinical text. The skill provides both masked output (replacing PHI with category tags like [PATIENT_NAME]) and obfuscated output (replacing PHI with realistic synthetic values) for HIPAA Safe Harbor and Expert Determination compliance. All processing runs locally with data never leaving the secure environment.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill hipaa-compliance-checker
```

## What It Does

- **30+ PHI entity detection**: Identifies all 18 HIPAA Safe Harbor identifiers plus additional clinical entities including patient names, dates of birth, medical record numbers, SSNs, phone numbers, email addresses, IP addresses, device identifiers, biometric identifiers, geographic subdivisions smaller than a state, and account numbers
- **Dual output modes**: Provides masked mode (PHI replaced with bracketed category labels for audit trails) and obfuscated mode (PHI replaced with realistic synthetic data for research datasets that need to retain statistical properties)
- **Context-aware detection**: Uses clinical NLP to distinguish between PHI and non-PHI uses of the same entity type (e.g., differentiating "Dr. Smith ordered the test" as a provider name from "the patient's brother Smith" as a relative identifier requiring de-identification)
- **Batch processing**: Processes individual clinical notes or entire document collections, producing de-identified output alongside a PHI detection report with entity counts and confidence scores
- **Compliance reporting**: Generates audit-ready reports documenting what PHI was detected, what action was taken, and the confidence level for each detection, supporting compliance officer review workflows

## Clinical Use Cases

- **Research data preparation**: A clinical researcher needs to share patient records with an external collaborator. The skill de-identifies an entire cohort's clinical notes, replacing all PHI with synthetic equivalents while preserving clinical content, temporal relationships, and data structure needed for the study
- **Training dataset creation**: A health system building an internal NLP model needs de-identified clinical text for model training. The obfuscated output mode produces realistic-looking notes that preserve linguistic patterns without exposing real patient information
- **Incident response**: After an accidental data exposure, the compliance team runs the affected documents through the skill to catalog exactly which PHI elements were present and generate a breach risk assessment
- **Cross-institutional data sharing**: Two hospitals participating in a quality improvement collaborative use the skill to de-identify outcomes data before sharing, satisfying both HIPAA Safe Harbor requirements and their respective IRB protocols

## Safety & Evidence

- **Safety Classification:** Safe — The skill removes or replaces PHI; it does not transmit, store, or expose patient data. Processing occurs entirely within the local environment. The skill is a privacy-enhancing tool that reduces PHI exposure risk.
- **Evidence Level:** High — De-identification methodology follows HIPAA Safe Harbor standards (45 CFR 164.514(b)(2)) with all 18 identifier categories covered. Clinical NLP entity detection is validated against i2b2/n2c2 de-identification benchmarks. The underlying engine has been tested across millions of clinical documents.

## Example Usage

**Masked output mode:**
```
De-identify the following clinical note (masked mode):

"John Smith, DOB 03/15/1958, MRN 4472891, was seen in clinic today at
Massachusetts General Hospital. He reports his chest pain has improved
since his visit on 02/28/2026. Contact: (617) 555-0142."
```
> **De-identified output:**
> "[PATIENT], DOB [DATE], MRN [MRN], was seen in clinic today at [FACILITY]. He reports his chest pain has improved since his visit on [DATE]. Contact: [PHONE]."
>
> **PHI Detection Report:**
> | Entity | Type | Original | Confidence |
> |--------|------|----------|------------|
> | John Smith | PATIENT_NAME | John Smith | 0.99 |
> | 03/15/1958 | DATE_OF_BIRTH | 03/15/1958 | 0.98 |
> | 4472891 | MEDICAL_RECORD_NUMBER | 4472891 | 0.97 |
> | Massachusetts General Hospital | FACILITY | MGH | 0.96 |
> | 02/28/2026 | DATE | 02/28/2026 | 0.99 |
> | (617) 555-0142 | PHONE_NUMBER | (617) 555-0142 | 0.99 |

**Obfuscated output mode:**
```
De-identify the same note (obfuscated mode)
```
> **Obfuscated output:**
> "Maria Chen, DOB 07/22/1961, MRN 7813254, was seen in clinic today at Riverside Community Medical Center. She reports her chest pain has improved since her visit on 01/15/2026. Contact: (312) 555-0897."

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors
- **License:** Commercial
- **Version:** 6.3.0
- **Specialty:** Health Information Management, Compliance
- **Review Status:** Verified by OMS Review Team

## References

- HIPAA Privacy Rule, 45 CFR 164.514(b) — Safe Harbor De-identification Standard
- HHS Guidance Regarding Methods for De-identification of Protected Health Information (2012, updated 2022)
- Stubbs A, Uzuner O, et al. "Automated systems for the de-identification of longitudinal clinical narratives: Overview of 2014 i2b2/UTHealth shared task Track 1." *J Biomed Inform*. 2015;58:S11-S19.
- Dernoncourt F, et al. "De-identification of patient notes with recurrent neural networks." *J Am Med Inform Assoc*. 2017;24(3):596-606.
- OCR HIPAA Breach Notification Rule, 45 CFR 164.400-414

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

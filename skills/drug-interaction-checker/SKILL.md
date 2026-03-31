---
name: drug-interaction-checker
description: >
  Real-time drug-drug interaction detection with five-level severity
  classification (A/B/C/D/X). Checks for drug-disease, drug-dose, and
  drug-food interactions using FDA and clinical databases.
---

# Drug Interaction Safety Checker

Real-time drug-drug interaction detection with five-level severity classification (A/B/C/D/X), modeled after the Lexicomp grading system. This skill checks for drug-disease contraindications, drug-dose range violations, and drug-food interactions by referencing FDA adverse event databases and peer-reviewed clinical pharmacology sources.

## Quick Install

```bash
npx skills add Open-Medica/open-medical-skills --skill drug-interaction-checker
```

## What It Does

- **Severity classification**: Grades every interaction on the A/B/C/D/X scale, where A indicates no known interaction and X indicates a contraindicated combination that should be avoided entirely
- **Multi-axis screening**: Evaluates drug-drug, drug-disease, drug-food, and drug-dose interactions in a single pass rather than checking each axis independently
- **Duplicate therapy detection**: Identifies overlapping pharmacologic classes when two or more agents share the same mechanism of action
- **Renal and hepatic adjustment alerts**: Flags medications that require dose modifications based on organ function, including CrCl-based thresholds and Child-Pugh scoring
- **Structured output**: Returns interaction results in a machine-readable format that downstream agents or clinical dashboards can consume directly

## Clinical Use Cases

- **Polypharmacy review**: A hospitalist adding a new antibiotic to a patient already on eight chronic medications can run the full regimen through the checker before placing the order
- **Transitions of care**: During discharge reconciliation, the skill screens the combined inpatient and outpatient medication lists for conflicts introduced during the hospital stay
- **Warfarin management**: Catches CYP2C9 and CYP3A4 interactions with newly prescribed drugs that may potentiate or diminish anticoagulant effect
- **Geriatric medication review**: Flags Beers Criteria medications and high-risk combinations common in elderly patients taking five or more concurrent drugs

## Safety & Evidence

- **Safety Classification:** Safe — The skill provides information and alerts only; it does not modify orders, prescriptions, or patient records. All interaction data is derived from published references and regulatory databases.
- **Evidence Level:** High — Interaction severity grading follows established frameworks (Lexicomp A-X scale) backed by FDA labeling, DailyMed, and published pharmacokinetic studies.

## Example Usage

**Checking a two-drug pair:**
```
Check interaction between warfarin and fluconazole
```
> **Result:** Severity X (Avoid Combination). Fluconazole is a potent CYP2C9 inhibitor that significantly increases warfarin plasma concentrations. Case reports document INR values exceeding 10 with concurrent use. If unavoidable, reduce warfarin dose by 25-50% and monitor INR every 2-3 days.

**Screening a full medication list:**
```
Screen the following regimen for interactions:
- Lisinopril 20mg daily
- Metformin 1000mg BID
- Atorvastatin 40mg daily
- Amlodipine 5mg daily
- Ibuprofen 600mg TID
```
> **Result:** Severity C (Monitor Therapy) between lisinopril and ibuprofen: NSAIDs may reduce antihypertensive efficacy and increase risk of acute kidney injury, particularly in volume-depleted patients. Consider acetaminophen as an alternative analgesic.

## Technical Details

- **Category:** Treatment
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Pharmacy, Clinical Pharmacology

## References

- Lexicomp Drug Interaction Classification System (Wolters Kluwer)
- FDA Adverse Event Reporting System (FAERS) database
- Hansten PD, Horn JR. *Drug Interactions Analysis and Management*. Wolters Kluwer, updated quarterly.
- American Geriatrics Society 2023 Updated Beers Criteria for Potentially Inappropriate Medication Use in Older Adults. *J Am Geriatr Soc*. 2023;71(7):2052-2081.
- DailyMed drug labeling repository (National Library of Medicine)

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

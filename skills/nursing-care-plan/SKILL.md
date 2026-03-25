---
name: nursing-care-plan
description: >
  Generate evidence-based nursing care plans with NANDA-I diagnoses, NOC
  outcomes, and NIC interventions. Supports individualized patient care
  planning.
---

# Nursing Care Plan Generator

Generate evidence-based nursing care plans using the NANDA-I, NOC, NIC (NNN) linkage framework. This skill connects standardized nursing diagnoses to measurable patient outcomes and specific interventions, producing structured care plans with PES-format diagnostic statements, Likert-scale outcome indicators, and detailed nursing activity lists with frequency recommendations and evidence rationale.

## Quick Install
```bash
npx skills add Open-Medica/open-medical-skills --skill nursing-care-plan
```

## What It Does
- Generates complete care plans linking NANDA-I diagnoses to NOC outcomes and NIC interventions using validated NNN linkage evidence
- Constructs PES-format diagnostic statements (Problem related to Etiology as evidenced by Signs/Symptoms) for actual diagnoses and risk-factor format for risk diagnoses
- Provides measurable NOC outcomes with specific indicators and 1-5 Likert scale ratings for baseline and target tracking
- Details NIC interventions with specific nursing activities, recommended frequencies, and evidence-based rationale citations
- Includes evaluation planning with reassessment frequency, comparison methods, and documentation guidance
- Supports three core diagnostic templates: Impaired Gas Exchange, Risk for Falls, and Acute Pain, each with multiple outcomes and interventions

## Clinical Use Cases
- **Post-Operative Respiratory Monitoring:** A nurse developing a care plan for a patient with impaired gas exchange after abdominal surgery uses the tool to generate a plan with NOC outcome "Respiratory Status: Gas Exchange" (target SpO2 >= 94%, PaO2 80-100 mmHg) and NIC interventions including airway management, oxygen therapy, and vital signs monitoring with specific Q2-4 hour activity schedules
- **Fall Prevention in Elderly Inpatients:** A charge nurse assigns a care plan for a newly admitted 78-year-old with a history of falls, altered mental status, and IV therapy. The tool generates a Risk for Falls plan with the Morse Fall Scale risk factors documented, NOC outcomes for "Risk Control: Falls" and "Fall Prevention Behavior," and NIC interventions including multi-component fall prevention (bed alarm, non-skid footwear, hourly rounding) citing Cameron et al. (Cochrane 2018)
- **Acute Pain Management on a Surgical Unit:** A bedside nurse creates a care plan for a patient reporting 7/10 pain post-operatively. The tool generates an Acute Pain plan with NOC outcomes for "Pain Level" (target <= 4/10) and "Pain Control," NIC Pain Management intervention including PQRST assessment, multimodal analgesia approach, non-pharmacological options, and reassessment timing (30 min after IV, 60 min after PO medications)
- **Nursing Education and Competency Training:** A clinical educator uses the tool to demonstrate standardized care planning for new graduate nurses, showing how NANDA-I diagnoses link to measurable outcomes and evidence-based interventions in a structured, auditable format

## Safety & Evidence
- **Safety Classification:** Caution -- Care plans must be individualized to each patient by a licensed nurse. These templates provide a starting framework based on published NNN linkages but do not account for individual patient factors, comorbidities, allergies, or institutional policies
- **Evidence Level:** Moderate -- Care plan structures based on Herdman TH, et al. *NANDA International Nursing Diagnoses: Definitions and Classification, 2024-2026* (13th Ed), Moorhead S, et al. *Nursing Outcomes Classification (NOC)* (6th Ed), Butcher HK, et al. *Nursing Interventions Classification (NIC)* (7th Ed), and Johnson M, et al. *NANDA, NOC, and NIC Linkages* (3rd Ed)

## Example Usage

**Generating a care plan for impaired gas exchange:**
```
Generate a nursing care plan for impaired gas exchange
```
Returns a complete care plan with NANDA code 00030, PES statement "Impaired Gas Exchange related to ventilation-perfusion imbalance as evidenced by abnormal arterial blood gases, abnormal skin color, confusion or restlessness," NOC outcome "Respiratory Status: Gas Exchange" with 6 measurable indicators, and 3 NIC interventions (Airway Management, Oxygen Therapy, Vital Signs Monitoring) with 18 specific nursing activities.

**Listing available diagnosis templates:**
```
List available nursing care plan diagnosis templates
```
Returns all available diagnoses with NANDA codes, domains, risk/actual classification, and the number of linked outcomes and interventions for each.

## Technical Details
- **Category:** Nursing
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialty:** Nursing
- **Available Diagnoses:** Impaired Gas Exchange (00030), Risk for Falls (00155), Acute Pain (00132)

## References
- Herdman TH, Kamitsuru S, Lopes CT. *NANDA International Nursing Diagnoses: Definitions and Classification, 2024-2026*. 13th Ed. Thieme.
- Moorhead S, et al. *Nursing Outcomes Classification (NOC)*. 6th Ed. Elsevier.
- Butcher HK, et al. *Nursing Interventions Classification (NIC)*. 7th Ed. Elsevier.
- Johnson M, et al. *NANDA, NOC, and NIC Linkages*. 3rd Ed. Elsevier.
- Cameron ID, et al. "Interventions for Preventing Falls in Older People in Care Facilities and Hospitals." *Cochrane Database Syst Rev*. 2018.
- Chou R, et al. "Management of Postoperative Pain." *J Pain*. 2016;17(2):131-157.

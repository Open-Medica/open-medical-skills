---
name: patient-assessment-tool
description: >
  Comprehensive nursing assessment tool for systematic patient evaluation.
  Covers vital signs interpretation, pain assessment, fall risk screening,
  and activities of daily living.
---

# Nursing Patient Assessment Tool

Perform comprehensive bedside patient assessments using multiple validated clinical instruments in a single workflow. This skill integrates the NEWS2 early warning score for clinical deterioration detection, the Morse Fall Scale for fall risk stratification, the Braden Scale for pressure injury risk assessment, and the PQRST framework for structured pain evaluation, each returning scored results with evidence-based intervention recommendations.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill patient-assessment-tool
```

## What It Does
- Calculates the NEWS2 (National Early Warning Score 2) from 7 physiological parameters with tiered clinical response recommendations (routine monitoring, ward-based response, urgent response, emergency response)
- Scores the Morse Fall Scale from 6 assessment items, classifying patients as low risk (0-24), moderate risk (25-44), or high risk (45+) with corresponding prevention interventions
- Evaluates pressure injury risk using the Braden Scale across 6 subscales (sensory perception, moisture, activity, mobility, nutrition, friction/shear), scoring 6-23 with lower scores indicating higher risk
- Performs structured PQRST pain assessments with numeric rating scale interpretation, severity classification, and multimodal management recommendations including non-pharmacological options
- Provides specific reassessment timing for each instrument and clinical context (e.g., 15-30 minutes after IV medication, Q shift for fall risk, Q 48-72 hours for Braden)

## Clinical Use Cases
- **Rapid Deterioration Detection on a Medical Unit:** A nurse assessing a patient with a respiratory rate of 26, heart rate of 115, BP of 95/60, SpO2 of 91% on supplemental O2, temperature 38.5C, and responding only to voice runs the NEWS2 calculator. The total score of 15 triggers an emergency response recommendation: continuous monitoring, urgent critical care team review, and consideration of ICU transfer
- **Admission Fall Risk Screening:** During hospital admission, a nurse assesses a 72-year-old patient with a history of falls, who uses a walker, has IV access, and exhibits weak gait. The Morse Fall Scale scores 85 (high risk), triggering the full fall prevention bundle: bed alarm, 1:1 sitter consideration, hourly rounding, low bed with floor mats, medication review, and physical therapy consultation
- **Pressure Injury Prevention in ICU:** A critical care nurse assessing a sedated, immobile patient on mechanical ventilation finds Braden scores of: sensory perception = 2, moisture = 2, activity = 1, mobility = 1, nutrition = 2, friction/shear = 1 (total 9, very high risk). The tool recommends Q 1-2 hour repositioning, advanced pressure-redistribution surface, wound care nurse consultation, and heel elevation
- **Post-Surgical Pain Assessment:** Following appendectomy, a patient reports 7/10 sharp, constant right lower quadrant pain that worsens with movement and improves with lying still. The PQRST assessment classifies this as severe pain, recommends prompt analgesic administration, provider notification if uncontrolled, and reassessment in 15-30 minutes post-intervention

## Safety & Evidence
- **Safety Classification:** Safe -- This tool supports nursing assessment and does not replace clinical judgment. All critical findings identified by NEWS2 or other instruments must be reported to the responsible provider immediately per institutional escalation protocols
- **Evidence Level:** Moderate -- NEWS2 validated by Smith GB, et al. (Resuscitation 2013;84(4):465-470) and endorsed by the Royal College of Physicians (2017). Morse Fall Scale validated by Morse JM (Can J Nurs Res 1989;21(4):9-19). Braden Scale validated by Braden B and Bergstrom N (Res Nurs Health 1994;17(6):459-470)

## Example Usage

**Calculating NEWS2 for a deteriorating patient:**
```
Calculate NEWS2 score: heart rate 115, systolic BP 95, diastolic BP 60, respiratory rate 26, temperature 38.5 C, SpO2 91%, consciousness V (responds to voice), supplemental O2 yes
```
Returns total NEWS2 score with component breakdown (respiratory rate = 3, SpO2 = 3, supplemental O2 = 2, systolic BP = 2, heart rate = 2, consciousness = 3, temperature = 1 = total 16), risk level "critical," emergency response recommendation, and continuous monitoring frequency.

**Assessing pain using PQRST:**
```
Assess pain: score 7/10, location right lower quadrant, quality sharp and cramping, onset 3 hours ago, duration constant with intermittent worsening, aggravating factors movement and coughing, alleviating factors lying still and ice
```
Returns severity classification "Severe," recommendation to administer prescribed analgesics promptly and notify provider, reassessment timing (15-30 min after IV, 30-60 min after PO), and non-pharmacological options (repositioning, ice application, deep breathing, distraction, massage).

## Technical Details
- **Category:** Nursing
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialty:** Nursing
- **Assessment Instruments:** NEWS2, Morse Fall Scale, Braden Scale, PQRST Pain Assessment

## References
- Smith GB, et al. "The Ability of the National Early Warning Score (NEWS) to Discriminate Patients at Risk of Early Cardiac Arrest, Unanticipated Intensive Care Unit Admission, and Death." *Resuscitation*. 2013;84(4):465-470.
- Royal College of Physicians. "National Early Warning Score (NEWS) 2: Standardising the Assessment of Acute-Illness Severity in the NHS." 2017.
- Morse JM. "Predicting Fall Risk." *Can J Nurs Res*. 1989;21(4):9-19.
- Braden B, Bergstrom N. "Predictive Validity of the Braden Scale for Pressure Sore Risk in a Nursing Home Population." *Res Nurs Health*. 1994;17(6):459-470.
- Katz S, et al. "Studies of Illness in the Aged: The Index of ADL." *JAMA*. 1963;185:914-919.

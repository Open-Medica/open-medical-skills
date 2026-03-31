---
name: clinical-guideline-navigator
description: >
  Search and navigate clinical practice guidelines from major organizations
  (AHA, ACC, ACP, IDSA, etc.). Provides evidence-graded recommendations for
  common clinical scenarios.
---

# Clinical Practice Guideline Navigator

Search, navigate, and apply clinical practice guidelines from major professional organizations including AHA, ACC, ACP, IDSA, ADA, ACOG, and dozens more. This skill provides evidence-graded recommendations for common clinical scenarios, translating dense guideline documents into concise, actionable decision points at the point of care.

## Quick Install

```bash
npx skills add Open-Medica/open-medical-skills --skill clinical-guideline-navigator
```

## What It Does

- **Multi-organization guideline search**: Queries guidelines from AHA/ACC (cardiology), IDSA (infectious disease), ADA (diabetes), ACOG (obstetrics), ATS/IDSA (pulmonology), USPSTF (preventive), and other specialty societies through a unified interface
- **Evidence grade surfacing**: Displays the recommendation class (I, IIa, IIb, III) and level of evidence (A, B-R, B-NR, C-LD, C-EO) alongside each recommendation so clinicians can assess the strength of the underlying data
- **Scenario-based retrieval**: Accepts a clinical scenario description (e.g., "new diagnosis of HFrEF, EF 30%, NYHA Class III") and returns the relevant guideline recommendations without requiring the user to know which document to search
- **Guideline comparison**: When multiple societies have published guidelines on the same topic (e.g., hypertension management per AHA/ACC vs. ESC), highlights where recommendations converge and diverge
- **Update tracking**: Flags when guidelines have been superseded by newer publications or when focused updates have modified prior recommendations

## Clinical Use Cases

- **Hypertension treatment initiation**: An internist evaluates a 52-year-old with newly diagnosed stage 1 hypertension and 10-year ASCVD risk of 12%. The skill retrieves 2017 ACC/AHA guidelines recommending pharmacotherapy for stage 1 HTN when 10-year risk exceeds 10%, and suggests thiazide diuretic, ACE inhibitor, ARB, or CCB as first-line options
- **Antibiotic selection for CAP**: An emergency physician admits a patient with community-acquired pneumonia. The skill pulls ATS/IDSA 2019 guidelines stratified by severity (outpatient vs. inpatient non-ICU vs. ICU) and MRSA/Pseudomonas risk factors to recommend the appropriate empiric regimen
- **Diabetes management escalation**: A primary care physician managing a patient whose A1C remains above target on metformin monotherapy receives guideline-concordant second-line agent recommendations from the ADA Standards of Care, stratified by comorbidities (established ASCVD, CKD, heart failure)
- **Cancer screening intervals**: A family physician queries age-appropriate cancer screening recommendations across USPSTF, ACS, and specialty society guidelines to build a personalized preventive care plan

## Safety & Evidence

- **Safety Classification:** Safe — The skill surfaces published guideline recommendations without modification. It does not generate novel treatment advice or override clinical judgment. All recommendations are attributed to their source organization and publication date.
- **Evidence Level:** High — Content is derived directly from peer-reviewed clinical practice guidelines developed through systematic evidence review processes by recognized professional organizations. The skill preserves original evidence grading and recommendation classes.

## Example Usage

**Scenario-based guideline query:**
```
Patient: 68-year-old with newly diagnosed heart failure, LVEF 25%, NYHA Class II
Currently on no cardiac medications
What does the guideline-directed medical therapy recommend?
```
> **AHA/ACC/HFSA 2022 Guideline Recommendations for HFrEF:**
> - **ACEi/ARB/ARNI** (Class I, LOE A): Initiate sacubitril/valsartan (preferred over ACEi/ARB in eligible patients) to reduce morbidity and mortality
> - **Beta-blocker** (Class I, LOE A): Initiate carvedilol, metoprolol succinate, or bisoprolol once euvolemic
> - **Mineralocorticoid receptor antagonist** (Class I, LOE A): Add spironolactone or eplerenone if eGFR >30 and K+ <5.0
> - **SGLT2 inhibitor** (Class I, LOE A): Add dapagliflozin or empagliflozin regardless of diabetes status
> - **Titration**: Uptitrate each agent to target dose as tolerated before adding the next pillar
>
> *Source: 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure, J Am Coll Cardiol. 2022;79(17):e263-e421.*

**Guideline comparison:**
```
Compare AHA/ACC and ESC recommendations for statin therapy
in primary prevention for patients aged 40-75 with LDL 130 mg/dL
```
> **AHA/ACC 2018**: Calculate 10-year ASCVD risk. If 7.5-19.9% (borderline-intermediate), consider moderate-intensity statin; if >=20%, recommend high-intensity statin. Coronary artery calcium score can reclassify if uncertain (Class IIa).
> **ESC 2021**: Uses SCORE2 risk calculation. For moderate-risk patients (SCORE2 2.5-7.5% for age <50), target LDL <100 mg/dL. For high-risk patients, target LDL <70 mg/dL.
> **Key divergence**: AHA/ACC uses statin intensity categories while ESC uses LDL target-based approach. Both agree on the benefit of statin therapy in intermediate-to-high risk primary prevention.

## Technical Details

- **Category:** Clinical Research Summarizing
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** All Specialties

## References

- 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. *J Am Coll Cardiol*. 2022;79(17):e263-e421.
- 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. *Hypertension*. 2018;71(6):e13-e115.
- Metlay JP, et al. "Diagnosis and Treatment of Adults with Community-Acquired Pneumonia: ATS/IDSA 2019." *Am J Respir Crit Care Med*. 2019;200(7):e45-e67.
- American Diabetes Association. Standards of Care in Diabetes (current year). *Diabetes Care*.
- USPSTF Recommendation Statements — uspreventiveservicestaskforce.org

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

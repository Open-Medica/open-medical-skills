# Clinical Case Scenario Generator

Generate realistic, comprehensive clinical case scenarios for medical education, simulation-based training, and clinical reasoning practice. Each case follows a structured clinical vignette format progressing from initial presentation through history, physical examination, diagnostic workup, differential diagnosis with likelihood ranking, evidence-based management plans, and board-relevant teaching points -- suitable for problem-based learning, standardized patient encounters, and self-study.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill medical-case-generator
```

## What It Does
- Creates complete clinical cases with realistic patient demographics, chief complaint, detailed history of present illness, past medical/surgical/social/family history, review of systems, vital signs, physical examination findings, laboratory values, and imaging results
- Generates ranked differential diagnoses with supporting evidence for each possibility, from most likely to least likely, teaching learners how to weigh clinical data
- Provides stepwise management plans following current practice guidelines with numbered action items, from initial stabilization through definitive treatment and follow-up
- Includes red flag identification sections highlighting critical findings that require immediate recognition and intervention
- Supports specialty-specific cases (internal medicine, emergency medicine, pediatrics, surgery, OB/GYN, psychiatry, neurology, cardiology, pulmonology, family medicine) with complexity grading (basic, intermediate, advanced)
- Offers progressive disclosure mode where learners receive the presentation first and develop their own differential before revealing the diagnosis

## Clinical Use Cases
- **Problem-Based Learning Sessions:** A PBL facilitator generates an intermediate internal medicine case presenting a 62-year-old male with 2 hours of crushing substernal chest pressure radiating to the left arm, diaphoresis, and ST depression on ECG. Students work through the differential (NSTEMI vs unstable angina vs aortic dissection vs PE vs pericarditis), review the lab findings (troponin 0.45, elevated), and develop a management plan before comparing to the evidence-based answer
- **Pediatric Clerkship Teaching:** An attending generates a pediatric case of a 21-day-old febrile infant. The case walks students through the mandatory full sepsis workup for neonates under 28 days (blood, urine, CSF cultures), empiric antibiotics (ampicillin + gentamicin), the decision to add acyclovir for HSV concern, and the teaching point that ALL febrile neonates under 28 days require admission regardless of appearance
- **Standardized Patient Encounter Preparation:** A third-year medical student preparing for an OSCE practices with a generated case that includes only the presentation and history, using the progressive disclosure feature to practice developing a differential and management plan independently before checking the answer
- **Resident Morning Report Simulation:** A chief resident selects an advanced complexity case for morning report discussion, using the detailed differential diagnosis ranking and teaching points to guide discussion of clinical reasoning, evidence-based management decisions, and identification of red flags that would change the clinical approach

## Safety & Evidence
- **Safety Classification:** Safe -- Cases are for educational purposes only. Clinical details are representative and should not be used for actual patient management. All management recommendations are based on published guidelines but should not substitute for real clinical decision-making
- **Evidence Level:** Moderate -- Case-based learning methodology supported by Barrows HS and Tamblyn RM (*Problem-Based Learning*, Springer 1980), Eva KW "What Every Teacher Needs to Know About Clinical Reasoning" (Med Educ 2005;39(1):98-106), and Kassirer JP "Teaching Clinical Reasoning" (Acad Med 2010;85(7):1118-1124). Case clinical content follows current practice guidelines

## Example Usage

**Generating an internal medicine case:**
```
Generate a clinical case in internal medicine, intermediate complexity
```
Returns a complete case: 62-year-old male retired accountant presenting with "crushing chest pressure for 2 hours." Includes detailed HPI (substernal pressure radiating to left arm and jaw, diaphoresis, nausea, at rest), PMH (HTN, DM2, HLD, former smoker), medications, social/family history (father MI at 58, brother CABG at 60), vitals (HR 92, BP 158/94, SpO2 96%), physical exam, labs (troponin 0.45, glucose 188, LDL 162), ECG (ST depression V4-V6), ranked differential (NSTEMI highest, unstable angina moderate, aortic dissection low), 9-step management plan (dual antiplatelet, heparin, nitroglycerin, beta-blocker, high-intensity statin, serial troponins, cardiology consult), and 7 teaching points including HEART score calculation.

**Listing available case specialties:**
```
List all available clinical case scenarios
```
Returns available cases with case ID, title, specialty, complexity, and chief complaint for each, along with total count and specialties covered.

## Technical Details
- **Category:** Education
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialty:** Medical Education
- **Available Specialties:** Internal Medicine, Emergency Medicine, Pediatrics, Surgery, OB/GYN, Psychiatry, Family Medicine, Neurology, Cardiology, Pulmonology
- **Complexity Levels:** Basic (early clinical), Intermediate (clerkship/intern), Advanced (resident/fellow)

## References
- Barrows HS, Tamblyn RM. *Problem-Based Learning: An Approach to Medical Education*. Springer, 1980.
- Eva KW. "What Every Teacher Needs to Know About Clinical Reasoning." *Med Educ*. 2005;39(1):98-106.
- Kassirer JP. "Teaching Clinical Reasoning: Case-Based and Coached." *Acad Med*. 2010;85(7):1118-1124.
- Amsterdam EA, et al. "2014 AHA/ACC Guideline for the Management of Patients with Non-ST-Elevation Acute Coronary Syndromes." *J Am Coll Cardiol*. 2014;64(24):e139-e228.

# Clinical Differential Diagnosis Assistant

An AI-powered clinical decision support tool that generates comprehensive, ranked differential diagnoses from patient symptoms, physical examination findings, laboratory results, and medical history. The skill applies Bayesian reasoning principles and pattern recognition across organ systems, prioritizing diagnoses by probability and clinical urgency while referencing current medical literature and diagnostic criteria.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill clinical-differential-diagnosis
```

## What It Does

- **Symptom-driven differential generation**: Accepts chief complaint, associated symptoms, temporal patterns, and pertinent negatives to produce a prioritized differential list ranked by pre-test probability
- **Multi-system integration**: Correlates findings across organ systems (e.g., linking joint pain, malar rash, and proteinuria to systemic lupus erythematosus) rather than analyzing each symptom in isolation
- **Red flag identification**: Highlights emergent and life-threatening diagnoses that require immediate evaluation or intervention, even when they are lower probability, to prevent missed critical diagnoses
- **Diagnostic workup suggestions**: For each differential diagnosis, recommends the most informative next diagnostic steps (labs, imaging, procedures) with sensitivity/specificity data where available
- **Iterative refinement**: Accepts new data (lab results, imaging findings) and dynamically reranks the differential as evidence accumulates

## Clinical Use Cases

- **Emergency department triage**: A patient presents with acute-onset chest pain, diaphoresis, and dyspnea. The skill generates a differential including ACS, pulmonary embolism, aortic dissection, tension pneumothorax, and esophageal rupture, highlighting which features favor each diagnosis and the recommended initial workup
- **Primary care undifferentiated symptoms**: A 45-year-old presents with three months of fatigue, weight gain, and cold intolerance. The skill maps these symptoms to hypothyroidism, depression, anemia, obstructive sleep apnea, and early heart failure, recommending TSH, CBC, and BMP as the highest-yield initial tests
- **Pediatric fever of unknown origin**: A child with two weeks of persistent fever, rash, and cervical lymphadenopathy triggers a differential including Kawasaki disease, EBV mononucleosis, juvenile idiopathic arthritis, and lymphoma, with emphasis on the time-sensitive Kawasaki diagnosis window
- **Atypical presentations in elderly patients**: Identifies how common conditions present differently in older adults (e.g., painless MI, afebrile infection, delirium as primary manifestation of UTI) to reduce diagnostic anchoring bias

## Safety & Evidence

- **Safety Classification:** Caution — This skill is a clinical decision support aid, not a diagnostic oracle. All generated differentials must be evaluated by a licensed clinician who integrates bedside assessment, clinical judgment, and patient context. The skill explicitly disclaims autonomous diagnostic authority and presents findings as considerations, not conclusions.
- **Evidence Level:** Moderate — Differential generation draws from established diagnostic frameworks (Harrison's, Tintinalli's, UpToDate algorithms), published sensitivity/specificity data for symptoms and tests, and validated clinical prediction rules. However, pre-test probability estimation inherently involves uncertainty and varies by clinical setting and population prevalence.

## Example Usage

**Acute presentation:**
```
55-year-old male presents with:
- Sudden onset severe headache ("worst of my life")
- Onset during exertion (lifting heavy box)
- Neck stiffness developing over 2 hours
- No fever
- No focal neurologic deficits
- PMH: hypertension, poorly controlled

Generate differential diagnosis.
```
> **Differential (ranked by urgency and probability):**
> 1. **Subarachnoid hemorrhage** (HIGH PRIORITY) — Thunderclap headache with exertional onset and meningismus is classic. Sensitivity of CT head within 6 hours is 98-100%. If CT negative, lumbar puncture is mandatory to exclude SAH.
> 2. **Intracerebral hemorrhage** — Hypertensive emergency with acute headache. CT head will differentiate from SAH.
> 3. **Cerebral venous sinus thrombosis** — Can present with thunderclap headache; consider CT venography if initial CT is nondiagnostic.
> 4. **Hypertensive emergency** — Severely elevated BP with end-organ symptoms. Check BP urgently.
> 5. **Meningitis** — Neck stiffness present but absence of fever makes this less likely; does not exclude early bacterial meningitis.
>
> **Recommended immediate workup:** Stat non-contrast CT head, blood pressure measurement, if CT negative for hemorrhage proceed to lumbar puncture with opening pressure.

## Technical Details

- **Category:** Diagnosis
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Internal Medicine, Family Medicine, Emergency Medicine

## References

- Stern SDC, Cifu AS, Altkorn D. *Symptom to Diagnosis: An Evidence-Based Guide*. 4th ed. McGraw Hill; 2020.
- Kasper DL, et al. *Harrison's Principles of Internal Medicine*. 21st ed. McGraw Hill; 2022.
- Tintinalli JE, et al. *Tintinalli's Emergency Medicine: A Comprehensive Study Guide*. 9th ed. McGraw Hill; 2020.
- Perry JJ, et al. "Clinical decision rules to rule out subarachnoid hemorrhage for acute headache." *JAMA*. 2013;310(12):1248-1255.
- Richardson WS, et al. "The well-built clinical question: a key to evidence-based decisions." *ACP J Club*. 1995;123:A12-13.

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

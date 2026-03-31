---
name: lab-result-interpreter
description: >
  Automatically extract and interpret biochemical test data from lab reports.
  Provides clinical significance analysis, reference range comparisons, and
  flags critical values.
---

# Lab Result Interpretation Assistant

Automatically extract, organize, and interpret biochemical and hematological laboratory test data from clinical lab reports. This skill provides AI agents with structured interpretation of lab values including reference range comparison, critical value flagging, clinical significance analysis, pattern recognition across related analytes, and differential diagnosis suggestions based on abnormal result patterns -- serving as a clinical decision-support tool for laboratory medicine workflows.

## Quick Install

```bash
npx skills add Open-Medica/open-medical-skills --skill lab-result-interpreter
```

## What It Does

- **Structured lab value extraction** from free-text or tabular lab reports, normalizing test names to LOINC codes and organizing results by organ system panel (metabolic, hepatic, renal, hematologic, thyroid, cardiac, coagulation)
- **Reference range comparison** with age-, sex-, and pregnancy-adjusted normal ranges, flagging values as low, normal, high, or critically abnormal with clear visual indicators
- **Critical value alerting** for results that require immediate clinical attention (e.g., potassium > 6.5 mEq/L, glucose < 40 mg/dL, INR > 5.0, hemoglobin < 7 g/dL), following CAP/CLIA critical value guidelines
- **Multi-analyte pattern recognition** to identify clinically meaningful patterns across related tests (e.g., elevated AST/ALT with high bilirubin and low albumin suggesting hepatic dysfunction, or elevated BUN/creatinine ratio suggesting prerenal azotemia)
- **Delta check analysis** comparing current results against previous values when historical data is provided, identifying clinically significant changes and trends over time

## Clinical Use Cases

- **Morning lab review efficiency**: A hospitalist rounding on 15 inpatients can feed all morning lab panels through the interpreter, receiving a prioritized summary that highlights critical values requiring immediate action, significant changes from prior results, and emerging trends -- reducing chart review time from minutes per patient to seconds.
- **Complex metabolic derangement workup**: An internist evaluating a patient with multiple electrolyte abnormalities can input a comprehensive metabolic panel and receive a structured analysis identifying the primary disorder (e.g., hyponatremia with low serum osmolality and high urine sodium suggesting SIADH), with suggested confirmatory tests.
- **Post-operative monitoring**: A surgeon reviewing labs on POD#2 after a major abdominal surgery can quickly identify concerning trends such as rising lactate, dropping hemoglobin, or worsening renal function that may indicate surgical complications requiring intervention.
- **Medical education**: A medical student interpreting their first arterial blood gas can receive a step-by-step analysis walking through pH assessment, primary disorder identification, compensation evaluation, and anion gap calculation with clinical correlation.

## Safety & Evidence

- **Safety Classification:** Caution -- While this skill provides evidence-based laboratory interpretation, lab results must always be interpreted in the clinical context of the individual patient. Automated interpretation is a decision-support aid, not a replacement for clinical judgment. Critical values must always be verified with the performing laboratory and communicated to the responsible provider per institutional protocols.
- **Evidence Level:** Moderate -- Reference ranges and critical value thresholds are based on published clinical laboratory standards (CLSI, CAP, AACC guidelines). Interpretive patterns follow established clinical pathology textbooks and clinical practice guidelines. However, individual patient factors (medications, comorbidities, specimen quality) may significantly alter interpretation.

## Example Usage

**Interpret a comprehensive metabolic panel:**
```
Interpret these lab results for a 68-year-old male:
Na 128, K 5.8, Cl 98, CO2 18, BUN 45, Creatinine 3.2,
Glucose 95, Calcium 7.8, Albumin 2.1, Total Protein 5.5,
AST 22, ALT 18, Alk Phos 85, Total Bilirubin 0.6

Previous labs from 3 days ago: Na 134, K 4.2, Creatinine 1.4,
BUN 22. Flag critical values and identify patterns.
```

**Analyze a CBC with differential:**
```
Interpret this CBC for a 45-year-old female presenting with fatigue:
WBC 2.1, RBC 3.2, Hemoglobin 8.5, Hematocrit 26, MCV 112,
MCH 38, MCHC 32, RDW 18.5, Platelets 95
Differential: Neutrophils 35%, Lymphocytes 50%, Monocytes 10%,
Eosinophils 3%, Basophils 2%
Reticulocyte count: 0.5%

Identify the type of anemia and suggest further workup.
```

## Technical Details

- **Category:** Lab/Imaging
- **Author:** OMS Contributors (original: Claude-Ally-Health / WellAlly Tech)
- **License:** MIT
- **Reference Standards:** CLSI C28-A3 (reference intervals), CAP critical value guidelines, AACC laboratory practice guidelines
- **Supported Panels:** BMP, CMP, CBC w/diff, LFTs, TFTs, lipid panel, coagulation studies, cardiac biomarkers, urinalysis, ABG, iron studies, B12/folate
- **Coding Systems:** LOINC (Logical Observation Identifiers Names and Codes) for test standardization
- **Dependencies:** None (rule-based interpretation engine with optional LLM enhancement)

## References

- Clinical and Laboratory Standards Institute (CLSI): https://clsi.org/
- College of American Pathologists (CAP) Critical Values: https://www.cap.org/
- American Association for Clinical Chemistry (AACC): https://www.aacc.org/
- LOINC (Logical Observation Identifiers Names and Codes): https://loinc.org/
- Wallach's Interpretation of Diagnostic Tests, 11th Edition. Lippincott Williams & Wilkins, 2020.
- Henry's Clinical Diagnosis and Management by Laboratory Methods, 24th Edition. Elsevier, 2021.

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

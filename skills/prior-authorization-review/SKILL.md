---
name: prior-authorization-review
description: >
  Official Anthropic skill for insurance prior authorization review
  workflows. Cross-references coverage requirements, clinical guidelines, and
  patient records.
---

# Prior Authorization Review Assistant

An AI-powered assistant for insurance prior authorization review workflows that cross-references payer coverage criteria, clinical practice guidelines, and patient medical records to streamline the prior authorization process. Originally developed as an official Anthropic skill, this tool helps clinicians and administrative staff build medical necessity arguments, identify required supporting documentation, and draft appeal letters when authorizations are denied.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill prior-authorization-review
```

## What It Does

- **Coverage criteria matching**: Analyzes the requested service or medication against payer-specific coverage policies, identifying which medical necessity criteria must be met and documenting how the patient's clinical situation satisfies each requirement
- **Step therapy verification**: Determines whether step therapy (fail-first) requirements apply, identifies which prior treatments the patient has already tried, and documents therapeutic failures or contraindications that justify skipping steps
- **Supporting documentation assembly**: Identifies and lists the specific clinical documents (lab results, imaging reports, specialist notes, prior treatment records) needed to support the authorization request, flagging any gaps
- **Peer-to-peer preparation**: Generates structured clinical talking points for physician peer-to-peer review calls with insurance medical directors, organized around the relevant coverage criteria and clinical guideline recommendations
- **Appeal letter drafting**: When an authorization is denied, the skill produces a clinical appeal letter citing applicable medical literature, guideline recommendations, and patient-specific factors that establish medical necessity

## Clinical Use Cases

- **Specialty medication authorization**: A rheumatologist prescribes a biologic (adalimumab) for a patient with moderate-to-severe rheumatoid arthritis who has failed methotrexate. The skill cross-references the insurer's step therapy requirements, confirms DMARD failure documentation is in the chart, and generates the prior auth submission narrative
- **Advanced imaging authorization**: A neurologist orders a brain MRI with contrast for new-onset seizures. The skill identifies the applicable ACR Appropriateness Criteria rating (usually appropriate, score 8), locates the payer's imaging prior auth requirements, and prepares the clinical justification
- **Surgical pre-authorization**: An orthopedic surgeon plans a total knee arthroplasty. The skill verifies that conservative therapy documentation (physical therapy duration, NSAID trials, cortisone injection dates) meets the insurer's minimum requirements and flags any documentation gaps before submission
- **Denied authorization appeal**: After a denied prior auth for a GLP-1 receptor agonist, the skill reviews the denial reason, identifies the specific criterion not met, pulls relevant ADA guideline recommendations and clinical trial data, and drafts a detailed clinical appeal letter

## Safety & Evidence

- **Safety Classification:** Safe — The skill assists with documentation and administrative processes. It does not make clinical decisions, alter prescriptions, or submit claims. All output is intended for review by qualified clinical and administrative staff before submission to payers.
- **Evidence Level:** Moderate — The skill references published clinical practice guidelines (ADA, ACR, AHA, NCCN, etc.) and evidence-based medical literature to support medical necessity arguments. Coverage criteria interpretation is based on publicly available payer policies, though specific plan variations may apply.

## Example Usage

**Prior authorization preparation:**
```
Prepare prior authorization for:
Medication: Dupilumab 300mg subcutaneous every 2 weeks
Patient: 34-year-old with moderate-to-severe atopic dermatitis
Insurance: Blue Cross Blue Shield
Prior treatments: Failed topical corticosteroids (clobetasol 3 months),
  tacrolimus ointment (4 months), phototherapy (6 months, partial response),
  and cyclosporine (discontinued after 3 months due to nephrotoxicity)
Current EASI score: 28 (severe)
```
> **Prior Authorization Summary:**
>
> **Medical Necessity Criteria Met:**
> 1. Diagnosis confirmed: Moderate-to-severe atopic dermatitis (L20.9), EASI score 28 (severe range: >21)
> 2. Step therapy satisfied:
>    - Topical corticosteroids: Failed (clobetasol x 3 months, inadequate response)
>    - Topical calcineurin inhibitor: Failed (tacrolimus x 4 months, inadequate response)
>    - Phototherapy: Partial response after 6 months, insufficient disease control
>    - Systemic immunosuppressant: Cyclosporine discontinued due to adverse effect (nephrotoxicity) — meets exception criteria for step-therapy bypass
> 3. FDA-approved indication: Dupilumab is FDA-approved for moderate-to-severe atopic dermatitis in adults inadequately controlled with topical therapies
>
> **Required Supporting Documents:**
> - Dermatology notes documenting EASI score assessment
> - Pharmacy records confirming prior medication trials and durations
> - Nephrology or PCP note documenting cyclosporine-related nephrotoxicity
> - Phototherapy treatment log with dates and response assessment
>
> **Guideline Support:** AAD 2024 guidelines recommend dupilumab as first-line systemic biologic therapy for moderate-to-severe AD after inadequate response to topical therapies (Strength: A, Evidence: I).

## Technical Details

- **Category:** Administrative
- **Author:** Anthropic
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Utilization Management, Insurance
- **Review Status:** Verified by Anthropic (Official)

## References

- CMS Medicare Benefit Policy Manual, Chapter 15 — Covered Medical and Other Health Services
- AMA Prior Authorization and Utilization Management Reform Principles (2022)
- Eichenfield LF, et al. "Guidelines of care for the management of atopic dermatitis." *J Am Acad Dermatol*. 2024.
- ACR Appropriateness Criteria (American College of Radiology)
- NCCN Clinical Practice Guidelines — prior authorization support documentation
- 42 CFR 422.112 — Medicare Advantage organization determination and appeal requirements

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

---
name: cpt-coding-assistant
description: >
  AI-driven CPT coding validation and suggestion tool. Validates procedure
  codes against clinical documentation and identifies potential coding gaps.
---

# CPT Procedure Code Assistant

An AI-driven CPT (Current Procedural Terminology) coding validation and suggestion tool that analyzes clinical documentation to identify appropriate procedure codes, detect coding gaps, validate code-documentation alignment, and flag potential compliance issues. Designed to support medical coders, billers, and clinicians in accurate charge capture and reimbursement optimization.

## Quick Install

```bash
npx skills add Open-Medica/open-medical-skills --skill cpt-coding-assistant
```

## What It Does

- **Documentation-to-code mapping**: Analyzes clinical notes, operative reports, and procedure documentation to suggest the most accurate CPT codes, including appropriate modifiers (-25, -59, -76, -RT/LT, etc.)
- **E/M level validation**: Evaluates Evaluation and Management documentation against 2021 E/M guideline criteria (medical decision making or total time) to confirm the billed level is supported by the note content
- **Coding gap detection**: Identifies documented procedures, services, or complexity factors that were performed but not captured in the charge, preventing revenue leakage
- **Bundling and unbundling analysis**: Checks for National Correct Coding Initiative (NCCI) edit pairs to prevent improper unbundling while also identifying when modifier use legitimately allows separate reporting
- **Compliance risk flagging**: Highlights patterns that could trigger audit risk, such as high-frequency use of high-level E/M codes, unusual modifier patterns, or documentation that does not support medical necessity

## Clinical Use Cases

- **Post-encounter charge capture**: After a complex office visit involving a new patient evaluation, EKG interpretation, and joint injection, the skill identifies all billable CPT codes (99205, 93010-26, 20610) and confirms modifier requirements
- **Surgical operative report coding**: A general surgeon completes a laparoscopic cholecystectomy with intraoperative cholangiogram. The skill maps the operative report to 47563 (lap chole with cholangiography) rather than the unbundled combination of 47562 + 47564, preventing a coding error
- **E/M documentation improvement**: A physician's note for a follow-up visit documents moderate complexity medical decision making. The skill confirms this supports a 99214 and identifies additional documented elements that could support 99215 if the note is amended to reflect them
- **Pre-billing audit**: The compliance team runs a batch of encounters through the skill to identify claims with high denial probability due to documentation-code mismatches before submission

## Safety & Evidence

- **Safety Classification:** Caution — CPT coding directly affects reimbursement and regulatory compliance. Code suggestions are advisory and must be reviewed by qualified medical coders or billing professionals. Incorrect coding can result in claim denials, audits, or compliance violations. This tool does not replace professional coding certification or judgment.
- **Evidence Level:** Moderate — Code mapping follows AMA CPT guidelines, CMS NCCI edits, and published coding references. E/M validation uses the 2021 AMA/CMS E/M documentation guidelines. However, payer-specific policies and local coverage determinations may modify standard coding rules.

## Example Usage

**Office visit code suggestion:**
```
Review this encounter note for CPT coding:

Chief complaint: Follow-up type 2 diabetes and new onset knee pain
History: Reviewed glucose logs, discussed dietary adherence, new right knee swelling x 2 weeks
Exam: General, cardiovascular, musculoskeletal (detailed right knee exam)
Assessment: T2DM uncontrolled A1C 8.5%, right knee effusion - likely OA vs gout
Plan: Increase metformin, order A1C in 3 months, right knee X-ray,
      aspirated right knee joint (20cc straw-colored fluid sent for crystal analysis),
      triamcinolone 40mg injected into right knee
```
> **Recommended CPT Codes:**
> - **99214-25** — Established patient E/M, moderate MDM (2 chronic conditions, one uncontrolled + new problem with additional workup). Modifier -25 required for separately identifiable E/M on same day as procedure.
> - **20610-RT** — Arthrocentesis, major joint (knee), with injection. Modifier -RT for right side.
> - **Note:** Joint aspiration and injection at the same site/session are bundled into 20610; do not separately report aspiration (20610 includes both).

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Medical Coding, Billing

## References

- AMA CPT Professional Edition (current year). American Medical Association.
- CMS National Correct Coding Initiative (NCCI) Policy Manual and Edits
- 2021 AMA/CMS E/M Documentation Guidelines for Office/Outpatient Services
- CMS Medicare Claims Processing Manual, Chapter 12 (Physicians/Nonphysician Practitioners)
- Abraham M, Ahlman JT, et al. *CPT Changes: An Insider's View* (current year). AMA Press.

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

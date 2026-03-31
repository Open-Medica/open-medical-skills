---
name: medication-administration-safety
description: >
  Five Rights of medication administration checker for nursing. Verifies
  right patient, drug, dose, route, and time before medication
  administration.
---

# Medication Administration Safety Check

Verify the Five Rights of medication administration before every drug is given to a patient. This skill provides a systematic checklist-based verification of right patient, right drug, right dose, right route, and right time, along with additional safety checks for allergies, drug interactions, and documentation completeness, reducing the risk of preventable medication errors at the bedside.

## Quick Install
```bash
npx skills add Open-Medica/open-medical-skills --skill medication-administration-safety
```

## What It Does
- Enforces the Five Rights verification workflow: Right Patient (two-identifier match), Right Drug (name, generic/brand cross-check), Right Dose (compared to ordered dose and standard ranges), Right Route (matches order and drug formulation), and Right Time (administration window and scheduling)
- Extends the classic Five Rights with additional safety gates: Right Documentation (MAR completion), Right Reason (indication verification), Right Response (post-administration monitoring plan), and allergy cross-check
- Flags high-alert medications (anticoagulants, insulins, opioids, concentrated electrolytes) for mandatory double-check verification per ISMP guidelines
- Generates a pre-administration safety summary suitable for bedside use, shift handoff, and quality assurance documentation
- Identifies common error-prone situations: sound-alike/look-alike drug names, decimal point errors, trailing zeros, and unit confusion (mg vs mcg)

## Clinical Use Cases
- **Bedside Medication Pass:** A nurse preparing to administer metoprolol 25 mg PO uses the tool to verify: patient wristband matches order, drug name confirmed against MAR, dose is within standard range, oral route matches the tablet formulation, and the scheduled time is within the administration window. The tool confirms all five rights and documents the verification
- **High-Alert Medication Double Check:** Before administering a heparin infusion, the tool flags this as an ISMP high-alert medication requiring independent double-check by a second nurse. It verifies the concentration, rate calculation, patient weight for weight-based dosing, and documents both verifiers
- **Allergy Cross-Reference:** A nurse receives an order for amoxicillin for a patient whose allergy list includes penicillin. The tool flags the cross-sensitivity between penicillin and amoxicillin (both beta-lactam antibiotics), generating an alert to verify the reaction type with the patient and contact the prescriber before administration
- **Preventing Look-Alike Sound-Alike Errors:** The tool detects that "hydroxyzine" and "hydralazine" are on the ISMP look-alike/sound-alike list and prompts the nurse to verify the exact drug name against the original order using both generic and brand names, not just the first few letters

## Safety & Evidence
- **Safety Classification:** Safe -- This tool reinforces established medication safety practices and serves as a cognitive aid for the medication administration process. It does not replace institutional policies, pharmacist verification, or nursing professional judgment
- **Evidence Level:** High -- Based on the Institute for Safe Medication Practices (ISMP) guidelines for safe medication administration, The Joint Commission National Patient Safety Goals, and the extensive medication error literature including Bates DW, et al. "The Costs of Adverse Drug Events in Hospitalized Patients" (JAMA 1997;277(4):307-311) documenting that preventable medication errors affect 5.3% of hospital admissions

## Example Usage

**Standard Five Rights verification:**
```
Verify medication administration: patient John Doe (MRN 12345), drug metoprolol tartrate 25 mg, route PO, scheduled time 08:00
```
Returns a checklist confirming each of the Five Rights with verification status, flags any discrepancies, and generates a documentation-ready safety summary.

**High-alert medication check:**
```
Verify high-alert medication: patient Jane Smith (MRN 67890), drug heparin 25,000 units in 500 mL D5W, rate 1,200 units/hour, patient weight 80 kg
```
Returns: HIGH-ALERT MEDICATION flag, confirms weight-based dosing calculation (15 units/kg/hr = 1,200 units/hr for 80 kg), requires independent double-check documentation by second nurse, and notes monitoring requirements (aPTT in 6 hours per protocol).

## Technical Details
- **Category:** Nursing
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialties:** Nursing, Pharmacy

## References
- Institute for Safe Medication Practices (ISMP). "ISMP List of High-Alert Medications in Acute Care Settings." Updated 2024.
- Institute for Safe Medication Practices (ISMP). "ISMP List of Confused Drug Names." Updated 2023.
- The Joint Commission. "National Patient Safety Goals for Hospital Programs." 2026.
- Bates DW, et al. "The Costs of Adverse Drug Events in Hospitalized Patients." *JAMA*. 1997;277(4):307-311.
- Aspden P, et al. *Preventing Medication Errors*. Institute of Medicine. National Academies Press, 2007.

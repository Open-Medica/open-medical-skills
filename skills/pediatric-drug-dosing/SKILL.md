# Pediatric Drug Dosing Calculator

Calculate weight-based and body-surface-area-based drug doses for pediatric patients with built-in safety checks, maximum dose enforcement, and age-appropriate validation. Medication errors are three times more common in children than adults, and this skill provides multiple safety layers to reduce dosing errors at the point of care.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill pediatric-drug-dosing
```

## What It Does
- Calculates mg/kg dose ranges for common pediatric medications with frequency and route recommendations
- Enforces absolute maximum single-dose and daily-dose caps to prevent dangerous overdoses, including 10-fold errors
- Validates patient age against medication restrictions (e.g., ibuprofen contraindicated under 6 months, ceftriaxone caution in neonates under 28 days)
- Computes body surface area using the Mosteller formula for BSA-based dosing when height is provided
- Screens for known contraindications and generates clinical alerts before prescribing
- Provides indication-specific dosing guidance, available formulations/concentrations, and practical administration tips

## Clinical Use Cases
- **Acute Otitis Media Dosing:** A pediatrician prescribing amoxicillin for a 20 kg child with acute otitis media uses the tool to confirm the standard dose (25-45 mg/kg/day TID) versus high-dose regimen (80-90 mg/kg/day BID for resistant organisms), with the tool capping at maximum single dose and flagging available suspension concentrations
- **Emergency Department Fever Management:** An ED physician calculates acetaminophen and ibuprofen doses for a febrile 8 kg infant, with the tool automatically flagging that ibuprofen is not recommended under 6 months and providing the correct infant concentration (160 mg/5 mL suspension)
- **Neonatal Meningitis Coverage:** A hospitalist ordering ceftriaxone for an 8 kg infant with suspected serious bacterial infection receives the tool's dose calculation (50-100 mg/kg/day) along with a critical alert about the absolute contraindication in neonates under 28 days receiving calcium-containing IV solutions
- **Weight-Based Antiemetic Dosing:** A nurse practitioner uses the tool to verify ondansetron dosing for a child with gastroenteritis, receiving both the mg/kg calculation and the simplified weight-band dosing (8-15 kg = 2 mg, 15-30 kg = 4 mg, >30 kg = 8 mg)

## Safety & Evidence
- **Safety Classification:** Caution -- All calculated doses MUST be independently verified by a licensed pharmacist or physician before administration. This tool is a clinical decision support aid and does not replace professional judgment or current drug reference resources
- **Evidence Level:** High -- Drug dosing data sourced from Taketomo CK, et al. *Pediatric & Neonatal Dosage Handbook* (Lexicomp, latest edition), with safety architecture informed by Kaushal R, et al. "Medication Errors and Adverse Drug Events in Pediatric Inpatients" (JAMA 2001;285(16):2114-2120)

## Example Usage

**Calculating amoxicillin dose for a 5-year-old:**
```
Calculate amoxicillin dose for a 20 kg child, age 60 months
```
Returns: 500-900 mg per dose (25-45 mg/kg), frequency Q8H (standard) or Q12H (high dose), maximum single dose 500 mg, oral route, available as 250 mg/5 mL or 400 mg/5 mL suspension. Includes clinical notes on high-dose regimens for AOM with risk factors and duration guidance.

**BSA calculation for chemotherapy dosing:**
```
Calculate BSA for a child weighing 25 kg and 120 cm tall
```
Returns: BSA 0.9129 m2 using Mosteller formula: sqrt((height x weight) / 3600).

## Technical Details
- **Category:** Pediatrics
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialties:** Pediatrics, Pharmacy
- **Medications Covered:** Amoxicillin, amoxicillin-clavulanate, acetaminophen, ibuprofen, ceftriaxone, prednisolone, ondansetron, albuterol

## References
- Taketomo CK, Hodding JH, Kraus DM. *Pediatric & Neonatal Dosage Handbook*. Lexicomp, Latest Edition.
- Kaushal R, et al. "Medication Errors and Adverse Drug Events in Pediatric Inpatients." *JAMA*. 2001;285(16):2114-2120.
- Mosteller RD. "Simplified Calculation of Body-Surface Area." *N Engl J Med*. 1987;317:1098.

---
name: vaccine-schedule-tracker
description: >
  CDC/WHO immunization schedule tracker for pediatric and adult vaccinations.
  Identifies overdue vaccines and generates catch-up schedules.
---

# Immunization Schedule Tracker

Track pediatric and adult immunization status against the CDC Advisory Committee on Immunization Practices (ACIP) recommended schedule. This skill identifies overdue vaccines, generates catch-up schedules with minimum intervals and minimum ages, screens for contraindications, and supports opportunistic immunization at every clinical encounter to reduce missed vaccination opportunities.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill vaccine-schedule-tracker
```

## What It Does
- Generates a complete immunization status report assessing all age-appropriate vaccines simultaneously, classifying each as up-to-date, due now, overdue, not yet due, or series complete
- Identifies overdue vaccines and provides minimum interval and minimum age guidance for catch-up immunization per ACIP general best practice guidelines
- Screens patient conditions and allergies against known vaccine contraindications and precautions before administration (e.g., SCID for rotavirus, severe immunodeficiency for live vaccines)
- Alerts when multiple live injectable vaccines are due and enforces the 28-day minimum spacing rule
- Provides age-appropriate filtering so only relevant vaccines are displayed for the patient's current age
- Calculates next recommended well-child visit age for continued immunization follow-up

## Clinical Use Cases
- **12-Month Well-Child Visit:** A pediatrician enters a patient's date of birth and vaccination history. The tool identifies that the child is due for MMR dose 1, Varicella dose 1, Hepatitis A dose 1, Hib booster, and PCV booster, and flags that Influenza is overdue if not yet given this season. The live vaccine spacing alert notes that MMR and Varicella can be given on the same day or must be separated by 28 days
- **Catch-Up Immunization for a New Patient:** A 4-year-old transfers into a new practice with incomplete records showing only 2 DTaP doses and 2 IPV doses. The tool generates a catch-up plan with minimum intervals, showing the child needs DTaP dose 3 (minimum 28 days after dose 2), DTaP dose 4 (minimum 6 months after dose 3), plus all missing vaccines
- **Pre-Travel Immunization Review:** A family planning international travel brings their 8-month-old for evaluation. The tool notes that while MMR is not routinely recommended until 12 months, a dose can be given as early as 6 months for international travel (with notation that this early dose does not count toward the routine series)
- **Contraindication Screening Before Immunization:** Before administering rotavirus vaccine to an infant, the nurse runs a contraindication check. The tool screens the patient's history of intussusception and flags it as a contraindication, recommending the vaccine NOT be administered

## Safety & Evidence
- **Safety Classification:** Safe -- The tool supports immunization decision-making but does not replace clinical judgment. All vaccines should be administered per current ACIP guidelines, and schedules are updated annually
- **Evidence Level:** High -- Based on CDC ACIP Recommended Immunization Schedules for Children/Adolescents (2026) and Adults (2026), and Kroger A, et al. "General Best Practice Guidelines for Immunization" (ACIP, Updated 2023). Coverage statistics from Whitney CG, et al. (MMWR 2014;63(16):352-355)

## Example Usage

**Full immunization report for a 12-month-old:**
```
Generate immunization report for patient born 2025-03-03 with the following vaccination history: HepB on 2025-03-03, 2025-04-03, 2025-09-03; RV on 2025-05-03, 2025-07-03, 2025-09-03; DTaP on 2025-05-03, 2025-07-03, 2025-09-03; Hib on 2025-05-03, 2025-07-03, 2025-09-03; PCV on 2025-05-03, 2025-07-03, 2025-09-03; IPV on 2025-05-03, 2025-07-03, 2025-09-03
```
Returns a comprehensive report showing HepB series complete, RV series complete, DTaP dose 4 due at 15 months, Hib booster due now, PCV booster due now, IPV dose 4 due at 48 months, MMR dose 1 due now, Varicella dose 1 due now, HepA dose 1 due now, and Influenza due annually starting at 6 months.

**Contraindication screening:**
```
Screen contraindications for MMR vaccine in a patient with severe immunodeficiency (HIV with CD4 < 15%)
```
Returns: CONTRAINDICATION IDENTIFIED. Do NOT administer. The tool flags severe immunodeficiency as a known MMR contraindication and recommends consulting immunization guidelines.

## Technical Details
- **Category:** Public Health
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialties:** Public Health, Family Medicine, Pediatrics
- **Vaccines Covered:** HepB, Rotavirus (RV5/RV1), DTaP, Hib, PCV15/PCV20, IPV, MMR, Varicella, HepA, Influenza (IIV/LAIV)

## References
- CDC. "Recommended Child and Adolescent Immunization Schedule for Ages 18 Years or Younger." ACIP, 2026.
- CDC. "Recommended Adult Immunization Schedule for Ages 19 Years or Older." ACIP, 2026.
- Kroger A, et al. "General Best Practice Guidelines for Immunization." ACIP, Updated 2023.
- Whitney CG, et al. "Benefits from Immunization During the Vaccines for Children Program Era -- United States, 1994-2013." *MMWR*. 2014;63(16):352-355.

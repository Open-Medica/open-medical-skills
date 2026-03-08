---
name: developmental-milestone-tracker
description: >
  Track and assess pediatric developmental milestones from birth to 5 years.
  Flags potential delays using CDC developmental surveillance guidelines.
---

# Developmental Milestone Tracker

Track and assess pediatric developmental milestones from birth to 5 years across five developmental domains. Based on the CDC's 2022 updated "Learn the Signs. Act Early." milestones and the AAP Bright Futures framework, this skill provides structured checklists with automated delay detection, critical milestone flagging, and referral guidance for well-child visits.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill developmental-milestone-tracker
```

## What It Does
- Provides age-appropriate milestone checklists from 2 months through 60 months across gross motor, fine motor, language/communication, cognitive, and social-emotional domains
- Flags critical milestones whose absence warrants prompt developmental evaluation (e.g., not pulling to stand by 12 months, no words by 18 months)
- Calculates domain-level percentage scores to identify specific areas of developmental concern
- Generates prioritized referral recommendations (urgent, high, moderate, routine) based on the severity and pattern of delays
- Integrates with the AAP-recommended formal screening tool schedule, alerting when ASQ-3, M-CHAT-R/F, or PEDS screening is due

## Clinical Use Cases
- **Well-Child Visit Surveillance:** A pediatrician conducting a 9-month well-child visit uses the tool to pull up the age-appropriate milestone checklist, systematically assessing each domain with the parent to identify any emerging delays before they become significant
- **Early Intervention Referral:** A family medicine physician assessing an 18-month-old finds that the child is not walking independently and not pointing to show interest -- both critical milestones. The tool flags these as urgent and generates a referral recommendation for Early Intervention and developmental-behavioral pediatrics
- **Developmental Monitoring in High-Risk Infants:** A NICU follow-up clinic uses the tracker to monitor premature infants at corrected age milestones, identifying domain-specific delays early enough to maximize the benefit of therapeutic intervention
- **Parent Education:** During a 24-month visit, the tool generates developmental promotion activities (reading together, encouraging age-appropriate play, limiting screen time) as anticipatory guidance for caregivers

## Safety & Evidence
- **Safety Classification:** Safe -- This is a developmental surveillance tool that supports clinical decision-making but does not replace validated screening instruments (ASQ-3, M-CHAT-R/F, PEDS) or comprehensive developmental evaluation by qualified professionals
- **Evidence Level:** High -- Milestone checklists are based on Zubler JM, et al. "Evidence-Informed Milestones for Developmental Surveillance" (Pediatrics 2022;149(3):e2021052138), which shifted CDC milestones to the 75th percentile threshold, and the AAP Bright Futures Guidelines for Health Supervision, 4th Edition

## Example Usage

**Generating a milestone checklist for a 12-month visit:**
```
Use the developmental milestone tracker for a 12-month-old child
```
Returns the complete checklist for the 12-month bracket: plays pat-a-cake, waves bye-bye, calls parent "mama" or "dada," understands "no," puts objects in containers, object permanence, pulls to stand (critical), cruises on furniture, and pincer grasp.

**Assessing a child with potential delays:**
```
Assess milestones for a 12-month-old: pulls to stand = not_yet, walks holding furniture = not_yet, calls parent mama/dada = not_yet, waves bye-bye = achieved, plays pat-a-cake = achieved, understands no = emerging, puts something in container = achieved, looks for hidden things = achieved, pincer grasp = achieved
```
Returns domain-specific analysis showing gross motor at 0% on track with critical flag for "pulls up to stand," language at 33% with concern for absent first words, and an urgent referral recommendation for developmental-behavioral pediatrics and Early Intervention evaluation.

## Technical Details
- **Category:** Pediatrics
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialties:** Pediatrics, Developmental-Behavioral Pediatrics

## References
- Zubler JM, et al. "Evidence-Informed Milestones for Developmental Surveillance." *Pediatrics*. 2022;149(3):e2021052138.
- CDC. "Learn the Signs. Act Early." Program, Updated 2022.
- Lipkin PH, Macias MM. "Promoting Optimal Development: Identifying Infants and Young Children with Developmental Disorders Through Developmental Surveillance and Screening." *Pediatrics*. 2020;145(1):e20193449.
- Hagan JF, et al. *Bright Futures: Guidelines for Health Supervision of Infants, Children, and Adolescents*. 4th Ed. AAP, 2017.

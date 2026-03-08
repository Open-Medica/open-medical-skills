# Medical Board Exam Preparation

Prepare for USMLE (Steps 1, 2 CK, 3) and COMLEX (Levels 1, 2-CE) board examinations with an AI-powered study assistant that combines evidence-based spaced repetition, performance analytics, and adaptive study planning. This skill implements the SM-2 algorithm for optimized review scheduling, tracks accuracy across all USMLE disciplines and organ systems, identifies knowledge gaps, and generates personalized study plans based on time remaining and performance data.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill board-exam-prep
```

## What It Does
- Implements the SM-2 spaced repetition algorithm to schedule review of high-yield material at scientifically optimal intervals, adjusting ease factor and interval length based on recall quality (0-5 scale)
- Tracks performance across 17 USMLE disciplines (anatomy, biochemistry, physiology, pathology, pharmacology, microbiology, immunology, behavioral science, biostatistics, internal medicine, surgery, pediatrics, OB/GYN, psychiatry, preventive medicine, neuroscience, genetics) and 12 organ systems
- Identifies weak areas (below 60% accuracy with 5+ attempts) and strong areas (above 80%) to prioritize study time where it matters most
- Generates structured study plans with phase-appropriate strategies: Early Preparation (>12 weeks), Content Review (6-12 weeks), Intensive Review (2-6 weeks), and Final Review (<2 weeks)
- Provides high-yield topic banks with priority rankings based on historical exam weighting, including First Aid rapid review, Pathoma fundamentals, Sketchy antimicrobials, and core discipline topics

## Clinical Use Cases
- **Step 1 Dedicated Study Period:** A second-year medical student with 8 weeks until Step 1 generates a study plan. The tool recommends the "Intensive Review" phase: organ system-based review with 40+ questions per day, 8 hours daily, structured as morning content review, midday question blocks, afternoon review of incorrect questions, and evening spaced repetition
- **Identifying Knowledge Gaps Mid-Study:** After 200 practice questions, a student reviews their performance analytics. The tool identifies pharmacology (52%) and renal physiology (48%) as weak areas below the 60% threshold, and pathology (85%) and behavioral science (82%) as strong areas. The recommendation: "Solid foundation. Target specific weak areas to push into the high-performance range. Priority review areas: pharmacology, renal."
- **Optimizing Retention with Spaced Repetition:** A student reviews a pharmacology flashcard on autonomic drugs and rates their recall as 3 (correct with difficulty). The SM-2 algorithm adjusts the ease factor downward and schedules the next review in 1 day rather than the 6-day interval a perfect response would yield, ensuring the difficult material is revisited sooner
- **COMLEX-Specific Preparation:** An osteopathic medical student targets COMLEX Level 1 and receives a study plan that includes OMM (osteopathic manipulative medicine) integration alongside the standard basic science disciplines

## Safety & Evidence
- **Safety Classification:** Safe -- This is an educational tool for exam preparation. Question content is illustrative and does not represent actual NBME or NBOME examination material
- **Evidence Level:** Moderate -- Spaced repetition efficacy supported by Deng F, et al. "Spaced Repetition in Medical Education" (Medical Education 2015;49(3):286-298), demonstrating 200-400% improvement in long-term retention compared to massed study. SM-2 algorithm from Wozniak PA (SuperMemo 1990). Study structure recommendations aligned with NBME content outlines

## Example Usage

**Generating a study plan:**
```
Create a USMLE Step 1 study plan with 8 weeks until exam
```
Returns: Phase "Intensive Review," strategy "Organ system-based review with heavy question practice (40+ questions/day)," 8 hours/day recommended, priority topics (First Aid Rapid Review, Pathoma Fundamentals, Sketchy Antimicrobials, Biostatistics Study Design, Autonomic Pharmacology, Renal Physiology, Cardiac Pathology, Immunology Hypersensitivity Reactions), and a daily structure (morning: content review 2-3 hours, midday: question blocks 2-3 hours, afternoon: review incorrects 1-2 hours, evening: spaced repetition 1 hour).

**Reviewing performance analytics:**
```
Analyze my board prep performance: 150 questions attempted, 98 correct, pharmacology 12/25, pathology 35/40, renal 8/20, cardiology 25/30
```
Returns: Overall 65.3%, weak areas (renal 40.0%, pharmacology 48.0%), strong areas (cardiology 83.3%, pathology 87.5%), recommendation "Solid foundation. Target specific weak areas. Priority: renal, pharmacology."

## Technical Details
- **Category:** Education
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialty:** Medical Education
- **Supported Exams:** USMLE Step 1, Step 2 CK, Step 3, COMLEX Level 1, COMLEX Level 2-CE

## References
- Deng F, et al. "Spaced Repetition in Medical Education: Theoretical Considerations and Practical Applications." *Medical Education*. 2015;49(3):286-298.
- Augustin M. "How to Learn Effectively in Medical School: Testing and Spaced Repetition." *Yale J Biol Med*. 2014;87(2):207-212.
- Wozniak PA. "SuperMemo 2 Algorithm." 1990.
- NBME. "Content Classification for USMLE Step Examinations."

---
name: medical-anatomy-tutor
description: >
  Interactive anatomy education tool with 3D anatomical references, clinical
  correlations, and self-assessment questions. Covers all major organ
  systems.
---

# Interactive Anatomy Learning Assistant

Study human anatomy interactively with structured anatomical references organized by body region and organ system, each linked to high-yield clinical correlations. This skill provides detailed structure lookups with origin, insertion, innervation, and blood supply data, plus board-style clinical vignette quizzes that test applied anatomical knowledge -- the type of integrated anatomy-pathology reasoning tested on USMLE and applied in clinical rotations.

## Quick Install
```bash
npx skills add Open-Medica/open-medical-skills --skill medical-anatomy-tutor
```

## What It Does
- Provides detailed anatomical information for high-yield structures including description, origin, insertion, innervation, blood supply, action, and relationships to adjacent structures
- Links every structure to multiple clinical correlations covering pathology, surgical landmarks, injury patterns, and physical examination findings (e.g., brachial plexus entry includes Erb-Duchenne palsy, Klumpke palsy, wrist drop, winged scapula, thoracic outlet syndrome)
- Supports browsing by 8 body regions (head/neck, thorax, abdomen, pelvis/perineum, upper limb, lower limb, back/spinal cord, neuroanatomy) and 9 organ systems (musculoskeletal, cardiovascular, respiratory, GI, genitourinary, nervous, endocrine, lymphatic, integumentary)
- Generates board-style clinical vignette quizzes with patient presentations, multiple-choice options, correct answers, and detailed explanations referencing the underlying anatomy
- Flags high-yield structures that appear frequently on board examinations for priority review

## Clinical Use Cases
- **Pre-Clinical Anatomy Course Review:** A first-year medical student studying the brachial plexus looks up the structure and receives the complete C5-T1 organization (roots, trunks, divisions, cords) along with 7 clinical correlations: Erb-Duchenne palsy, Klumpke palsy, winged scapula, wrist drop (Saturday night palsy), hand of benediction, claw hand, and thoracic outlet syndrome
- **Board Exam Preparation:** A student preparing for USMLE Step 1 takes an anatomy quiz. A clinical vignette presents a 55-year-old woman with sudden severe headache, fixed dilated pupil, and "down and out" eye. The student must identify CN III compression (typically by PComm aneurysm) from the Circle of Willis clinical correlations
- **Surgery Clerkship Preparation:** A third-year student reviewing for the surgery shelf exam looks up the inguinal canal to review the distinction between direct and indirect inguinal hernias, the boundaries of Hesselbach's triangle, and the relationship to the inferior epigastric vessels -- all high-yield surgical anatomy
- **Cardiology Rotation Integration:** A student on cardiology rotations reviews coronary artery anatomy, learning that LAD occlusion causes anterior wall MI (the "widowmaker"), RCA occlusion causes inferior MI with potential AV block (RCA supplies the AV node in 85% of patients), and 85% of people have right-dominant circulation where the PDA arises from the RCA

## Safety & Evidence
- **Safety Classification:** Safe -- This is an educational tool for anatomy study. Anatomical knowledge should be confirmed through cadaveric dissection, imaging review, and approved educational resources
- **Evidence Level:** Moderate -- Anatomical content sourced from Drake RL, et al. *Gray's Anatomy for Students* (4th Ed, 2020), Moore KL, et al. *Clinically Oriented Anatomy* (8th Ed, 2018), and Netter FH *Atlas of Human Anatomy* (7th Ed, 2019). Clinical correlations verified against standard pathology and surgery references

## Example Usage

**Looking up a specific structure:**
```
Look up the Circle of Willis anatomy and clinical correlations
```
Returns: Anastomotic arterial ring at the base of the brain formed by internal carotid and vertebrobasilar systems, blood supply details, 7 clinical correlations (Berry aneurysm at AComm, PComm aneurysm compressing CN III, MCA/ACA/PCA stroke presentations, complete circle present in only 20-25% of population), and related structures (ACA, MCA, PCA, basilar artery).

**Taking a clinical anatomy quiz:**
```
Generate a 5-question anatomy quiz on thorax and abdomen
```
Returns 5 clinical vignette questions. Example: "A patient presents with an acute inferior STEMI with ST elevation in leads II, III, aVF and new second-degree AV block. Which artery is most likely occluded?" Correct answer: Right coronary artery, with explanation of RCA supply to the inferior wall and AV node in right-dominant circulation (85%).

## Technical Details
- **Category:** Education
- **Author:** Open Medical Skills Community
- **License:** MIT
- **Version:** 1.0.0
- **Script Language:** Python
- **Specialties:** Medical Education, Anatomy
- **Structures Covered:** Brachial plexus, Circle of Willis, inguinal canal, coronary arteries, cranial nerves (I-XII), knee joint, diaphragm, and more

## References
- Drake RL, Vogl AW, Mitchell AWM. *Gray's Anatomy for Students*. 4th Ed. Elsevier, 2020.
- Moore KL, Dalley AF, Agur AMR. *Clinically Oriented Anatomy*. 8th Ed. Wolters Kluwer, 2018.
- Netter FH. *Atlas of Human Anatomy*. 7th Ed. Elsevier, 2019.

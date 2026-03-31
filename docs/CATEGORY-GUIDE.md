# OMS Category Guide

Open Medical Skills organizes all skills and plugins into 14 canonical medical categories. This guide provides detailed descriptions, example skills, and mapping guidance for each category.

## The 14 Canonical Categories

Every skill must be assigned to exactly one category. Choose the category that best matches the skill's **primary clinical domain**. If a skill spans multiple domains, select the one that represents its core function.

---

### 1. Diagnosis (`diagnosis`)

**Description:** Tools that assist with clinical reasoning, differential diagnosis generation, screening, and diagnostic decision-making.

**Example skills:**
- Clinical differential diagnosis generators
- Symptom checkers and clinical reasoning aids
- Screening tool interpreters (e.g., Ottawa Ankle Rules, Wells Criteria)
- Genomic variant interpretation for diagnostic purposes
- Pattern recognition across organ systems

**When to use:** The skill's primary purpose is to help identify or narrow down a diagnosis from clinical findings.

---

### 2. Treatment (`treatment`)

**Description:** Tools related to treatment planning, therapeutic protocols, drug selection, and clinical management.

**Example skills:**
- Treatment plan generators
- Clinical guideline navigators for therapy selection
- Precision medicine and targeted therapy tools
- Evidence-based protocol assistants
- Drug selection and formulary tools

**When to use:** The skill's primary purpose is to help plan, select, or manage a treatment or therapy.

---

### 3. Lab & Imaging (`lab-imaging`)

**Description:** Tools for interpreting laboratory results, medical imaging, radiology, pathology, and DICOM data.

**Example skills:**
- Lab result interpreters (CBC, BMP, liver panel)
- DICOM metadata extractors
- Medical imaging analysis tools
- Radiology report assistants
- Pathology slide analysis aids
- Radiation exposure trackers

**When to use:** The skill's primary purpose involves laboratory data interpretation or medical imaging.

---

### 4. Pharmacy (`pharmacy`)

**Description:** Tools for drug interactions, medication dosing, formulary management, medication safety, and pharmacology.

**Example skills:**
- Drug interaction checkers
- Medication dosing calculators
- Supplement-drug interaction databases
- Pharmacokinetic and pharmacodynamic tools
- DrugBank search interfaces
- Medication reconciliation aids

**When to use:** The skill's primary purpose is related to medications, drug safety, or pharmacology.

---

### 5. Emergency (`emergency`)

**Description:** Tools for emergency medicine protocols, triage, ACLS/BLS, trauma management, and acute care.

**Example skills:**
- ACLS protocol assistants
- Emergency triage protocol tools
- Trauma management guides
- Rapid assessment scoring tools
- Critical care decision aids
- Mass casualty triage systems

**When to use:** The skill is designed for acute, time-sensitive clinical scenarios.

---

### 6. Surgery (`surgery`)

**Description:** Tools for surgical planning, perioperative checklists, procedure documentation, and operative workflows.

**Example skills:**
- Surgical safety checklists (WHO model)
- Surgical procedure planners
- Perioperative risk calculators
- Operative note generators
- Surgical anatomy references

**When to use:** The skill's primary purpose supports surgical planning, execution, or documentation.

---

### 7. Nursing (`nursing`)

**Description:** Tools for nursing assessments, care plans, medication administration safety, and nursing workflows.

**Example skills:**
- Nursing care plan generators
- Medication administration safety tools
- Patient assessment frameworks
- Nursing documentation aids
- Wound care assessment tools

**When to use:** The skill is specifically designed for nursing practice or nursing-led patient care.

---

### 8. Pediatrics (`pediatrics`)

**Description:** Pediatric-specific tools including growth charts, developmental milestones, pediatric dosing, and age-specific assessments.

**Example skills:**
- Pediatric drug dosing calculators
- Growth chart plotters and interpreters
- Developmental milestone trackers
- Pediatric vital sign reference tools
- Vaccine schedule trackers
- Neonatal assessment tools

**When to use:** The skill is specifically designed for pediatric patients or pediatric clinical practice.

---

### 9. Mental Health (`mental-health`)

**Description:** Tools for psychiatry, psychology, mental health screening, therapy aids, and behavioral health.

**Example skills:**
- PHQ-9 depression screening tools
- GAD-7 anxiety screening tools
- Cognitive behavioral therapy aids
- Psychiatric medication references
- Substance use screening tools
- Mental status exam assistants

**When to use:** The skill's primary purpose involves mental health, psychiatry, or psychological assessment.

---

### 10. Public Health (`public-health`)

**Description:** Tools for epidemiology, disease surveillance, outbreak investigation, population health, and public health policy.

**Example skills:**
- Epidemiology surveillance tools
- Outbreak investigation assistants
- Vaccination coverage calculators
- Social determinants of health analyzers
- Public health reporting tools
- Disease trend trackers

**When to use:** The skill operates at a population level or supports public health infrastructure.

---

### 11. Research (`research`)

**Description:** Tools for medical literature search, evidence synthesis, biostatistics, systematic reviews, and research methodology.

**Example skills:**
- PubMed literature search tools
- Systematic review assistants
- Evidence synthesis engines
- Biostatistics analyzers
- Clinical trial search tools
- Research protocol builders
- Protein structure analysis tools

**When to use:** The skill supports medical research methodology, literature review, or data analysis.

---

### 12. Education (`education`)

**Description:** Tools for medical education, board exam preparation, anatomy tutoring, case-based learning, and clinical teaching.

**Example skills:**
- Board exam preparation tools
- Medical anatomy tutors
- Clinical case generators for teaching
- Medical paper humanizers (making research accessible)
- Spaced repetition tools for medical content
- OSCE preparation aids

**When to use:** The skill's primary purpose is teaching, learning, or medical education.

---

### 13. Administrative (`administrative`)

**Description:** Tools for medical coding (ICD-10, CPT), billing, compliance, prior authorization, HIPAA, and healthcare administration.

**Example skills:**
- ICD-10 code lookup tools
- CPT coding assistants
- RAF score calculators
- Prior authorization review tools
- HIPAA compliance checkers
- Medical billing workflow aids
- FDA 510(k) documentation assistants
- IEC 62304 compliance tools

**When to use:** The skill supports healthcare business operations, coding, billing, or regulatory compliance.

---

### 14. Clinical Research Summarizing (`clinical-research-summarizing`)

**Description:** Tools specifically focused on summarizing clinical research papers, trial data, and medical evidence for rapid consumption.

**Example skills:**
- Clinical trial result summarizers
- Research paper abstract generators
- Meta-analysis summary tools
- Evidence table generators
- PICO (Population, Intervention, Comparison, Outcome) extractors

**When to use:** The skill's primary purpose is condensing and summarizing clinical research output, distinct from the broader "Research" category which covers research methodology and tools.

---

## Category Mapping from External Sources

### Mapping Approach

When submitting a skill that originated from another platform or taxonomy (such as ToolUniverse, which has 438+ fine-grained categories), map to the OMS category that best represents the skill's primary clinical function.

The mapping principle is **clinical function over technical implementation**:

- A FHIR data connector that primarily serves lab data retrieval maps to `lab-imaging`, not a generic "interoperability" category
- A machine learning model for chest X-ray analysis maps to `lab-imaging`, not "AI/ML"
- A chatbot that helps with prior authorization maps to `administrative`, not "conversational AI"

### Example Mappings

| External Category | Maps to OMS |
|-------------------|-------------|
| Cardiology, Endocrinology, Gastroenterology (specialty-based) | Map by function: diagnosis tools to `diagnosis`, treatment tools to `treatment` |
| Radiology, Pathology, Laboratory Medicine | `lab-imaging` |
| Pharmacology, Drug Information, Clinical Pharmacy | `pharmacy` |
| Emergency Medicine, Critical Care, Toxicology | `emergency` |
| Orthopedic Surgery, Neurosurgery, General Surgery | `surgery` |
| Neonatology, Pediatric Cardiology | `pediatrics` |
| Psychiatry, Psychology, Addiction Medicine | `mental-health` |
| Epidemiology, Biostatistics, Preventive Medicine | `public-health` or `research` depending on function |
| Medical Education, Simulation, Board Review | `education` |
| Health Informatics, Medical Coding, Revenue Cycle | `administrative` |
| Bioinformatics, Genomics, Proteomics | `research` (unless diagnostic, then `diagnosis`) |
| Clinical Trial Management, Study Design | `research` |
| Literature Review, Evidence-Based Medicine | `research` or `clinical-research-summarizing` |

### When a Skill Spans Multiple Categories

Choose the category that represents the skill's **primary** function. If the skill truly serves multiple domains equally, prefer the more specific category over the more general one.

For example:
- A tool that does both drug dosing (pharmacy) and drug-disease interactions (diagnosis): choose `pharmacy` because drug interaction checking is fundamentally a pharmacy function
- A tool that summarizes research AND generates treatment recommendations: choose `treatment` because the clinical output is the primary value

## Adding New Categories

The 14 canonical categories are defined in `src/content.config.ts` and synchronized across the Cloudflare Worker (`workers/submission-api/`) and GitHub Actions (`validate-submission.yml`). Proposing a new category requires a discussion in the GitHub repository and consensus among physician maintainers.

---

*Maintained by [IntelMedica.ai](https://intelmedica.ai) -- Building intelligent tools for modern healthcare.*

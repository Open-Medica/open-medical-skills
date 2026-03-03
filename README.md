<p align="center">
  <img src="public/logo-shield.svg" width="80" alt="Open Medical Skills">
</p>

<h1 align="center">Open Medical Skills</h1>

<p align="center">
  A curated marketplace of physician-reviewed medical AI skills and plugins.<br>
  Compiled and maintained by physicians, for physicians and the healthcare industry.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Skills-49-teal" alt="Skills: 49">
  <img src="https://img.shields.io/badge/Plugins-5-teal" alt="Plugins: 5">
  <img src="https://img.shields.io/badge/Status-Active-green" alt="Status: Active">
  <img src="https://img.shields.io/badge/Physician-Reviewed-blue" alt="Physician Reviewed">
</p>

---

## What is Open Medical Skills?

Open Medical Skills (OMS) is a trusted, open-source hub for discovering, sharing, and installing medical AI agent skills and plugins. Unlike general-purpose skill marketplaces, every skill listed here is:

- **Physician-reviewed** — Vetted by medical professionals before listing
- **Evidence-informed** — Based on clinical guidelines and best practices
- **Safely classified** — With appropriate guardrails for medical use
- **Open source** — Transparent and auditable by the community

OMS skills work with major AI coding agents including Claude Code, Cursor, Codex, Windsurf, and GitHub Copilot.

---

## Quick Install

Install any skill with a single command:

```bash
npx skills add gitjfmd/open-medical-skills --skill <skill-name>
```

### Agent-Specific Installation

```bash
# Claude Code
npx skills add gitjfmd/open-medical-skills --skill <skill-name> -a claude-code

# Cursor
npx skills add gitjfmd/open-medical-skills --skill <skill-name> -a cursor

# Codex
npx skills add gitjfmd/open-medical-skills --skill <skill-name> -a codex

# Windsurf
npx skills add gitjfmd/open-medical-skills --skill <skill-name> -a windsurf

# GitHub Copilot
npx skills add gitjfmd/open-medical-skills --skill <skill-name> -a github-copilot

# All agents at once
npx skills add gitjfmd/open-medical-skills --skill <skill-name> -a '*'
```

---

## Available Skills

### Emergency Medicine

| Skill | Safety | Evidence |
|-------|--------|----------|
| [ACLS Protocol Assistant](skills/acls-protocol-assistant/) | Caution | High |
| [Emergency Department Triage Protocols](skills/emergency-triage-protocols/) | Caution | Moderate |
| [Trauma Management Protocols (ATLS)](skills/trauma-management-protocols/) | Caution | High |

### Diagnosis

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Clinical Differential Diagnosis Assistant](skills/clinical-differential-diagnosis/) | Caution | Moderate |
| [FHIR Healthcare Data Access](skills/fhir-data-access/) | Restricted | High |
| [Medical Imaging & DICOM Analysis](skills/medical-imaging-analysis/) | Caution | Moderate |

### Treatment

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Clinical Treatment Plan Generator](skills/clinical-treatment-plan-generator/) | Caution | Moderate |
| [Drug Interaction Safety Checker](skills/drug-interaction-checker/) | Safe | High |
| [Precision Medicine Treatment Planning](skills/precision-medicine-therapeutics/) | Caution | High |

### Pharmacy

| Skill | Safety | Evidence |
|-------|--------|----------|
| [DrugBank Comprehensive Drug Database](skills/drugbank-search/) | Safe | High |
| [FDA Drug Information & Adverse Events](skills/fda-drug-information/) | Safe | High |
| [Supplement-Drug Interaction Safety](skills/supplement-drug-interactions/) | Safe | High |

### Surgery

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Surgical Procedure Planning Assistant](skills/surgical-procedure-planner/) | Caution | Moderate |
| [WHO Surgical Safety Checklist](skills/surgical-safety-checklist/) | Safe | High |

### Nursing

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Medication Administration Safety Check](skills/medication-administration-safety/) | Safe | High |
| [Nursing Care Plan Generator](skills/nursing-care-plan/) | Caution | Moderate |
| [Nursing Patient Assessment Tool](skills/patient-assessment-tool/) | Safe | Moderate |

### Pediatrics

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Developmental Milestone Tracker](skills/developmental-milestone-tracker/) | Safe | High |
| [Pediatric Drug Dosing Calculator](skills/pediatric-drug-dosing/) | Caution | High |
| [Pediatric Growth Chart Analyzer](skills/pediatric-growth-charts/) | Safe | High |

### Mental Health

| Skill | Safety | Evidence |
|-------|--------|----------|
| [CBT Therapeutic Techniques Guide](skills/cognitive-behavioral-therapy-tools/) | Safe | High |
| [GAD-7 Anxiety Screening Tool](skills/gad7-anxiety-screening/) | Safe | High |
| [PHQ-9 Depression Screening Tool](skills/phq9-depression-screening/) | Caution | High |

### Public Health

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Epidemiology & Disease Surveillance](skills/epidemiology-surveillance/) | Safe | High |
| [Immunization Schedule Tracker](skills/vaccine-schedule-tracker/) | Safe | High |
| [Outbreak Investigation Assistant](skills/outbreak-investigation/) | Safe | High |

### Lab & Imaging

| Skill | Safety | Evidence |
|-------|--------|----------|
| [DICOM Metadata & PHI Anonymization](skills/dicom-metadata-extractor/) | Caution | High |
| [Lab Result Interpretation Assistant](skills/lab-result-interpreter/) | Caution | Moderate |
| [Medical Radiation Exposure Tracker](skills/radiation-exposure-tracker/) | Safe | Moderate |

### Research

| Skill | Safety | Evidence |
|-------|--------|----------|
| [ClinicalTrials.gov Database Access](skills/clinical-trials-search/) | Safe | High |
| [PubMed Medical Literature Search](skills/pubmed-literature-search/) | Safe | High |
| [Systematic Review & Meta-Analysis Assistant](skills/systematic-review-assistant/) | Safe | High |

### Education

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Clinical Case Scenario Generator](skills/medical-case-generator/) | Safe | Moderate |
| [Interactive Anatomy Learning Assistant](skills/medical-anatomy-tutor/) | Safe | Moderate |
| [Medical Board Exam Preparation](skills/board-exam-prep/) | Safe | Moderate |

### Administrative

| Skill | Safety | Evidence |
|-------|--------|----------|
| [CPT Procedure Code Assistant](skills/cpt-coding-assistant/) | Caution | Moderate |
| [FDA 510(k) Documentation Automation](skills/fda-510k-documentation/) | Safe | Moderate |
| [HIPAA Compliance & De-identification](skills/hipaa-compliance-checker/) | Safe | High |
| [ICD-10 Diagnosis Code Lookup](skills/icd10-code-lookup/) | Safe | High |
| [IEC 62304 Medical Device Software Lifecycle](skills/iec-62304-compliance/) | Safe | High |
| [Medicare Drug Spending & Utilization](skills/medicare-drug-stats/) | Safe | High |
| [Prior Authorization Review Assistant](skills/prior-authorization-review/) | Safe | Moderate |
| [RAF Score & HCC Calculator](skills/raf-score-calculator/) | Safe | Moderate |

### Clinical Research & Summarizing

| Skill | Safety | Evidence |
|-------|--------|----------|
| [Biostatistics Analysis Tool](skills/biostatistics-analyzer/) | Safe | Moderate |
| [Clinical Evidence Synthesis Tool](skills/evidence-synthesis-ai/) | Safe | Moderate |
| [Clinical Practice Guideline Navigator](skills/clinical-guideline-navigator/) | Safe | High |
| [Genomic Variant Interpretation](skills/genomics-variant-interpreter/) | Restricted | High |
| [Medical Academic Writing Humanizer](skills/medical-paper-humanizer/) | Safe | Low |
| [Protein Structure Database (AlphaFold & PDB)](skills/protein-structure-analysis/) | Safe | High |

---

## Plugins

Full-featured integrations with multiple tools bundled together.

| Plugin | Description |
|--------|-------------|
| [AWS HealthLake FHIR](plugins/aws-healthlake-fhir/) | FHIR-compliant health data lake integration |
| [Healthcare MCP Comprehensive](plugins/healthcare-mcp-comprehensive/) | Comprehensive healthcare MCP server suite |
| [Holy Bio Research Suite](plugins/holy-bio-research-suite/) | Biomedical research toolkit |
| [Medical Coding Platform](plugins/medikode-medical-coding-platform/) | CPT/ICD-10 validation, EOB parsing, RAF scoring |
| [OpenEMR Integration](plugins/openemr-integration/) | Open-source EHR system integration |

---

## Categories

OMS organizes skills across 14 medical categories:

| Category | Description |
|----------|-------------|
| **Diagnosis** | Clinical decision support, differential diagnosis, imaging interpretation |
| **Treatment** | Treatment planning, drug interactions, precision medicine |
| **Lab & Imaging** | Laboratory results, DICOM, radiology, pathology |
| **Pharmacy** | Drug databases, formulary management, medication safety |
| **Emergency** | ACLS, triage, trauma protocols, emergency procedures |
| **Surgery** | Surgical planning, safety checklists, operative protocols |
| **Nursing** | Care plans, patient assessment, medication administration |
| **Pediatrics** | Growth tracking, developmental milestones, pediatric dosing |
| **Mental Health** | Screening tools (PHQ-9, GAD-7), therapeutic techniques |
| **Public Health** | Epidemiology, immunization schedules, outbreak investigation |
| **Research** | Literature search, clinical trials, systematic reviews |
| **Education** | Board prep, anatomy tutoring, case-based learning |
| **Administrative** | Medical coding (CPT/ICD-10), compliance, prior authorization |
| **Clinical Research & Summarizing** | Evidence synthesis, biostatistics, guideline navigation |

---

## Safety Classifications

Every skill is classified by safety level to help clinicians understand appropriate use:

| Classification | Meaning |
|----------------|---------|
| **Safe** | Low risk of patient harm. Suitable for general use with standard clinical oversight. |
| **Caution** | Moderate risk. Requires clinical validation before acting on outputs. Should be used by trained healthcare professionals. |
| **Restricted** | High risk. Outputs must be verified by qualified specialists. Not suitable for independent clinical decision-making. |

## Evidence Levels

Each skill's evidence base is rated:

| Level | Description |
|-------|-------------|
| **High** | Based on published clinical guidelines, systematic reviews, or validated scoring systems. |
| **Moderate** | Based on peer-reviewed literature, expert consensus, or established clinical practice. |
| **Low** | Based on limited evidence, case reports, or emerging research. |
| **Expert Opinion** | Based on clinical expertise without formal evidence grading. |

---

## Contributing

We welcome contributions from physicians, developers, and healthcare professionals.

### How to Submit a Skill

1. **Fork this repository**
2. Create a new skill directory under `skills/your-skill-name/`
3. Add a `SKILL.md` describing the skill's clinical purpose, usage, and safety considerations
4. Add your implementation files (e.g., `script.py`)
5. Create a YAML definition in `content/skills/your-skill-name.yaml`
6. Submit a pull request

All submissions are reviewed by physician maintainers before being listed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## OMS CLI

Install the OMS command-line tool for browsing and installing skills from your terminal:

```bash
# Search for skills
oms search "emergency"

# View skill details
oms info acls-protocol-assistant

# List all categories
oms categories

# Install a skill
oms install acls-protocol-assistant
```

---

## Disclaimer

These skills are intended for **educational and clinical decision support purposes only**. They do not replace professional medical judgment, clinical training, or the physician-patient relationship. Always verify AI-generated outputs against current clinical guidelines and institutional protocols before applying them to patient care.

---

<p align="center">
  Built by <a href="https://intelmedica.ai"><strong>IntelMedica.ai</strong></a><br>
  Compiled and maintained by physicians, for physicians and the healthcare industry.
</p>

<p align="center">
  <a href="https://openmedicalskills.org">Website</a> &middot;
  <a href="https://github.com/gitjfmd/open-medical-skills/issues">Report an Issue</a> &middot;
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

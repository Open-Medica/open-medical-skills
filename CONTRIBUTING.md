# Contributing to Open Medical Skills

Thank you for your interest in contributing to Open Medical Skills. We welcome submissions from physicians, developers, researchers, and healthcare professionals.

## How to Submit a Skill

### Option 1: Pull Request (Technical Users)

1. **Fork** this repository
2. Create a new branch: `git checkout -b add-skill/your-skill-name`
3. Create your skill directory:
   ```
   skills/your-skill-name/
   ├── SKILL.md        # Required: Skill documentation
   └── script.py       # Optional: Implementation script
   ```
4. Create a YAML definition at `content/skills/your-skill-name.yaml`
5. Submit a pull request

### Option 2: Web Form (Non-Technical Users)

Visit [openmedicalskills.org/submit](https://openmedicalskills.org/submit) to submit a skill through our guided web form. No GitHub experience required.

## YAML Skill Definition Format

```yaml
name: "your-skill-name"
display_name: "Your Skill Display Name"
description: "A clear, concise description of what this skill does."
author: "Your Name or Organization"
repository: "https://github.com/gitjfmd/open-medical-skills"
category: "diagnosis"  # See categories below
tags: ["relevant", "tags"]
specialty: ["relevant-specialty"]
evidence_level: "moderate"  # high | moderate | low | expert-opinion
safety_classification: "safe"  # safe | caution | restricted
verified: false
reviewer: "Pending Review"
version: "1.0.0"
license: "MIT"
date_added: "2026-03-03"
install:
  npx: "npx skills add gitjfmd/open-medical-skills --skill your-skill-name"
  git: "git clone https://github.com/gitjfmd/open-medical-skills.git"
```

## Categories

Choose one of the following 14 categories:

- `diagnosis` — Clinical decision support, differential diagnosis
- `treatment` — Treatment planning, drug interactions
- `lab-imaging` — Lab results, radiology, DICOM
- `pharmacy` — Drug databases, formulary, medication safety
- `emergency` — ACLS, triage, trauma
- `surgery` — Surgical planning, safety checklists
- `nursing` — Care plans, patient assessment
- `pediatrics` — Growth, milestones, pediatric dosing
- `mental-health` — Screening tools, therapeutic techniques
- `public-health` — Epidemiology, immunization, outbreak investigation
- `research` — Literature search, clinical trials
- `education` — Board prep, anatomy, case-based learning
- `administrative` — Medical coding, compliance, prior authorization
- `clinical-research-summarizing` — Evidence synthesis, biostatistics

## Safety Classification Guidelines

- **Safe**: Low risk. Educational content, reference data, literature search.
- **Caution**: Moderate risk. Clinical decision support that requires professional validation.
- **Restricted**: High risk. Genomic interpretation, prescribing decisions, or outputs that directly affect patient care.

## Review Process

1. All submissions are automatically validated for YAML format and schema compliance
2. A physician reviewer examines the clinical content for accuracy and safety
3. Accepted skills are merged and automatically deployed to the marketplace

## Code of Conduct

- All contributions must be evidence-informed and clinically responsible
- Include appropriate safety disclaimers for clinical tools
- Cite references for clinical parameters, scoring systems, and guidelines
- Do not submit skills that provide unsupported medical claims

## Questions?

Open an [issue](https://github.com/gitjfmd/open-medical-skills/issues) or visit [openmedicalskills.org](https://openmedicalskills.org).

# Contributing to Open Medical Skills

Thank you for your interest in contributing to Open Medical Skills. This guide covers everything you need to know to submit a medical AI skill or plugin for physician review.

## Submission Paths

### Path 1: GitHub Pull Request (Technical)

This is the preferred path for developers comfortable with Git workflows.

#### Step-by-step

1. **Fork** the [open-medical-skills](https://github.com/gitjfmd/open-medical-skills) repository.

2. **Create a branch** from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-skill-name
   ```

3. **Add a YAML file** to `content/skills/` (or `content/plugins/` for plugins):
   ```bash
   # Example: content/skills/my-skill-name.yaml
   ```
   Follow the [YAML schema reference](#yaml-schema-reference) below, or see [`docs/SKILL-FORMAT.md`](./SKILL-FORMAT.md) for the full SKILL.md specification.

4. **Create a skill directory** at `skills/my-skill-name/` containing a `SKILL.md` file. See the [SKILL.md format specification](./SKILL-FORMAT.md) for structure and required sections.

5. **Open a pull request** targeting the `dev` branch. Use the [skill submission PR template](../.github/PULL_REQUEST_TEMPLATE/skill-submission.md) and fill out all required fields.

6. **Wait for review.** Automated CI checks will validate your YAML schema and file structure. A physician maintainer will then review the submission for medical accuracy and safety.

### Path 2: Web Submission Form (Non-Technical)

No GitHub account or coding experience required.

1. Go to the [Submission Form](/submit) on the OMS website.
2. Fill in the guided fields: skill name, description, category, safety classification, evidence level, and install methods.
3. The form auto-generates a properly formatted pull request to the repository.
4. A physician maintainer reviews and approves or requests changes.

### Path 3: AI Skill Builder (Non-Technical)

1. Go to the [AI Skill Builder](/create-skill) on the OMS website.
2. Chat with the AI assistant to build your skill step by step.
3. The assistant helps you define metadata, prompts, safety guardrails, and documentation.
4. Review, export, and submit for physician review.

## YAML Schema Reference

Every skill requires a YAML file in `content/skills/`. Here is the complete schema:

```yaml
name: "my-skill-name"                    # Required. Unique kebab-case identifier.
display_name: "My Skill Name"            # Required. Human-readable title.
description: "Brief description."         # Required. 1-3 sentences.
author: "Author Name"                    # Required. Person or organization.
repository: "https://github.com/..."     # Required. Must be a valid, publicly accessible URL.
category: "diagnosis"                    # Required. One of the 14 canonical categories (see below).
tags: ["tag1", "tag2"]                   # Optional. Searchable keywords.
version: "1.0.0"                         # Optional. Semantic version.
license: "MIT"                           # Optional. SPDX license identifier.
type: "skill"                            # Default: "skill". Use "plugin" for plugin submissions.
install:                                 # Optional. At least one install method recommended.
  npx: "npx skills add owner/repo@skill"
  wget: "wget https://..."
  git: "git clone https://..."
  docker: "docker pull ..."
evidence_level: "moderate"               # Default: "moderate". Options: high, moderate, low, expert-opinion.
safety_classification: "safe"            # Default: "safe". Options: safe, caution, restricted.
specialty: ["Internal Medicine"]         # Optional. Medical specialties.
status: "draft"                          # Default: "draft". Options: published, draft, coming-soon.
reviewer: "Pending Review"               # Default: "Pending Review". Set by reviewers.
date_added: "2026-01-15"                 # Required. ISO 8601 date.
verified: false                          # Default: false. Set by reviewers.
```

See [`docs/SKILL-FORMAT.md`](./SKILL-FORMAT.md) for the complete SKILL.md body specification.

## Categories

All skills must be assigned to exactly one of the following 14 canonical categories. See [`docs/CATEGORY-GUIDE.md`](./CATEGORY-GUIDE.md) for detailed descriptions, examples, and mapping guidance.

| Category | Slug | Description |
|----------|------|-------------|
| Diagnosis | `diagnosis` | Differential diagnosis, screening, clinical reasoning |
| Treatment | `treatment` | Treatment planning, drug selection, therapy protocols |
| Lab & Imaging | `lab-imaging` | Lab interpretation, radiology, DICOM, pathology |
| Pharmacy | `pharmacy` | Drug interactions, dosing, formulary, medication safety |
| Emergency | `emergency` | Emergency protocols, triage, ACLS, trauma |
| Surgery | `surgery` | Surgical planning, checklists, procedure documentation |
| Nursing | `nursing` | Nursing assessments, care plans, medication administration |
| Pediatrics | `pediatrics` | Pediatric-specific tools, growth charts, milestones, dosing |
| Mental Health | `mental-health` | Psychiatry, psychology, screening tools, therapy aids |
| Public Health | `public-health` | Epidemiology, surveillance, outbreak investigation |
| Research | `research` | Literature search, evidence synthesis, biostatistics |
| Education | `education` | Medical education, board prep, anatomy, case generation |
| Administrative | `administrative` | Coding (ICD/CPT), billing, compliance, prior authorization |
| Clinical Research Summarizing | `clinical-research-summarizing` | Summarizing clinical research papers and trial data |

## Quality Standards

Submissions are evaluated against these criteria:

1. **Clear clinical purpose** -- The skill should address a specific, well-defined clinical need or healthcare workflow.

2. **Evidence-based** -- Claims should reference clinical guidelines, peer-reviewed literature, or established protocols. Avoid unsupported assertions.

3. **Safety-aware** -- Include appropriate disclaimers. Do not make unsupported clinical claims. Tools that influence clinical decisions must carry explicit warnings and the appropriate safety classification.

4. **Well-documented** -- A complete SKILL.md is required, including: purpose, usage examples, clinical use cases, known limitations, technical details, and literature references.

5. **Open source** -- The source repository must be publicly accessible under a recognized open-source license. The community must be able to audit and verify the code.

6. **Research tool framing** -- All OMS skills are research and learning tools. They must NOT be framed as clinical decision support (CDS) systems. This is a deliberate regulatory boundary to avoid FDA SaMD classification.

## Review Process

1. **Automated validation** -- CI pipeline validates YAML schema, checks for duplicates, verifies repository URLs, and confirms metadata completeness.

2. **Auto-labeling** -- The PR is automatically labeled by category and flagged for physician review.

3. **Physician review** -- A physician maintainer evaluates:
   - Medical accuracy and appropriateness
   - Safety classification correctness
   - Evidence level assignment
   - Quality of documentation and references
   - Compliance with research tool framing
   - Potential for patient harm if misused

4. **Decision** -- The reviewer will approve, request changes, or reject the submission with explanation.

5. **Publication** -- Approved PRs are merged to `dev`, then promoted to `main` for deployment. Cloudflare Pages auto-deploys on merge to `main`.

## Code of Conduct

All contributors are expected to:

- Be respectful and constructive in all interactions
- Provide accurate medical information with appropriate citations
- Clearly disclose conflicts of interest
- Not submit skills that promote unproven or dangerous therapies
- Not submit skills that collect or expose protected health information (PHI) without appropriate safeguards
- Frame all submissions as research and learning tools, not clinical decision support

Submissions that violate these principles will be rejected.

## Research Tool Framing

This is critically important: **all skills in Open Medical Skills are research and learning tools.** They are not clinical decision support (CDS) systems and must not be marketed, documented, or framed as such. This is a deliberate regulatory boundary that protects both the project and the healthcare community.

Every SKILL.md must include a disclaimer stating that the tool is for research and educational purposes only and should not be used as a substitute for professional medical judgment.

## Questions?

- Open a [GitHub Discussion](https://github.com/gitjfmd/open-medical-skills/discussions) for general questions
- Open a [GitHub Issue](https://github.com/gitjfmd/open-medical-skills/issues) for bugs or feature requests
- Contact: dev@intelmedica.ai

---

*Maintained by [IntelMedica.ai](https://intelmedica.ai) -- Building intelligent tools for modern healthcare.*

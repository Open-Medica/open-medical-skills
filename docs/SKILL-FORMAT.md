# SKILL.md Format Specification

This document defines the canonical format for `SKILL.md` files in Open Medical Skills. Every skill submitted to the directory must include a `SKILL.md` file in its skill directory (`skills/<skill-name>/SKILL.md`).

## File Structure

A SKILL.md file has two parts:

1. **YAML frontmatter** -- Machine-readable metadata between `---` delimiters
2. **Markdown body** -- Human-readable documentation following a defined structure

## Frontmatter Fields

The frontmatter contains the minimum metadata needed to identify the skill. The full metadata lives in the corresponding YAML file in `content/skills/`.

```yaml
---
name: skill-name                  # Required. Must match the YAML file name and directory name.
description: >                    # Required. 1-3 sentence description of what the skill does.
  Brief description of the skill's
  purpose and capabilities.
---
```

### Field Reference

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Unique kebab-case identifier. Must match the directory name and YAML filename. |
| `description` | Yes | string | Brief description (1-3 sentences). Can use YAML block scalar (`>`) for multi-line. |

## Body Structure

The Markdown body follows a standardized section structure. All sections marked "Required" must be present for the submission to pass review.

### Required Sections

#### Title (H1)

The top-level heading serves as the human-readable skill name.

```markdown
# Drug Interaction Safety Checker
```

#### Overview Paragraph

Immediately after the title, a 2-4 sentence paragraph expanding on the description. This should cover what the skill does, its approach, and its primary audience.

#### Quick Install

```markdown
## Quick Install

\`\`\`bash
npx skills add Open-Medica/open-medical-skills --skill skill-name
\`\`\`
```

Provide the primary install method. Additional install methods can be listed if available.

#### What It Does

```markdown
## What It Does

- **Feature name**: Description of the capability
- **Feature name**: Description of the capability
```

A bulleted list of the skill's core capabilities. Each bullet should have a bold label followed by a description. Aim for 3-6 items.

#### Clinical Use Cases

```markdown
## Clinical Use Cases

- **Use case title**: 2-3 sentence scenario description showing how the skill would be used in a real clinical or research context.
```

Concrete scenarios demonstrating how the skill applies in practice. Include the clinical setting, the problem being solved, and how the skill helps. Aim for 2-4 use cases.

#### Safety & Evidence

```markdown
## Safety & Evidence

- **Safety Classification:** Safe | Caution | Restricted -- Followed by justification.
- **Evidence Level:** High | Moderate | Low | Expert Opinion -- Followed by explanation of the evidence base.
```

This section is critically important. It must include:

- The safety classification with a clear explanation of why that level was assigned
- The evidence level with a description of the supporting evidence
- Any specific warnings, contraindications, or limitations relevant to safe use

**Safety classification definitions:**

| Level | Meaning | Examples |
|-------|---------|---------|
| Safe | Informational or administrative. No direct clinical impact. | ICD-10 lookup, literature search, anatomy tutor |
| Caution | Informs clinical reasoning but does not make decisions. Requires clinician oversight. | Differential diagnosis aid, drug interaction alerts |
| Restricted | Directly influences patient care decisions. Highest review bar. | Dosing calculators, treatment protocol generators |

**Evidence level definitions:**

| Level | Meaning |
|-------|---------|
| High | Based on systematic reviews, clinical guidelines, or well-validated frameworks |
| Moderate | Based on established clinical references, textbooks, or validated tools with known limitations |
| Low | Based on limited evidence, small studies, or novel approaches |
| Expert Opinion | Based on clinical expertise without formal evidence base |

#### Example Usage

```markdown
## Example Usage

**Scenario title:**
\`\`\`
User prompt or input
\`\`\`
> **Result:** Expected output or response from the skill.
```

At least one worked example showing input and expected output. Use blockquotes for the skill's response. Include 1-3 examples of increasing complexity.

#### Technical Details

```markdown
## Technical Details

- **Category:** Diagnosis
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Internal Medicine, Emergency Medicine
```

Structured metadata in a bulleted list format.

#### References

```markdown
## References

- Author(s). *Title*. Publisher; Year.
- Author(s). "Article title." *Journal*. Year;Volume(Issue):Pages.
- Organization. Database or guideline title. URL.
```

Cited literature, clinical guidelines, databases, and other sources that support the skill's evidence base. Use standard academic citation format.

### Required Sections Summary

| Section | Heading Level | Required |
|---------|---------------|----------|
| Title | H1 | Yes |
| Overview paragraph | (none) | Yes |
| Quick Install | H2 | Yes |
| What It Does | H2 | Yes |
| Clinical Use Cases | H2 | Yes |
| Safety & Evidence | H2 | Yes |
| Example Usage | H2 | Yes |
| Technical Details | H2 | Yes |
| References | H2 | Yes |

### Optional Sections

These sections can be included to provide additional depth:

- **Prerequisites / Requirements** -- System dependencies, API keys, or platform requirements
- **Configuration** -- Configuration options and environment variables
- **API Reference** -- For skills that expose a programmatic interface
- **Changelog** -- Version history and notable changes
- **Contributing** -- How to contribute to this specific skill
- **Troubleshooting** -- Common issues and solutions

### Footer

Every SKILL.md should end with:

```markdown
---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
```

### Research Tool Disclaimer

The Safety & Evidence section or the footer must include a statement clarifying that the skill is a research and learning tool, not clinical decision support. For example:

> This tool is designed for research and educational purposes only. It is not intended to serve as clinical decision support and should not be used as a substitute for professional medical judgment.

## Complete Example

```markdown
---
name: drug-interaction-checker
description: >
  Real-time drug-drug interaction detection with five-level severity
  classification (A/B/C/D/X). Checks for drug-disease, drug-dose, and
  drug-food interactions using FDA and clinical databases.
---

# Drug Interaction Safety Checker

Real-time drug-drug interaction detection with five-level severity
classification (A/B/C/D/X), modeled after the Lexicomp grading system.
This skill checks for drug-disease contraindications, drug-dose range
violations, and drug-food interactions by referencing FDA adverse event
databases and peer-reviewed clinical pharmacology sources.

## Quick Install

\`\`\`bash
npx skills add Open-Medica/open-medical-skills --skill drug-interaction-checker
\`\`\`

## What It Does

- **Severity classification**: Grades every interaction on the A/B/C/D/X
  scale, where A indicates no known interaction and X indicates a
  contraindicated combination
- **Multi-axis screening**: Evaluates drug-drug, drug-disease, drug-food,
  and drug-dose interactions in a single pass
- **Duplicate therapy detection**: Identifies overlapping pharmacologic
  classes
- **Renal and hepatic adjustment alerts**: Flags medications requiring
  dose modifications based on organ function

## Clinical Use Cases

- **Polypharmacy review**: A hospitalist adding a new antibiotic to a
  patient on eight chronic medications can screen the full regimen
  before placing the order.
- **Transitions of care**: During discharge reconciliation, the skill
  screens combined inpatient and outpatient medication lists for
  conflicts.

## Safety & Evidence

- **Safety Classification:** Safe -- The skill provides information and
  alerts only; it does not modify orders, prescriptions, or patient
  records.
- **Evidence Level:** High -- Interaction severity grading follows
  established frameworks (Lexicomp A-X scale) backed by FDA labeling,
  DailyMed, and published pharmacokinetic studies.

## Example Usage

**Checking a two-drug pair:**
\`\`\`
Check interaction between warfarin and fluconazole
\`\`\`
> **Result:** Severity X (Avoid Combination). Fluconazole is a potent
> CYP2C9 inhibitor that significantly increases warfarin plasma
> concentrations.

## Technical Details

- **Category:** Treatment
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Pharmacy, Clinical Pharmacology

## References

- Lexicomp Drug Interaction Classification System (Wolters Kluwer)
- FDA Adverse Event Reporting System (FAERS) database
- Hansten PD, Horn JR. *Drug Interactions Analysis and Management*.
  Wolters Kluwer, updated quarterly.

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
```

## Agent Skills Open Standard Compatibility

The SKILL.md format is designed to be compatible with emerging agent skill standards, including the Skills Open Standard ecosystem. Key compatibility notes:

- **Frontmatter metadata** maps to skill manifest fields used by agent platforms (name, description)
- **Install commands** support `npx`, `wget`, `git`, and `docker` patterns used across skill registries
- **Structured output** in the "What It Does" section can be parsed by agent orchestrators to understand skill capabilities
- **Safety & Evidence sections** extend beyond typical skill standards to meet healthcare requirements -- this is an OMS-specific enhancement that general-purpose skill platforms do not require

If you are porting a skill from another agent platform, ensure you add the Safety & Evidence, Clinical Use Cases, and References sections, which are specific to the OMS medical context.

---

*Maintained by [IntelMedica.ai](https://intelmedica.ai) -- Building intelligent tools for modern healthcare.*

---
name: iec-62304-compliance
description: >
  Modular skills for AI coding agents working on medical device software.
  Aligned to IEC 62304, ISO 14971, FDA, and EU MDR standards for software
  lifecycle management.
---

# IEC 62304 Medical Device Software Lifecycle

A modular skill set for AI coding agents working on medical device software development. Provides structured guidance aligned to IEC 62304 (Medical Device Software Lifecycle Processes), ISO 14971 (Risk Management), FDA 21 CFR Part 820, and EU MDR (Medical Device Regulation) standards. The skill ensures that software development activities produce the documentation, testing, and traceability artifacts required for regulatory submissions and quality system compliance.

## Quick Install

```bash
npx skills add Open-Medica/open-medical-skills --skill iec-62304-compliance
```

## What It Does

- **Software safety classification**: Guides determination of IEC 62304 software safety class (Class A, B, or C) based on severity of hazardous situations that could result from software failure, which in turn defines the rigor of required development activities
- **Lifecycle process mapping**: Maps each phase of the software development lifecycle (planning, requirements, architecture, detailed design, implementation, integration/testing, release, maintenance) to IEC 62304 clause requirements, identifying required deliverables and review gates
- **Documentation template generation**: Produces compliant document templates for Software Development Plan, Software Requirements Specification, Software Architecture Document, Software Detailed Design, Software Unit Test Plan, Software Integration Test Plan, and Software Release documentation
- **Risk management integration**: Links software development activities to ISO 14971 risk management processes, ensuring that software-related hazards are identified, risk controls are implemented in code, and traceability from hazard analysis through to verification of risk control measures is maintained
- **Change control and maintenance**: Provides guidance on IEC 62304 Clause 6 (Software Maintenance Process) including problem resolution, change request evaluation, regression analysis requirements, and re-release documentation for post-market software modifications

## Clinical Use Cases

- **New SaMD development**: A development team building a Class II SaMD (diagnostic decision support tool) uses the skill to structure their entire development lifecycle from planning through release, ensuring every IEC 62304 required activity and deliverable is addressed before regulatory submission
- **Legacy software compliance**: An established medical device company retrofitting IEC 62304 compliance onto existing software uses the skill to perform gap analysis, identifying which lifecycle documentation exists and what must be created retroactively to satisfy regulatory expectations
- **Agile development in regulated environments**: A team using Scrum for medical device software uses the skill to map agile ceremonies and artifacts (sprint planning, user stories, definition of done) to IEC 62304 activities and deliverables without abandoning their iterative workflow
- **EU MDR transition**: A manufacturer with existing FDA 510(k) clearance preparing for EU CE marking under MDR uses the skill to identify additional documentation requirements specific to EU MDR Technical Documentation expectations (Annex II) and Notified Body audit preparation

## Safety & Evidence

- **Safety Classification:** Safe — The skill provides process guidance, document templates, and compliance checklists. It does not make regulatory determinations, certify devices, or replace qualified regulatory affairs and quality assurance professionals. All generated documentation must be reviewed and approved through the organization's quality management system.
- **Evidence Level:** High — Guidance is derived directly from published international standards (IEC 62304:2006+A1:2015, ISO 14971:2019), FDA guidance documents, and EU MDR requirements. These are the authoritative references for medical device software development worldwide.

## Example Usage

**Software safety classification:**
```
Determine IEC 62304 software safety class for:
Device: AI-assisted insulin dosing recommendation system
Intended use: Provides insulin dose suggestions to patients with Type 1 diabetes
    based on continuous glucose monitor readings and meal input
Software failure mode: Algorithm suggests incorrect dose
Potential harm: Hypoglycemia (potentially life-threatening) or hyperglycemia
    (potentially leading to DKA)
```
> **IEC 62304 Software Safety Classification:**
>
> **Classification: Class C (highest rigor)**
>
> **Rationale:**
> - Software failure (incorrect dose recommendation) can directly contribute to a hazardous situation
> - The hazardous situation (inappropriate insulin dose) can result in serious injury (severe hypoglycemia, seizure, loss of consciousness) or death
> - No independent hardware or external safety measure can reliably prevent the harm once the incorrect dose is administered
>
> **Required IEC 62304 activities for Class C:**
> - Full Software Development Plan (Clause 5.1)
> - Detailed Software Requirements Analysis (Clause 5.2) with traceability to risk controls
> - Software Architecture Document with segregation analysis (Clause 5.3)
> - Detailed Design for all software units (Clause 5.4)
> - Unit-level verification for all modules (Clause 5.5)
> - Integration testing at all integration levels (Clause 5.6)
> - System-level testing against all requirements (Clause 5.7)
> - Comprehensive Software Release documentation (Clause 5.8)
>
> **ISO 14971 risk controls to implement:**
> - Maximum dose limits (hard-coded safety cap)
> - Rate-of-change limiting on dose adjustments
> - Mandatory user confirmation before dose delivery
> - Alerting for physiologically implausible dose recommendations
> - Graceful degradation with safe default when sensor data is unreliable

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Regulatory Affairs, Quality Assurance, Medical Devices

## References

- IEC 62304:2006+A1:2015 — Medical device software — Software life cycle processes
- ISO 14971:2019 — Medical devices — Application of risk management to medical devices
- IEC 82304-1:2016 — Health software — General requirements for product safety
- EU MDR 2017/745 — Regulation on Medical Devices, Annex II (Technical Documentation)
- FDA 21 CFR Part 820 — Quality System Regulation (Design Controls)
- AAMI TIR45:2012 — Guidance on the use of agile practices in the development of medical device software

---

*This skill is part of [Open Medical Skills](https://github.com/Open-Medica/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

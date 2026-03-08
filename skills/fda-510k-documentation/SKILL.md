# FDA 510(k) Documentation Automation

Automate the generation of FDA-required documentation for Software as a Medical Device (SaMD) under the 510(k) premarket notification pathway. This skill produces traceability matrices linking software requirements to regulatory obligations, generates predicate device comparison tables, drafts software documentation per FDA guidance, and creates the structured narrative sections required for a complete 510(k) submission package.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill fda-510k-documentation
```

## What It Does

- **Traceability matrix generation**: Creates bidirectional traceability matrices linking software requirements to design inputs, design outputs, verification/validation activities, and risk controls, satisfying FDA Design Controls (21 CFR 820.30) requirements
- **Predicate device comparison**: Generates structured substantial equivalence comparison tables between the subject device and predicate device(s), covering intended use, technological characteristics, performance data, and safety/effectiveness profiles
- **Software documentation per FDA guidance**: Produces Level of Concern determination, Software Description, Software Requirements Specification (SRS) summaries, Software Architecture Design, and software testing documentation aligned with FDA's 2023 "Content of Premarket Submissions for Device Software Functions" guidance
- **Risk management documentation**: Generates risk analysis artifacts aligned with ISO 14971:2019, including hazard identification, risk estimation, risk evaluation, and risk control verification documentation required as part of the 510(k) submission
- **Submission package assembly**: Organizes all generated documents into the FDA-recommended 510(k) submission structure with cover letter template, Indications for Use statement, device description, substantial equivalence discussion, and performance testing summaries

## Clinical Use Cases

- **Startup SaMD submission**: A health tech startup developing an AI-powered skin lesion classification app needs to prepare its first 510(k) submission. The skill generates the complete documentation package including software level of concern assessment (Major), predicate device comparison against existing dermatology CADx devices, and the software documentation suite
- **Legacy software update**: A medical device manufacturer is submitting a new 510(k) for a significant software update to a cleared patient monitoring system. The skill identifies which existing documentation can be referenced and generates only the delta documentation needed for the changed functionality
- **Combination product documentation**: A company developing software that interfaces with a physical diagnostic device uses the skill to generate the software-specific sections of the 510(k) while maintaining traceability to the hardware design controls
- **Pre-submission preparation**: Before a formal Pre-Sub (Q-Sub) meeting with FDA, the skill generates a draft intended use statement, preliminary predicate device comparison, and key questions document formatted according to FDA Pre-Sub guidance

## Safety & Evidence

- **Safety Classification:** Safe — The skill generates regulatory documentation and templates. It does not make regulatory determinations, submit filings to FDA, or certify device safety. All generated documents must be reviewed and finalized by qualified regulatory affairs professionals, quality engineers, and legal counsel before submission.
- **Evidence Level:** Moderate — Documentation templates follow current FDA guidance documents (2023 Software Guidance, 2014 Design Controls Guidance) and 21 CFR 820 Quality System Regulation requirements. However, FDA regulatory requirements evolve, and specific submission requirements may vary based on device classification, product code, and reviewing division expectations.

## Example Usage

**Generating a traceability matrix:**
```
Generate a traceability matrix for:
Device: AI-based chest X-ray triage system (SaMD, Class II)
Product code: QIH
Predicate: K192004

Software requirements:
1. REQ-001: Detect and flag critical findings (pneumothorax, pleural effusion) on chest X-rays
2. REQ-002: Generate notification to reading radiologist within 60 seconds of acquisition
3. REQ-003: Operate with sensitivity >= 95% and specificity >= 90% for target findings
4. REQ-004: Process DICOM images from multiple vendor CT/CR systems
```
> **Traceability Matrix (Partial):**
>
> | Req ID | Requirement | Design Input | Design Output | Verification | Risk Control |
> |--------|------------|-------------|---------------|-------------|-------------|
> | REQ-001 | Detect critical findings | User needs assessment, clinical literature review | Algorithm design spec v2.1, model architecture doc | Unit test UT-001, Integration test IT-003 | Risk ID R-004: False negative mitigation — ensemble model with minimum sensitivity threshold |
> | REQ-002 | Notification within 60s | Clinical workflow analysis, stakeholder interviews | Notification service spec, API design doc | Performance test PT-002 (latency benchmark) | Risk ID R-007: Delayed notification — fallback queue with escalation |
> | REQ-003 | Sensitivity >= 95%, Specificity >= 90% | Clinical performance goals, predicate device labeling | Validation protocol VP-001, statistical analysis plan | Clinical validation study CVS-001 (n=2,000 images) | Risk ID R-001: Inadequate performance — locked model with version control, revalidation on update |
> | REQ-004 | Multi-vendor DICOM compatibility | DICOM conformance statement, vendor interoperability requirements | DICOM parsing module, conformance statement | Interoperability test IOT-001 (5 vendor systems) | Risk ID R-012: Image parsing failure — input validation with rejection of non-conformant images |

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Regulatory Affairs, Medical Devices

## References

- FDA. "Content of Premarket Submissions for Device Software Functions." Guidance for Industry and Staff, 2023.
- FDA. "Design Controls Guidance for Medical Device Manufacturers." 21 CFR 820.30, 1997 (updated 2014).
- 21 CFR Part 820 — Quality System Regulation
- FDA. "Deciding When to Submit a 510(k) for a Software Change to an Existing Device." Guidance, 2017.
- ISO 14971:2019 — Medical devices — Application of risk management to medical devices
- FDA Digital Health Center of Excellence — fda.gov/medical-devices/digital-health-center-excellence

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

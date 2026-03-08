---
name: medical-imaging-analysis
description: >
  Analyze medical imaging data from DICOM servers and PACS systems. Extract
  metadata, query imaging studies by patient or modality, and process
  diagnostic imaging reports for clinical decision support.
---

# Medical Imaging & DICOM Analysis

Analyze medical imaging data from DICOM servers and Picture Archiving and Communication Systems (PACS). This skill enables AI agents to query imaging studies by patient, modality, or date range; retrieve and parse DICOM metadata for clinical context; process diagnostic imaging reports; and support radiological workflows including study comparison, modality-specific analysis, and structured reporting -- bridging the gap between imaging data systems and clinical decision support.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill medical-imaging-analysis
```

## What It Does

- **PACS/DICOM server querying** using C-FIND and DICOMweb (QIDO-RS) to search for imaging studies by patient ID, accession number, modality type (CT, MRI, US, XR, NM, PET), body part, study date range, or referring physician
- **Study-level metadata analysis** extracting study descriptions, series counts, image counts, acquisition parameters (slice thickness, field strength, contrast administration), and radiation dose information (CTDIvol, DLP) when available
- **Multi-modality comparison support** enabling side-by-side analysis of studies across different time points or modalities (e.g., comparing a baseline CT with a follow-up PET/CT to assess treatment response)
- **Structured radiology report generation** from DICOM metadata and study parameters, producing standardized report templates with findings organized by anatomical region, impression summaries, and follow-up recommendations using ACR-compliant formatting
- **Imaging protocol compliance verification** to check whether acquired studies match the ordered imaging protocol specifications (contrast phase, slice thickness, coverage extent, reconstruction kernel)

## Clinical Use Cases

- **Radiology workflow optimization**: A radiologist beginning a reading session can query their PACS worklist for all unread studies, sort by priority and modality, pull relevant prior studies for comparison, and have the system pre-populate structured report templates with study metadata -- reducing per-study administrative overhead.
- **Oncology treatment response assessment**: An oncologist reviewing a patient's serial imaging can retrieve all CT studies over the past 12 months, extract tumor measurement data from structured reports, and track lesion size changes over time to assess treatment response per RECIST 1.1 criteria.
- **Emergency department imaging triage**: An ED physician can query the PACS for a trauma patient's incoming CT results, view the study parameters to confirm appropriate protocols were followed (e.g., IV contrast given, full trauma coverage obtained), and access the preliminary report -- all without leaving their clinical workflow.
- **Radiation dose monitoring**: A medical physicist implementing a dose monitoring program can batch-query all CT studies performed in a department, extract CTDIvol and DLP values from DICOM dose reports, and generate dose summary statistics by protocol, scanner, and patient size category to identify optimization opportunities.

## Safety & Evidence

- **Safety Classification:** Caution -- This skill interacts with clinical imaging systems that contain protected health information. Access must be properly authenticated and authorized per institutional PACS security policies. The skill does not render diagnostic-quality images or replace radiologist interpretation. All imaging data accessed through this skill should be handled in compliance with HIPAA and institutional data governance policies.
- **Evidence Level:** Moderate -- The DICOM standard and DICOMweb APIs are universally adopted in medical imaging (ISO 12052). Structured reporting follows ACR guidelines. However, AI-assisted imaging analysis and automated report generation are evolving fields where clinical validation remains ongoing. This skill provides data access and organization, not diagnostic interpretation.

## Example Usage

**Query PACS for a patient's imaging history:**
```
Query the DICOM server for all imaging studies for patient ID
MRN-2024-55891 from the past 24 months. List each study with
its date, modality, body part, series count, and study description.
Highlight any studies with contrast administration and include
radiation dose data for CT studies.
```

**Generate a structured report template from study metadata:**
```
For the CT chest/abdomen/pelvis study (Accession: ACC-2024-78432),
extract the acquisition parameters (slice thickness, contrast phase,
kVp, mAs, reconstruction kernel) and generate a structured radiology
report template with sections for: Technique, Comparison Studies,
Findings (organized by chest/abdomen/pelvis), and Impression.
Pre-populate the technique section from DICOM metadata.
```

## Technical Details

- **Category:** Diagnosis
- **Author:** OMS Contributors (original: K-Dense-AI)
- **License:** MIT
- **Protocols:** DICOM (C-FIND, C-MOVE, C-GET), DICOMweb (WADO-RS, STOW-RS, QIDO-RS)
- **Standards:** DICOM PS3 (ISO 12052), IHE Radiology Technical Framework, ACR Practice Parameters for Communication
- **PACS Compatibility:** Any DICOM-compliant PACS (Sectra, Philips, GE, Fuji, Agfa, etc.)
- **Report Standards:** RSNA RadReport templates, ACR Assist structured reporting
- **Dependencies:** Python 3.8+, pydicom, pynetdicom (for DIMSE services), requests (for DICOMweb)

## References

- DICOM Standard: https://www.dicomstandard.org/
- DICOMweb Standard (WADO-RS, STOW-RS, QIDO-RS): https://www.dicomstandard.org/using/dicomweb
- IHE Radiology Technical Framework: https://www.ihe.net/resources/technical_frameworks/#radiology
- ACR Practice Parameter for Communication of Diagnostic Imaging Findings: https://www.acr.org/Clinical-Resources/Practice-Parameters-and-Technical-Standards
- RSNA RadReport Template Library: https://radreport.org/
- RECIST 1.1 Guidelines: Eisenhauer EA, et al. "New response evaluation criteria in solid tumours: revised RECIST guideline (version 1.1)." Eur J Cancer. 2009;45(2):228-247.

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

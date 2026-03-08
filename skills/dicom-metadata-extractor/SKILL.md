# DICOM Metadata & PHI Anonymization

Extract, inspect, and anonymize metadata from DICOM (Digital Imaging and Communications in Medicine) medical image files. This skill provides AI agents with the ability to parse DICOM headers for study and patient information, batch-extract metadata fields across imaging series, identify and redact protected health information (PHI) embedded in DICOM tags for de-identification, and prepare imaging datasets for research use in compliance with HIPAA Safe Harbor and Expert Determination methods -- powered by the pydicom library.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill dicom-metadata-extractor
```

## What It Does

- **DICOM header parsing** to extract all standard metadata fields including Patient ID, Study Date, Modality, Body Part, Series Description, Institution Name, Referring Physician, pixel spacing, slice thickness, and hundreds of additional DICOM tags organized by group
- **Batch metadata extraction** across entire imaging studies or series, generating structured CSV or JSON reports of metadata fields for all files in a directory, enabling systematic data audits
- **PHI identification and removal** following HIPAA Safe Harbor de-identification (18 identifiers), automatically detecting and redacting patient name, date of birth, medical record number, accession number, institution name, referring physician, and other PHI-containing DICOM tags
- **Pixel data PHI detection** for burned-in annotations, identifying text overlays on image pixels that may contain patient identifying information (e.g., patient name rendered in image corners by the modality)
- **Research dataset preparation** with configurable anonymization profiles, date shifting (preserving temporal relationships between studies), UID remapping (maintaining series/study relationships while replacing identifiers), and export in standard DICOM or converted formats

## Clinical Use Cases

- **Research data preparation**: A radiology researcher preparing a dataset of 5,000 chest CTs for a deep learning study needs to anonymize all DICOM files before sharing with collaborators. This skill batch-processes the entire dataset, strips PHI from headers, remaps UIDs consistently, shifts dates by a random offset, and flags files with potential burned-in annotations for manual review.
- **PACS migration quality assurance**: A hospital IT team migrating from one PACS system to another can use this skill to extract and compare metadata before and after migration, verifying that no data corruption occurred and that all studies maintained proper series relationships and metadata integrity.
- **Clinical trial imaging core lab**: An imaging core lab receiving multi-site trial data can extract standardized metadata from incoming DICOM files, verify protocol compliance (correct modality, slice thickness, contrast phase), and flag submissions that deviate from the imaging protocol.
- **HIPAA compliance audit**: A compliance officer can run this skill against a sample of DICOM files stored on a research server to verify that all PHI has been properly removed, generating an audit report listing any residual identifying information found in DICOM headers or burned-in pixel data.

## Safety & Evidence

- **Safety Classification:** Caution -- This skill processes medical imaging files that may contain protected health information (PHI). Users must ensure that anonymized datasets are validated before sharing or publication. Burned-in annotations in pixel data require visual verification as automated detection may miss some cases. The skill does not modify clinical systems or PACS storage directly.
- **Evidence Level:** High -- DICOM is the universal standard for medical imaging (ISO 12052). The pydicom library used by this skill is the most widely adopted open-source DICOM parser in the Python ecosystem, validated across millions of DICOM files. Anonymization follows DICOM Supplement 142 (Clinical Trial De-identification) and HIPAA Safe Harbor guidelines.

## Example Usage

**Extract metadata from a DICOM study:**
```
Extract all metadata from the DICOM files in /data/imaging/study_001/.
Generate a structured report showing Patient ID, Study Date, Modality,
Series Description, Slice Thickness, Pixel Spacing, and Institution
Name for each series. Output as a CSV file.
```

**Anonymize a dataset for research sharing:**
```
Anonymize all DICOM files in /data/trial/site_003/ using HIPAA Safe
Harbor de-identification. Remove all 18 PHI identifiers from DICOM
headers, remap Study/Series/SOP Instance UIDs while preserving
relationships, shift all dates by a consistent random offset, and
flag any files with suspected burned-in annotations. Save anonymized
files to /data/trial/site_003_anon/.
```

## Technical Details

- **Category:** Lab/Imaging
- **Author:** OMS Contributors (original: Healthcare MCP Public)
- **License:** MIT
- **Core Library:** pydicom (Python DICOM parser)
- **Standards:** DICOM PS3 (ISO 12052), DICOM Supplement 142 (De-identification), HIPAA Safe Harbor (45 CFR 164.514(b))
- **Supported Modalities:** All DICOM-compliant modalities (CT, MRI, US, XR, NM, PT, MG, DX, CR, and more)
- **PHI Tags Handled:** All 18 HIPAA Safe Harbor identifiers mapped to DICOM tag equivalents
- **Dependencies:** Python 3.8+, pydicom, numpy (for pixel operations), pillow (for burned-in annotation detection)

## References

- DICOM Standard: https://www.dicomstandard.org/
- pydicom Documentation: https://pydicom.github.io/pydicom/stable/
- DICOM Supplement 142 - Clinical Trial De-identification Profiles: https://www.dicomstandard.org/News-dir/ftsup/docs/sups/Sup142.pdf
- HIPAA Safe Harbor De-identification Method: https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html
- Cancer Imaging Archive (TCIA) De-identification Guidelines: https://wiki.cancerimagingarchive.net/display/Public/Submission+and+De-identification+Overview

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

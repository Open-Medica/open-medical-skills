---
name: fhir-data-access
description: >
  Connect to FHIR-compliant electronic health record systems to query,
  retrieve, and analyze patient data using natural language. Supports full
  CRUD operations on FHIR resources with SMART-on-FHIR authentication.
---

# FHIR Healthcare Data Access

Connect to FHIR-compliant (Fast Healthcare Interoperability Resources) electronic health record systems to query, retrieve, and analyze patient data using natural language. This skill supports full CRUD operations on FHIR R4 resources with SMART-on-FHIR OAuth2 authentication, enabling AI agents to interact with EHR data in a standards-compliant, auditable manner.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill fhir-data-access
```

## What It Does

- **Natural language to FHIR query translation**: Converts plain-language clinical questions (e.g., "Show me this patient's last three A1C results") into proper FHIR RESTful API queries against the appropriate resource endpoints (Observation, Condition, MedicationRequest, etc.)
- **SMART-on-FHIR authentication**: Implements the SMART App Launch Framework for secure OAuth2-based authorization, supporting both standalone launch and EHR launch contexts with appropriate scope negotiation (patient/*.read, user/*.write, etc.)
- **Multi-resource retrieval**: Queries across FHIR resource types including Patient, Encounter, Observation, Condition, MedicationRequest, AllergyIntolerance, Procedure, DiagnosticReport, DocumentReference, and CarePlan
- **Data aggregation and analysis**: Combines data from multiple FHIR resources to build longitudinal patient summaries, trend vital signs and lab values over time, and correlate medication changes with clinical outcomes
- **Write-back operations**: Supports creating and updating FHIR resources (e.g., posting new Observations, updating CarePlans, creating CommunicationRequests) with full audit trail logging and validation against FHIR profiles

## Clinical Use Cases

- **Point-of-care data retrieval**: A physician asks "What medications is this patient currently taking and when were they last prescribed?" The skill queries MedicationRequest resources with status=active and returns a formatted current medication list with prescriber and date information
- **Population health queries**: A quality improvement team needs to identify all diabetic patients in their panel with A1C > 9% who have not had a nephrology referral. The skill constructs a FHIR search query combining Condition (diabetes), Observation (A1C), and ServiceRequest (referral) resources
- **Clinical decision support integration**: An AI agent performing medication reconciliation uses the skill to pull the patient's current medication list from the EHR, compare it against a discharge medication list, and flag discrepancies for pharmacist review
- **Research data extraction**: An IRB-approved retrospective study needs to extract vital signs, lab results, and diagnosis codes for a cohort of patients. The skill retrieves FHIR Bundles with the relevant resources while respecting access scopes and consent directives

## Safety & Evidence

- **Safety Classification:** Restricted — This skill accesses real patient health data in electronic health record systems. It requires proper SMART-on-FHIR authorization, institutional approval, and appropriate access scopes. Write operations modify clinical records and must be used with extreme caution under clinician supervision. All data access is logged for audit purposes. The skill must never be deployed without institutional security review and BAA (Business Associate Agreement) compliance.
- **Evidence Level:** High — FHIR R4 is the HL7-endorsed interoperability standard mandated by ONC for certified EHR technology under the 21st Century Cures Act. SMART-on-FHIR is the established authorization framework for third-party clinical applications. Implementation follows published HL7 FHIR specifications.

## Example Usage

**Patient data query:**
```
Connect to FHIR server and retrieve:
- Patient demographics
- Active medications
- Last 5 lab results for hemoglobin A1C
- Active problem list

Patient ID: 12345
FHIR Server: https://fhir.hospital.org/api/v4
```
> **Patient Summary (FHIR R4):**
>
> **Demographics:**
> Name: [Retrieved from Patient resource]
> DOB: [Retrieved] | Age: [Calculated] | Sex: [Retrieved]
> MRN: 12345
>
> **Active Medications (MedicationRequest, status=active):**
> 1. Metformin 1000mg BID — prescribed 2025-11-15
> 2. Lisinopril 20mg daily — prescribed 2025-08-22
> 3. Atorvastatin 40mg daily — prescribed 2025-06-10
>
> **A1C History (Observation, LOINC 4548-4):**
> | Date | A1C | Status |
> |------|-----|--------|
> | 2026-02-15 | 7.8% | Final |
> | 2025-11-10 | 8.2% | Final |
> | 2025-08-05 | 8.9% | Final |
> | 2025-05-12 | 9.1% | Final |
> | 2025-02-08 | 8.7% | Final |
> Trend: Improving (9.1% -> 7.8% over 12 months)
>
> **Active Conditions (Condition, clinicalStatus=active):**
> 1. Type 2 diabetes mellitus (E11.9)
> 2. Essential hypertension (I10)
> 3. Hyperlipidemia (E78.5)
>
> *5 FHIR queries executed in 1.2s. All access logged under session [ID].*

## Technical Details

- **Category:** Diagnosis
- **Author:** OMS Contributors
- **License:** Apache-2.0
- **Version:** 1.0.0
- **Specialty:** Health Informatics, Clinical Data Management

## References

- HL7 FHIR R4 Specification — hl7.org/fhir/R4/
- SMART App Launch Implementation Guide (HL7) — build.fhir.org/ig/HL7/smart-app-launch/
- 21st Century Cures Act, Section 4003 — ONC interoperability and patient access requirements
- Mandel JC, et al. "SMART on FHIR: a standards-based, interoperable apps platform for electronic health records." *J Am Med Inform Assoc*. 2016;23(5):899-908.
- ONC Health IT Certification Program — healthit.gov

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

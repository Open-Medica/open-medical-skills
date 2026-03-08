# ICD-10 Diagnosis Code Lookup

Search, validate, and browse ICD-10-CM diagnosis codes using the National Library of Medicine (NLM) Clinical Tables API. This skill enables AI agents to perform partial-match text searches against the complete ICD-10-CM code set, validate specific codes for billing accuracy, browse the hierarchical chapter-block-category structure, and retrieve code descriptions with inclusion/exclusion notes -- streamlining medical coding, claims processing, and clinical documentation workflows.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill icd10-code-lookup
```

## What It Does

- **Free-text code search** with partial matching and auto-completion, allowing natural language queries like "chest pain" or "type 2 diabetes with nephropathy" to return matching ICD-10-CM codes ranked by relevance
- **Code validation** to verify that a specific ICD-10-CM code (e.g., E11.65) is valid, active in the current fiscal year, and billable (not a header/category code), with clear error messages for invalid or retired codes
- **Hierarchical browsing** through the ICD-10-CM structure from chapter level (e.g., Chapter IX: Diseases of the Circulatory System) down to subcategory and extension character level, displaying parent-child relationships
- **Inclusion and exclusion notes** for each code, showing "Includes," "Excludes1" (mutually exclusive), and "Excludes2" (not included here but may coexist) notes critical for accurate coding
- **Code-first and use-additional-code instructions** identifying when manifestation codes require an underlying etiology code, and when additional codes should be assigned for associated conditions

## Clinical Use Cases

- **Clinical documentation improvement (CDI)**: A CDI specialist reviewing a discharge summary that says "heart failure" can search for all HF-related ICD-10 codes, identify the most specific code matching the documented acuity (acute vs chronic), type (systolic vs diastolic vs combined), and stage, and query the physician for clarification if specificity is insufficient.
- **Real-time coding at point of care**: A physician completing an encounter note can type a clinical finding (e.g., "acute on chronic diastolic heart failure") and instantly receive the correct ICD-10-CM code (I50.31) with its full description and any required additional codes, reducing after-visit coding burden.
- **Claims denial management**: A billing specialist investigating a denied claim can validate the submitted ICD-10 code, check for Excludes1 conflicts with other codes on the same claim, verify laterality and extension characters, and identify the correct code to resubmit.
- **Quality measure reporting**: A quality team mapping clinical conditions to HEDIS or CMS quality measures can look up all ICD-10 codes in a value set, verify code validity for the reporting year, and ensure complete capture of qualifying diagnoses.

## Safety & Evidence

- **Safety Classification:** Safe -- This skill queries a public, read-only code reference database. It does not access patient records, submit claims, or make clinical diagnoses. ICD-10-CM code assignment should always be performed by qualified medical coders based on clinical documentation and official coding guidelines.
- **Evidence Level:** High -- The NLM Clinical Tables API provides access to the official ICD-10-CM code set maintained by the National Center for Health Statistics (NCHS) and CMS. This is the authoritative code set mandated for all HIPAA-covered entities in the United States.

## Example Usage

**Search for codes by clinical description:**
```
Search ICD-10 codes for "acute kidney injury with tubular
necrosis." Show the code, full description, any Excludes1 or
Excludes2 notes, and whether a use-additional-code instruction
applies. Also show the parent category.
```

**Validate a code and check hierarchy:**
```
Validate ICD-10-CM code M54.51. Is it a valid billable code in
the current fiscal year? Show its full description, the parent
category hierarchy up to the chapter level, and any related codes
in the same subcategory. Also list any Excludes1 and Excludes2
notes.
```

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors (original: MCP Healthcare Server)
- **License:** MIT
- **API:** NLM Clinical Tables API (https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html)
- **Code Set:** ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification)
- **Coverage:** Complete ICD-10-CM code set (~72,000+ codes), updated annually with each fiscal year release
- **Rate Limits:** No authentication required; reasonable use policy
- **Dependencies:** HTTP client (curl/fetch), JSON parser

## References

- NLM Clinical Tables API - ICD-10-CM: https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html
- CMS ICD-10-CM Official Guidelines for Coding and Reporting: https://www.cms.gov/medicare/coding-billing/icd-10-codes
- WHO ICD-10 Classification: https://icd.who.int/browse10/2019/en
- AAPC ICD-10-CM Code Search: https://www.aapc.com/codes/icd-10-codes-range/
- National Center for Health Statistics (NCHS) ICD-10-CM: https://www.cdc.gov/nchs/icd/icd-10-cm.htm

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

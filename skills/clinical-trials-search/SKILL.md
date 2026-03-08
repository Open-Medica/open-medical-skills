---
name: clinical-trials-search
description: >
  Access 400,000+ clinical trials from 220+ countries via ClinicalTrials.gov
  API v2. Search by condition, intervention, sponsor, or location.
---

# ClinicalTrials.gov Database Access

Search and retrieve data from over 400,000 clinical studies registered across 220+ countries via the ClinicalTrials.gov API v2. This skill enables AI agents to query the world's largest clinical trial registry by condition, intervention, sponsor, investigator, location, study phase, recruitment status, and outcome measures -- supporting evidence-based clinical decision-making, research planning, and patient recruitment workflows.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill clinical-trials-search
```

## What It Does

- **Multi-parameter trial search** across conditions (disease/disorder), interventions (drug/device/procedure), study phase (I-IV), recruitment status (recruiting, completed, terminated), age group, sex eligibility, and geographic location
- **Detailed study protocol retrieval** including primary/secondary outcome measures, eligibility criteria, study design (randomized, blinded, controlled), sample size, study arms, and intervention descriptions
- **Sponsor and collaborator queries** to find all trials run by a specific pharmaceutical company, academic institution, NIH institute, or cooperative group
- **Site location search** to identify recruiting trials within a specified distance of a geographic location, filtered by condition and intervention type
- **Results data access** for completed trials including primary outcome results, adverse event summaries, participant flow, and baseline demographics when available

## Clinical Use Cases

- **Patient enrollment referral**: An oncologist treating a patient with refractory NSCLC can search for Phase II/III trials recruiting in their region, review eligibility criteria against the patient's profile, and identify trials offering novel checkpoint inhibitor combinations.
- **Evidence gap analysis for grant writing**: A researcher planning a clinical trial on a novel anticoagulant can search for all completed and ongoing trials on the same drug class, identify which endpoints have been studied, and justify their proposed study design by demonstrating what has not yet been investigated.
- **Competitive intelligence in drug development**: A pharmaceutical company can monitor all trials registered by competitors in a therapeutic area, track enrollment progress, review primary endpoints, and anticipate market entry timelines for competing products.
- **Guideline committee evidence review**: A clinical guideline panel evaluating treatment recommendations can retrieve all registered Phase III trials for an intervention, check which have posted results, and identify completed trials whose data may not yet be published but whose results are available on ClinicalTrials.gov.

## Safety & Evidence

- **Safety Classification:** Safe -- This skill queries a public, read-only U.S. government database. It does not enroll patients in trials, provide treatment recommendations, or interact with protected health information. All data comes from sponsor-submitted regulatory registrations.
- **Evidence Level:** High -- ClinicalTrials.gov is the authoritative clinical trial registry mandated by the FDA Amendments Act (FDAAA 801). Registration is legally required for most interventional studies of FDA-regulated products, making it the most comprehensive trial registry globally.

## Example Usage

**Find recruiting trials for a specific condition:**
```
Search ClinicalTrials.gov for Phase II and Phase III trials
currently recruiting patients with treatment-resistant depression.
Filter for trials using psilocybin or ketamine as interventions.
Show the NCT number, title, sponsor, enrollment target,
primary outcome, and site locations.
```

**Retrieve results from completed trials:**
```
Find all completed clinical trials sponsored by Novo Nordisk
studying semaglutide for obesity (BMI >= 30). For trials that
have posted results, show the primary outcome measure,
statistical results, and serious adverse event rates.
```

## Technical Details

- **Category:** Research
- **Author:** OMS Contributors (original: Augmented-Nature)
- **License:** MIT
- **API:** ClinicalTrials.gov API v2 (https://clinicaltrials.gov/api/v2)
- **Endpoints:** /studies (search), /studies/{nctId} (detail), /stats (aggregation)
- **Data Coverage:** 400,000+ studies from 220+ countries, updated daily
- **Rate Limits:** No authentication required; reasonable use policy applies
- **Dependencies:** HTTP client (curl/fetch), JSON parser

## References

- ClinicalTrials.gov API v2 Documentation: https://clinicaltrials.gov/data-api/api
- FDAAA 801 and the Final Rule: https://www.fda.gov/regulatory-information/fdaaa-801-and-final-rule
- ICMJE Trial Registration Policy: https://www.icmje.org/recommendations/browse/publishing-and-editorial-issues/clinical-trial-registration.html
- WHO International Clinical Trials Registry Platform: https://www.who.int/clinical-trials-registry-platform

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

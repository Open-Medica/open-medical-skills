# Medicare Drug Spending & Utilization

Access comprehensive Centers for Medicare & Medicaid Services (CMS) data on drug spending, physician prescribing patterns, hospital utilization metrics, and provider payment analysis through the Socrata Open Data API. This skill enables AI agents to query real federal healthcare expenditure datasets, supporting health economics research, formulary management, prescribing pattern analysis, and healthcare policy evaluation.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill medicare-drug-stats
```

## What It Does

- **Drug spending analysis** across Medicare Part B and Part D programs including total spending, per-unit cost, per-beneficiary cost, year-over-year price changes, and manufacturer rebate impact data
- **Prescriber-level data queries** to examine individual provider prescribing patterns, total claim counts, beneficiary counts, and drug-specific utilization for any Medicare-enrolled prescriber by NPI number
- **Geographic utilization analysis** with spending and utilization data aggregated at state, hospital referral region (HRR), and county levels to identify regional variation in prescribing and costs
- **Hospital utilization metrics** including DRG-level discharge counts, average covered charges, total Medicare payments, and length-of-stay data by facility and diagnosis
- **Trend analysis support** with multi-year datasets enabling year-over-year comparisons of drug prices, utilization volumes, prescribing shifts, and spending trajectories

## Clinical Use Cases

- **Formulary cost management**: A health plan pharmacy director can query total Medicare spending for all drugs within a therapeutic class (e.g., PCSK9 inhibitors), compare per-unit costs, and identify the most cost-effective formulary choices supported by real utilization data.
- **Prescribing pattern benchmarking**: A medical director at an ACO can pull prescribing data for all primary care providers in their network, compare opioid prescribing rates against regional and national benchmarks, and identify outlier prescribers for targeted education.
- **Drug pricing research**: A health economist studying insulin affordability can track year-over-year spending per beneficiary for all insulin products in the Medicare Part D program, quantify the impact of manufacturer rebates, and model projected savings from proposed policy changes.
- **Hospital efficiency analysis**: A hospital administrator can compare their facility's average Medicare payment and length of stay for a specific DRG against peer hospitals in the same region, identifying opportunities for cost reduction and care pathway improvement.

## Safety & Evidence

- **Safety Classification:** Safe -- This skill queries publicly available, de-identified CMS administrative datasets. It does not access individual patient records, contain protected health information, or make clinical recommendations. All data is aggregate-level and publicly released by the U.S. federal government.
- **Evidence Level:** High -- CMS datasets are the authoritative source for U.S. Medicare program utilization and spending data. These datasets are used extensively in peer-reviewed health services research, congressional reports, and federal policy analysis. Data undergoes rigorous quality checks before public release.

## Example Usage

**Analyze drug spending trends:**
```
Query Medicare Part D drug spending data for semaglutide (Ozempic
and Wegovy) from 2020 to 2024. Show total spending, number of
beneficiaries, per-beneficiary cost, and year-over-year percentage
change. Compare against liraglutide (Victoza) for the same period.
```

**Examine prescribing patterns by region:**
```
Pull Medicare prescriber data for all opioid prescriptions in
West Virginia, Kentucky, and Ohio for 2023. Aggregate by state
and show total claim counts, total beneficiaries, and per-capita
opioid prescribing rate. Compare to the national average.
```

## Technical Details

- **Category:** Administrative
- **Author:** OMS Contributors (original: openpharma-org)
- **License:** MIT
- **API:** Socrata Open Data API (SODA) for CMS datasets
- **Key Datasets:** Medicare Part D Spending by Drug, Medicare Provider Utilization and Payment, Medicare Part D Prescribers, Inpatient Prospective Payment System (IPPS)
- **Data Source:** Centers for Medicare & Medicaid Services (data.cms.gov)
- **Rate Limits:** 1,000 requests/hour without app token; higher limits with free Socrata app token
- **Dependencies:** HTTP client (curl/fetch), JSON parser, SoQL query syntax

## References

- CMS Data Portal: https://data.cms.gov/
- Socrata Open Data API (SODA) Documentation: https://dev.socrata.com/
- Medicare Part D Drug Spending Dashboard: https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug
- Medicare Provider Utilization and Payment Data: https://data.cms.gov/provider-summary-by-type-of-service
- CMS Research, Statistics, Data & Systems: https://www.cms.gov/data-research

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

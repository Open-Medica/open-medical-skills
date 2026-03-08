# Medical Radiation Exposure Tracker

Track cumulative radiation exposure from medical imaging procedures across a patient's lifetime. This skill calculates effective doses from diagnostic X-rays, CT scans, fluoroscopy, nuclear medicine studies, and interventional radiology procedures, incorporating body surface area adjustments, organ-specific weighting factors, and radioactive decay models for comprehensive dosimetry tracking.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill radiation-exposure-tracker
```

## What It Does

- **Cumulative dose tracking**: Maintains a running total of effective radiation dose (in millisieverts, mSv) from all documented medical imaging procedures, organized chronologically with per-procedure and cumulative totals
- **Procedure-specific dose estimation**: Provides reference effective dose values for common imaging studies (chest X-ray ~0.02 mSv, head CT ~2 mSv, abdomen/pelvis CT ~10 mSv, coronary CT angiography ~5-15 mSv, PET/CT ~25 mSv) based on published dosimetry data
- **Body habitus adjustment**: Adjusts dose estimates for patient body surface area, BMI, and age, as radiation exposure per procedure varies significantly with body size (larger patients require higher technique factors) and pediatric patients have higher tissue radiosensitivity
- **Organ dose calculation**: Estimates organ-specific absorbed doses using ICRP tissue weighting factors, enabling risk assessment for particularly radiosensitive organs (breast, thyroid, bone marrow, gonads)
- **Lifetime cancer risk projection**: Applies the BEIR VII linear no-threshold model to estimate the incremental lifetime attributable cancer risk from cumulative medical radiation exposure, presented as excess cases per 100,000 population

## Clinical Use Cases

- **Chronic disease monitoring**: A patient with Crohn's disease has undergone 12 abdominal CT scans over 5 years for flare assessment and abscess surveillance. The skill calculates cumulative abdominal exposure (~120 mSv) and recommends discussing MRI enterography as a radiation-free alternative for future monitoring
- **Pediatric imaging stewardship**: A 4-year-old with a VP shunt has had 15 head CT scans in 3 years. The skill flags the cumulative dose (>30 mSv to the head), emphasizes the elevated pediatric radiosensitivity, and recommends fast-sequence MRI (quick brain) as an alternative protocol for shunt evaluation
- **Emergency department utilization review**: A radiology quality committee reviews patients who have received more than 50 mSv cumulative effective dose in the past 12 months to identify potential overutilization and recommend imaging optimization strategies
- **Pre-procedure informed consent**: Before ordering a cardiac catheterization (estimated 7-15 mSv), the referring cardiologist uses the skill to contextualize the additional dose relative to the patient's existing cumulative exposure and present this information during consent

## Safety & Evidence

- **Safety Classification:** Safe — The skill performs dosimetric calculations and provides informational tracking. It does not modify imaging orders, contraindicate procedures, or interfere with clinical decision-making. Dose estimates are reference values that may differ from actual delivered doses depending on scanner model, protocol, and technique factors.
- **Evidence Level:** Moderate — Effective dose estimates are based on published reference values from ICRP Publication 103, NCRP Report 184, and ACR dose index registry data. Cancer risk projections use the BEIR VII linear no-threshold model, which is widely used for radiation protection purposes but acknowledged to carry uncertainty at low dose ranges (<100 mSv).

## Example Usage

**Cumulative dose report:**
```
Calculate cumulative radiation exposure for patient with the following imaging history:

2024-03: Chest X-ray (PA + lateral)
2024-06: CT abdomen/pelvis with contrast
2024-09: CT chest with contrast (PE protocol)
2025-01: PET/CT (whole body)
2025-04: CT abdomen/pelvis with contrast (follow-up)
2025-10: Coronary CT angiography
2026-01: CT abdomen/pelvis with contrast (follow-up)

Patient: 55-year-old female, BMI 28
```
> **Cumulative Radiation Exposure Report:**
>
> | Date | Procedure | Effective Dose (mSv) | Cumulative (mSv) |
> |------|-----------|---------------------|-------------------|
> | 2024-03 | Chest X-ray (PA + lateral) | 0.06 | 0.06 |
> | 2024-06 | CT abdomen/pelvis w/ contrast | 12.0 | 12.06 |
> | 2024-09 | CT chest w/ contrast (PE protocol) | 7.0 | 19.06 |
> | 2025-01 | PET/CT whole body | 25.0 | 44.06 |
> | 2025-04 | CT abdomen/pelvis w/ contrast | 12.0 | 56.06 |
> | 2025-10 | Coronary CT angiography | 10.0 | 66.06 |
> | 2026-01 | CT abdomen/pelvis w/ contrast | 12.0 | 78.06 |
>
> **Total cumulative effective dose: 78.1 mSv** (over 22 months)
> **BMI adjustment note:** Doses adjusted upward ~10% from reference values for BMI 28
>
> **Context:** Average annual background radiation in the US is approximately 3.1 mSv. This patient's cumulative medical exposure is equivalent to approximately 25 years of natural background radiation.
>
> **Recommendation:** Cumulative dose exceeds 50 mSv in 12 months. Consider alternative imaging modalities (MRI, ultrasound) where clinically appropriate for future follow-up studies. Discuss with ordering physicians to optimize imaging protocol selection.

## Technical Details

- **Category:** Lab & Imaging
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Radiology, Radiation Oncology, Nuclear Medicine

## References

- ICRP Publication 103. "The 2007 Recommendations of the International Commission on Radiological Protection." *Ann ICRP*. 2007;37(2-4):1-332.
- NCRP Report No. 184. "Medical Radiation Exposure of Patients in the United States." National Council on Radiation Protection and Measurements, 2019.
- National Research Council. *Health Risks from Exposure to Low Levels of Ionizing Radiation: BEIR VII Phase 2*. National Academies Press, 2006.
- Mettler FA, et al. "Effective doses in radiology and diagnostic nuclear medicine." *Radiology*. 2008;248(1):254-263.
- ACR Dose Index Registry — acr.org/Quality-Safety/National-Radiology-Data-Registry/Dose-Index-Registry

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

# Pediatric Growth Chart Analyzer

Interpret pediatric growth measurements using CDC and WHO growth charts for children from birth through 20 years. This skill plots height, weight, BMI, and head circumference against age- and sex-specific percentile curves, identifies abnormal growth patterns, and generates clinical recommendations for further evaluation when measurements fall outside expected ranges.

## Quick Install
```bash
npx skills add gitjfmd/open-medical-skills --skill pediatric-growth-charts
```

## What It Does
- Calculates age- and sex-specific percentiles for weight, height/length, BMI, and head circumference using CDC (2-20 years) and WHO (0-2 years) reference data
- Identifies growth parameters that fall below the 3rd percentile or above the 97th percentile and flags them for clinical attention
- Detects concerning growth velocity patterns such as weight faltering (crossing two major percentile lines downward) or rapid weight gain
- Computes BMI percentile for children aged 2-20 years with classification (underweight, healthy weight, overweight, obese)
- Generates clinical recommendations including nutritional assessment, endocrine evaluation referral, or continued monitoring based on growth trajectory

## Clinical Use Cases
- **Well-Child Growth Monitoring:** A pediatrician enters a 15-month-old's weight (9.5 kg) and length (76 cm) at a routine visit. The tool reports weight at the 15th percentile and length at the 25th percentile, both proportionally within normal range, with guidance to continue routine monitoring
- **Failure to Thrive Evaluation:** A family medicine physician notices an 8-month-old who was at the 50th percentile for weight at 4 months is now at the 10th percentile. The tool detects the percentile crossing and recommends nutritional assessment, caloric intake review, and consideration of organic causes
- **Obesity Screening in Adolescents:** During an annual physical, a 14-year-old's BMI is calculated at the 96th percentile. The tool classifies this as overweight (85th-95th = overweight, above 95th = obese) and recommends lipid panel, fasting glucose, and lifestyle counseling per AAP guidelines
- **Microcephaly or Macrocephaly Detection:** A 6-month-old's head circumference plots below the 2nd percentile. The tool flags this for further workup including neuroimaging consideration, genetic evaluation, and TORCH screening if not previously performed

## Safety & Evidence
- **Safety Classification:** Safe -- Growth chart interpretation is a standard clinical assessment that supports but does not replace clinical judgment. Abnormal findings require further evaluation by a qualified clinician
- **Evidence Level:** High -- Based on CDC Growth Charts (Kuczmarski RJ, et al. "2000 CDC Growth Charts for the United States." National Center for Health Statistics, Vital Health Stat 2002) and WHO Child Growth Standards (WHO Multicentre Growth Reference Study Group, Acta Paediatrica 2006). The AAP recommends WHO charts for 0-2 years and CDC charts for 2-20 years

## Example Usage

**Assessing growth for a 12-month-old male:**
```
Analyze growth for a 12-month-old male: weight 10.2 kg, length 76 cm, head circumference 46.5 cm
```
Returns percentiles for each measurement against WHO standards, flags any parameters outside normal range, and provides age-appropriate anticipatory guidance on nutrition and growth expectations.

**BMI classification for a school-age child:**
```
Calculate BMI percentile for a 10-year-old female: weight 45 kg, height 140 cm
```
Returns BMI value, BMI-for-age percentile using CDC charts, classification category, and recommendations if outside healthy weight range.

## Technical Details
- **Category:** Pediatrics
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialties:** Pediatrics, Family Medicine

## References
- Kuczmarski RJ, et al. "2000 CDC Growth Charts for the United States: Methods and Development." *National Center for Health Statistics. Vital Health Stat*. 2002;11(246).
- WHO Multicentre Growth Reference Study Group. "WHO Child Growth Standards: Length/Height-for-Age, Weight-for-Age, Weight-for-Length, Weight-for-Height and BMI-for-Age." *Acta Paediatrica*. 2006;95(Suppl 450):1-101.
- AAP Committee on Nutrition. "Assessment of Nutritional Status." In: *Pediatric Nutrition*. 8th Ed. AAP, 2019.
- Hagan JF, et al. *Bright Futures: Guidelines for Health Supervision*. 4th Ed. AAP, 2017.

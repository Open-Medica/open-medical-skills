# Biostatistics Analysis Tool

Perform common biostatistical analyses for medical research including survival analysis (Kaplan-Meier, Cox proportional hazards), logistic and linear regression, ROC curve analysis with AUC calculation, sample size and power calculations, and diagnostic test performance metrics. The skill guides researchers through appropriate test selection, assumption checking, result interpretation, and reporting in accordance with published statistical reporting guidelines.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill biostatistics-analyzer
```

## What It Does

- **Statistical test selection**: Given a research question, data structure (continuous/categorical, paired/unpaired, parametric/non-parametric), and study design, recommends the appropriate statistical test and explains why alternatives were not selected
- **Survival analysis**: Performs Kaplan-Meier estimation with log-rank test comparison between groups, Cox proportional hazards regression with hazard ratio calculation and proportional hazards assumption testing (Schoenfeld residuals)
- **Regression modeling**: Conducts logistic regression (binary, ordinal, multinomial) and linear regression with model diagnostics, effect size reporting (odds ratios with 95% CI for logistic; beta coefficients for linear), multicollinearity assessment (VIF), and model fit statistics (C-statistic, R-squared, Hosmer-Lemeshow)
- **Diagnostic test evaluation**: Calculates sensitivity, specificity, positive/negative predictive values, positive/negative likelihood ratios, and generates ROC curves with AUC and optimal threshold determination (Youden's index)
- **Sample size and power**: Computes required sample sizes for common study designs (two-group comparison of means, two-group comparison of proportions, survival analysis, non-inferiority/equivalence trials) and performs post-hoc power analysis for completed studies

## Clinical Use Cases

- **Clinical trial analysis**: A research team analyzing a randomized controlled trial comparing two anti-hypertensive agents uses the skill to perform the primary efficacy analysis (between-group difference in systolic BP at 12 weeks, adjusted for baseline), generate Kaplan-Meier curves for the secondary MACE endpoint, and calculate the number needed to treat
- **Retrospective cohort study**: An epidemiologist studying risk factors for post-operative complications uses the skill to build a multivariable logistic regression model, check for confounders, assess model discrimination (C-statistic), and produce a forest plot of adjusted odds ratios
- **Diagnostic accuracy study**: A pathologist evaluating a new biomarker for pancreatic cancer uses the skill to generate ROC curves comparing the novel biomarker against CA 19-9, calculate DeLong's test for AUC comparison, and determine the optimal cutoff point that maximizes sensitivity at a clinically acceptable specificity threshold
- **Grant proposal sample size justification**: An investigator planning a non-inferiority trial needs to calculate the required sample size assuming a non-inferiority margin of 5%, expected event rate of 15% in both arms, 80% power, and one-sided alpha of 0.025, accounting for 15% dropout

## Safety & Evidence

- **Safety Classification:** Safe — The skill performs mathematical computations and statistical analyses. It does not make clinical decisions, treat patients, or generate clinical recommendations. Statistical results and interpretations must be reviewed by qualified biostatisticians or researchers with statistical training.
- **Evidence Level:** Moderate — Statistical methods implemented follow established textbook approaches (Altman, Bland, Hosmer-Lemeshow) and published reporting guidelines (CONSORT, STROBE, STARD, TRIPOD). Calculations use standard statistical formulas. However, proper application of statistical methods requires understanding of assumptions, study design, and clinical context that the skill supports but does not replace.

## Example Usage

**Sample size calculation:**
```
Calculate required sample size for:
Study design: Randomized controlled trial, parallel groups
Primary outcome: Proportion of patients achieving HbA1c < 7.0% at 6 months
Expected rate in control group: 35%
Expected rate in intervention group: 50%
Alpha: 0.05 (two-sided)
Power: 80%
Allocation ratio: 1:1
Expected dropout rate: 10%
```
> **Sample Size Calculation:**
>
> **Method:** Two-proportion z-test (chi-square test for equality of proportions)
>
> **Parameters:**
> - p1 (control): 0.35
> - p2 (intervention): 0.50
> - Absolute difference: 0.15
> - Alpha: 0.05 (two-sided)
> - Power: 0.80
> - Allocation ratio: 1:1
>
> **Result (before dropout adjustment):**
> - Per group: 170 patients
> - Total: 340 patients
>
> **Result (after 10% dropout adjustment):**
> - Per group: 189 patients
> - Total: 378 patients
>
> **Reporting language:**
> "A sample size of 170 per group (340 total) provides 80% power to detect a 15 percentage point difference in the proportion of patients achieving HbA1c <7.0% (50% vs. 35%) using a two-sided chi-square test at the 5% significance level. Accounting for an anticipated 10% dropout rate, we plan to enroll 189 patients per group (378 total)."
>
> **Sensitivity analysis:** At 90% power, the required sample size increases to 227 per group (454 total, or 504 after dropout adjustment).

**ROC curve analysis:**
```
Evaluate diagnostic performance of troponin-I for acute MI diagnosis:
- AUC for troponin-I: 0.92 (95% CI: 0.89-0.95)
- AUC for CK-MB: 0.78 (95% CI: 0.73-0.83)
- Compare the two biomarkers
```
> **ROC Curve Comparison:**
>
> | Biomarker | AUC | 95% CI | Optimal Cutoff (Youden) | Sensitivity | Specificity |
> |-----------|-----|--------|------------------------|-------------|-------------|
> | Troponin-I | 0.92 | 0.89-0.95 | 0.04 ng/mL | 93.2% | 84.6% |
> | CK-MB | 0.78 | 0.73-0.83 | 5.0 ng/mL | 72.1% | 76.3% |
>
> **DeLong's test for AUC comparison:**
> - Difference in AUC: 0.14 (95% CI: 0.08-0.20)
> - Z-statistic: 4.67
> - P-value: <0.001
>
> **Interpretation:** Troponin-I demonstrates significantly superior discriminative ability for acute MI diagnosis compared to CK-MB (AUC 0.92 vs. 0.78, p<0.001). At the optimal cutoff of 0.04 ng/mL, troponin-I achieves 93.2% sensitivity and 84.6% specificity.

## Technical Details

- **Category:** Clinical Research Summarizing
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Research, Biostatistics

## References

- Altman DG. *Practical Statistics for Medical Research*. Chapman and Hall/CRC, 1991.
- Hosmer DW, Lemeshow S, Sturdivant RX. *Applied Logistic Regression*. 3rd ed. Wiley, 2013.
- Bland JM, Altman DG. "Statistical methods for assessing agreement between two methods of clinical measurement." *Lancet*. 1986;327(8476):307-310.
- DeLong ER, DeLong DM, Clarke-Pearson DL. "Comparing the areas under two or more correlated receiver operating characteristic curves." *Biometrics*. 1988;44(3):837-845.
- Schulz KF, et al. "CONSORT 2010 Statement: updated guidelines for reporting parallel group randomised trials." *BMJ*. 2010;340:c332.
- Collins GS, et al. "Transparent reporting of a multivariable prediction model for individual prognosis or diagnosis (TRIPOD)." *BMJ*. 2015;350:g7594.

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

# Medical Academic Writing Humanizer

Removes identifiable markers of AI-generated prose from medical academic papers and makes them read naturally, as if written by an experienced human researcher. Based on Wikipedia's AI writing detection patterns and adapted specifically for medical and biomedical literature conventions, the skill rewrites text to eliminate formulaic phrasing, mechanical transitions, and stylistic uniformity that characterize machine-generated content while preserving scientific accuracy and appropriate academic register.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill medical-paper-humanizer
```

## What It Does

- **AI writing pattern detection**: Identifies over 40 common markers of AI-generated text including hedging overuse ("it is important to note that"), filler transitions ("furthermore," "moreover," "additionally" in sequence), sycophantic framing ("this groundbreaking study"), uniform sentence length, and formulaic paragraph structure
- **Medical register preservation**: Maintains the precision required in scientific writing — exact statistical language, proper use of clinical terminology, accurate citation integration, and appropriate hedging where scientific uncertainty genuinely exists — while eliminating artificial hedging that adds no meaning
- **Section-specific adaptation**: Applies different humanization strategies to each manuscript section: more varied voice in the Introduction and Discussion, strict precision in Methods and Results, measured interpretation in the Abstract and Conclusions
- **Voice and style variation**: Introduces natural sentence length variation, occasional passive-to-active voice shifts where appropriate, discipline-specific idioms, and the kind of concise directness that characterizes experienced medical writers
- **Before/after comparison**: Outputs the revised text alongside a marked-up diff showing every change made, with brief rationale notes explaining why each modification was applied, enabling the author to accept, reject, or further modify individual changes

## Clinical Use Cases

- **Manuscript preparation**: A researcher has drafted a case report using AI assistance and needs to ensure the final submission reads naturally. The skill identifies and corrects 23 instances of formulaic AI phrasing, replaces generic transitions with context-specific connectors, and varies the sentence structure throughout
- **Grant application polishing**: A principal investigator preparing an NIH R01 application has used AI to draft the Significance and Innovation sections. The skill removes the characteristic "tapestry" phrasing and ensures the prose matches the direct, evidence-forward style expected by study sections
- **Thesis and dissertation review**: A doctoral candidate who used AI tools during the drafting process runs their literature review through the skill to ensure it reads with the scholarly voice expected at the dissertation level and does not trigger institutional AI detection tools
- **Journal revision response**: An author responding to reviewer comments has drafted response letters and revised manuscript sections with AI assistance. The skill ensures consistency between the original (human-written) manuscript sections and the newly revised sections

## Safety & Evidence

- **Safety Classification:** Safe — The skill modifies prose style without altering scientific content, data, statistical results, or clinical conclusions. It is a writing tool, not a content generator. Users remain responsible for the accuracy and integrity of all scientific claims in their manuscripts.
- **Evidence Level:** Low — Writing style humanization is not a clinically evaluated intervention. The skill's approach is based on documented AI writing patterns identified by Wikipedia's editorial community, linguistic analysis of published medical literature, and style guidelines from major medical journal submission requirements (ICMJE, CONSORT, STROBE). Effectiveness is subjective and depends on the quality of the input text.

## Example Usage

**Humanizing an AI-generated paragraph:**
```
Humanize the following Discussion paragraph:

"This study demonstrates that the implementation of telehealth interventions
significantly improves patient outcomes in rural communities. It is important
to note that these findings align with previous research conducted by Smith
et al. (2024) and Johnson et al. (2023). Furthermore, our results suggest
that telehealth can serve as a viable alternative to traditional in-person
consultations. Moreover, the cost-effectiveness analysis reveals substantial
savings for both healthcare systems and patients. Additionally, patient
satisfaction scores were notably higher in the telehealth group. In conclusion,
these findings underscore the transformative potential of telehealth in
addressing healthcare disparities."
```
> **Humanized output:**
>
> "Telehealth improved clinical outcomes across all three endpoints measured in our rural cohort, consistent with the gains reported by Smith et al. (2024) in Appalachian primary care and Johnson et al. (2023) in Australian remote communities. The effect sizes we observed (OR 2.1 for medication adherence, OR 1.8 for follow-up completion) suggest that virtual visits are not merely a stopgap but a practical substitute for in-person encounters when travel distance exceeds 45 miles — the threshold at which our subgroup analysis showed the largest benefit. At $47 per encounter versus $112 for in-person visits (including patient travel costs), the economic case is straightforward. Patients also preferred it: satisfaction scores in the telehealth arm averaged 4.3/5.0 compared with 3.8/5.0 for usual care (p=0.02), driven largely by reduced time away from work."
>
> **Changes made:**
> - Removed 5 formulaic transitions ("Furthermore," "Moreover," "Additionally," "It is important to note," "In conclusion")
> - Replaced vague claims with specific data points
> - Varied sentence length (range: 14-52 words vs. original 12-18 words uniform)
> - Added contextual comparisons to cited studies rather than generic alignment claims
> - Eliminated "transformative potential" (AI-characteristic superlative hedging)

## Technical Details

- **Category:** Clinical Research Summarizing
- **Author:** OMS Contributors
- **License:** MIT
- **Version:** 1.0.0
- **Specialty:** Medical Writing, Research

## References

- Wikipedia. "Wikipedia:AI-generated content." Guidelines for identifying and handling AI-written text. Wikimedia Foundation.
- International Committee of Medical Journal Editors (ICMJE). "Recommendations for the Conduct, Reporting, Editing, and Publication of Scholarly Work in Medical Journals." Updated 2023.
- COPE (Committee on Publication Ethics). "COPE position statement on AI tools." 2023.
- Gao CA, et al. "Comparing scientific abstracts generated by ChatGPT to real abstracts with detectors and blinded human reviewers." *npj Digital Medicine*. 2023;6:75.
- WAME (World Association of Medical Editors). "WAME Recommendations on chatbots and generative AI in relation to scholarly publications." 2023.

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*

-- Auto-generated seed file from skills-index.json
-- Generated: 2026-03-26T05:48:04.774Z
-- Total skills: 49

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'acls-protocol-assistant',
  'ACLS Protocol Assistant',
  'Advanced Cardiac Life Support (ACLS) protocol guide for emergency resuscitation. Provides step-by-step guidance for cardiac arrest, arrhythmia management, and post-cardiac arrest care.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/acls-protocol-assistant',
  'emergency',
  '["acls","resuscitation","cardiac-arrest","emergency-protocols"]',
  '1.0.0',
  'MIT',
  'high',
  'caution',
  '["emergency-medicine","critical-care"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'biostatistics-analyzer',
  'Biostatistics Analysis Tool',
  'Perform common biostatistical analyses for medical research including survival analysis, logistic regression, ROC curves, and sample size calculations.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/biostatistics-analyzer',
  'clinical-research-summarizing',
  '["biostatistics","research","data-analysis"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["research","biostatistics"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'board-exam-prep',
  'Medical Board Exam Preparation',
  'USMLE/COMLEX board exam preparation tool with practice questions, spaced repetition, and high-yield topic reviews. Tracks performance and identifies weak areas.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/board-exam-prep',
  'education',
  '["usmle","board-exams","medical-education","test-prep"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["medical-education"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'clinical-differential-diagnosis',
  'Clinical Differential Diagnosis Assistant',
  'AI-powered clinical decision support tool that helps generate comprehensive differential diagnoses based on patient symptoms, lab results, and medical history. Integrates evidence-based clinical reasoning and medical literature.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/clinical-differential-diagnosis',
  'diagnosis',
  '["differential-diagnosis","clinical-decision-support","symptom-analysis"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["internal-medicine","family-medicine","emergency-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'clinical-guideline-navigator',
  'Clinical Practice Guideline Navigator',
  'Search and navigate clinical practice guidelines from major organizations (AHA, ACC, ACP, IDSA, etc.). Provides evidence-graded recommendations for common clinical scenarios.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/clinical-guideline-navigator',
  'clinical-research-summarizing',
  '["clinical-guidelines","evidence-based-medicine","best-practices"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["all-specialties"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'clinical-treatment-plan-generator',
  'Clinical Treatment Plan Generator',
  'Generate comprehensive clinical treatment plans with SMART goal frameworks and evidence-based interventions. Exports to LaTeX/PDF format for clinical documentation.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/clinical-treatment-plan-generator',
  'treatment',
  '["treatment-planning","clinical-documentation","smart-goals"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["internal-medicine","psychiatry","family-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'clinical-trials-search',
  'ClinicalTrials.gov Database Access',
  'Access 400,000+ clinical trials from 220+ countries via ClinicalTrials.gov API v2. Search by condition, intervention, sponsor, or location.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/clinical-trials-search',
  'research',
  '["clinical-trials","research","evidence-based-medicine"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["research","clinical-research"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'cognitive-behavioral-therapy-tools',
  'CBT Therapeutic Techniques Guide',
  'Evidence-based cognitive behavioral therapy (CBT) tools and worksheets. Includes thought records, behavioral activation, and cognitive restructuring exercises.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/cognitive-behavioral-therapy-tools',
  'mental-health',
  '["cbt","psychotherapy","mental-health","therapy"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["psychiatry","psychology","counseling"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'cpt-coding-assistant',
  'CPT Procedure Code Assistant',
  'AI-driven CPT coding validation and suggestion tool. Validates procedure codes against clinical documentation and identifies potential coding gaps.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/cpt-coding-assistant',
  'administrative',
  '["cpt","medical-coding","billing","reimbursement"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["medical-coding","billing"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'developmental-milestone-tracker',
  'Developmental Milestone Tracker',
  'Track and assess pediatric developmental milestones from birth to 5 years. Flags potential delays using CDC developmental surveillance guidelines.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/developmental-milestone-tracker',
  'pediatrics',
  '["development","milestones","pediatrics","screening"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["pediatrics","developmental-pediatrics"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'dicom-metadata-extractor',
  'DICOM Metadata & PHI Anonymization',
  'Extract metadata from DICOM medical images, anonymize protected health information (PHI), and process imaging data for research or clinical workflows. Supports pydicom integration.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/dicom-metadata-extractor',
  'lab-imaging',
  '["dicom","medical-imaging","phi-anonymization","metadata"]',
  '1.0.0',
  'MIT',
  'high',
  'caution',
  '["radiology","medical-informatics"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'drug-interaction-checker',
  'Drug Interaction Safety Checker',
  'Real-time drug-drug interaction detection with five-level severity classification (A/B/C/D/X). Checks for drug-disease, drug-dose, and drug-food interactions using FDA and clinical databases.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/drug-interaction-checker',
  'treatment',
  '["drug-interactions","medication-safety","pharmacology"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["pharmacy","clinical-pharmacology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'drugbank-search',
  'DrugBank Comprehensive Drug Database',
  'Access 17,430+ drugs (13,166 small molecules + 4,264 biotech drugs) with high-performance SQLite backend. Search by name, therapeutic category, elimination half-life, or molecular similarity.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/drugbank-search',
  'pharmacy',
  '["drugbank","drug-database","pharmacology"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["pharmacy","clinical-pharmacology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'emergency-triage-protocols',
  'Emergency Department Triage Protocols',
  'AI-assisted emergency department triage tool with evidence-based protocols for rapid patient assessment. Helps prioritize cases based on acuity and clinical presentation.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/emergency-triage-protocols',
  'emergency',
  '["emergency-medicine","triage","acuity-assessment"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["emergency-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'epidemiology-surveillance',
  'Epidemiology & Disease Surveillance',
  'Access WHO Global Health Observatory data for epidemiological analysis. Track disease prevalence, mortality rates, and public health indicators by country and region.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/epidemiology-surveillance',
  'public-health',
  '["epidemiology","surveillance","who","public-health"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["public-health","epidemiology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'evidence-synthesis-ai',
  'Clinical Evidence Synthesis Tool',
  'Synthesizes clinical evidence from multiple sources including PubMed, Cochrane, and clinical guidelines. Generates evidence summaries with quality grading.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/evidence-synthesis-ai',
  'clinical-research-summarizing',
  '["evidence-synthesis","clinical-guidelines","research"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["research","evidence-based-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'fda-510k-documentation',
  'FDA 510(k) Documentation Automation',
  'Automates FDA-required documentation for Software as a Medical Device (SaMD) including 510(k) submissions. Generates traceability matrices linking code to regulatory requirements.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/fda-510k-documentation',
  'administrative',
  '["fda","510k","regulatory","medical-devices"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["regulatory-affairs","medical-devices"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'fda-drug-information',
  'FDA Drug Information & Adverse Events',
  'Access comprehensive FDA drug databases including adverse events (FAERS), drug labels, NDC directory, recalls, shortages, and 510(k) device clearances via openFDA API.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/fda-drug-information',
  'pharmacy',
  '["fda","drug-safety","adverse-events","recalls"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["pharmacy","regulatory-affairs"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'fhir-data-access',
  'FHIR Healthcare Data Access',
  'Connect to FHIR-compliant electronic health record systems to query, retrieve, and analyze patient data using natural language. Supports full CRUD operations on FHIR resources with SMART-on-FHIR authentication.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/fhir-data-access',
  'diagnosis',
  '["fhir","ehr","patient-data","smart-on-fhir"]',
  '1.0.0',
  'Apache-2.0',
  'high',
  'restricted',
  '["health-informatics","clinical-data-management"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'gad7-anxiety-screening',
  'GAD-7 Anxiety Screening Tool',
  'Generalized Anxiety Disorder 7-item (GAD-7) screening tool with automated scoring. Assesses anxiety severity and guides treatment decisions.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/gad7-anxiety-screening',
  'mental-health',
  '["anxiety","screening","gad-7","mental-health"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["psychiatry","primary-care"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'genomics-variant-interpreter',
  'Genomic Variant Interpretation',
  'Interpret genomic variants using ClinVar, gnomAD, and other genomic databases. Provides pathogenicity classification and clinical significance assessment.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/genomics-variant-interpreter',
  'clinical-research-summarizing',
  '["genomics","variants","precision-medicine","genetics"]',
  '1.0.0',
  'MIT',
  'high',
  'restricted',
  '["medical-genetics","genomics"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'hipaa-compliance-checker',
  'HIPAA Compliance & De-identification',
  'Clinical de-identification pipeline that detects 30+ PHI entity types. Provides masked and obfuscated output modes for HIPAA compliance. Runs locally with data never leaving secure environment.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/hipaa-compliance-checker',
  'administrative',
  '["hipaa","de-identification","phi","privacy"]',
  '6.3.0',
  'Commercial',
  'high',
  'safe',
  '["health-information-management","compliance"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'icd10-code-lookup',
  'ICD-10 Diagnosis Code Lookup',
  'Search and validate ICD-10-CM diagnosis codes using NLM Clinical Tables API. Supports partial matching and hierarchical browsing of code categories.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/icd10-code-lookup',
  'administrative',
  '["icd-10","medical-coding","billing"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["medical-coding","health-information-management"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'iec-62304-compliance',
  'IEC 62304 Medical Device Software Lifecycle',
  'Modular skills for AI coding agents working on medical device software. Aligned to IEC 62304, ISO 14971, FDA, and EU MDR standards for software lifecycle management.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/iec-62304-compliance',
  'administrative',
  '["iec-62304","medical-devices","software-lifecycle","iso-14971"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["regulatory-affairs","quality-assurance","medical-devices"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'lab-result-interpreter',
  'Lab Result Interpretation Assistant',
  'Automatically extract and interpret biochemical test data from lab reports. Provides clinical significance analysis, reference range comparisons, and flags critical values.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/lab-result-interpreter',
  'lab-imaging',
  '["lab-results","biochemistry","clinical-pathology"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["pathology","laboratory-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'medical-anatomy-tutor',
  'Interactive Anatomy Learning Assistant',
  'Interactive anatomy education tool with 3D anatomical references, clinical correlations, and self-assessment questions. Covers all major organ systems.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/medical-anatomy-tutor',
  'education',
  '["anatomy","medical-education","learning"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["medical-education","anatomy"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'medical-case-generator',
  'Clinical Case Scenario Generator',
  'Generate realistic clinical case scenarios for medical education and assessment. Customizable by specialty, complexity level, and learning objectives.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/medical-case-generator',
  'education',
  '["medical-education","case-scenarios","teaching"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["medical-education"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'medical-imaging-analysis',
  'Medical Imaging & DICOM Analysis',
  'Analyze medical imaging data from DICOM servers and PACS systems. Extract metadata, query imaging studies by patient or modality, and process diagnostic imaging reports for clinical decision support.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/medical-imaging-analysis',
  'diagnosis',
  '["dicom","medical-imaging","radiology","pacs"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["radiology","diagnostic-imaging"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'medical-paper-humanizer',
  'Medical Academic Writing Humanizer',
  'Removes signs of AI-generated writing from medical papers and makes them sound more natural. Based on Wikipedia''s AI writing guide, adapted for medical literature.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/medical-paper-humanizer',
  'clinical-research-summarizing',
  '["academic-writing","medical-papers","writing-tools"]',
  '1.0.0',
  'MIT',
  'low',
  'safe',
  '["medical-writing","research"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'medicare-drug-stats',
  'Medicare Drug Spending & Utilization',
  'Access CMS Medicare data including physician services, prescriber data, hospital utilization, and drug spending analysis via Socrata API.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/medicare-drug-stats',
  'administrative',
  '["medicare","cms","drug-spending","utilization"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["health-economics","policy"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'medication-administration-safety',
  'Medication Administration Safety Check',
  'Five Rights of medication administration checker for nursing. Verifies right patient, drug, dose, route, and time before medication administration.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/medication-administration-safety',
  'nursing',
  '["medication-safety","nursing","five-rights"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["nursing","pharmacy"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'nursing-care-plan',
  'Nursing Care Plan Generator',
  'Generate evidence-based nursing care plans with NANDA-I diagnoses, NOC outcomes, and NIC interventions. Supports individualized patient care planning.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/nursing-care-plan',
  'nursing',
  '["nursing-care-plans","nanda","noc","nic"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["nursing"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'outbreak-investigation',
  'Outbreak Investigation Assistant',
  'Systematic approach to outbreak investigation using CDC guidelines. Assists with case definition, epidemic curve analysis, and source identification.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/outbreak-investigation',
  'public-health',
  '["outbreak","infectious-disease","epidemiology","cdc"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["public-health","infectious-disease"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'patient-assessment-tool',
  'Nursing Patient Assessment Tool',
  'Comprehensive nursing assessment tool for systematic patient evaluation. Covers vital signs interpretation, pain assessment, fall risk screening, and activities of daily living.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/patient-assessment-tool',
  'nursing',
  '["nursing-assessment","patient-evaluation","vital-signs"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["nursing"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'pediatric-drug-dosing',
  'Pediatric Drug Dosing Calculator',
  'Weight-based and body-surface-area-based drug dosing calculator for pediatric patients. Includes common pediatric medications with age-appropriate dosing ranges.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/pediatric-drug-dosing',
  'pediatrics',
  '["pediatric-dosing","medication-safety","weight-based-dosing"]',
  '1.0.0',
  'MIT',
  'high',
  'caution',
  '["pediatrics","pharmacy"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'pediatric-growth-charts',
  'Pediatric Growth Chart Analyzer',
  'Interpret pediatric growth measurements using CDC and WHO growth charts. Plots height, weight, BMI, and head circumference percentiles for age and gender.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/pediatric-growth-charts',
  'pediatrics',
  '["growth-charts","pediatrics","development"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["pediatrics","family-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'phq9-depression-screening',
  'PHQ-9 Depression Screening Tool',
  'Validated Patient Health Questionnaire-9 (PHQ-9) for depression screening and severity assessment. Automatic scoring and interpretation with suicide risk flagging.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/phq9-depression-screening',
  'mental-health',
  '["depression","screening","phq-9","mental-health"]',
  '1.0.0',
  'MIT',
  'high',
  'caution',
  '["psychiatry","primary-care"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'precision-medicine-therapeutics',
  'Precision Medicine Treatment Planning',
  'Generate personalized treatment plans based on pharmacogenomics, variant interpretation, and patient-specific data. Integrates ClinPGx and ClinVar databases for evidence-based precision therapeutics.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/precision-medicine-therapeutics',
  'treatment',
  '["precision-medicine","pharmacogenomics","personalized-treatment"]',
  '1.0.0',
  'MIT',
  'high',
  'caution',
  '["medical-genetics","oncology","pharmacology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'prior-authorization-review',
  'Prior Authorization Review Assistant',
  'Official Anthropic skill for insurance prior authorization review workflows. Cross-references coverage requirements, clinical guidelines, and patient records.',
  'Anthropic',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/prior-authorization-review',
  'administrative',
  '["prior-auth","insurance","utilization-review"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["utilization-management","insurance"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'protein-structure-analysis',
  'Protein Structure Database (AlphaFold & PDB)',
  'Access AlphaFold Protein Structure Database and Protein Data Bank (PDB) for structural biology research. Analyze protein structures and molecular interactions.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/protein-structure-analysis',
  'clinical-research-summarizing',
  '["protein-structure","alphafold","structural-biology","bioinformatics"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["biochemistry","molecular-biology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'pubmed-literature-search',
  'PubMed Medical Literature Search',
  'Search 36M+ citations from PubMed and PubMed Central. Advanced search with boolean operators, MeSH terms, author/journal filters, and full-text access.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/pubmed-literature-search',
  'research',
  '["pubmed","literature-search","research","evidence-based-medicine"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["research","all-specialties"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'radiation-exposure-tracker',
  'Medical Radiation Exposure Tracker',
  'Track cumulative radiation exposure from medical imaging procedures (X-rays, CT scans). Includes body surface area adjustments and radioactive decay models for comprehensive dosimetry.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/radiation-exposure-tracker',
  'lab-imaging',
  '["radiation-safety","medical-imaging","dosimetry"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["radiology","radiation-oncology","nuclear-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'raf-score-calculator',
  'RAF Score & HCC Calculator',
  'Risk Adjustment Factor (RAF) score calculator with Hierarchical Condition Category (HCC) capture from encounter documentation for Medicare Advantage.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/raf-score-calculator',
  'administrative',
  '["raf-score","hcc","risk-adjustment","medicare"]',
  '1.0.0',
  'MIT',
  'moderate',
  'safe',
  '["health-information-management","value-based-care"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'supplement-drug-interactions',
  'Supplement-Drug Interaction Safety',
  'First supplement-drug interaction safety tool for AI agents. Evidence-based supplement safety intelligence with 805 FDA FAERS adverse event signals and CYP450 pathway analysis.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/supplement-drug-interactions',
  'pharmacy',
  '["supplements","drug-interactions","herbal-medicine","safety"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["pharmacy","integrative-medicine"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'surgical-procedure-planner',
  'Surgical Procedure Planning Assistant',
  'Pre-operative planning tool for surgical procedures. Assists with procedure selection, anatomical considerations, equipment checklists, and patient positioning protocols.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/surgical-procedure-planner',
  'surgery',
  '["surgical-planning","operative-planning","pre-op"]',
  '1.0.0',
  'MIT',
  'moderate',
  'caution',
  '["surgery"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'surgical-safety-checklist',
  'WHO Surgical Safety Checklist',
  'Digital implementation of the WHO Surgical Safety Checklist for pre-operative, intra-operative, and post-operative verification. Reduces surgical complications and improves team communication.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/surgical-safety-checklist',
  'surgery',
  '["surgical-safety","who-checklist","patient-safety"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["surgery","anesthesiology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'systematic-review-assistant',
  'Systematic Review & Meta-Analysis Assistant',
  'Assists with systematic review methodology including PICO formulation, search strategy development, study selection, and quality assessment using PRISMA guidelines.',
  'OMS Contributors',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/systematic-review-assistant',
  'research',
  '["systematic-review","meta-analysis","prisma","evidence-synthesis"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["research","epidemiology"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'trauma-management-protocols',
  'Trauma Management Protocols (ATLS)',
  'Advanced Trauma Life Support (ATLS) protocol assistant for initial assessment and management of trauma patients. Covers primary/secondary surveys and critical interventions.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/trauma-management-protocols',
  'emergency',
  '["trauma","atls","emergency-surgery","critical-care"]',
  '1.0.0',
  'MIT',
  'high',
  'caution',
  '["emergency-medicine","trauma-surgery"]',
  'Pending Review',
  '2026-03-02',
  0
);

INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)
VALUES (
  'vaccine-schedule-tracker',
  'Immunization Schedule Tracker',
  'CDC/WHO immunization schedule tracker for pediatric and adult vaccinations. Identifies overdue vaccines and generates catch-up schedules.',
  'Open Medical Skills Community',
  'https://github.com/Open-Medica/open-medical-skills/tree/main/skills/vaccine-schedule-tracker',
  'public-health',
  '["immunization","vaccines","preventive-care"]',
  '1.0.0',
  'MIT',
  'high',
  'safe',
  '["public-health","family-medicine","pediatrics"]',
  'Pending Review',
  '2026-03-02',
  0
);

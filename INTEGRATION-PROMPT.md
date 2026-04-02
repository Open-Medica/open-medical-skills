# TU Skills → OMS Integration

> Paste this as your first message in a Claude Code session opened in the OMS project directory.
> Path: `/home/jfmd/.jfmd/projects/INTELMEDICA-COMP/open-medical-skills/`

---

## Task

Integrate all 57 ToolUniverse (TU) specialized biomedical skills into the Open Medical Skills (OMS) website as browsable content entries. This adds TU's research tools to our catalog alongside the existing 49 skills, with proper categorization, evidence levels, and install instructions.

## Architecture Context

ToolUniverse (Harvard MIMS Lab) provides 1,995 API tools across 438 categories, wrapped by 57 routing skills. Each skill orchestrates calls across multiple APIs (e.g., `tooluniverse-drug-research` hits FDA + ChEMBL + PubChem + PharmGKB). The TU MCP is already globally available via `~/.mcp.json`.

Data is already indexed in Supabase (`tooluniverse` schema), Qdrant (`tu_tools_nomic`, `tu_tools_mxbai`), and SurrealDB (`intelmedica.tooluniverse`).

## Agent Definitions

Use the agents defined in `AGENTS/claude/`:

| Agent | File | Purpose |
|---|---|---|
| Skill Ingestion | `skill-ingestion-agent.md` | Read TU SKILL.md files, generate OMS YAML + SKILL.md |
| Clinical Categorization | `clinical-categorization-agent.md` | Classify each skill (category, evidence, safety, specialty) |
| Content Validator | `content-validator-agent.md` | Validate YAML against Zod schema, check duplicates |
| Public Repo Sync | `public-repo-sync-agent.md` | Sync content to public `open-medical-skills` repo |
| TU API Research | `tu-api-research-agent.md` | Check API key availability for each skill's tools |

## Execution Plan

### Phase 1: Ingest (parallel agents)

Spawn 3 background agents:

**Agent A — Read & Classify (batches 1-20):**
```
Read SKILL.md files from data/tools_universe/skills/tooluniverse-*/SKILL.md (first 20).
For each skill:
1. Extract name, description, tools used, evidence sources
2. Apply clinical-categorization-agent.md rules to determine category, evidence_level, safety_classification, specialty tags
3. Generate YAML file in content/skills/<name>.yaml following src/content.config.ts schema
4. Generate skills/<name>/SKILL.md with description, tools wrapped, usage examples
Use author "ToolUniverse (Harvard MIMS Lab)", repository "https://github.com/mims-harvard/ToolUniverse", verified: false, status: published.
Check content/skills/ for name collisions with existing 49 skills — add -tu suffix if needed.
```

**Agent B — Read & Classify (batches 21-40):**
Same instructions, skills 21-40.

**Agent C — Read & Classify (batches 41-57):**
Same instructions, skills 41-57.

### Phase 2: Validate

After Phase 1 agents complete:

**Agent D — Validate all new content:**
```
Follow content-validator-agent.md:
1. Run pnpm build to trigger Zod validation
2. Fix any schema errors in the generated YAML files
3. Check for duplicate names against existing 49 skills
4. Verify all SKILL.md files exist for new entries
5. Report any issues
```

### Phase 3: Build & Test

```
1. Run pnpm build — confirm zero errors
2. Run pnpm dev — check the website renders new skills
3. Verify category filters show the new TU skills
4. Verify search (Pagefind) indexes the new skills
5. Spot-check 5 skill detail pages for correct metadata
```

### Phase 4: Sync to Public Repo

**Agent E — Sync open-source content:**
```
Follow public-repo-sync-agent.md:
1. Sync new content/skills/*.yaml files to public repo
2. Sync new skills/*/SKILL.md files to public repo
3. Never sync src/, workers/, AGENTS/, CLAUDE.md, CLAUDE.local.md, data/
4. Create commit with descriptive message
5. Wait for user approval before pushing
```

## Category Mapping Reference

| TU Skill Domain | OMS Category |
|---|---|
| Drug research, DDI, pharmacovigilance, adverse events | `pharmacy` |
| Disease research, rare disease, clinical guidelines | `diagnosis` |
| Treatment, precision medicine, drug repurposing | `treatment` |
| Genomics, variants, expression, protein structure | `lab-imaging` |
| Literature review, evidence synthesis | `research` |
| Clinical trials, statistical modeling | `research` |
| Meta-research, systematic reviews | `clinical-research-summarizing` |
| Infectious disease, phylogenetics, epidemiology | `public-health` |
| Antibody engineering, protein therapeutics, CRISPR | `research` |
| Single-cell, spatial omics, multi-omics | `research` |

## Metadata Defaults for TU Skills

```yaml
author: "ToolUniverse (Harvard MIMS Lab)"
repository: "https://github.com/mims-harvard/ToolUniverse"
safety_classification: "caution"
verified: false
reviewer: "Pending Review"
status: "published"
install:
  git: "https://github.com/mims-harvard/ToolUniverse"
```

## Key Files

| File | Read For |
|---|---|
| `src/content.config.ts` | Zod schema (required fields, valid enums) |
| `content/skills/*.yaml` | Existing 49 skills (avoid duplicates) |
| `data/tools_universe/skills/tooluniverse-*/SKILL.md` | Source material (57 skills to ingest) |
| `data/tools_universe/CLAUDE.md` | Full TU documentation |
| `AGENTS/claude/*.md` | Agent definitions |

## Success Criteria

- [ ] 57 new YAML files in `content/skills/` (or fewer if some are duplicates)
- [ ] 57 new SKILL.md entries in `skills/*/`
- [ ] `pnpm build` passes with zero errors
- [ ] Website shows 106+ skills (49 existing + 57 new)
- [ ] Category filters include new skills
- [ ] Public repo has new content committed (not pushed yet)

## Clinical Priority

Focus on getting these skills right first (user's clinical focus):
1. `tooluniverse-clinical-guidelines` — ADA, AHA, NICE, WHO, NCCN, CPIC
2. `tooluniverse-drug-drug-interaction` — CYP450, transporter mechanisms
3. `tooluniverse-disease-research` — 10-dimension disease profiling
4. `tooluniverse-infectious-disease` — pathogen characterization
5. `tooluniverse-literature-deep-research` — systematic reviews
6. `tooluniverse-pharmacovigilance` — FAERS safety signals
7. `tooluniverse-clinical-trial-design` — feasibility assessment
8. `tooluniverse-adverse-event-detection` — signal detection
9. `tooluniverse-precision-medicine-stratification` — patient stratification
10. `tooluniverse-variant-interpretation` — VUS pathogenicity scoring

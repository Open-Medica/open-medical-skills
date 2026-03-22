---
phase: 1
slug: public-repository-creation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Shell commands (`gh api`, `git`) — no test framework needed |
| **Config file** | None — infrastructure phase, not code |
| **Quick run command** | `gh api repos/Open-Medica/open-medical-skills --jq '.visibility'` |
| **Full suite command** | Run all 7 smoke tests below |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run relevant verification command after each push
- **After every plan wave:** Run all 7 verification commands
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | REPO-01 | smoke | `gh api repos/Open-Medica/open-medical-skills --jq '{v:.visibility,l:.license.spdx_id}'` | N/A (CLI) | ⬜ pending |
| 01-01-02 | 01 | 1 | REPO-02 | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/content/skills --jq '. \| length'` (expect 49) | N/A (CLI) | ⬜ pending |
| 01-01-03 | 01 | 1 | REPO-02 | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/cli --jq '. \| length'` (expect >0) | N/A (CLI) | ⬜ pending |
| 01-01-04 | 01 | 1 | REPO-02 | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/logo --jq '. \| length'` (expect 2) | N/A (CLI) | ⬜ pending |
| 01-01-05 | 01 | 1 | REPO-02 | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/scripts --jq '. \| length'` (expect >=2) | N/A (CLI) | ⬜ pending |
| 01-01-06 | 01 | 1 | REPO-02 | smoke | `gh api repos/Open-Medica/open-medical-skills/contents/docs --jq '. \| length'` (expect 3) | N/A (CLI) | ⬜ pending |
| 01-01-07 | 01 | 1 | REPO-04 | smoke | `gh api repos/Open-Medica/open-medical-skills/branches/dev --jq '.name'` (expect "dev") | N/A (CLI) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — all verification uses `gh api` CLI commands against the live GitHub API.

---

## Manual-Only Verifications

All phase behaviors have automated verification via `gh api` smoke tests.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-22

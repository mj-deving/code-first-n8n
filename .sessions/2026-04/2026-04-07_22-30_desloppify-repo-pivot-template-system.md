# Session: Desloppify Adoption, Repo Pivot, Template System, CLI-First Tools

**Date:** 2026-04-07 (started ~2026-03-24, continued across multiple days)
**Duration:** ~16 hours across multiple sub-sessions
**Mode:** full
**Working Directory:** ~/projects/code-mode

## Summary

Explored and adopted desloppify as PAI quality harness (90.9/100 trial). Pivoted code-mode repo from research workspace to "Code-First n8n Proving Ground." Built hybrid workflow template system. Fixed POC-05 E2E sibling tool serialization bug. Added CLI mode to code-mode-tools (ADR-0001). Built n8nac-tools from scratch. Renamed code-mode-mcp-server → code-mode-tools. Ran multi-repo Codex reviews and fixed all findings across 4 repos.

## Work Done

### Desloppify (2026-03-24)
- Researched megaplan + desloppify (Peter O'Malley's agent harness tools)
- Installed desloppify 0.9.14 via pipx, ran full scan + 20-dimension subjective review on code-mode-mcp-server
- Results: 90.9/100 strict, 97.2/100 mechanical. Test strategy (52%) was main gap.
- Adopted into PAI: skill at ~/.claude/skills/Desloppify/, .desloppify/ in global gitignore
- Created adoption plan with visual diagram
- Documented in PAI-Exploration/References/desloppify-integration/

### Repo Pivot (2026-04-07)
- Restructured code-mode as "Code-First n8n Proving Ground"
- Created THESIS.md (lifecycle table + value prop as front door)
- Created playbook/ (lifecycle.md, benchmarks.md, architecture.md — portable knowledge)
- Moved research artifacts to archive/ (7 markdown files + sessions + plans)
- Renamed pocs/ → workflows/
- Formalized 5 workflows (01-customer-onboarding, 02-mcp-filesystem, 03-multi-agent-dispatch, 04-dev-loop, 05-e2e-sibling-tools)
- Created README.md for GitHub front page

### POC-05 E2E Fix
- Swapped WF11 from Gemini to Claude via OpenRouter
- Discovered serialization bug: tool.invoke(object) → n8n toolCode does JSON.parse(query) on object → [object Object]
- Fixed: JSON round-trip args + improved tool description + Calculator Tool handles both string/object input
- Result: 8/8 criteria pass, full E2E verified (100+200=300, multi-step 17+25=42→42*3=126)

### Template System
- Built hybrid workflow template (develop in monorepo → graduate to standalone repo)
- Created template/ with README, workflow.ts skeleton, workflow.json, test.json, issue templates
- Created scripts/new-workflow.sh scaffold script
- Created TEMPLATE.md documenting the hybrid approach
- Merged AGENTS.md into CLAUDE.md (Claude doesn't auto-read AGENTS.md)

### CLI-First Tools (ADR-0001)
- Wrote ADR-0001: CLI-First Over MCP-Only (accepted)
- Added CLI mode to code-mode-tools (exec, list-tools subcommands, TTY detection)
- Built n8nac-tools from scratch (6 commands: list, push, pull, verify, search, api)
- Both tools: same binary, CLI mode on TTY, MCP mode on pipe
- Renamed code-mode-mcp-server → code-mode-tools (npm + GitHub)

### Codex Reviews + Fixes
- Round 1: 4-repo review → 19 findings → all 19 fixed by parallel agents
- Round 2: 2-repo review → 7 findings → all 7 fixed by Codex --auto
- Round 3: n8nac-tools audit → 6 publish blockers → all 6 fixed
- Total: 32 findings found and fixed

### npm Publishing
- Published code-mode-tools@0.2.0 (renamed from code-mode-mcp-server)
- Deprecated code-mode-mcp-server on npm
- Published n8nac-tools@1.0.0
- Cleaned expired npm token

## Decisions Made

| Decision | Rationale |
|---|---|
| Desloppify: on-demand, not auto-gating | Speed over forced quality gates |
| Desloppify: complementary to /simplify | Microscope (diffs) vs thermometer (codebase) |
| Repo pivot: proving ground + POC factory | Research phase complete, distribution phase begins |
| Hybrid template: monorepo → graduate | Develop together, distribute separately |
| AGENTS.md merged into CLAUDE.md | Claude doesn't auto-read AGENTS.md |
| ADR-0001: CLI-first over MCP-only | Token-efficient, universally accessible, testable |
| Auto-discover config from ~/.config/ only | CWD discovery is unsafe for global binaries |

## Key Files Modified/Created

| File | Change |
|---|---|
| ~/projects/code-mode/THESIS.md | Created — lifecycle thesis front door |
| ~/projects/code-mode/TEMPLATE.md | Created — hybrid template approach |
| ~/projects/code-mode/README.md | Created — GitHub front page |
| ~/projects/code-mode/playbook/*.md | Created — 3 portable knowledge docs |
| ~/projects/code-mode/workflows/* | Renamed from pocs/, 5 workflows formalized |
| ~/projects/code-mode/template/ | Created — scaffold template |
| ~/projects/code-mode/scripts/ | Created — new-workflow.sh + check-secrets.sh |
| ~/projects/code-mode/docs/decisions/ADR-0001 | Created — CLI-first decision |
| ~/projects/n8nac-tools/ | Created — entire new repo |
| ~/projects/code-mode-mcp-server/ | Renamed to code-mode-tools, CLI mode added |
| ~/projects/n8n-nodes-utcp-codemode/ | Sibling adapter fix + Codex findings |

## Test Counts

| Repo | Tests | Change |
|---|---|---|
| code-mode-tools | 44 | Was 22, +22 |
| n8nac-tools | 50 | New repo |
| n8n-nodes-utcp-codemode | 78 | Was 70, +8 |
| **Total** | **222** | |

## Open Items

- [ ] Distribution posts (dev.to / Reddit / LinkedIn) — playbook/ is source material
- [ ] Build n8nac MCP server for workflow 04 (dev loop capstone)
- [ ] Token Savings Calculator landing page
- [ ] Export workflows as .workflow.ts (needs n8n + n8nac running)

## Context for Next Session

Five npm packages published and current. Four repos clean with 222 tests. Proving ground has 5 workflows, template system, and ADR-0001. Distribution is the main gap — everything is built but not yet promoted. Workflow 04 (dev loop) is the capstone that needs an n8nac-mcp-server to implement.

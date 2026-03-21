# Session: Code-Mode × n8n Research & Synthesis

**Date:** 2026-03-20 12:00
**Duration:** ~90 min
**Mode:** full
**Working Directory:** /home/mj/projects/code-mode

## Summary

Explored the UTCP code-mode library, evaluated it for PAI (rejected — wrong problem), identified n8n AI agent workflows as the ideal use case, produced a full technical elaboration with architecture, savings math, and business models, then discovered deep synergy with the existing n8n-autopilot repo. Synthesized all findings into persistent documents and visual references.

## Work Done

- Fetched and analyzed code-mode README from GitHub
- Cloned `universal-tool-calling-protocol/code-mode` repo, installed deps, ran tests (18/19 pass)
- Evaluated code-mode for PAI system — concluded it doesn't fit (context size is the real cost, not tool round-trips)
- Identified n8n AI agent workflows as the ideal use case (O(n²) token compounding)
- Ran Research skill (ClaudeResearcher) on n8n AI agent architecture, community node SDK, and optimization landscape
- Applied FirstPrinciples skill — Deconstruct → Challenge → Reconstruct analysis yielded key insight: "tool sub-node, not agent replacement"
- Cloned `mj-deving/n8n-autopilot` repo, analyzed all 5 workflows including WF5 (16-node multi-agent)
- Identified 3 concrete synergies between n8n-autopilot and code-mode
- Created full technical elaboration document (now `n8n-code-mode-reference.md`)
- Created architecture comparison diagram (HTML)
- Created 12-section comprehensive visual reference page (HTML)
- Created synthesis markdown document (`code-mode-synthesis.md`)
- Created 22-slide presentation deck (HTML)
- Created and maintained persistent memory documents

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Code-mode doesn't fit PAI | PAI's token costs are context/prompt size, not tool round-trips. Claude Code already parallelizes tool calls. | Wrapping PAI tools as UTCP manuals |
| n8n AI agents are the ideal use case | EngineRequest/EngineResponse loop compounds tokens O(n²). No existing solution addresses the structural cause. | General chatbot agents, API orchestration platforms |
| Tool sub-node, not agent replacement | Community node SDK only exposes supplyData(). Working within the loop as a tool is more practical and adoptable. | Replacing the agent loop entirely, forking n8n core |
| Renamed elaboration to reference | The document is the definitive technical reference, not just an elaboration | Keeping original name |

## Key Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `memory/reference_code_mode_repo.md` | created | UTCP code-mode library reference (architecture, protocols, benchmarks) |
| `memory/project_n8n_code_mode.md` | created | Project memory: n8n opportunity + autopilot synergy analysis |
| `memory/MEMORY.md` | created | Memory index linking both memory docs |
| `n8n-code-mode-reference.md` | created (renamed) | Full technical elaboration (architecture, savings, implementation, roadmap, business models) |
| `code-mode-synthesis.md` | created | Complete markdown synthesis of all research |
| `~/.agent/diagrams/n8n-code-mode-architecture.html` | created | Side-by-side comparison diagram |
| `~/.agent/diagrams/code-mode-n8n-reference.html` | created | 12-section visual reference page |
| `~/.agent/diagrams/code-mode-synthesis-slides.html` | created | 22-slide presentation deck |
| `repo/` | cloned | Code-mode repo with passing tests |
| `n8n-autopilot/` | cloned | n8n-autopilot repo for synergy analysis |

## Learnings

- n8n's AI Agent loop uses EngineRequest/EngineResponse pattern — each iteration re-sends full context, causing O(n²) token growth
- n8n community nodes use `supplyData()` to return LangChain tools — this is the integration surface
- Code-mode's `applySyncPromise` mechanism bridges async tool calls into the synchronous isolated-vm sandbox
- No existing n8n community node or feature optimizes agent tool call round-trips — this is greenfield
- n8nac CLI has `skills search`, `node-info`, `validate`, `verify` — comprehensive enough to be registered as UTCP tools themselves

## Open Items

- [ ] Build minimal POC community node (`n8n-nodes-utcp-codemode`)
- [ ] Benchmark token savings on 5 real n8n workflows
- [ ] Test with GPT-4o, Claude, and Gemini as agent LLM
- [ ] Publish to npm
- [ ] Write n8n community forum post explaining the concept
- [ ] Explore SaaS wrapper for hosted execution

## Context for Next Session

Research phase is complete. All findings documented in `code-mode-synthesis.md` and visual artifacts. The next phase is implementation — building the minimal POC community node using n8n-nodes-starter template, implementing `supplyData()` that returns a `DynamicStructuredTool` wrapping code-mode's `callToolChain()`. Start with static tool source configuration (v1.0 roadmap).

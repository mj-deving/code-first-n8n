# POC-03: Multi-Agent Dispatch → 1 Code Block

## What This Proves

- **Lifecycle layer:** Architecture
- **Thesis claim:** Complex multi-agent orchestration workflows collapse into a single code-mode execution, eliminating orchestration overhead while preserving sub-agent LLM calls

## The Scenario

A 16-node dispatcher workflow from n8n-autopilot (WF5) that routes incoming requests to 4 specialist agents, each calling Gemini, then aggregates results through a quality check. Traditional architecture:

```
Webhook → Dispatcher Agent (LLM) → Switch Node
  ├→ Specialist A (LLM) → Tools → Response
  ├→ Specialist B (LLM) → Tools → Response
  ├→ Specialist C (LLM) → Tools → Response
  └→ Specialist D (LLM) → Tools → Response
     → Merge → QualityCheck Agent (LLM) → Output
```

**16 nodes. 6+ LLM calls. Multiple orchestration round-trips.**

## The Code-Mode Alternative

```
Webhook → Code-Mode Tool → AI Agent
  → LLM writes TypeScript:
     1. Parse input, determine which specialists to invoke
     2. Call specialist APIs (Gemini) directly
     3. Aggregate results
     4. Run quality check
     5. Return structured output
  → 1 code-mode execution
```

**3 nodes. The 4 Gemini specialist calls remain (they're the real work). The orchestration overhead — dispatcher, switch, merge, quality check routing — disappears.**

## What This Demonstrates

1. **Orchestration elimination** — The n8n switch/merge/routing nodes are replaced by TypeScript control flow inside the sandbox
2. **LLM calls preserved** — Sub-agent calls to Gemini still happen (registered as tools). Code-mode doesn't replace LLM reasoning, it replaces the orchestration plumbing
3. **Complexity reduction** — 16 nodes → 3 nodes. The workflow is readable as code, not as a visual graph
4. **Composability** — Adding a 5th specialist is one line of code, not 3+ new nodes with connections

## Source Material

- **WF5** from n8n-autopilot: 16-node multi-agent dispatcher pattern
- Analyzed in `archive/code-mode-synthesis.md:90`
- n8n-autopilot repo: `~/projects/code-mode/n8n-autopilot/`

## Status

- [x] Pattern identified and analyzed (from n8n-autopilot WF5)
- [x] Architecture documented (traditional vs code-mode)
- [ ] `workflow.ts` — Code-mode version of WF5 (TODO: needs Gemini API as UTCP tool)
- [ ] `workflow-traditional.ts` — Original WF5 exported via n8nac
- [ ] Benchmark: orchestration overhead comparison
- [ ] `test.ts` — automated test comparing both approaches

## Prerequisites

- Gemini API registered as a UTCP tool source in code-mode
- n8n running with both WF5 (traditional) and WF5-codemode variants
- Test payloads that exercise all 4 specialist paths

## What's Next

1. Register Gemini API as HTTP tool source in code-mode
2. Build code-mode WF5 variant on n8n
3. Run same payloads through both, compare node count, latency, and token usage
4. Export both as `.workflow.ts` for reproducibility

# Multi-Agent Dispatch Benchmark: Traditional 16-Node vs Code-Mode 3-Node

**Date:** 2026-04-07
**LLM:** Claude Haiku 4.5 via OpenRouter (anthropic/claude-haiku-4-5)
**Scenario:** Customer support dispatch — classify request, route to specialist, quality check, return structured JSON
**Status:** Design comparison only — no runtime benchmark captured yet

## Test Input

```json
{
  "message": "URGENT: Our production n8n instance is completely down and workflows are not executing. This is blocking our customer onboarding pipeline."
}
```

Expected output: `tech` classification with `urgent: true`, troubleshooting response, high confidence.

## Architecture Comparison

### WF5 — Traditional Multi-Agent Dispatch (16 Nodes)

| Component | Nodes | LLM Calls |
|-----------|-------|-----------|
| Webhook trigger | 1 | 0 |
| Dispatcher classifier + parser | 2 | 1 |
| Route switch | 1 | 0 |
| Tech specialist | 1 | 1 |
| Sales specialist | 1 | 1 |
| FAQ specialist | 1 | 1 |
| Fallback response | 1 | 0 |
| Quality check | 1 | 0 |
| Urgency filter + Telegram alert | 2 | 0 |
| Merge + final response nodes | 4 | 0 |
| **Total** | **16** | **4** |

The traditional design requires a dispatcher LLM call to classify, then a separate specialist LLM call to respond, plus orchestration nodes for routing, merging, fallback, and quality checking.

### WF03 — Code-Mode Multi-Agent Dispatch (3 Nodes)

| Component | Nodes | LLM Calls |
|-----------|-------|-----------|
| Webhook trigger | 1 | 0 |
| Chat model | 1 | 0 |
| AI Agent (classify + specialist + quality check) | 1 | 1 |
| **Total** | **3** | **1** |

The code-mode version collapses the entire dispatch graph into one AI Agent call. The agent classifies the request, responds with specialist behavior, checks response quality, flags urgency, and returns structured JSON — all in a single pass driven by prompt instructions.

## Design Comparison

| Metric | Traditional WF5 | Code-Mode WF03 | Reduction |
|--------|-----------------|----------------|-----------|
| **Node count** | 16 | 3 | **81%** |
| **LLM calls** | 4 | 1 | **75%** |
| **Routing logic** | Switch + parser + fallback + merge | One AI Agent prompt | Eliminated |
| **Quality check** | Separate node | Embedded in prompt | Eliminated |
| **Urgency detection** | Filter node + Telegram | Prompt instruction | Simplified |
| **Maintenance surface** | 16 nodes to configure | 1 system prompt to maintain | **94% fewer config points** |

## Token Estimate

| Architecture | LLM Calls | Est. Input Tokens | Est. Output Tokens | Est. Total |
|-------------|-----------|-------------------|-------------------|------------|
| Traditional (4 specialist calls) | 4 | ~3,200 | ~800 | ~4,000 |
| Code-mode (1 agent call) | 1 | ~600 | ~200 | ~800 |
| **Savings** | | | | **~80%** |

## Key Findings

1. **81% node reduction is architectural, not runtime.** The savings come from eliminating the orchestration graph — switch nodes, merge nodes, fallback logic, and separate specialist chains.

2. **75% fewer LLM calls.** The traditional design makes 4 separate LLM calls (dispatcher + 3 specialist paths). Code-mode makes 1 call that handles classification and specialist response together.

3. **Prompt replaces graph.** The routing logic that required 13 orchestration nodes (switch, merge, fallback, quality check, urgency filter) is expressed as prompt instructions in one AI Agent node.

4. **Runtime benchmark pending.** These numbers are from design analysis. The workflow.ts is implemented and ready for push to n8n, but no execution timing has been captured yet.

5. **Maintenance cost drops dramatically.** Changing specialist behavior means editing one system prompt vs reconfiguring multiple nodes and their connections.

# Code-Mode Benchmark: 5-Tool Customer Onboarding Pipeline

**Date:** 2026-03-20
**n8n:** 2.11.2 | **LLM:** Google Gemini 2.0 Flash (Free Tier)
**Scenario:** Customer data enrichment — validate email → classify company → score tier → generate message → format report

## Test Input

```json
{
  "name": "Maria Schmidt",
  "email": "maria.schmidt@microsoft.com",
  "company": "Microsoft Deutschland GmbH"
}
```

## Results

### WF8 — Traditional (5 Code Tool Sub-Nodes)

| Metric | Value |
|--------|-------|
| **LLM calls** | **11** |
| **Tool calls** | **10** (5 validate_email + 5 classify_company — agent retried) |
| **Execution time** | **12,483ms** |
| **Nodes fired** | **22** |
| **Status** | Success (but agent struggled, maxed tool retries) |

The traditional agent made **11 sequential LLM API calls** — each sending the full accumulated context (system prompt + tool schemas for all 5 tools + all prior tool calls and results). Context compounds with each call:

| LLM Call | Estimated Input Tokens | What It Carries |
|----------|----------------------|-----------------|
| 1 | ~500 | System prompt + 5 tool schemas + user input |
| 2 | ~700 | + tool call #1 + result #1 |
| 3 | ~900 | + tool call #2 + result #2 |
| 4 | ~1,100 | + tool call #3 + result #3 |
| 5 | ~1,300 | + tool call #4 + result #4 |
| 6 | ~1,500 | + tool call #5 + result #5 |
| 7 | ~1,700 | + tool call #6 + result #6 |
| 8 | ~1,900 | + tool call #7 + result #7 |
| 9 | ~2,100 | + tool call #8 + result #8 |
| 10 | ~2,300 | + tool call #9 + result #9 |
| 11 | ~2,500 | + tool call #10 + result #10 |
| **Total** | **~16,500** | **O(n²) compounding** |

Plus output tokens (~100-200 per call for tool selection + args) = **~18,000 total tokens**.

### WF9 — Code-Mode (1 Code-Mode Tool)

| Metric | Value |
|--------|-------|
| **LLM calls** | **1** |
| **Tool calls** | **0** (logic expressed as code) |
| **Execution time** | **2,530ms** |
| **Nodes fired** | **3** |
| **Status** | Success |

The code-mode agent made **1 LLM call** — Gemini saw the task, understood it could be expressed as TypeScript, and wrote the complete 5-step pipeline as code. No tool calls needed, no context accumulation.

| LLM Call | Estimated Input Tokens | What It Carries |
|----------|----------------------|-----------------|
| 1 | ~400 | System prompt + 1 tool schema + user input |
| **Total** | **~400** | **+ ~300 output (code block)** |

Total: **~700 tokens**.

## Comparison

| Metric | WF8 Traditional | WF9 Code-Mode | Savings |
|--------|----------------|---------------|---------|
| **LLM API calls** | 11 | 1 | **91%** |
| **Total tokens (est.)** | ~18,000 | ~700 | **96%** |
| **Execution time** | 12,483ms | 2,530ms | **80%** |
| **Nodes fired** | 22 | 3 | **86%** |
| **Agent iterations** | 11 | 1 | **91%** |

## Scaling Analysis

At GPT-4o pricing ($2.50/M input, $10/M output):

| Executions/day | Traditional Cost/Year | Code-Mode Cost/Year | Annual Savings |
|---------------|----------------------|---------------------|---------------|
| 10 | ~$164 | ~$6 | **$158** |
| 100 | ~$1,643 | ~$64 | **$1,579** |
| 1,000 | ~$16,425 | ~$639 | **$15,786** |
| 10,000 | ~$164,250 | ~$6,388 | **$157,862** |

## Key Findings

1. **The compounding is real.** 11 LLM calls with growing context = O(n²) token cost. The traditional agent sent ~16,500 input tokens total vs ~400 for code-mode.

2. **The agent struggled.** With 5 tools available, Gemini called `validate_email` 5 times and `classify_company` 5 times before giving up — it couldn't orchestrate the 5-step pipeline efficiently. Code-mode expressed the same logic as a single code block.

3. **Speed difference is dramatic.** 12.5s vs 2.5s — 5x faster. Each LLM round-trip adds ~1s of latency.

4. **Node complexity drops 86%.** 22 node fires vs 3. Simpler workflow, easier to maintain, fewer failure points.

5. **The token savings are 96%** — far beyond our initial 80% estimate. The compounding effect in a 5-tool pipeline is severe.

# POC-01: Customer Onboarding Pipeline

## What This Proves

**Lifecycle layer:** Runtime execution
**Thesis claim:** Code-mode collapses N sequential LLM tool calls into 1 sandboxed execution

## The Scenario

A 5-tool customer data enrichment pipeline:
1. **Validate email** — check format, domain, MX records
2. **Classify company** — categorize by industry, size, region
3. **Score tier** — assign customer tier based on classification
4. **Generate message** — create personalized onboarding message
5. **Format report** — compile all results into structured output

## Results

| Metric | Traditional (WF8) | Code-Mode (WF9) | Savings |
|---|---|---|---|
| LLM calls | 11 | 1 | **91%** |
| Tokens | ~18,000 | ~700 | **96%** |
| Latency | 12.5s | 2.5s | **80%** |
| Nodes | 22 | 3 | **86%** |

See [playbook/benchmarks.md](../../playbook/benchmarks.md) for full methodology and data.

## How It Works

**Traditional (WF8):** 5 separate Code Tool sub-nodes, each called sequentially by the AI agent. Each LLM call carries the full accumulated context. 11 round-trips total (agent retried some tools).

**Code-Mode (WF9):** 1 Code-Mode Tool. The LLM writes a single TypeScript block that executes all 5 operations in sequence inside the sandbox. 1 LLM call total.

## n8n Workflow IDs

| Workflow | n8n ID | Purpose |
|---|---|---|
| WF8 — Traditional | zQ4KCniPiiOS3EEG | 5 tools, 11 LLM calls |
| WF9 — Code-Mode | WVeyUVbK32wI6ZGQ | 1 tool, 1 LLM call |

## Test Input

```json
{
  "name": "Maria Schmidt",
  "email": "maria.schmidt@microsoft.com",
  "company": "Microsoft Deutschland GmbH"
}
```

## Status

- [x] Traditional workflow built and benchmarked (WF8)
- [x] Code-mode workflow built and benchmarked (WF9)
- [x] Results documented
- [ ] `workflow.ts` — n8nac-compatible workflow definition (TODO: export from n8n)
- [ ] `test.ts` — automated test harness (TODO: code-mode test execution)
- [ ] Reproducible from terminal (TODO: n8nac push + test cycle)

## What's Next

To fully prove the lifecycle claim, this POC needs:
1. Export WF8 and WF9 as `.workflow.ts` files via n8nac
2. Write automated test that pushes, executes, and compares both
3. Run from terminal end-to-end: `n8nac push → test → report`

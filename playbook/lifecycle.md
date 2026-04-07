# The Code-First n8n Lifecycle

> This document is portable — it works standalone, outside this repo.

## Two Tools, One Philosophy

n8n workflow development and execution have traditionally been UI-driven. Two tools change this:

**n8nac** (`@n8n-as-code/cli`) — code-first n8n development. Author workflows as TypeScript files, push/validate/verify via CLI. Proven in [n8n-autopilot](https://github.com/mj-deving/n8n-autopilot): 5 production AI workflows, zero UI clicks.

**code-mode** (`@utcp/code-mode` + `@code-mode/core`) — code-first n8n runtime. Collapse sequential LLM tool calls into a single sandboxed TypeScript execution. Benchmarked: 96% token savings on a 5-tool pipeline.

## The Lifecycle Coverage

| Layer | Tool | How |
|---|---|---|
| **Write** | n8nac | `.workflow.ts` files → TypeScript workflow definitions |
| **Deploy** | n8nac | `n8nac push` → push to n8n instance from terminal |
| **Validate** | n8nac | `n8nac validate` → schema + structure checks |
| **Test** | code-mode | Sandbox executes test payloads, checks results programmatically |
| **Debug** | code-mode | `enableTrace` → ToolCallRecord[] with timing per tool call |
| **Runtime** | code-mode | AI agent writes TypeScript → sandbox executes all tools in one shot |
| **Monitor** | n8n UI | Visual verification when needed — the UI is still there |

## The Bridge: Dev Loop as Code-Mode

The most powerful synergy: register n8nac CLI commands as UTCP tools inside code-mode. Then the entire development cycle — search for nodes, build a workflow, push it, test it, debug it — becomes a single code-mode execution.

```
Traditional dev loop:
  n8nac search "email" → pick node → edit workflow.ts → n8nac push → manual test → check logs → repeat

Code-mode dev loop:
  AI writes one TypeScript block that:
    1. Searches available nodes via n8nac API
    2. Constructs the workflow definition
    3. Pushes it to n8n
    4. Sends test payloads
    5. Checks execution results
    6. Reports pass/fail
  → all in one sandboxed execution
```

## Why This Matters

**For developers:** No context switching between terminal and browser. Everything is code, everything is automatable, everything is version-controllable.

**For teams:** Workflows in git, not locked in a database. PR reviews for automation changes. CI/CD for n8n.

**For cost:** 96% fewer tokens at runtime. On a 1,000-execution/day workload, that's ~$37K/year saved at GPT-4o pricing.

## How to Prove Each Layer

Each layer can be independently verified with a POC:

1. **Write + Deploy** — Create a workflow as TypeScript, push it, verify it appears in n8n
2. **Test** — Execute the workflow with test payloads, assert on outputs
3. **Runtime** — Run the same workflow with code-mode vs traditional, compare tokens/latency
4. **Debug** — Enable trace, step through tool call records, verify timing data
5. **Full lifecycle** — End-to-end: write → deploy → test → run → debug, all from terminal

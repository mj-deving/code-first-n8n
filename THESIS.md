# Code-First n8n: The Thesis

> n8nac owns development. Code-mode owns runtime. Together they cover the full lifecycle.

## The Problem

n8n AI agent workflows chain 5-15+ tool calls sequentially. Each call requires a full LLM round-trip with compounding context -- O(n^2) token growth. A 5-tool pipeline costs ~18,000 tokens across 11 LLM calls, takes 12+ seconds of latency, and requires 22 n8n nodes to wire together.

n8n workflow development is click-heavy. Building, testing, and debugging happens in the UI. There's no code-first path from authoring through production.

## The Solution

Two tools that together make n8n fully code-first:

| Layer | Tool | What It Does |
|---|---|---|
| **Write workflows** | n8nac TypeScript (.workflow.ts) | Author workflows as code, not clicks |
| **Deploy workflows** | n8nac push CLI | Push to n8n from terminal |
| **Test workflows** | code-mode test harness | Automated testing via sandboxed execution |
| **Debug workflows** | code-mode trace + replay | Programmatic debugging with execution records |
| **Runtime execution** | code-mode sandbox | Collapse N LLM calls → 1 code execution |
| **Visual UI** | Verification only | Still there when you need it |

## The Thesis

**n8nac** proved code-first n8n *development* works — write, deploy, test, debug, all from terminal.

**Code-mode** extends that philosophy to *runtime* — the AI agent writes a single TypeScript block that executes all tools in a sandbox, instead of N sequential LLM round-trips.

**Together:** fully code-first n8n, from authoring through production. No clicking required.

## Benchmark Results

5-tool customer onboarding pipeline (validate → classify → score → message → report):

| Metric | Traditional | Code-Mode | Savings |
|---|---|---|---|
| LLM calls | 11 | 1 | **91%** |
| Tokens | ~18,000 | ~700 | **96%** |
| Latency | 12.5s | 2.5s | **80%** |
| Nodes | 22 | 3 | **86%** |

## Three Synergies

1. **Dev loop as code-mode** — Register n8nac CLI + n8n API as UTCP tools → the entire search → push → test → debug cycle becomes one code block

2. **Multi-agent → 1 code block** — A 16-node dispatcher workflow collapses to a single TypeScript execution. Sub-agent LLM calls remain; orchestration overhead disappears

3. **Test pipeline → code-mode harness** — Replace bash/Python test scripts with a single code-mode execution: activate workflow, send payloads, check results, report

## What Ships From Here

This repo is a **proving ground**. Each POC template in `workflows/` proves one layer of this thesis with real benchmarks:

| POC | Proves | Status |
|---|---|---|
| [01 — Customer Onboarding](workflows/01-customer-onboarding/) | Runtime: 96% token savings | Benchmarked |
| [02 — MCP Filesystem](workflows/02-mcp-filesystem/) | Runtime + MCP: real file ops in sandbox | Verified |
| [03 — Multi-Agent Dispatch](workflows/03-multi-agent-dispatch/) | Architecture: 16 nodes → 1 code block | Analyzed |
| [04 — Dev Loop](workflows/agents/04-dev-loop/) | Full lifecycle: n8nac → code-mode end-to-end | **E2E Proven** |
| [05 — E2E Sibling Tools](workflows/05-e2e-sibling-tools/) | Auto-register: zero-config tool discovery | **8/8 pass** |

## Published Packages

| Package | npm | What |
|---|---|---|
| `n8n-nodes-utcp-codemode` | [v2.1.0](https://www.npmjs.com/package/n8n-nodes-utcp-codemode) | n8n community node — Code-Mode Tool |
| `code-mode-tools` | [v0.2.0](https://www.npmjs.com/package/code-mode-tools) | Standalone MCP server wrapping CodeModeEngine |
| `@utcp/code-mode` | [v1.2.11](https://www.npmjs.com/package/@utcp/code-mode) | Upstream library (not ours) |

## Deep Dives

- [Playbook: Lifecycle](playbook/lifecycle.md) — The full n8nac + code-mode framing
- [Playbook: Benchmarks](playbook/benchmarks.md) — Token savings data and methodology
- [Playbook: Architecture](playbook/architecture.md) — How the pieces fit together
- [Archive](archive/) — Original research artifacts from the exploration phase

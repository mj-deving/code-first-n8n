# Session: Code-Mode POC Build, n8n Install & Benchmark

**Date:** 2026-03-20 19:30
**Duration:** ~4 hours (continuation of earlier research session)
**Mode:** full
**Working Directory:** /home/mj/projects/code-mode

## Summary

Built a working POC n8n community node wrapping UTCP code-mode, installed it in a live n8n instance on Windows (accessed from WSL), created test workflows via n8nac, and ran a realistic 5-tool benchmark proving 96% token savings and 91% fewer LLM calls compared to traditional agent tool calling.

## Work Done

- Built `n8n-nodes-utcp-codemode` package (TypeScript, 8/8 tests passing)
- Fixed Windows crash: moved `isolated-vm`, `@langchain/core`, `zod` to lazy `await import()` inside `supplyData()` — n8n scans all community node modules at startup, eagerly loading isolated-vm (native C++ addon) crashed n8n
- Added `execute()` method alongside `supplyData()` — n8n requires both on tool sub-nodes
- Discovered WSL2→Windows networking requires vEthernet IP (`172.31.224.1`), not `localhost`
- Started n8n from WSL via `powershell.exe`
- Copied n8nac credentials to WSL Linux path for cross-platform access
- Created WF7 (Code-Mode Test) via n8nac — first successful sandbox execution (Fibonacci)
- Created WF8 (Benchmark Traditional — 5 Code Tool sub-nodes) via n8nac
- Created WF9 (Benchmark Code-Mode — 1 Code-Mode Tool) via n8nac
- Ran head-to-head benchmark: WF8 (11 LLM calls, 12.5s) vs WF9 (1 LLM call, 2.5s)
- Created CLAUDE.md for the project
- Ran /simplify review (3 parallel agents) — fixed dynamic imports, extracted interface, parallelized tool registration, null coalescing
- Updated benchmark-results.md with comprehensive analysis
- Updated code-mode-synthesis.md with all findings
- Updated project memory with n8n access details

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Lazy imports for isolated-vm | n8n scans all modules at startup; native addon crashes Windows | Removing isolated-vm (breaks core functionality), building for Linux only |
| Both execute() + supplyData() | n8n requires execute() for Tool Executor compatibility | supplyData() only (caused runtime error) |
| WSL vEthernet IP for n8n access | WSL2 localhost doesn't route to Windows host services | Running everything on Windows side, SSH tunnel |
| Gemini explicit tool instructions | Gemini 2.0 Flash is weak at proactive tool calling | Switching to Claude/GPT-4o (not free), prompt engineering only |

## Key Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `n8n-nodes-utcp-codemode/nodes/CodeModeTool/CodeModeTool.node.ts` | created + iterated | Main node: lazy imports, execute()+supplyData(), ToolSource interface |
| `n8n-nodes-utcp-codemode/package.json` | created | n8n community node package with @utcp/code-mode deps |
| `n8n-nodes-utcp-codemode/__tests__/CodeModeTool.test.ts` | created | 8 unit tests |
| `n8n-nodes-utcp-codemode/nodes/CodeModeTool/codemode.svg` | created | Node icon (blue/gold) |
| `CLAUDE.md` | created | Project guidance for Claude Code |
| `benchmark-results.md` | created + rewritten | 5-tool pipeline benchmark: 96% savings |
| `code-mode-synthesis.md` | updated | Research synthesis |
| Windows: `~/.n8n/nodes/` | modified | Installed community node |
| Windows: n8n-autopilot WF7,WF8,WF9 | created | Test and benchmark workflows via n8nac |

## Learnings

- n8n community nodes MUST have both `execute()` and `supplyData()` on tool sub-nodes
- n8n loads ALL community node JS files at startup — any top-level import of native addons will crash
- WSL2 networking to Windows: use `powershell.exe -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'vEthernet (WSL*)').IPAddress"` to resolve IP
- Gemini 2.0 Flash needs very explicit tool-calling instructions (weaker than Claude at proactive tool use)
- The O(n²) token compounding in n8n agents is even worse than estimated — 11 LLM calls for a 5-tool pipeline
- n8n event logs rotate and lose tokenUsage data after restart — extract metrics before restarting

## Open Items

- [ ] Publish to npm as `n8n-nodes-utcp-codemode`
- [ ] Write n8n community forum post with benchmark data
- [ ] Register real MCP tool sources (e.g., filesystem, GitHub) in Code-Mode Tool
- [ ] Test with Claude/GPT-4o as the agent LLM (better tool-calling than Gemini)
- [ ] v1.5: Auto-register sibling tool nodes from same Agent

## Context for Next Session

POC is built, installed in n8n, benchmarked. The node is at `n8n-nodes-utcp-codemode/` with lazy imports (critical for Windows). n8n accessed from WSL via `172.31.224.1:5678`. Three benchmark workflows exist: WF7 (test), WF8 (traditional 5-tool), WF9 (code-mode). The 96% token savings benchmark is in `benchmark-results.md`. Next: publish to npm, write community post, or add real MCP tool sources.

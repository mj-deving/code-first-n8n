# n8n-nodes-utcp-codemode — Project Status

> Single source of truth for project state. Updated every session.
> Last updated: 2026-03-21

## Quick Links

| Resource | Location |
|---|---|
| **npm** | [n8n-nodes-utcp-codemode](https://www.npmjs.com/package/n8n-nodes-utcp-codemode) (v0.1.3) |
| **GitHub** | [mj-deving/n8n-nodes-utcp-codemode](https://github.com/mj-deving/n8n-nodes-utcp-codemode) |
| **Community Post** | `n8n-community-post.md` (ready to post in "Built with n8n") |
| **Benchmarks** | `benchmark-results.md` — 96% token savings on 5-tool pipeline |
| **Research** | `code-mode-synthesis.md` — full synthesis of UTCP + n8n integration |
| **Reference** | `n8n-code-mode-reference.md` — 12-section technical elaboration |

## Current Version: 2.0.0

| Version | Date | Changes |
|---|---|---|
| 0.1.0 | 2026-03-20 | Initial release — Code-Mode Tool with isolated-vm sandbox |
| 0.1.1 | 2026-03-20 | Fix: repository URLs point to standalone repo |
| 0.1.2 | 2026-03-20 | feat: add @utcp/mcp dependency for MCP transport |
| 0.1.3 | 2026-03-21 | feat: lazy import @utcp/mcp, debug logging for MCP registration |
| 0.1.4 | 2026-03-21 | chore: strip debug logging, clean production release |
| 0.2.0 | 2026-03-21 | feat: MCP server presets UI (Filesystem, GitHub, Brave, SQLite, Memory) |
| 0.2.1 | 2026-03-21 | rebrand: drop UTCP from user-facing text, lead with token savings |
| 1.1.0 | 2026-03-21 | feat: output transparency, token savings estimation, example workflow |
| **2.0.0** | **2026-03-21** | **feat: monorepo extraction — @code-mode/core SDK + sandbox replay + caching** |
| 2.1.0 | planned | feat: auto-register sibling tool sub-nodes (gated on user signal) |

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Core sandbox execution | **SHIPPED** | isolated-vm V8 sandbox, TypeScript code chains |
| **@code-mode/core SDK** | **SHIPPED v2.0** | Platform-agnostic engine, extracted from n8n node |
| **Monorepo (npm workspaces)** | **SHIPPED v2.0** | packages/core + packages/n8n |
| **Sandbox Replay** | **SHIPPED v2.0** | enableTrace → ToolCallRecord[] with timing |
| **Internal setup caching** | **SHIPPED v2.0** | Always-on, FIFO at 16 entries |
| **Engine lifecycle caching** | **SHIPPED v2.0** | Cached by configHash across supplyData() calls |
| Lazy imports (Windows compat) | **SHIPPED** | All heavy deps lazy-loaded in supplyData() |
| npm published | **SHIPPED** | v1.1.0 on npmjs.com (v2.0.0 pending publish) |
| Public GitHub repo | **SHIPPED** | Clean standalone repo |
| MCP transport support | **WORKING** | 14 filesystem tools register, sandbox calls work |
| MCP end-to-end with Claude | **WORKING** | Claude via OpenRouter reads real files through MCP sandbox |
| MCP end-to-end with Gemini | **BROKEN** | Gemini calls tools but returns empty results |
| Community forum post | **POSTED** | Posted to "Built with n8n" — flagged for AI content, rewritten |
| Real MCP demo workflow | **WORKING** | WF10 on n8n with OpenRouter Chat Model node + filesystem MCP |
| OpenRouter integration | **WORKING** | Use `lmChatOpenRouter` node type, not `lmChatOpenAi` |

## Benchmark Summary

5-tool customer onboarding pipeline (validate email → classify → score → message → report):

| Metric | Traditional | Code-Mode | Savings |
|---|---|---|---|
| LLM calls | 11 | 1 | 91% |
| Tokens | ~18,000 | ~700 | **96%** |
| Time | 12.5s | 2.5s | 80% |
| Nodes | 22 | 3 | 86% |

## n8n Workflows (Windows, 172.31.224.1:5678)

| ID | Name | Purpose |
|---|---|---|
| qwTD3EeYRAmg287L | WF7 — Code-Mode Test | Fibonacci test (basic) |
| zQ4KCniPiiOS3EEG | WF8 — Benchmark Traditional | 5 tools, 11 LLM calls |
| WVeyUVbK32wI6ZGQ | WF9 — Benchmark Code-Mode | 1 tool, 1 LLM call |
| Ml4GL2HRJCSpCXtM | WF10 — MCP Filesystem Test | Real MCP integration test |

## Architecture (v2.0)

```
@code-mode/core (platform-agnostic):
  CodeModeEngine.create() → UtcpClient
    .registerToolSource(config)     → MCP/HTTP tool registration
    .execute(code, options)         → sandbox execution → ExecutionResult
    .getToolDescription()           → LLM prompt string
    .close()                        → releases client + MCP transports

n8n wrapper (thin):
  AI Agent → execute_code_chain(code) → CodeModeTool
    → await import('@code-mode/core')
    → CodeModeEngine (cached by configHash)
    → engine.execute(code, { timeout, memoryLimit, enableTrace })
    → { result, logs, error?, _codeMode: { trace?, stats?, tokenEstimate } }
```

## MCP Configuration (working format)

```json
[{
  "name": "fs",
  "call_template_type": "mcp",
  "config": {
    "mcpServers": {
      "filesystem": {
        "transport": "stdio",
        "command": "node",
        "args": ["path/to/server-filesystem/dist/index.js", "C:\\allowed\\dir"]
      }
    }
  }
}]
```

Key: `transport: "stdio"` is required. Without it, `@utcp/mcp` throws "Unsupported MCP transport: undefined".

## Strategic Direction (decided 2026-03-21, council + research)

**First-mover confirmed.** No n8n competitor. Pattern validated by Anthropic PTC, LangGraph CodeAct, OpenAI Code Interpreter. See `project_strategic_direction.md` for full analysis.

## Roadmap

1. ~~**Rebrand** — drop UTCP from user-facing text~~ ✅ done (v0.2.1)
2. ~~**v2.0: Core SDK extraction** — @code-mode/core monorepo~~ ✅ done (v2.0.0)
3. **npm publish v2.0** — publish @code-mode/core (new), update n8n-nodes-utcp-codemode
4. **Distribution** — repost community content (dev.to / Reddit / LinkedIn)
5. **v2.1: Auto-register siblings** — detect sibling tool sub-nodes, register automatically
6. **v3.0 (vision): Workflow composition** — sandbox calls n8n sub-workflows as functions
7. **Revoke stale npm tokens** — two tokens shared in chat session

## Known Issues

- **Gemini tool-calling weakness** — Gemini 2.0 Flash calls MCP tools but returns empty/generic results. Needs explicit "You MUST call X" prompting and still struggles.
- **Double namespace** — MCP tools register as `manual.server_toolname` (e.g., `fs.filesystem_read_file`). This is a UTCP convention, not a bug.
- **isolated-vm native addon** — may need rebuild after Node.js version changes
- **Windows npx** — use full `node path/to/module.js` instead of `npx` for MCP servers spawned from n8n

## Document Index

| File | Purpose | Audience |
|---|---|---|
| `STATUS.md` | This file — project state & links | Project team |
| `CLAUDE.md` | Build commands, architecture, gotchas | AI assistant |
| `benchmark-results.md` | Detailed benchmark data | Technical audience |
| `code-mode-synthesis.md` | Research synthesis | Decision-makers |
| `n8n-code-mode-reference.md` | Full technical elaboration | Developers |
| `n8n-community-post.md` | Forum post draft | n8n community |
| `n8n-nodes-utcp-codemode/README.md` | npm package README | Package users |
| `.sessions/` | Session records | Session continuity |
| `MEMORY/WORK/` | PRDs for Algorithm runs | AI workflow |

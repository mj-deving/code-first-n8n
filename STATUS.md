# Code-First n8n Proving Ground — Status

> Proving ground for the n8nac + code-mode lifecycle thesis.
> Produces verified POC templates for n8n automation use cases.
> Last updated: 2026-04-08

## Thesis

See [THESIS.md](THESIS.md) — n8nac owns dev-time, code-mode owns runtime, together they cover the full lifecycle.

## Quick Links

| Resource | Location |
|---|---|
| **Thesis** | [THESIS.md](THESIS.md) — the lifecycle framing |
| **Playbook** | [playbook/](playbook/) — portable knowledge (lifecycle, benchmarks, architecture) |
| **POCs** | [workflows/](workflows/) — proven automation templates |
| **npm (n8n)** | [n8n-nodes-utcp-codemode@2.1.0](https://www.npmjs.com/package/n8n-nodes-utcp-codemode) |
| **npm (MCP)** | [code-mode-tools@0.2.0](https://www.npmjs.com/package/code-mode-tools) |
| **GitHub (n8n)** | [mj-deving/n8n-nodes-utcp-codemode](https://github.com/mj-deving/n8n-nodes-utcp-codemode) |
| **GitHub (MCP)** | [mj-deving/code-mode-tools](https://github.com/mj-deving/code-mode-mcp-server) |
| **Archive** | [archive/](archive/) — original research artifacts |

## Current Version: 2.1.0

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
| **2.1.0** | **2026-03-21** | **feat: auto-register sibling tool sub-nodes, externalTools API** |

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
| **Auto-register siblings** | **SHIPPED v2.1** | AiTool input, siblingAdapter, externalTools API |
| npm published | **SHIPPED** | code-mode-core@2.1.0 + n8n-nodes-utcp-codemode@2.1.0 on npmjs.com |
| Public GitHub repo | **SHIPPED** | Clean standalone repo |
| MCP transport support | **WORKING** | 14 filesystem tools register, sandbox calls work |
| MCP end-to-end with Claude | **WORKING** | Claude via OpenRouter reads real files through MCP sandbox |
| MCP end-to-end with Gemini | **BROKEN** | Gemini calls tools but returns empty results |
| **Dev loop workflow (WF04)** | **PROVEN** | Builds + deploys + activates a workflow in `11.5s` for about `$0.05` using Claude Haiku 4.5 via OpenRouter |
| Community forum post | **POSTED** | Posted to "Built with n8n" — flagged for AI content, rewritten |
| Real MCP demo workflow | **WORKING** | WF10 on n8n with OpenRouter Chat Model node + filesystem MCP |
| Default LLM recommendation | **HAIKU VIA OPENROUTER** | Best current cost/performance for n8n tool calling; Gemini is not reliable here |
| E2E sibling tools test | **PROVEN** | WF11 passes `8/8` criteria with Claude via OpenRouter after the serialization and prompt fixes |
| Strategic ideation | **COMPLETE** | 34 ideas, 9 hypotheses — `strategic-initiatives-ideation.md` |
| **MCP server (code-mode-as-server)** | **BUILT v0.1** | Standalone package, 22 tests, E2E verified. [GitHub](https://github.com/mj-deving/code-mode-mcp-server) |

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
| pxCt6Wv92qqUbznT | WF11 — E2E Sibling Tools Test | Calculator sibling → Code-Mode → Agent |
| EBMbixqklugU5WtQ | WF04 — Dev Loop | AI builds, deploys, and activates another workflow in one execution |

## Architecture (v2.1)

```
@code-mode/core (platform-agnostic):
  CodeModeEngine.create() → UtcpClient
    .registerToolSource(config)     → MCP/HTTP tool registration
    .execute(code, options)         → sandbox execution → ExecutionResult
    .getToolDescription()           → LLM prompt string
    .close()                        → releases client + MCP transports

  ExecutionOptions (v2.1):
    timeout, memoryLimit, enableTrace     → existing
    externalTools?: ToolLike[]            → NEW: merge with registered tools
    externalCallToolFn?: CallToolFn       → NEW: route external tool calls

n8n wrapper (thin):
  [Sibling Tools] → Code-Mode Tool → AI Agent
    → getInputConnectionData(AiTool) discovers siblings
    → siblingAdapter.ts converts LangChain → ToolLike[] + CallToolFn
    → engine.execute(code, { ..., externalTools, externalCallToolFn })
    → sandbox calls both manual.mcp_tool() and sibling.toolName()
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

## Strategic Direction (updated 2026-03-23)

**First-mover confirmed.** No n8n competitor. Pattern validated by Anthropic PTC, LangGraph CodeAct, OpenAI Code Interpreter.

**Platform expansion decided (2026-03-23):** Build code-mode as an MCP server — universal adapter that serves Claude Desktop, Claude Code, Cursor, Windsurf, LangChain, CrewAI, and any MCP-compatible client. One deliverable → maximum reach.

**Key strategic insight:** An MCP server is NOT the "MCP Gateway proxy" (which was architecturally flawed — can't control external LLM's prompt). It's code-mode AS a server: exposes `execute_code_chain` as a real MCP tool that clients explicitly call. The LLM sees the tool, writes code, sandbox executes it.

**Moat vs upstream repo:** The OG `@utcp/code-mode` is a raw client library. `@code-mode/core` adds: production engine with setup caching (FIFO/16), execution tracing (ToolCallRecord[]), external tool composition API, security hardening, collision-safe bridges, 67 tests. That's the value — not the sandbox itself, but the production-ready engine around it.

### Design Questions (open, 2026-03-23)

1. **Tool registration model:** Should the MCP server pre-register tool sources at startup (config file) or let clients register tools dynamically via MCP resource/prompt protocol?
2. **Multi-tool-source composition:** When a client connects, do they bring their own MCP tools (forwarded through code-mode for optimization), or only use tools code-mode already has registered?
3. **Security boundary:** The sandbox runs arbitrary code from the LLM. As an MCP server, we accept code from external clients. What sandboxing guarantees do we promise? Is isolated-vm sufficient for multi-client?
4. **Stateless vs stateful:** Should the engine persist between MCP calls (keep registered tools hot) or create fresh per-call? Performance vs memory trade-off.
5. **Platform-specific wrappers still needed?** If MCP server covers Claude/Cursor/LangChain(via adapter)/CrewAI — do we still need native LangChain/CrewAI wrappers, or is MCP sufficient?

See `strategic-initiatives-ideation.md` for full 34-idea analysis with intern critical review.

## Roadmap

1. ~~**Rebrand** — drop UTCP from user-facing text~~ ✅ done (v0.2.1)
2. ~~**v2.0: Core SDK extraction** — @code-mode/core monorepo~~ ✅ done (v2.0.0)
3. ~~**npm publish v2.0** — publish both packages~~ ✅ done (v2.0.0)
4. ~~**v2.1: Auto-register siblings** — detect sibling tool sub-nodes~~ ✅ done (v2.1.0)
5. ~~**v3.0: MCP Server** — code-mode as an MCP server~~ ✅ built (v0.1.0, [repo](https://github.com/mj-deving/code-mode-mcp-server))
5b. **npm publish MCP server** — `npm publish` code-mode-tools@0.2.0 ← **NEXT**
6. **Token Savings Calculator** — lead gen landing page (2-3 days)
7. **Distribution** — dev.to / Reddit / LinkedIn
8. **Revoke stale npm tokens** — two tokens shared in chat session
9. **v4.0 (vision): Multi-sandbox orchestration** — fan-out/fan-in parallel execution
10. **Published benchmark H6.2** — "Scaling Parallel Sandbox Execution: Where V8 Isolates Hit the Wall"

## Known Issues

- **Gemini tool-calling weakness** — Gemini 2.0 Flash and Gemini 2.5 Flash are not reliable for n8n tool calling; the agent receives `null` or empty tool args instead of usable payloads. Claude works; Gemini does not.
- **Double namespace** — MCP tools register as `manual.server_toolname` (e.g., `fs.filesystem_read_file`). This is a UTCP convention, not a bug.
- **isolated-vm native addon** — may need rebuild after Node.js version changes
- **Windows npx** — use full `node path/to/module.js` instead of `npx` for MCP servers spawned from n8n
- **MCP presets deprecated** — All `@modelcontextprotocol/server-*` packages archived by Anthropic (2025). Still functional on npm but no security patches. `server-postgres` has known SQL injection vulnerability (Datadog). `server-sqlite` removed from npm entirely.
- **Staging monorepo needs npm install** — Junction-linked staging dir at `C:\Users\User\.n8n\n8n-nodes-utcp-codemode-src\` needs `npm install` for code-mode-core to resolve. Fixed 2026-03-21.
- **n8n community forum flagged** — Account flagged for AI content. Distribution bottleneck.
- **Token costs dropping** — GPT-4o-mini is 97% cheaper than GPT-4. "96% savings" pitch weakens as base costs fall. Lead with latency/complexity reduction alongside token savings.

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
| `strategic-initiatives-ideation.md` | 34 ideas + 9 hypotheses for tasks 5,6,7 | Strategic planning |
| `.sessions/` | Session records | Session continuity |
| `MEMORY/WORK/` | PRDs for Algorithm runs | AI workflow |

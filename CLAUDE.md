# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Research and development workspace for integrating [UTCP code-mode](https://github.com/universal-tool-calling-protocol/code-mode) with n8n AI agent workflows. Contains the upstream library (cloned), a POC n8n community node, and research artifacts. See `STATUS.md` for current project state, version history, and all links.

## Structure

- `n8n-nodes-utcp-codemode/` — **npm workspaces monorepo** (the primary deliverable)
  - `packages/core/` — `@code-mode/core` — platform-agnostic SDK (CodeModeEngine, sandbox, bridges, cache)
  - `packages/n8n/` — `n8n-nodes-utcp-codemode` — thin n8n wrapper importing core
- `repo/` — Cloned upstream `universal-tool-calling-protocol/code-mode` (read-only reference)
- `n8n-autopilot/` — Cloned `mj-deving/n8n-autopilot` (read-only reference)
- `STATUS.md` — **Masterdoc: current state, versions, links, next steps**
- `code-mode-synthesis.md` — Research synthesis document
- `n8n-code-mode-reference.md` — Full technical elaboration
- `benchmark-results.md` — 96% token savings benchmark data
- `n8n-community-post.md` — Forum post draft (ready to post)

## Build & Test (n8n-nodes-utcp-codemode)

```bash
cd n8n-nodes-utcp-codemode

# Workspace-level (builds/tests both packages)
npm run build          # tsc in core then n8n
npm test               # jest in core (31 tests) then n8n (9 tests)
npm run lint           # tsc --noEmit in both

# Per-package
cd packages/core && npm test    # 31 unit tests (engine, schema-to-ts, replay)
cd packages/n8n && npm test     # 9 unit tests (node description)

# IMPORTANT: build core before n8n (n8n imports core's dist/)
cd packages/core && npm run build && cd ../n8n && npm run build
```

Jest configs are `jest.config.cjs` in each package.

## Upstream Library Tests (repo)

```bash
cd repo/typescript-library

npm install
npx jest --config jest.config.cjs    # 18/19 pass (1 stale assertion)
```

The jest config was renamed from `.js` to `.cjs` to fix ESM module compat with `"type": "module"` in package.json.

## Architecture: v2.0 Monorepo

### @code-mode/core (platform-agnostic SDK)

```
CodeModeEngine.create() → UtcpClient
  .registerToolSource(config) → registers MCP/HTTP tools
  .execute(code, options) → sandbox execution → ExecutionResult
  .getToolDescription() → LLM prompt string
  .close() → releases UtcpClient + MCP transports
```

Core modules (packages/core/src/):
- `engine.ts` — CodeModeEngine class, orchestrates everything
- `sandbox.ts` — Only file importing isolated-vm, creates isolates
- `bridges.ts` — Console + tool bridges for isolated-vm (collision-safe)
- `schema-to-ts.ts` — JSON Schema → TypeScript converter (from upstream)
- `cache.ts` — Internal setup caching (always-on, FIFO at 16 entries)
- `types.ts` — ToolDefinition, ExecutionResult, ExecutionOptions, etc.

### n8n wrapper (thin node)

```
AI Agent → calls execute_code_chain(code) → CodeModeTool
  → await import('@code-mode/core')
  → CodeModeEngine.create() (cached by configHash across calls)
  → engine.execute(code, { timeout, memoryLimit, enableTrace })
  → returns { result, logs, _codeMode: { trace?, stats?, tokenEstimate } }
```

Key files:
- `packages/n8n/nodes/CodeModeTool/CodeModeTool.node.ts` — Thin wrapper (~360 lines, ~100 logic)
- `packages/n8n/nodes/CodeModeTool/presets.ts` — MCP preset configs
- `packages/n8n/nodes/CodeModeTool/codemode.svg` — Node icon

The node exposes five configurable parameters: `mcpPresets`, `toolSources`, `timeout`, `memoryLimit`, `enableTrace`.

## n8n Access (Development/Testing)

n8n runs on Windows, accessed from WSL via the vEthernet IP:

```bash
# Get the Windows host IP (changes per WSL session)
WIN_IP=$(powershell.exe -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'vEthernet (WSL*)').IPAddress" | tr -d '\r\n')

# n8n API (localhost doesn't work from WSL2)
curl -s "http://$WIN_IP:5678/api/v1/workflows" -H "X-N8N-API-KEY: $(cat ~/.config/n8nac-nodejs/Config/credentials.json | python3 -c 'import sys,json; print(json.load(sys.stdin)["hosts"]["http://localhost:5678"])')"

# Start n8n from WSL if not running
powershell.exe -Command "Set-Location C:\Users\User; Start-Process -FilePath 'n8n' -ArgumentList 'start' -WindowStyle Hidden"
```

n8nac credentials stored at `~/.config/n8nac-nodejs/Config/credentials.json` (copied from Windows AppData).

## Critical Gotchas

- **WSL2 → Windows networking**: Use `172.31.224.1` (or dynamically resolved vEthernet IP), NOT `localhost`
- **NEVER `pkill -f "n8n"`**: Kills Claude Code too (working dir contains "n8n"). Kill by specific PID only.
- **Gemini rate limit**: Free tier = 15 req/min. Space webhook tests 8+ seconds apart.
- **n8nac push**: ONLY filename, no path — `npx n8nac push CodeModeTool.node.ts`
- **Lazy imports mandatory**: `@code-mode/core`, `@utcp/mcp`, `@langchain/core/tools`, `zod` must be `await import()` inside `supplyData()`, NOT top-level imports. n8n loads all community node modules at startup — eager import of isolated-vm (native addon) crashes n8n on Windows.
- **Build order matters**: Core must be built before n8n (`packages/core/dist/` must exist for n8n's imports to resolve).
- **isolated-vm**: Native C++ addon — may need rebuild after Node.js version changes
- **MCP config requires `transport: "stdio"`**: Without it, `@utcp/mcp` throws "Unsupported MCP transport: undefined". Use `node path/to/module.js` not `npx` on Windows.
- **MCP double namespace**: Tools register as `manual.server_toolname` (e.g., `fs.filesystem_read_file`). This is UTCP convention.
- **Gemini + MCP**: Gemini calls MCP tools but returns empty results. Claude/GPT-4o needed for reliable MCP code generation.
- **Engine cache**: Keyed by configHash. Multiple n8n nodes with different configs get separate engines. Old engines are never evicted (acceptable for typical 1-2 configs).

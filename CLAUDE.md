# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Code-First n8n Proving Ground.** Proves the n8nac + code-mode lifecycle thesis and produces verified POC templates for n8n automation use cases. See [THESIS.md](THESIS.md) for the framing, [STATUS.md](STATUS.md) for current state.

## Structure

- `THESIS.md` — **Front door: the n8nac + code-mode lifecycle thesis**
- `playbook/` — **Portable knowledge** (lifecycle, benchmarks, architecture)
- `workflows/` — **Workflow templates** — each proves a layer of the thesis
  - `01-customer-onboarding/` — Runtime: 96% token savings (benchmarked)
  - `02-mcp-filesystem/` — Runtime + MCP (verified live)
  - `03-multi-agent-dispatch/` — Architecture (analyzed)
  - `05-e2e-sibling-tools/` — Auto-register (8/8 pass)
  - `TEMPLATE.md` — What every workflow directory must contain
- `template/` — Scaffold template for new workflows
- `scripts/` — Shared tooling (new-workflow.sh, check-secrets.sh)
- `n8n-nodes-utcp-codemode/` — n8n community node (published, npm)
- `code-mode-tools/` — Standalone MCP server (published, npm)
- `repo/` — Cloned upstream `universal-tool-calling-protocol/code-mode` (read-only)
- `n8n-autopilot/` — Cloned `mj-deving/n8n-autopilot` (read-only)
- `archive/` — Original research artifacts from exploration phase
- `STATUS.md` — Project state, version history, links

## Workflow Development

### Creating a New Workflow

```bash
./scripts/new-workflow.sh <category>/<name> "<Display Name>"
# Example:
./scripts/new-workflow.sh agents/06-slack-triage "Slack Message Triage"
```

Categories: `agents`, `pipelines`, `triggers`, `utilities`

### Development Cycle

1. Scaffold → `./scripts/new-workflow.sh`
2. Build → write workflow.ts or build in n8n UI
3. Deploy → `npx n8nac push <filename>.workflow.ts`
4. Test → POST to webhook, check with n8n API
5. Document → fill README.md (mermaid, nodes, test payloads)
6. Benchmark → compare before/after if applicable
7. Commit → git add + commit

### n8nac Commands

```bash
npx n8nac list                     # Status of all workflows
npx n8nac pull <id>               # Download from n8n
npx n8nac push <filename>          # Upload (FILENAME only, no path!)
npx n8nac verify <id>             # Live validation
npx n8nac skills search "topic"   # Research nodes
```

### Code-Mode Patterns (inside sandbox)

```typescript
// MCP tools (registered via tool sources):
const files = fs.filesystem_list_directory({ path: "/data" });

// Sibling tools (auto-registered from connected nodes):
const result = sibling.calculator({ a: 100, b: 200 });

// Return result to agent:
return { answer: result };
```

### Workflow Rules

1. Every workflow directory follows the structure in `template/`
2. Mermaid diagram required in every workflow README
3. Test payloads in `test.json` for webhook-triggered workflows
4. Run `scripts/check-secrets.sh` before committing
5. Never hardcode credentials — use n8n credential references

## Build & Test (n8n-nodes-utcp-codemode)

```bash
cd n8n-nodes-utcp-codemode

# Workspace-level (builds/tests both packages)
npm run build          # tsc in core then n8n
npm test               # jest in core (47 tests) then n8n (20 tests)
npm run lint           # tsc --noEmit in both

# Per-package
cd packages/core && npm test    # 47 unit tests (engine, schema-to-ts, replay, integration)
cd packages/n8n && npm test     # 20 unit tests (node description, siblingAdapter)

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

## Architecture: v2.1 Monorepo

### @code-mode/core (platform-agnostic SDK)

```
CodeModeEngine.create() → UtcpClient
  .registerToolSource(config) → registers MCP/HTTP tools
  .execute(code, options) → sandbox execution → ExecutionResult
  .getToolDescription() → LLM prompt string
  .close() → releases UtcpClient + MCP transports
```

ExecutionOptions (v2.1):
- `timeout`, `memoryLimit`, `enableTrace` — existing
- `externalTools?: ToolLike[]` — merge with registered tools for sandbox
- `externalCallToolFn?: CallToolFn` — route external tool calls (Set-based O(1) dispatch)

Core modules (packages/core/src/):
- `engine.ts` — CodeModeEngine class, orchestrates everything
- `sandbox.ts` — Only file importing isolated-vm, creates isolates
- `bridges.ts` — Console + tool bridges for isolated-vm (collision-safe)
- `schema-to-ts.ts` — JSON Schema → TypeScript converter (from upstream)
- `cache.ts` — Internal setup caching (always-on, FIFO at 16 entries)
- `types.ts` — ToolDefinition, ExecutionResult, ExecutionOptions, etc.

Exported types: `CodeModeEngine`, `ExecutionOptions`, `ExecutionResult`, `ToolLike`, `CallToolFn`, etc.

### n8n wrapper (thin node)

```
[Sibling Tools] → Code-Mode Tool → AI Agent
  → getInputConnectionData(AiTool) discovers siblings
  → siblingAdapter.ts converts LangChain → ToolLike[] + CallToolFn
  → engine.execute(code, { ..., externalTools, externalCallToolFn })
  → sandbox calls both manual.mcp_tool() and sibling.toolName()
```

Key files (in monorepo at `~/projects/n8n-nodes-utcp-codemode/`):
- `packages/n8n/nodes/CodeModeTool/CodeModeTool.node.ts` — Thin wrapper
- `packages/n8n/nodes/CodeModeTool/siblingAdapter.ts` — LangChain → ToolLike adapter (v2.1)
- `packages/n8n/nodes/CodeModeTool/presets.ts` — MCP preset configs

The node exposes six configurable parameters: `autoRegisterSiblings`, `mcpPresets`, `toolSources`, `timeout`, `memoryLimit`, `enableTrace`.

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

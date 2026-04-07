# Architecture Reference

## Package Relationships

```
@utcp/code-mode@1.2.11          ← upstream library (raw sandbox + UTCP client)
    ↓ wraps
@code-mode/core                  ← production engine (caching, tracing, composition)
    ↓ consumed by
n8n-nodes-utcp-codemode@2.1.0   ← n8n community node (thin wrapper)
code-mode-tools@0.2.0           ← CLI + MCP server (standalone)
n8nac-tools@1.0.0               ← CLI + MCP wrapper for n8nac commands
```

## @code-mode/core (platform-agnostic SDK)

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
- `schema-to-ts.ts` — JSON Schema → TypeScript converter
- `cache.ts` — Internal setup caching (always-on, FIFO at 16 entries)
- `types.ts` — ToolDefinition, ExecutionResult, ExecutionOptions, etc.

Exported types: `CodeModeEngine`, `ExecutionOptions`, `ExecutionResult`, `ToolLike`, `CallToolFn`, etc.

## n8n Wrapper (thin node)

```
[Sibling Tools] → Code-Mode Tool → AI Agent
  → getInputConnectionData(AiTool) discovers siblings
  → siblingAdapter.ts converts LangChain → ToolLike[] + CallToolFn
  → engine.execute(code, { ..., externalTools, externalCallToolFn })
  → sandbox calls both manual.mcp_tool() and sibling.toolName()
```

Key files (in monorepo at ~/projects/n8n-nodes-utcp-codemode/):
- `packages/n8n/nodes/CodeModeTool/CodeModeTool.node.ts` — Thin wrapper
- `packages/n8n/nodes/CodeModeTool/siblingAdapter.ts` — LangChain → ToolLike adapter
- `packages/n8n/nodes/CodeModeTool/presets.ts` — MCP preset configs

Six configurable parameters: `autoRegisterSiblings`, `mcpPresets`, `toolSources`, `timeout`, `memoryLimit`, `enableTrace`.

## n8n Access (WSL → Windows)

```bash
WIN_IP=$(powershell.exe -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'vEthernet (WSL*)').IPAddress" | tr -d '\r\n')
curl -s "http://$WIN_IP:5678/api/v1/workflows" -H "X-N8N-API-KEY: $(python3 -c 'import json; print(json.load(open("/home/mj/.config/n8nac-nodejs/Config/credentials.json"))["hosts"]["http://localhost:5678"])')"
```

Start n8n: `powershell.exe -Command "Set-Location C:\Users\User; Start-Process cmd -ArgumentList '/c','n8n start' -WindowStyle Hidden"`

n8nac credentials at `~/.config/n8nac-nodejs/Config/credentials.json`.

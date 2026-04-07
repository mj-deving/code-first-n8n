# Architecture: How the Pieces Fit

## Component Map

```
@utcp/code-mode (upstream)          @code-mode/core (ours)           Wrappers
────────────────────────           ─────────────────────           ──────────
CodeModeUtcpClient                 CodeModeEngine                  n8n node
  - V8 sandbox (isolated-vm)         - Setup caching (FIFO/16)      - supplyData() thin wrapper
  - UTCP tool registration            - Execution tracing            - Sibling auto-register
  - TypeScript compilation             - External tool composition    - MCP presets UI
                                       - Collision-safe bridges
                                       - Security hardening        MCP server
                                       - 47 tests                    - Standalone stdio server
                                                                     - tools.json config
                                                                     - 22 tests
```

## Package Relationships

```
@utcp/code-mode@1.2.11          ← upstream library (raw sandbox + UTCP client)
    ↓ wraps
@code-mode/core                  ← our production engine (caching, tracing, composition)
    ↓ consumed by
n8n-nodes-utcp-codemode@2.1.0   ← n8n community node (thin wrapper)
code-mode-tools@0.2.0      ← MCP server (standalone, any MCP client)
```

## @code-mode/core — The Engine

Platform-agnostic SDK that wraps the upstream library with production features:

```typescript
const engine = await CodeModeEngine.create();

// Register tool sources (MCP servers, HTTP APIs)
await engine.registerToolSource({
  name: "fs",
  call_template_type: "mcp",
  config: { mcpServers: { filesystem: { transport: "stdio", command: "node", args: [...] } } }
});

// Execute code in sandbox
const result = await engine.execute(code, {
  timeout: 30000,
  memoryLimit: 128,
  enableTrace: true,           // → ToolCallRecord[] with timing
  externalTools: [...],        // v2.1: merge additional tools
  externalCallToolFn: fn       // v2.1: route external tool calls
});

// Get LLM-ready tool description
const description = engine.getToolDescription();

engine.close();
```

**What core adds over upstream:**
| Feature | Upstream | Core |
|---|---|---|
| Setup caching | None | FIFO at 16 entries, keyed by configHash |
| Execution tracing | None | ToolCallRecord[] with per-call timing |
| External tool composition | None | externalTools + externalCallToolFn API |
| Collision-safe bridges | None | Namespaced console + tool bridges in isolate |
| Test coverage | 18 tests (1 stale) | 47 tests (engine, schema, replay, integration) |

## n8n Node — Thin Wrapper

```
[Sibling Tools] → Code-Mode Tool → AI Agent
  → getInputConnectionData(AiTool) discovers siblings
  → siblingAdapter.ts converts LangChain → ToolLike[] + CallToolFn
  → engine.execute(code, { externalTools, externalCallToolFn })
  → sandbox calls both manual.mcp_tool() and sibling.toolName()
```

Six configurable parameters: `autoRegisterSiblings`, `mcpPresets`, `toolSources`, `timeout`, `memoryLimit`, `enableTrace`.

**Critical pattern:** All heavy imports (`@code-mode/core`, `@utcp/mcp`, `@langchain/core/tools`, `zod`) are lazy — `await import()` inside `supplyData()`. Eager imports crash n8n on Windows (isolated-vm native addon loaded at startup).

## MCP Server — Universal Adapter

Exposes `execute_code_chain` and `list_available_tools` as MCP tools over stdio. Any MCP-compatible client (Claude Desktop, Claude Code, Cursor, Windsurf) can use code-mode.

```json
{
  "mcpServers": {
    "code-mode": {
      "command": "node",
      "args": ["/path/to/code-mode-tools/dist/index.js"],
      "env": { "TOOLS_CONFIG": "/path/to/tools.json" }
    }
  }
}
```

## Moat Over Upstream

The upstream `@utcp/code-mode` is a raw client library — it creates sandboxes and registers tools. Our value layer:

1. **Production engine** — caching, tracing, lifecycle management
2. **Platform wrappers** — n8n node, MCP server (upstream has neither)
3. **Proven benchmarks** — 96% savings documented and reproducible
4. **Workflow knowledge** — n8nac + code-mode lifecycle framing
5. **POC templates** — reusable, tested automation patterns

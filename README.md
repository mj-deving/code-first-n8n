# Code-First n8n

**Cut AI Agent token costs by 96%. Make n8n fully code-first — from authoring through production.**

This repo proves that two tools together cover the entire n8n workflow lifecycle without clicking:

- **[n8nac](https://github.com/mj-deving/n8n-autopilot)** — code-first *development* (write, deploy, test, debug from terminal)
- **[code-mode](https://github.com/universal-tool-calling-protocol/code-mode)** — code-first *runtime* (collapse N LLM calls → 1 sandboxed execution)

## The Lifecycle

| Layer | Tool | Status |
|---|---|---|
| **Write workflows** | n8nac TypeScript (.workflow.ts) | Code-first today |
| **Deploy workflows** | n8nac push CLI | Code-first today |
| **Test workflows** | code-mode test harness | Proven ([POC-01](workflows/01-customer-onboarding/)) |
| **Debug workflows** | code-mode trace + replay | Built into engine |
| **Runtime execution** | code-mode sandbox | **96% token savings** ([benchmarks](playbook/benchmarks.md)) |
| **Visual UI** | Verification only | Still there when you need it |

## Proven Results

5-tool customer onboarding pipeline — validate email → classify company → score tier → generate message → format report:

| Metric | Traditional | Code-Mode | Savings |
|---|---|---|---|
| **LLM API calls** | 11 | 1 | **91%** |
| **Total tokens** | ~18,000 | ~700 | **96%** |
| **Execution time** | 12.5s | 2.5s | **80%** |
| **n8n nodes** | 22 | 3 | **86%** |

## POC Dashboard

Each POC proves one layer of the thesis with real data:

| POC | What It Proves | Status |
|---|---|---|
| [01 — Customer Onboarding](workflows/01-customer-onboarding/) | Runtime: 96% token savings | Benchmarked |
| [02 — MCP Filesystem](workflows/02-mcp-filesystem/) | Real file operations through MCP in sandbox | Verified |
| [03 — Multi-Agent Dispatch](workflows/03-multi-agent-dispatch/) | 16-node workflow → 1 code block | Analyzed |
| [04 — Dev Loop](workflows/agents/04-dev-loop/) | Full lifecycle: n8nac → code-mode end-to-end | Designed |
| [05 — E2E Sibling Tools](workflows/05-e2e-sibling-tools/) | Zero-config tool discovery + execution | **8/8 pass** |

## Install

### n8n Community Node

```bash
# In n8n: Settings → Community Nodes → Install
n8n-nodes-utcp-codemode
```

Or via npm for self-hosted:
```bash
cd ~/.n8n
npm install n8n-nodes-utcp-codemode
# Restart n8n
```

### MCP Server (Claude Desktop, Cursor, any MCP client)

```bash
npm install -g code-mode-tools
```

Add to your MCP config:
```json
{
  "mcpServers": {
    "code-mode": {
      "command": "code-mode-tools",
      "args": ["--config", "tools.json"]
    }
  }
}
```

See [code-mode-tools](https://github.com/mj-deving/code-mode-mcp-server) for full setup.

## How It Works

```
Traditional AI Agent:
  LLM → tool call → LLM → tool call → LLM → tool call → ... → answer
  (11 LLM calls, ~18K tokens, O(n²) context growth)

Code-Mode:
  LLM → writes TypeScript → sandbox executes all tools → answer
  (1 LLM call, ~700 tokens, O(1) constant)
```

The LLM sees one tool: `execute_code_chain`. It writes a TypeScript block that calls all available tools directly inside an [isolated-vm](https://github.com/nickolassanchez/isolated-vm) sandbox. Tool results flow back as return values, not as LLM context.

### With MCP Tools

```typescript
// LLM writes this TypeScript, sandbox executes it:
const files = fs.filesystem_list_directory({ path: "/data" });
const content = fs.filesystem_read_file({ path: files[0] });
return { files: files.length, firstFile: content };
```

### With Sibling Tools (auto-registered)

```typescript
// Calculator Tool connected as sibling — zero config needed:
const sum = sibling.calculator({ a: 100, b: 200 });
return { result: sum }; // { sum: 300 }
```

## Published Packages

| Package | Version | What |
|---|---|---|
| [n8n-nodes-utcp-codemode](https://www.npmjs.com/package/n8n-nodes-utcp-codemode) | 2.1.0 | n8n community node |
| [code-mode-tools](https://www.npmjs.com/package/code-mode-tools) | 0.2.0 | Standalone MCP server |

Built on top of [@utcp/code-mode](https://www.npmjs.com/package/@utcp/code-mode) (upstream library by [UTCP](https://github.com/universal-tool-calling-protocol/code-mode)).

## Create a New Workflow

```bash
./scripts/new-workflow.sh agents/06-slack-triage "Slack Message Triage"
```

This scaffolds a complete workflow directory from [template/](template/) with README, workflow.ts skeleton, test.json stub, and all sections pre-filled. See [TEMPLATE.md](TEMPLATE.md) for the hybrid approach.

**Workflow lifecycle:** Develop in this monorepo → prove with benchmarks → graduate to standalone repo for distribution.

## Deep Dives

| Document | What's Inside |
|---|---|
| [THESIS.md](THESIS.md) | The full thesis — why n8nac + code-mode cover the entire lifecycle |
| [TEMPLATE.md](TEMPLATE.md) | Hybrid workflow template approach (develop → prove → graduate) |
| [Playbook: Lifecycle](playbook/lifecycle.md) | Portable framing of the code-first n8n story |
| [Playbook: Benchmarks](playbook/benchmarks.md) | Token savings data, methodology, cost projections |
| [Playbook: Architecture](playbook/architecture.md) | How @code-mode/core, n8n node, and MCP server fit together |
| [CLAUDE.md](CLAUDE.md) | Build commands, architecture, workflow development guide |

## LLM Compatibility

| Provider | Status |
|---|---|
| Claude (Anthropic) | Works — reliable code generation + tool calling |
| GPT-4o (OpenAI) | Works — excellent TypeScript generation |
| Gemini 2.0 Flash (Google) | Partial — code generation works, MCP tool calling broken |

## License

MPL-2.0

---

Built by [@mj-deving](https://github.com/mj-deving)

# Code-First n8n

![n8n](https://img.shields.io/badge/n8n-2.11.2-orange.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Workflows](https://img.shields.io/badge/workflows-5%2F5%20complete-brightgreen.svg)
![Token Savings](https://img.shields.io/badge/token%20savings-96%25-blue.svg)

**96% fewer tokens. 80% faster. 86% fewer nodes. Make n8n fully code-first -- from authoring through production.**

This repo proves that two tools together cover the entire n8n workflow lifecycle without clicking:

- **[n8nac](https://github.com/mj-deving/n8n-autopilot)** — code-first *development* (write, deploy, test, debug from terminal)
- **[code-mode](https://github.com/universal-tool-calling-protocol/code-mode)** — code-first *runtime* (collapse N LLM calls → 1 sandboxed execution)

## Evolution

This project didn't start here. It evolved through three phases:

```
n8n-autopilot (2025)          n8nac matures (2026-Q1)       code-mode integration (2026-Q1/Q2)
─────────────────────    →    ─────────────────────    →    ──────────────────────────────
Built workflows in n8n        Built the tool that            Built the runtime that
manually. Felt the pain       writes workflows from          executes them in one shot.
of click-driven dev.          TypeScript. Dev-time solved.   Runtime solved.
German UI, 16-node WFs,       n8nac push/pull/verify,        isolated-vm sandbox,
check-secrets.sh born here.   .workflow.ts format,           96% token savings,
                              code-as-config thesis forms.   full lifecycle proven.
```

**[n8n-autopilot](https://github.com/mj-deving/n8n-autopilot)** proved the pain — complex workflows are unmaintainable in a visual UI. **n8nac** solved dev-time by making workflows code-first. **code-mode** solved runtime by collapsing N tool calls into one sandboxed execution. This proving ground brings both together and measures the results.

## The Lifecycle

| Layer | Tool | Status |
|---|---|---|
| **Write workflows** | n8nac TypeScript (.workflow.ts) | Code-first today |
| **Deploy workflows** | n8nac push CLI | Code-first today |
| **Test workflows** | code-mode test harness | Benchmarked ([POC-01](workflows/01-customer-onboarding/)) |
| **Debug workflows** | code-mode trace + replay | Built into engine |
| **Runtime execution** | code-mode sandbox | **96% token savings** ([benchmarks](playbook/benchmarks.md)) |
| **Visual UI** | Verification only | Still there when you need it |

## Benchmark Results

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
| [01 — Customer Onboarding](workflows/01-customer-onboarding/) | Runtime: 96% token savings | **Complete** — [benchmarked](workflows/01-customer-onboarding/benchmark.md) |
| [02 — MCP Filesystem](workflows/02-mcp-filesystem/) | Real file operations through MCP in sandbox | **Complete** — [verified](workflows/02-mcp-filesystem/benchmark.md) |
| [03 — Multi-Agent Dispatch](workflows/03-multi-agent-dispatch/) | 16-node workflow → 3 nodes (81% reduction) | **Complete** — [implemented](workflows/03-multi-agent-dispatch/benchmark.md) |
| [04 — Dev Loop](workflows/agents/04-dev-loop/) | Full lifecycle in one prompt (11.5s, $0.05) | **Complete** — [E2E proven](workflows/agents/04-dev-loop/benchmark.md) |
| [05 — E2E Sibling Tools](workflows/05-e2e-sibling-tools/) | Zero-config tool discovery + execution | **Complete** — [8/8 pass](workflows/05-e2e-sibling-tools/benchmark.md) |

## Repo Map

| Directory | What |
|---|---|
| `workflows/` | POC workflow directories (the proving ground) |
| `n8n-nodes-utcp-codemode/` | npm monorepo: `@code-mode/core` SDK + n8n community node |
| `code-mode-mcp-server/` | Standalone MCP server wrapping CodeModeEngine (separate npm package) |
| `repo/` | Cloned upstream [UTCP code-mode](https://github.com/universal-tool-calling-protocol/code-mode) library (read-only reference) |
| `n8n-autopilot/` | Cloned [n8nac](https://github.com/mj-deving/n8n-autopilot) (read-only reference) |
| `playbook/` | Portable knowledge: lifecycle framing, benchmarks, architecture |
| `docs/` | ADRs and design documents |
| `template/` | Scaffold source for new workflow directories |
| `scripts/` | Tooling (new-workflow, check-secrets) |
| `archive/` | Original research artifacts from exploration phase |
| `null/` | Empty placeholder (artifact from early scaffolding) |

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

The same binary works as a CLI (see [ADR-0001](docs/decisions/ADR-0001-cli-first-over-mcp-only.md)):

```bash
# Execute a code chain directly from terminal or any AI agent's Bash tool
code-mode-tools exec "const files = fs.filesystem_list_directory({ path: '.' }); return files;" --config tools.json

# Discover available tools (human-readable or --json for machines)
code-mode-tools list-tools --config tools.json
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

This scaffolds a complete workflow directory from [template/](template/) with README, workflow.ts skeleton, test.json stub, and all sections pre-filled. See [docs/TEMPLATE.md](docs/TEMPLATE.md) for the workflow template requirements.

**Workflow lifecycle:** Develop in this monorepo → prove with benchmarks → distribute via n8n community templates and blog posts.

## Deep Dives

| Document | What's Inside |
|---|---|
| [docs/TEMPLATE.md](docs/TEMPLATE.md) | Workflow template requirements and lifecycle |
| [Playbook: Lifecycle](playbook/lifecycle.md) | Portable framing of the code-first n8n story |
| [Playbook: Benchmarks](playbook/benchmarks.md) | Token savings data, methodology, cost projections |
| [Playbook: Architecture](playbook/architecture.md) | How @code-mode/core, n8n node, and MCP server fit together |
## Contributing

```bash
# Build n8n community node (monorepo)
cd n8n-nodes-utcp-codemode && npm run build && npm test

# Scaffold a new workflow
./scripts/new-workflow.sh agents/06-slack-triage "Slack Message Triage"

# Check for secrets before committing
npm run check-secrets

# Check n8n execution results
npm run check-exec -- <workflowId>
```

AI agents: see [AGENTS.md](AGENTS.md) for the n8nac workflow protocol.

## LLM Compatibility

| Provider | Status |
|---|---|
| Claude (Anthropic) | Works — reliable code generation + tool calling |
| GPT-4o (OpenAI) | Works — excellent TypeScript generation |
| Gemini 2.0 Flash (Google) | Partial — code generation works, MCP tool calling broken |

## License

MIT

---

Built by [@mj-deving](https://github.com/mj-deving)

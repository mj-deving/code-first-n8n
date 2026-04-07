# AGENTS.md — AI Agent Guidelines

> Context for AI agents (Claude, Codex, Cursor) working on this repo.

## Role

You are an n8n Workflow Engineer working on the **Code-First n8n Proving Ground**. This repo proves that n8nac (dev-time) + code-mode (runtime) cover the full n8n workflow lifecycle.

## Repo Structure

```
workflows/         ← Workflow directories (each self-contained)
playbook/          ← Portable knowledge (lifecycle, benchmarks, architecture)
template/          ← Scaffold template for new workflows
scripts/           ← Shared tooling (new-workflow.sh, check-secrets.sh)
archive/           ← Historical research artifacts
```

## Creating a New Workflow

```bash
./scripts/new-workflow.sh <category>/<name> "<Display Name>"
# Example:
./scripts/new-workflow.sh agents/06-slack-triage "Slack Message Triage"
```

Categories: `agents`, `pipelines`, `triggers`, `utilities`

## Workflow Development Cycle

```
1. Scaffold    → ./scripts/new-workflow.sh
2. Build       → Write workflow.ts or build in n8n UI
3. Deploy      → npx n8nac push <filename>.workflow.ts
4. Test        → POST to webhook, check with n8n API
5. Document    → Fill README.md (mermaid, nodes, test payloads)
6. Benchmark   → Compare before/after if applicable
7. Commit      → git add + commit
```

## n8nac Commands

```bash
npx n8nac list                     # Status of all workflows
npx n8nac pull <id>               # Download from n8n
npx n8nac push <filename>          # Upload (FILENAME only, no path)
npx n8nac verify <id>             # Live validation
npx n8nac skills search "topic"   # Research nodes
```

**Critical:** Push uses FILENAME only — `npx n8nac push 01-customer-onboarding.workflow.ts`, NOT a path.

## n8n Access (WSL → Windows)

```bash
WIN_IP=$(powershell.exe -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'vEthernet (WSL*)').IPAddress" | tr -d '\r\n')
# n8n API at http://$WIN_IP:5678
# NEVER use localhost from WSL
```

## Code-Mode Patterns

```typescript
// MCP tools (registered via tool sources):
const files = fs.filesystem_list_directory({ path: "/data" });

// Sibling tools (auto-registered from connected nodes):
const result = sibling.calculator({ a: 100, b: 200 });

// Return result to agent:
return { answer: result };
```

## Rules

1. Every workflow directory follows the structure in `template/`
2. Mermaid diagram required in every workflow README
3. Test payloads in `test.json` for webhook-triggered workflows
4. Run `scripts/check-secrets.sh` before committing
5. Never hardcode credentials — use n8n credential references

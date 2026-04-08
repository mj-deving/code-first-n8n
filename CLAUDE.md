# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Code-First n8n Proving Ground.** Proves the n8nac + code-mode lifecycle thesis and produces verified workflow templates. See [THESIS.md](THESIS.md) for the framing, [STATUS.md](STATUS.md) for current state.

## Structure

- `THESIS.md` — **Front door: the n8nac + code-mode lifecycle thesis**
- `playbook/` — **Portable knowledge** (lifecycle, benchmarks, architecture)
- `workflows/` — **Workflow templates** — each proves a layer of the thesis
- `template/` — Scaffold template for new workflows
- `scripts/` — Shared tooling (new-workflow.sh, check-secrets.sh)
- `n8n-nodes-utcp-codemode/` — n8n community node (npm)
- `code-mode-mcp-server/` — CLI + MCP server (npm package renamed to code-mode-tools, directory kept as code-mode-mcp-server)
- `repo/` — Upstream `universal-tool-calling-protocol/code-mode` (read-only)
- `n8n-autopilot/` — `mj-deving/n8n-autopilot` (read-only)
- `archive/` — Research artifacts from exploration phase
- `docs/decisions/` — ADRs (ADR-0001: CLI-first over MCP-only)

## Workflow Development

```bash
./scripts/new-workflow.sh <category>/<name> "<Display Name>"
```

Cycle: scaffold → build → `npx n8nac push <filename>` → test → document → commit.

See `.ai/guides/build.md` for full build/test commands across all packages.

## Build Quick Reference

```bash
# Monorepo (n8n node): build core first, then n8n
cd n8n-nodes-utcp-codemode && npm run build && npm test  # 78 tests

# code-mode-tools
cd ~/projects/code-mode-mcp-server && npm run build && npm test  # 44 tests

# n8nac-tools
cd ~/projects/n8nac-tools && npm run build && npm test  # 50 tests
```

See `.ai/guides/build.md` for per-package details.

## Architecture

See `.ai/guides/architecture.md` for full architecture, package relationships, and n8n access.
Key: `@code-mode/core` wraps upstream → consumed by n8n node + code-mode-tools + n8nac-tools.

## Critical Gotchas

- **NEVER `pkill -f "n8n"`** — kills Claude Code too (working dir contains "n8n"). Kill by PID only.
- **WSL2 → Windows**: Use vEthernet IP (`172.31.224.1`), NOT `localhost`
- **n8nac push**: ONLY filename, no path — `npx n8nac push workflow.ts`
- **Lazy imports mandatory**: `@code-mode/core`, `@utcp/mcp`, `@langchain/core/tools`, `zod` must be `await import()` inside `supplyData()`. Eager import crashes n8n on Windows.
- **Build order**: Core before n8n (`packages/core/dist/` must exist)
- **MCP transport: "stdio" required**: Without it, `@utcp/mcp` throws "Unsupported MCP transport: undefined"
- **Gemini + MCP**: Gemini calls tools but returns empty results. Use Claude/GPT-4o.
- **Sibling tool args**: Use `args ?? {}` not `args || {}` (falsy primitives are valid args)
- **CLI-first** (ADR-0001): Same binary for CLI + MCP. Detect TTY vs pipe.

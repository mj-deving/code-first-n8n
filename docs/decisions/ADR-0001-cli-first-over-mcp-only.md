---
summary: "Prefer CLI-first design over MCP-only -- same binary serves humans, AI agents, and MCP clients"
read_when: ["cli", "mcp", "architecture", "tool design", "binary", "transport"]
status: accepted
updated: 2026-04-07
---

# ADR-0001: CLI-First Over MCP-Only

## Status

Accepted

## Date

2026-04-07

## Context

The code-mode proving ground builds tools that serve two audiences: human developers at a terminal and AI agents calling tools programmatically. Our first platform extension (code-mode-mcp-server v0.1.0) shipped as an MCP-only server. That works for MCP clients (Claude Desktop, Cursor, Claude Code), but it is invisible to anything that does not speak JSON-RPC over stdio.

At the same time, every AI coding agent already has access to a Bash tool. A CLI binary is callable by any agent without protocol negotiation, schema exchange, or client libraries. This raises a design question for every new tool we build in this repo: should the primary interface be MCP, CLI, or both?

Three observations from shipping @code-mode/core and the MCP server:

1. **MCP framing is expensive.** Every MCP call carries JSON-RPC envelope, tool schemas in the LLM context window, and content-type metadata. For a tool that takes a string of code and returns a string of output, that framing can exceed the payload itself.

2. **Humans cannot use MCP directly.** Debugging an MCP server requires a JSON-RPC client or an MCP inspector. A CLI is testable with `echo "input" | tool` or `tool exec "code"` -- no special tooling needed.

3. **The sandbox (isolated-vm) does not care how it was invoked.** The core engine is already platform-agnostic. The interface layer is a thin shell. Making that shell a CLI first costs nothing and gains a universal entry point.

## Decision

Build every new tool in this repo as a CLI-first binary. MCP support is added as a runtime mode of the same binary, not a separate program.

The pattern:

```
CLI-first binary:
  tool exec "code" --config config.json    -> human/AI direct use
  tool list-tools --config config.json     -> human/AI discovery
  echo '{"jsonrpc":"2.0",...}' | tool      -> MCP client use (auto-detected)
```

Detection logic: if `process.stdin.isTTY` is true or a subcommand is present, run in CLI mode. If stdin is a pipe carrying JSON-RPC, switch to MCP mode. Same binary, same process, same core engine underneath.

Specific rules:

- **CLI is the primary interface.** All functionality must be usable via CLI flags and subcommands before MCP wrapping begins.
- **MCP is a transport adapter.** It adds auto-discovery (`tools/list`) and schema validation on top of CLI capabilities, but never gates functionality behind MCP-only paths.
- **Tests target CLI first.** Shell-script tests (`tool exec ... | jq .result`) validate core behavior. MCP protocol tests are integration-level, not the primary test surface.
- **One binary ships.** No separate `tool-cli` and `tool-mcp-server` packages. Single entry point, runtime dispatch.

## Consequences

### What improves

- **Token efficiency.** CLI invocations skip JSON-RPC framing and schema overhead. An agent calling `tool exec "code"` via Bash sends fewer tokens than an MCP tool call with full schema in context.
- **Universal accessibility.** Any agent with a Bash tool can use CLI tools. MCP requires an MCP-compatible client, which not every platform provides.
- **Testability.** CLI tools are testable with shell scripts, bun test, or manual invocation. No JSON-RPC client required for basic validation.
- **Debuggability.** When something breaks, `tool exec "code" --verbose` gives immediate output. MCP failures require inspecting JSON-RPC message logs.
- **Core logic stays clean.** Because CLI is the first consumer, the core engine can never become coupled to MCP transport details.

### What gets harder

- **Schema validation is opt-in, not automatic.** MCP provides input schema validation via JSON Schema definitions in `tools/list`. CLI mode relies on argument parsing and manual validation. Tool authors must handle bad input explicitly in CLI paths.
- **Auto-discovery is weaker in CLI.** MCP's `tools/list` returns structured schemas with descriptions, types, and required fields. CLI offers `--help` text, which is less machine-parseable. For integration scenarios (connecting tools to LLM context), MCP discovery remains superior.
- **Some clients are MCP-only.** Claude Desktop (Windows Store) cannot invoke CLI tools directly -- it requires MCP servers registered in its config. For these clients, the MCP adapter path is mandatory, not optional.
- **TTY detection has edge cases.** Piped input that is not JSON-RPC (e.g., piped plaintext) could confuse auto-detection. The detection heuristic must be robust: check for subcommand first, then fall back to stdin content sniffing.

### Mitigations

- MCP adapter mode preserves all MCP benefits (schema validation, auto-discovery, structured errors) for clients that need them.
- The `--json` flag on CLI commands produces machine-parseable output, partially closing the discovery gap.
- TTY detection uses a priority chain: explicit subcommand > `--mcp` flag > `process.stdin.isTTY` check > first-byte sniffing of stdin.

## References

- code-mode-mcp-server v0.1.0: first MCP-only tool in this repo
- @code-mode/core v2.1.0: platform-agnostic engine (already transport-independent)
- THESIS.md: code-first philosophy that motivates CLI-first design
- Article II of the Nine Articles: "Every library MUST expose functionality through CLI"

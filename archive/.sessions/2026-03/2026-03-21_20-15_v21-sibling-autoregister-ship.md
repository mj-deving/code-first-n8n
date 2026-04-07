# Session: v2.1 Sibling Auto-Register — Plan, Build, Ship

**Date:** 2026-03-21 20:15
**Duration:** ~3 hours
**Mode:** full
**Working Directory:** ~/projects/code-mode

## Summary

Planned, implemented, tested, deployed, published, and documented v2.1.0 of the code-mode monorepo. The headline feature is auto-registering sibling tool sub-nodes — when Code-Mode Tool is connected alongside other tools on an AI Agent, those siblings are automatically discoverable and callable from inside the code-mode sandbox. Also conducted MCP preset deprecation analysis, decided not to add new presets (Option B), and updated all documentation.

## Work Done

- Researched 3 critical unknowns via parallel ClaudeResearcher agents (n8n AiTool inputs, MCP server deprecation, Zod version)
- First Principles analysis → minimal core change (externalTools/externalCallToolFn on ExecutionOptions)
- Wrote full 628-line implementation plan at `MEMORY/WORK/20260321-180000_v21-features-plan/v21-implementation-plan.md`
- Generated visual HTML plan at `~/.agent/diagrams/code-mode-v21-plan.html`
- Implemented v2.1 across 7 files (5 modified, 2 new) in `~/projects/n8n-nodes-utcp-codemode/`
- 67 tests passing (47 core + 20 n8n)
- /simplify review (3 parallel agents) → fixed Set-based dispatch, imported types from core
- Committed `433c1e9`, pushed to GitHub
- Built and deployed to Windows n8n (rsync → staging → npm install → restart)
- Published `code-mode-core@2.1.0` + `n8n-nodes-utcp-codemode@2.1.0` to npm
- Updated 8 documentation files (STATUS.md, CLAUDE.md, README.md, MEMORY.md, project_v21, synthesis, reference)
- Committed README docs update `c15eb0c`, pushed to GitHub

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Option B — no new MCP presets | All @modelcontextprotocol servers deprecated/archived. Presets are just config strings pointing at external packages. Not worth maintaining. | Option A (don't care, ship with warnings), Option C (find community replacements) |
| Minimal core change (externalTools on ExecutionOptions) | First Principles: sandbox only needs ToolLike[] + CallToolFn — both already platform-agnostic. ~20-line core change. | Modify sandbox/bridges directly, bypass engine entirely |
| Set-based dispatch for external tools | /simplify caught O(n) .some() on hot path. Built Set<string> once before sandbox entry. | Keep .some() (works but O(n) per tool call) |
| Import ToolLike/CallToolFn from core in adapter | /simplify caught type duplication. siblingAdapter should use core's types. | Keep local type definitions (intentional decoupling but drift risk) |
| Inject toJsonSchemaFn into adapter | Avoids LangChain import in adapter module definition. Caller provides the converter. | Import @langchain/core directly in adapter |

## Key Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `packages/core/src/types.ts` | edited | Added externalTools + externalCallToolFn to ExecutionOptions |
| `packages/core/src/engine.ts` | edited | Merge external tools, compose callToolFn with Set dispatch |
| `packages/core/src/index.ts` | edited | Export ToolLike + CallToolFn types |
| `packages/n8n/nodes/CodeModeTool/CodeModeTool.node.ts` | edited | AiTool input, autoRegisterSiblings, sibling discovery wiring |
| `packages/n8n/nodes/CodeModeTool/siblingAdapter.ts` | created | LangChain → ToolLike adapter |
| `packages/n8n/__tests__/siblingAdapter.test.ts` | created | 10 test cases |
| `packages/n8n/__tests__/CodeModeTool.test.ts` | edited | +2 tests (AiTool input, autoRegister property) |
| `README.md` | edited | Auto-register docs, MCP deprecation note |

## Learnings

- All `@modelcontextprotocol/server-*` packages are deprecated/archived by Anthropic — including the 5 existing presets (Filesystem, GitHub, Brave, SQLite, Memory). SQLite removed from npm entirely.
- n8n's AgentToolV2 proves tool sub-nodes CAN accept AiTool inputs with `required: false`
- LangChain @1.1.34 ships `toJsonSchema()` at `@langchain/core/utils/json_schema` — handles Zod v3 and v4
- Zod v4.3.6 is installed, has native `z.toJSONSchema()`
- Agent worktree isolation fails when CWD is not a git repo — need to ensure CWD matches the target repo
- Direct implementation was faster than multi-agent for this scope (~7 files)

## Open Items

- [ ] E2E test with real sibling tools in n8n UI (connect HTTP Tool → Code-Mode → Agent)
- [ ] Revoke stale npm tokens at npmjs.com/settings/mj-deving/tokens
- [ ] Distribution: dev.to / Reddit r/n8n / LinkedIn posts
- [ ] Portfolio site at ~/projects/n8n-portfolio

## Context for Next Session

v2.1.0 is shipped, published, deployed, and documented. The sibling auto-register feature hasn't been E2E tested with real sibling tools yet (requires n8n UI). Next priorities are distribution (writing posts about code-mode) and the portfolio site. All MCP presets are deprecated — might need community alternatives in a future version.

# Session: v2.0 Monorepo Extraction, Publish, Deploy

**Date:** 2026-03-21 18:30
**Duration:** ~3 hours
**Mode:** full
**Working Directory:** ~/projects/code-mode

## Summary

Extracted platform-agnostic `code-mode-core` SDK from the n8n community node into a monorepo with npm workspaces. Added sandbox replay (execution tracing), internal setup caching, and fixed all review findings. Published both packages to npm. Deployed v2.0 to Windows n8n. Wrote 16 integration tests with real isolated-vm execution.

## Work Done

- Extracted `code-mode-core@2.0.0` as platform-agnostic SDK (CodeModeEngine, SandboxManager, bridges, schema-to-ts, cache)
- Converted repo to npm workspaces monorepo (packages/core + packages/n8n)
- Copied ~370 lines sandbox code from upstream @utcp/code-mode (MPL-2.0 attributed)
- Added Sandbox Replay: enableTrace → ToolCallRecord[] with timing + ExecutionStats
- Added internal setup caching: always-on, FIFO eviction at 16 entries
- Added engine lifecycle caching: keyed by configHash across supplyData() calls
- Security: prototype pollution guard (RESERVED_NAMES), sanitizer collision detection
- Fixed engine.close() to call client.close() (Codex review finding)
- Fixed execute() to register tools (was creating empty sandbox)
- Fixed engine cache: keyed by configHash not 'default'
- Added ExecutionResult.error field for distinguishing failures from null
- Published code-mode-core@2.0.0 and n8n-nodes-utcp-codemode@2.0.0 to npm
- Deployed v2.0 to Windows n8n — node loads, workflows intact
- Wrote portability proof (examples/standalone.ts)
- Wrote 16 integration tests with real isolated-vm sandbox
- Created code-mode research workspace as private git repo
- Updated CLAUDE.md and STATUS.md for v2.0 architecture
- Drafted v2.1 auto-register siblings plan

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Copy sandbox code instead of wrapping | Upstream methods are private; owning gives freedom to optimize | Wrapping CodeModeUtcpClient (fragile, can't instrument) |
| No ToolBackend interface yet | Only one platform exists; design interface when second backend arrives | Abstract interface upfront (YAGNI) |
| Composition over inheritance for replay | Instance-level callTool wrapping, no subclass needed | Subclassing CodeModeEngine (coupling risk) |
| Unscoped npm name (code-mode-core) | @code-mode org doesn't exist on npm; unscoped is simplest | @mj-deving/core (too personal), create npm org (manual step) |
| FIFO cache eviction at 16 | Simple, bounded, covers typical usage (1-2 configs) | LRU (complexity not justified), unbounded (memory leak) |

## Key Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| packages/core/src/engine.ts | created | CodeModeEngine class — orchestrates sandbox execution |
| packages/core/src/sandbox.ts | created | SandboxManager — only isolated-vm importer |
| packages/core/src/bridges.ts | created | Console + tool bridges with collision detection |
| packages/core/src/schema-to-ts.ts | created | JSON Schema → TypeScript converter (from upstream) |
| packages/core/src/cache.ts | created | Internal setup caching with FIFO eviction |
| packages/core/src/types.ts | created | ToolDefinition, ExecutionResult, ExecutionOptions |
| packages/n8n/nodes/CodeModeTool/CodeModeTool.node.ts | created | Thin wrapper (~360 lines, ~100 logic) |
| packages/core/__tests__/integration.test.ts | created | 16 real sandbox tests |
| examples/standalone.ts | created | Portability proof |
| package.json | modified | Converted to workspace root |

## Learnings

- n8n property declarations are ~130 lines of irreducible boilerplate — "100 line node" target is unrealistic
- engine.close() must call client.close() — resource lifecycle is first-class when wrapping SDKs
- /simplify finds code quality issues; Codex finds lifecycle/semantic bugs — use both
- Codex runs in read-only sandbox — can design patches but can't apply them
- npm scoped packages require org creation on npmjs.com (can't do via CLI)
- Integration tests with real isolated-vm are fast (~200ms each) and catch bugs mocks miss

## Open Items

- [ ] Revoke stale npm tokens at npmjs.com/settings/mj-deving/tokens
- [ ] Distribution: dev.to / Reddit r/n8n / LinkedIn
- [ ] v2.1: auto-register sibling tools (plan at project_v21_auto_register.md)
- [ ] Portfolio site: ~/projects/n8n-portfolio

## Context for Next Session

v2.0 is shipped and deployed. Both npm packages published. 56 tests pass. v2.1 plan is drafted — the first step is prototyping whether n8n allows AiTool inputs on tool sub-nodes (1h, high-risk gate). If it works, the sibling adapter is ~12h of work. If blocked, need graph walk fallback.

# Session: npm publish, MCP integration, rebrand, strategic analysis

**Date:** 2026-03-21 09:00
**Duration:** ~12 hours (2026-03-20 21:00 → 2026-03-21 09:00)
**Mode:** full
**Working Directory:** ~/projects/code-mode

## Summary

Massive session that took the code-mode project from "POC ready" to "rebranded, published, MCP-proven, strategically analyzed." Shipped 9 npm releases (v0.1.0 → v1.1.0), created a public GitHub repo, proved MCP integration end-to-end with Claude via OpenRouter, ran a full competitive landscape analysis (first-mover confirmed), and conducted a 4-member council debate on strategic direction.

## Work Done

- Created npm account (mj-deving) with 2FA + granular access token
- Published 9 npm releases: v0.1.0 → v1.1.0
- Created clean public GitHub repo: mj-deving/n8n-nodes-utcp-codemode
- Added @utcp/mcp transport for real MCP server support (14 filesystem tools)
- Proved MCP E2E: Claude via OpenRouter reads Windows files through sandbox
- Discovered n8n has dedicated `lmChatOpenRouter` node type (not OpenAI node)
- Created OpenRouter credential (openRouterApi type) in n8n
- Built MCP server presets UI (fixedCollection with Filesystem, GitHub, Brave, SQLite, Memory)
- Rebranded: dropped UTCP from user-facing text, lead with "96% fewer tokens"
- Added output transparency (_codeMode section with token savings estimation)
- Created example workflow (examples/filesystem-demo.json)
- Wrote community post, posted, flagged for AI content, rewrote casual version
- Made KI-Roadmap repo private
- Created n8n-portfolio project (private repo)
- Full competitive analysis: no n8n competitor, pattern validated by Anthropic PTC, LangGraph CodeAct, Manus
- Council debate (4 members, 3 rounds): consensus to skip v1.5, ship-rebrand-post
- Planned v1.5 auto-register siblings in detail (prototype-first approach)
- Planned MCP presets (shipped same session)
- Created STATUS.md masterdoc
- Saved strategic direction to memory

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Drop UTCP from user-facing text | UTCP is niche, no brand recognition. "96% fewer tokens" is the story | Keep UTCP branding |
| Use fixedCollection for presets | More reliable than multiOptions + displayOptions for dynamic config | multiOptions with displayOptions, pure JSON |
| Use lmChatOpenRouter node (not lmChatOpenAi) | OpenAI node doesn't support custom base URLs | lmChatOpenAi with baseURL hack |
| Skip v1.5 auto-registration (for now) | Council: 3/4 say defer. Build ahead of users but focus on UX first | Build v1.5 immediately |
| Build ahead of users | Marius's preference. Goal is reputation, not revenue | Wait for user signal |
| require.resolve() for MCP server paths | Cross-platform, falls back to npx | Hardcoded paths, bundled deps |
| transport: "stdio" in MCP config | Required by @utcp/mcp, discovered through debugging | (none — it's the only option) |

## Key Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| n8n-nodes-utcp-codemode/package.json | edited | 9 version bumps, added @utcp/mcp, rebranded description |
| n8n-nodes-utcp-codemode/nodes/CodeModeTool/CodeModeTool.node.ts | edited | MCP import, presets merge, output transparency, rebrand |
| n8n-nodes-utcp-codemode/nodes/CodeModeTool/presets.ts | created | MCP server preset configurations |
| n8n-nodes-utcp-codemode/README.md | created+edited | Full README with benchmarks, presets, competitive context |
| n8n-nodes-utcp-codemode/.npmignore | created | Clean package contents |
| n8n-nodes-utcp-codemode/examples/filesystem-demo.json | created | Example workflow |
| code-mode/STATUS.md | created | Project masterdoc |
| code-mode/n8n-community-post.md | edited | Community post, rewritten for casual tone |
| code-mode/.gitignore | created | Excludes cloned repos, PAI internals |

## Learnings

- n8n `lmChatOpenRouter` is a dedicated node type — don't use lmChatOpenAi for OpenRouter
- n8n API treats `active` as read-only — can't activate workflows programmatically
- n8n logs to stdout by default — redirect with `n8n start > file.log 2>&1`
- @utcp/mcp is a separate package, not bundled in @utcp/sdk or @utcp/code-mode
- MCP config MUST have `transport: "stdio"` — fails silently without it
- Gemini calls MCP tools but returns empty results — Claude/GPT-4o needed
- npm 2FA with security keys works for web but not CLI — need TOTP or granular token
- n8n community forum flags AI-generated content

## Open Items

- [ ] Repost community post when n8n forum unblocks (or try dev.to/Reddit/LinkedIn)
- [ ] Explore commercialization angles (consulting, premium, SaaS, courses)
- [ ] Deploy v1.1.0 to Windows n8n, test _codeMode output transparency
- [ ] Revoke stale npm tokens at npmjs.com
- [ ] v1.5 prototype: test AiTool input on tool sub-nodes (2h)
- [ ] Portfolio site at ~/projects/n8n-portfolio

## Context for Next Session

Project is at v1.1.0 with 9 releases shipped. Rebranded away from UTCP, leading with "96% fewer tokens." Full competitive analysis confirmed first-mover position — no n8n competitors. Distribution is the bottleneck (forum flagged). Marius wants to build ahead of users for reputation, not wait for demand. Next technical work: v1.5 sibling auto-registration prototype or more MCP servers. Commercialization angles unexplored.

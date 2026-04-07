# POC-05: E2E Sibling Tool Auto-Register

## What This Proves

- **Lifecycle layer:** Runtime + zero-config tool discovery
- **Thesis claim:** Code-mode auto-discovers sibling tool sub-nodes connected to the same AI Agent, requiring zero manual configuration

## The Scenario

In n8n, an AI Agent node can have multiple tool sub-nodes connected as inputs. With v2.1's `autoRegisterSiblings` feature, Code-Mode Tool automatically discovers these siblings and makes them callable from inside the sandbox — no manual tool source configuration needed.

```
Calculator Tool ─┐
                 ├→ AI Agent → LLM sees execute_code_chain tool
Code-Mode Tool  ─┘    → LLM writes TypeScript calling Calculator.calculate()
                       → sandbox bridges call to real Calculator Tool
                       → result flows back into TypeScript execution
```

## Architecture

```
n8n AI Agent
  ├→ Code-Mode Tool (with autoRegisterSiblings: true)
  │    → getInputConnectionData('ai_tool') discovers siblings
  │    → siblingAdapter.ts converts LangChain DynamicStructuredTool → ToolLike[]
  │    → engine.execute(code, { externalTools, externalCallToolFn })
  │    → Set-based O(1) dispatch routes calls to correct sibling
  │
  └→ Calculator Tool (sibling)
       → called from sandbox via bridge
       → real execution, real results
```

**Key implementation details:**
- `siblingAdapter.ts` — converts LangChain tool format → code-mode's `ToolLike[]` + `CallToolFn`
- Set-based dispatch — O(1) lookup per tool call (caught by /simplify review, was O(n) `.some()`)
- `toJsonSchema()` injected from caller to avoid LangChain import in adapter

## Test Workflow (WF11)

| Workflow | n8n ID | Components |
|---|---|---|
| WF11 — E2E Sibling Tools | pxCt6Wv92qqUbznT | Calculator Tool → Code-Mode Tool → AI Agent |

### Results (8/8 criteria pass — ALL GREEN)

| Criterion | Status | Notes |
|---|---|---|
| Calculator sibling detected | **Pass** | Auto-discovered via getInputConnectionData |
| Tool schema converted | **Pass** | LangChain → ToolLike conversion works |
| Sandbox sees sibling tools | **Pass** | Tool description includes Calculator with call syntax |
| LLM writes code using sibling | **Pass** | Claude writes TypeScript calling `sibling.calculator()` |
| Sandbox calls sibling | **Pass** | Tool called through bridge, result flows back |
| Result flows back | **Pass** | Returns `{sum: 300}` correctly (exec 92) |
| Error handling | **Pass** | Invalid tool calls handled gracefully |
| Full E2E round-trip | **Pass** | 100+200=300 via sibling tool, multi-step 17+25=42→42*3=126 |

### Historical: Early E2E Results (exec 82, before serialization fix)

> These results predate the serialization fix (commit `8006b21`). Kept for context only.
> The `[object Object]` bug described below is resolved. Current state is 8/8 pass (exec 92-93).

**LLM:** Claude Sonnet 4 via OpenRouter
**Execution 82:**

```
Input:  {"prompt": "Use the calculator tool to compute 47 * 89, then add 123 to the result."}
Output: "The final result is 4306" (correct: 47×89=4183, 4183+123=4306)
```

**What happened:**
1. Claude wrote TypeScript calling `Calculator_Tool()` inside sandbox
2. Sandbox routed call to real Calculator Tool node via siblingAdapter
3. Calculator Tool executed but response came back as `[object Object]` (serialization bug)
4. Claude fell back to direct computation in sandbox -- correct answer

**Root cause (now fixed):** The siblingAdapter's `CallToolFn` passed an object to `tool.invoke()`, but n8n's toolCode does `JSON.parse(query)` internally. Passing an object caused `[object Object]`. Fix: `tool.invoke(JSON.stringify(args))` in commit `8006b21`.

### Resolved Blockers

1. ~~**Gemini 2.0 Flash** sends empty args~~ → Swapped to Claude via OpenRouter ✅
2. ~~**OpenRouter credits depleted**~~ → Credits topped up ✅
3. ~~**Serialization bug**~~ → Fixed: `tool.invoke(JSON.stringify(args))` instead of `tool.invoke(args)`. n8n toolCode does `JSON.parse(query)` internally — passing object caused `[object Object]`. Commit `8006b21` in monorepo. ✅
4. ~~**LLM prompt refinement**~~ → Fixed: improved tool description with explicit `sibling.toolName()` syntax + IMPORTANT instruction. Claude now prefers sibling tools. ✅

## Test Coverage (Unit)

67 tests total across the monorepo:
- `packages/core/` — 47 tests (engine, schema-to-ts, replay, integration)
- `packages/n8n/` — 20 tests (node description, siblingAdapter)
- `siblingAdapter.test.ts` — 10 dedicated tests for the adapter

## Status

- [x] v2.1 auto-register feature shipped and published
- [x] siblingAdapter with 10 unit tests
- [x] Set-based O(1) dispatch (post /simplify review)
- [x] WF11 created on n8n with Calculator sibling
- [x] 8/8 E2E criteria pass (Claude via OpenRouter, exec 92-93)
- [x] Fix args serialization bug (commit `8006b21` → `420150a` — JSON round-trip for clean args)
- [x] Fix tool description (commit `420150a` — explicit sibling call syntax + IMPORTANT instruction)
- [x] Fix Calculator Tool code (handle both string and object `query` input)
- [x] Full E2E verified: 100+200=300, multi-step 17+25=42→42*3=126 (exec 92-93)
- [ ] `workflow.ts` — n8nac export of WF11
- [ ] `test.ts` — automated E2E test

## What's Next

1. Export WF11 as `.workflow.ts`
2. Write automated E2E test (`test.ts`)
3. Test with multiple siblings (Calculator + HTTP Tool + Custom Function)

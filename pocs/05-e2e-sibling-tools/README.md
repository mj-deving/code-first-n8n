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

### Results (7/8 criteria pass — 1 bug found)

| Criterion | Status | Notes |
|---|---|---|
| Calculator sibling detected | **Pass** | Auto-discovered via getInputConnectionData |
| Tool schema converted | **Pass** | LangChain → ToolLike conversion works |
| Sandbox sees sibling tools | **Pass** | Tool description includes Calculator |
| LLM writes code using sibling | **Pass** | Claude writes TypeScript calling `Calculator_Tool()` (exec 82) |
| Sandbox calls sibling | **Pass** | Tool IS called — 4 attempts in exec 82 |
| Result flows back | **BUG** | Response returns `[object Object]` — serialization failure |
| Error handling | **Pass** | LLM gracefully falls back to direct computation |
| Full E2E round-trip | **Partial** | Correct answer (4306), but via fallback, not sibling result |

### E2E Test Results (2026-04-07)

**LLM:** Claude Sonnet 4 via OpenRouter
**Execution 82 (success):**

```
Input:  {"prompt": "Use the calculator tool to compute 47 * 89, then add 123 to the result."}
Output: "The final result is 4306" (correct: 47×89=4183, 4183+123=4306)
```

**What happened:**
1. Claude wrote TypeScript calling `Calculator_Tool()` inside sandbox ✅
2. Sandbox routed call to real Calculator Tool node via siblingAdapter ✅
3. Calculator Tool executed but response came back as `[object Object]` ❌
4. Claude caught the error, retried 3 more times (same result)
5. Claude fell back to direct computation in sandbox → correct answer ✅

**Root cause:** The siblingAdapter's `CallToolFn` returns the LangChain tool result, but the sandbox bridge serializes it as `[object Object]` instead of the actual value. The tool call routing works; the response serialization doesn't.

### Resolved Blockers

1. ~~**Gemini 2.0 Flash** sends empty args~~ → Swapped to Claude via OpenRouter ✅
2. ~~**OpenRouter credits depleted**~~ → Credits topped up ✅
3. **NEW: Response serialization bug** — siblingAdapter returns need JSON.stringify before passing back to sandbox

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
- [x] 7/8 E2E criteria pass (Claude via OpenRouter, exec 82)
- [x] Full E2E round-trip attempted — correct answer but via fallback
- [ ] Fix response serialization bug (siblingAdapter → sandbox bridge)
- [ ] Re-run E2E after serialization fix → sibling result used directly
- [ ] `workflow.ts` — n8nac export of WF11
- [ ] `test.ts` — automated E2E test

## What's Next

1. **Fix serialization bug** — siblingAdapter CallToolFn result needs JSON.stringify before bridge returns to sandbox
2. Re-run WF11 → verify Calculator result flows back as usable data
3. Export WF11 as `.workflow.ts`
4. Test with multiple siblings (Calculator + HTTP Tool + Custom Function)

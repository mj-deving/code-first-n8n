# E2E Sibling Tools Benchmark: Auto-Register and Round-Trip Verification

**Date:** 2026-04-07
**n8n:** Windows host at 172.31.224.1:5678
**LLM:** Claude via OpenRouter (anthropic/claude-sonnet-4)
**Scenario:** Code-mode auto-discovers sibling Calculator tool, executes arithmetic through sandbox, returns result via agent
**Workflow:** `pxCt6Wv92qqUbznT` (WF11)

## Test Input

```json
{
  "prompt": "Use the calculator tool to compute 100 + 200, then report the result."
}
```

Expected output: result derived from real sibling tool call, e.g. `{sum: 300}`.

## Results

### E2E Criteria (Executions 92-93)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Code-mode discovers sibling Calculator tool | Pass |
| 2 | LLM writes TypeScript that calls `sibling.calculator()` | Pass |
| 3 | Sandbox executes the sibling call | Pass |
| 4 | Calculator tool receives correct arguments | Pass |
| 5 | Calculator returns correct sum | Pass |
| 6 | Result serializes cleanly (no `[object Object]`) | Pass |
| 7 | Agent returns the result to the user | Pass |
| 8 | End-to-end webhook response contains correct answer | Pass |
| | **Total** | **8/8** |

### Test Coverage

| Test Suite | Count | Scope |
|-----------|-------|-------|
| siblingAdapter unit tests | 10 | Auto-discover, register, invoke, error handling |
| Core engine tests | 57 | Code execution, tool bridging, sandbox isolation |
| **Total** | **67** | Full stack coverage |

## Historical Comparison

| Metric | Execution 82 (pre-fix) | Executions 92-93 (current) | Resolution |
|--------|----------------------|---------------------------|------------|
| Sibling round-trip | Blocked | Pass | Fixed |
| Serialization | `[object Object]` bug | Clean JSON | `tool.invoke(JSON.stringify(args))` |
| E2E criteria | Partial | **8/8** pass | Prompt shaping + serialization fix |
| Arithmetic verification | Correct answer but wrong path | Correct answer via real sibling call | Full E2E verified |

### The Serialization Bug (Execution 82)

Execution 82 returned the correct arithmetic answer (`300`), but the sibling call path was compromised. The `tool.invoke()` call received `[object Object]` instead of serialized JSON because the args object was being coerced to string implicitly. The fix was explicit serialization: `tool.invoke(JSON.stringify(args))`.

## Verified Calculations

| Expression | Expected | Actual | Execution |
|-----------|----------|--------|-----------|
| 100 + 200 | 300 | 300 | 92 |
| 17 + 25 | 42 | 42 | 92 |
| 42 * 3 | 126 | 126 | 93 |

## Key Findings

1. **Auto-register works zero-config.** Code-mode discovers sibling tool sub-nodes connected to the same AI Agent without any manual registration. Set `autoRegisterSiblings: true` and siblings appear in the sandbox as `sibling.<toolName>()`.

2. **Set-based O(1) dispatch.** Sibling tool lookup uses a Set for O(1) dispatch regardless of how many siblings are registered. No linear scan.

3. **Serialization is the critical path.** The `[object Object]` bug was the only blocker. Once args serialize cleanly through `JSON.stringify()`, the entire round-trip works: LLM writes code, sandbox calls sibling, sibling executes, result returns to agent.

4. **67 tests cover the full stack.** 10 dedicated siblingAdapter tests plus 57 core engine tests ensure the feature stays green across changes.

5. **Prompt shaping matters.** The system prompt must explicitly show the `sibling.calculator({ a: 42, b: 58 })` syntax. Without it, the LLM tries to call the calculator directly instead of through the code-mode sandbox.

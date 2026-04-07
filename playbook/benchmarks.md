# Benchmarks: Code-Mode Token Savings

> Real measurements from n8n 2.11.2, Gemini 2.0 Flash, 2026-03-20

## 5-Tool Customer Onboarding Pipeline

**Scenario:** Customer data enrichment — validate email → classify company → score tier → generate message → format report.

**Input:**
```json
{
  "name": "Maria Schmidt",
  "email": "maria.schmidt@microsoft.com",
  "company": "Microsoft Deutschland GmbH"
}
```

### Traditional (WF8): 5 Code Tool Sub-Nodes

The agent makes 11 sequential LLM calls. Each call sends the full accumulated context — system prompt, all tool schemas, all prior tool calls and results. Context compounds O(n²):

| LLM Call | Est. Input Tokens | Cumulative Context |
|---|---|---|
| 1 | ~500 | System + 5 schemas + input |
| 2 | ~700 | + call #1 + result #1 |
| ... | ... | ... |
| 11 | ~2,500 | + all 10 prior calls + results |
| **Total** | **~18,000** | **O(n²) compounding** |

- 11 LLM API calls
- 22 nodes fired
- 12,483ms execution time
- Agent struggled, maxed tool retries

### Code-Mode (WF9): 1 Code-Mode Tool

The agent makes 1 LLM call — sees the task, writes a complete TypeScript pipeline:

| LLM Call | Est. Input Tokens | What It Does |
|---|---|---|
| 1 | ~700 | System + 1 schema + input → writes full pipeline |
| **Total** | **~700** | **O(1) constant** |

- 1 LLM API call
- 3 nodes fired
- 2,530ms execution time
- Clean success, no retries

### Comparison

| Metric | Traditional | Code-Mode | Savings |
|---|---|---|---|
| **LLM calls** | 11 | 1 | **91%** |
| **Tokens** | ~18,000 | ~700 | **96%** |
| **Latency** | 12.5s | 2.5s | **80%** |
| **Nodes** | 22 | 3 | **86%** |

### Why It Works

The fundamental insight is about **context accumulation**. In traditional agent loops:
- Each tool call adds to the conversation history
- The next LLM call must process ALL prior context
- Token usage grows O(n²) with the number of tools

In code-mode:
- The LLM sees one tool (`execute_code_chain`) with all available tools described in its schema
- It writes a TypeScript block that calls all tools directly in the sandbox
- Token usage is O(1) — one prompt, one response, regardless of how many tools execute

### Annual Cost Projections (GPT-4o Pricing)

| Daily Executions | Traditional/Year | Code-Mode/Year | Annual Savings |
|---|---|---|---|
| 100 | ~$2,400 | ~$100 | **$2,300** |
| 1,000 | ~$24,000 | ~$1,000 | **$23,000** |
| 10,000 | ~$240,000 | ~$10,000 | **$230,000** |

Note: Base LLM costs are falling (GPT-4o-mini is 97% cheaper than GPT-4). Lead with latency reduction and complexity reduction alongside token savings.

## LLM Compatibility

| Provider | Code Generation Quality | Notes |
|---|---|---|
| OpenAI (GPT-4o, o1, o3) | Strong | Excellent TypeScript generation |
| Anthropic (Claude 3.5/4) | Strong | Reliable structured code |
| Google (Gemini 2.0 Flash) | Good | Used in benchmarks above |
| Gemini + MCP tools | Broken | Calls tools but returns empty results |
| Mistral | Adequate | Simpler chains only |

## Methodology

- n8n 2.11.2 on Windows, accessed from WSL via vEthernet IP
- Gemini 2.0 Flash free tier (15 req/min rate limit)
- Same input payload for both workflows
- Token counts estimated from n8n execution data (exact counts not exposed by Gemini)
- Execution time from n8n execution timestamps
- Benchmark workflows: WF8 (ID: zQ4KCniPiiOS3EEG), WF9 (ID: WVeyUVbK32wI6ZGQ)

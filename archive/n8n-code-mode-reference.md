# Code-Mode as n8n Community Node: Full Elaboration

## The Problem: Compounding Token Costs in n8n AI Agents

n8n's AI Agent node uses an **EngineRequest/EngineResponse loop** (via LangChain) where each tool call triggers a full LLM round-trip. The LLM receives the entire accumulated context — system prompt, tool schemas, chat history, AND all prior tool results — with every iteration.

### The Math

For a workflow that calls 5 tools (a typical automation — fetch data, process, post result):

| Iteration | What the LLM Receives | Input Tokens |
|-----------|----------------------|-------------|
| 1 | System prompt + tool schemas + user input | ~2,000 |
| 2 | All of #1 + tool call #1 + tool result #1 | ~3,500 |
| 3 | All of #2 + tool call #2 + tool result #2 | ~5,000 |
| 4 | All of #3 + tool call #3 + tool result #3 | ~6,500 |
| 5 | All of #4 + tool call #4 + tool result #4 | ~8,000 |
| **Total** | | **~25,000 input tokens** |

Plus ~500 output tokens per call = **2,500 output tokens** across 5 calls.

**The cost is O(n²), not O(n).** A 10-iteration run doesn't cost 10× a single call — it costs 30-50× due to context accumulation.

### At Scale

n8n automations run on triggers — every webhook, form submission, schedule tick. If a workflow triggers 100 times/day:
- **Traditional:** 25K tokens × 100 = 2.5M tokens/day = **~$7.50/day** (GPT-4o pricing)
- **At 1,000/day:** **~$75/day = $27,375/year** in input tokens alone

---

## The Solution: Code-Mode as a Tool Sub-Node

### Architecture (First Principles)

**Don't replace the agent loop. Become a tool within it.**

The code-mode integration is a **tool sub-node** (using n8n's `supplyData()` interface) that the AI Agent can invoke. When the agent encounters a multi-step task, instead of making N sequential tool calls, it:

1. **Writes a TypeScript code block** that chains all the operations
2. **Calls the code-mode tool once** — the sandbox executes all tools without returning to the LLM
3. **Gets back a single result** — then decides if it's done or needs another step

The agent loop stays. It just becomes dramatically more efficient.

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│ n8n AI Agent Node                                        │
│                                                          │
│  LLM ──────► "I'll use execute_code_chain to do all 3"  │
│                    │                                     │
│                    ▼                                     │
│  ┌─────────────────────────────────────────────┐        │
│  │  Code-Mode Tool Sub-Node                     │        │
│  │                                              │        │
│  │  1. Receive TypeScript code from LLM         │        │
│  │  2. Register n8n tools as UTCP manuals       │        │
│  │  3. Execute in isolated-vm sandbox           │        │
│  │  4. Return combined result                   │        │
│  │                                              │        │
│  │  ┌──────────────────────────────────────┐   │        │
│  │  │ Sandbox (isolated-vm)                 │   │        │
│  │  │                                       │   │        │
│  │  │  github.get_pr({ pull_number: 42 })  │   │        │
│  │  │  const comments = github.get_comments()│  │        │
│  │  │  slack.post({ text: summary })        │   │        │
│  │  │  return { pr, comments, slackResult } │   │        │
│  │  └──────────────────────────────────────┘   │        │
│  └─────────────────────────────────────────────┘        │
│                    │                                     │
│                    ▼                                     │
│  LLM ◄──── "All done. Posted PR summary to Slack."      │
└─────────────────────────────────────────────────────────┘
```

### Token Savings: Before/After

For the same 5-tool workflow:

| Metric | Traditional | With Code-Mode | Savings |
|--------|------------|---------------|---------|
| LLM API calls | 5 | 2 | **60%** |
| Input tokens | ~25,000 | ~5,000 | **80%** |
| Output tokens | ~2,500 | ~800 | **68%** |
| Total tokens | ~27,500 | ~5,800 | **79%** |
| Latency | 5× LLM + 5× tool (serial) | 2× LLM + 5× tool (can parallel) | **~60%** |

At 1,000 executions/day with GPT-4o ($2.50/1M input, $10/1M output):
- **Traditional:** $25K input + $25K output = **~$50K/year**
- **Code-Mode:** $5K input + $8K output = **~$13K/year**
- **Net savings: ~$37K/year**

*(Conservative estimate — real savings depend on tool result sizes and iteration counts)*

---

## Implementation Approach

### Community Node Structure

```
n8n-nodes-utcp-codemode/
  credentials/
    UtcpCodeModeCredentials.credentials.ts  # API keys for registered tools
  nodes/
    CodeModeTool/
      CodeModeTool.node.ts                  # Tool sub-node (supplyData)
      codemode.svg                          # Icon
  package.json                              # n8n-community-node-package keyword
```

### The Node: `CodeModeTool.node.ts`

This implements `supplyData()` (not `execute()`), returning a LangChain `DynamicStructuredTool` that the AI Agent can invoke:

```typescript
// Simplified — the node returns a LangChain tool
export class CodeModeTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Code-Mode Tool',
    name: 'codeModeTool',
    group: ['transform'],
    // This is a tool sub-node for the AI Agent
    codex: { categories: ['AI'], subcategories: { AI: ['Tools'] } },
    inputs: [],
    outputs: [{ type: 'ai_tool', displayName: 'Tool' }],
    properties: [
      { displayName: 'Timeout', name: 'timeout', type: 'number', default: 30000 },
      { displayName: 'Memory Limit (MB)', name: 'memoryLimit', type: 'number', default: 128 },
      // Tool sources configuration
      { displayName: 'Tool Sources', name: 'toolSources', type: 'json', default: '[]' },
    ],
  };

  async supplyData(this: ISupplyDataFunctions): Promise<SupplyData> {
    const timeout = this.getNodeParameter('timeout', 0) as number;
    const memoryLimit = this.getNodeParameter('memoryLimit', 0) as number;

    // Initialize code-mode engine (v2.1 — @code-mode/core)
    const { CodeModeEngine } = await import('code-mode-core');
    const engine = await CodeModeEngine.create();
    // Register tool sources, discover siblings, etc.

    const tool = new DynamicStructuredTool({
      name: 'execute_code_chain',
      description: await engine.getToolDescription(),
      schema: z.object({ code: z.string().describe('TypeScript code to execute') }),
      func: async ({ code }) => {
        const result = await engine.execute(code, {
          timeout, memoryLimit, enableTrace: false,
          // v2.1: external tools from sibling tool sub-nodes
          // externalTools, externalCallToolFn
        });
        return JSON.stringify({ result: result.result, logs: result.logs });
      },
    });

    return { response: tool };
  }
}
```

### Tool Registration: n8n Tools → UTCP Manuals

The key integration challenge: how do n8n workflow tools become available inside the code-mode sandbox?

**Option A: Static Configuration (MVP)**
Users define tool sources in the node's JSON config — pointing to MCP servers, HTTP APIs, or OpenAPI specs they want available in the sandbox.

```json
[
  { "name": "github", "call_template_type": "mcp", "config": { "command": "npx", "args": ["@modelcontextprotocol/server-github"] } },
  { "name": "slack", "call_template_type": "http", "config": { "base_url": "https://slack.com/api" } }
]
```

**Option B: Auto-Registration (Advanced)**
The node inspects other tool sub-nodes connected to the same AI Agent and auto-registers them as UTCP manuals. This requires deeper integration with n8n's execution context but would be seamless for users.

**Option C: Hybrid**
Start with Option A (ship fast), add Option B in v2.

---

## What the Node Exposes to Workflow Builders

From an n8n user's perspective, this is just another **tool sub-node** they drag onto their AI Agent:

1. **Drag "Code-Mode Tool" from the sidebar**
2. **Connect it to the AI Agent** (like HTTP Request Tool, Calculator, etc.)
3. **Configure tool sources** (MCP servers, APIs they want available)
4. **The agent automatically uses it** when it recognizes multi-step tasks

The LLM sees one tool: `execute_code_chain(code: string)`. The tool description includes TypeScript interfaces for all registered tools, so the LLM knows what's available.

**No code required from the n8n user.** The LLM writes the code. The user configures which external tools to make available.

---

## Limitations and Constraints

### Hard Constraints
1. **Sandbox isolation** — Code runs in isolated-vm with no direct Node.js API access. Every tool must be bridged through UTCP's `applySyncPromise` mechanism. This adds ~10-50ms latency per tool call.
2. **Community node SDK** — Can only use `supplyData()` to return a LangChain tool. Cannot modify the agent loop itself or the EngineRequest/EngineResponse mechanism.
3. **Tool schemas required** — Every tool needs a well-defined schema for code-mode to generate TypeScript interfaces. Tools without schemas can't be used.

### Soft Constraints
4. **LLM code generation reliability** — The LLM must write correct TypeScript. With typed interfaces this works well (88%+ in benchmarks), but edge cases exist. Error handling in the sandbox mitigates this.
5. **n8n's existing tools aren't auto-registered** — v1 requires manual tool source configuration. Users must point to MCP servers or APIs separately from their n8n tool nodes.
6. **No filesystem/network access in sandbox** — All external operations must go through registered tools. Can't do arbitrary HTTP requests or file operations from within the code block.

### Assumptions to Validate
7. **n8n users will accept a tool that "writes code"** — Some chose n8n precisely to avoid coding. Power users will love it; beginners may not understand it.
8. **Tool result sizes stay manageable** — If a tool returns 50K tokens of data, the sandbox processes it fine, but passing it back to the LLM for the final answer negates some savings.

---

## Comparison to Existing n8n Optimization Approaches

| Approach | What It Does | Token Savings | Implementation Effort |
|----------|-------------|---------------|----------------------|
| **Prompt engineering** | Shorter system prompts, clearer stop conditions | 10-30% | Low (just text) |
| **maxIterations tuning** | Limit loop iterations | Caps cost, doesn't reduce it | Low (one setting) |
| **Token usage tracking** | Monitor costs per workflow | 0% (observability only) | Medium |
| **Context minimization** | Trim tool schemas, reduce chat history | 15-25% | Medium |
| **Code-Mode Tool** | Collapse N tool calls into 1 code execution | **60-80%** | Medium-High |

Code-mode is the only approach that addresses the **structural cause** — the compounding round-trip loop — rather than treating symptoms.

---

## LLM Provider Compatibility

Code-mode works with any LLM that can:
1. **Write TypeScript/JavaScript** (all major models can)
2. **Call a single tool** (the `execute_code_chain` function)

| Provider | Compatible | Notes |
|----------|-----------|-------|
| OpenAI (GPT-4o, o1, o3) | Yes | Strong code generation |
| Anthropic (Claude 3.5/4) | Yes | Excellent at structured code |
| Google (Gemini) | Yes | Good code generation |
| Mistral | Yes | Adequate code generation |
| Ollama (Llama 3, Mistral local) | Partial | Depends on model quality |
| OpenRouter | Yes | Depends on underlying model |

---

## Use Case Examples

### 1. DevOps PR Review Pipeline
**Traditional:** 6 agent iterations (get PR → get files → get comments → get CI status → analyze → post review)
**Code-mode:** 1 code block fetches all data, analyzes in-sandbox, posts review. **Savings: ~85%**

### 2. CRM Data Enrichment
**Traditional:** 4 iterations per contact (lookup CRM → search LinkedIn → check email validity → update record)
**Code-mode:** 1 code block chains all lookups and updates. At 500 contacts/day, saves **~$15K/year**.

### 3. Multi-Channel Notification
**Traditional:** 3 iterations (format message → post Slack → send email → update ticket)
**Code-mode:** 1 code block formats and sends to all channels. At high trigger volume, significant savings.

### 4. Data Pipeline Processing
**Traditional:** 5+ iterations (fetch CSV → parse → validate → transform → insert DB)
**Code-mode:** 1 code block processes entire pipeline in-sandbox. Large datasets stay in the sandbox — only summary returns to LLM.

---

## Publishing Path

### MVP (Community Node)
1. Build node using `n8n-nodes-starter` template
2. Implement `supplyData()` returning DynamicStructuredTool
3. Bundle `@utcp/code-mode` + `@utcp/sdk` as dependencies
4. Test with n8n dev environment
5. Publish to npm as `n8n-nodes-utcp-codemode`
6. Submit to n8n community nodes directory

### Growth Path
- **v1.0** — Static tool source configuration (MCP, HTTP, OpenAPI)
- **v1.5** — Auto-register sibling tool nodes from the same agent
- **v2.0** — Visual tool source picker in n8n UI
- **v2.5** — Pre-built tool source templates (GitHub, Slack, Notion, etc.)
- **v3.0** — Execution analytics dashboard (tokens saved, cost comparison)

---

## Revenue / Business Model Potential

### Open Source Community Node (Growth Play)
- Publish as MIT/MPL-2.0 community node
- Build reputation in n8n ecosystem
- Drive adoption of UTCP standard
- Potential acquisition interest from n8n (they've acquired popular community nodes before)

### SaaS Wrapper (Revenue Play)
- Hosted code-mode execution service
- Free tier: 100 executions/day
- Pro tier: unlimited executions, analytics dashboard, pre-configured tool sources
- Enterprise: custom sandbox configs, audit logging, compliance
- **Pricing anchor:** "Save $30K/year in LLM costs for $99/month"

### Consulting Play
- Help n8n-heavy companies optimize their AI agent costs
- Audit existing workflows, identify code-mode candidates
- Implementation and configuration services

---

## Open Questions and Next Steps

### Technical Questions
1. **Can `supplyData()` return a tool whose description dynamically updates?** The tool interfaces change based on registered tool sources — need to verify n8n re-evaluates tool descriptions per execution.
2. **What's the overhead of spinning up isolated-vm per tool call?** Need to benchmark whether a persistent sandbox pool is needed.
3. **How does n8n handle large tool results?** If the sandbox returns 100K tokens, does the agent choke?

### Market Questions
4. **What's the n8n AI Agent adoption curve?** How many n8n users actually use AI Agent nodes and would benefit from this?
5. **Is there appetite for a paid optimization tool?** Or do n8n users expect everything to be free?
6. **Would n8n Inc. be interested in a native integration?** This could be pitched as a platform improvement.

### Next Steps
- [ ] Build a minimal proof-of-concept community node
- [ ] Benchmark token savings on 5 real-world n8n workflows
- [ ] Test with GPT-4o, Claude, and Gemini as the agent LLM
- [ ] Publish to npm and get community feedback
- [ ] Write a blog post / n8n community forum post explaining the concept

---

## Architecture Diagram

Visual comparison available at: `~/.agent/diagrams/n8n-code-mode-architecture.html`

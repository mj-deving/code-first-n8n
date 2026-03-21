# Community Node: Code-Mode Tool — 96% fewer tokens for multi-tool AI Agents

**npm:** `npm install n8n-nodes-utcp-codemode`
**GitHub:** [mj-deving/n8n-nodes-utcp-codemode](https://github.com/mj-deving/n8n-nodes-utcp-codemode)

---

So I've been running into this problem where my AI Agent workflows get expensive fast when they use multiple tools. Looked into why and realized the token usage grows quadratically — every tool call sends the full conversation history again.

Ran some numbers on a 5-tool pipeline I had (email validation, company classification, tier scoring, message generation, report formatting). The traditional approach: 11 LLM calls, ~18k tokens. Felt like there had to be a better way.

Found the [UTCP code-mode](https://github.com/universal-tool-calling-protocol/code-mode) library and wrapped it as an n8n tool node. The idea: instead of the agent calling tools one by one, it writes a TypeScript code block that runs the whole pipeline in one go inside a V8 sandbox. One LLM call, ~700 tokens.

Benchmarked it side by side on the same workflow:

| | Traditional | Code-Mode | Diff |
|---|---|---|---|
| LLM calls | 11 | 1 | -91% |
| Tokens | ~18k | ~700 | -96% |
| Time | 12.5s | 2.5s | -80% |

Also got MCP server integration working — tested it with the filesystem MCP server, the agent can read/write files through code-mode. Claude and GPT-4o handle it well, Gemini struggles a bit with writing the code blocks proactively.

## Install

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-utcp-codemode
```

Restart n8n, then connect Code-Mode Tool (under AI > Tools) to any AI Agent.

Three settings: tool sources (JSON config for MCP servers or HTTP APIs), timeout, memory limit.

---

Still early — would appreciate anyone trying it out and sharing what they see. Curious whether the savings hold up on different pipeline shapes or with other models.

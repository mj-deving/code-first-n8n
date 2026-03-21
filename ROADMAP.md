# Code-Mode — Technical & Commercial Roadmap

> Generated 2026-03-21 | First-principles + creative brainstorm + scientific validation + market research
> Architecture principle: **Platform-agnostic core, n8n as first integration**

---

## Vision

Code-mode is a **universal LLM cost optimizer** that collapses O(n²) sequential tool calls into O(1) code executions. The core insight — LLM calls are expensive, tool execution is cheap, LLMs can write code — applies to every multi-tool AI agent system, not just n8n.

**Architecture target:**
```
@code-mode/core          ← Platform-agnostic engine (sandbox + tools + caching)
├── @code-mode/n8n       ← n8n tool sub-node wrapper (SHIPPED as v1.1.0)
├── @code-mode/langchain ← LangChain tool wrapper (planned)
├── @code-mode/crewai    ← CrewAI tool wrapper (planned)
└── @code-mode/api       ← Standalone REST API (planned)
```

---

## Technical Roadmap

### Phase 1: Foundation (Now → 4 weeks)
*Priority: highest confidence, lowest effort, biggest impact*

| Version | Feature | Effort | Confidence | What |
|---------|---------|--------|-----------|------|
| **v1.2** | Code Caching | 10-15h | 75% | Hash tool config + prompt → cache generated code → skip LLM on repeat executions. 95% faster for scheduled workflows |
| **v1.3** | Sandbox Replay | 8-12h | 85% | Record every tool call, timing, and result. Step-through debugger for AI agent executions. First platform with execution-level replay |
| **v1.4** | Execution Cost Metering | 10-15h | 80% | Real-time per-tool-call cost tracking. Budget enforcement mid-execution. "FinOps for AI agents" |

**Validation before building:**
- v1.2: Measure cache hit rate on WF8/WF9 benchmarks. Kill if <20% hit rate
- v1.3: Check isolated-vm supports execution tracing hooks
- v1.4: Verify token counting is accessible from within sandbox context

### Phase 2: Platform Liberation (Weeks 4-8)
*Extract platform-agnostic core*

| Version | Feature | Effort | Confidence | What |
|---------|---------|--------|-----------|------|
| **v2.0** | Core SDK Extraction | 20-30h | 80% | Extract `@code-mode/core` as standalone package. n8n becomes thin wrapper. LangChain adapter as proof of portability |
| **v2.1** | Auto-Register Siblings | 14-18h | 65% | AiTool input wiring for n8n. Prototype first (2h) to validate n8n allows this |
| **v2.2** | Code Cookbook | 15-20h | 70% | Searchable library of reusable TypeScript snippets. AI imports by name. Community contributions via GitHub |

**Validation:**
- v2.0: Standalone benchmark must run outside n8n context. Kill if >60% rewrite needed
- v2.1: 2-hour prototype. Kill if n8n blocks AiTool input on tool sub-nodes
- v2.2: Create 5 templates, measure if >30% of executions use them after 4 weeks

### Phase 3: Intelligence Layer (Weeks 8-16)
*Features that make code-mode smarter over time*

| Version | Feature | Effort | Confidence | What |
|---------|---------|--------|-----------|------|
| **v3.0** | Execution Contracts | 20-25h | 70% | Design-by-Contract: pre/post-conditions checked between tool calls. Blocks destructive actions. Enterprise trust enabler |
| **v3.1** | Ghost Execution | 15-20h | 75% | Shadow/mock tool responses for testing. "Paper trading" for automations. Compliance teams will pay for this |
| **v3.2** | Persistent Sandbox State | 20-25h | 60% | V8 context persists between executions. Step N builds on step N-1. Enables conversational agent state |
| **v3.3** | Speculative Execution | 25-30h | 55% | AST analysis detects independent tool calls → automatic parallelization. AI writes sequential code; sandbox runs it concurrently |

### Phase 4: Ecosystem (Weeks 16+)
*Platform effects and moonshots*

| Feature | Effort | Confidence | What |
|---------|--------|-----------|------|
| Workflow-as-Tool | 30-40h | 45% | Sandbox calls n8n sub-workflows as functions. Composition primitive |
| Multi-Agent Arena | 30-35h | 60% | N agents write competing code chains, parallel sandboxes execute, best wins |
| Genetic Code Evolution | 40-50h | 40% | Evolutionary algorithms optimize code patterns across thousands of executions |
| Reactive Streams | 35-45h | 50% | Long-running sandbox subscriptions to real-time event streams |

---

## Commercial Roadmap

### Track A: Fastest-to-Revenue (Start immediately)

#### A1. "Token Audit" — AI Cost Optimization Consulting
- **Model:** Fixed-price audits ($2K-5K) for companies running AI agent workflows
- **Deliverable:** Before/after benchmark + deployed code-mode integration
- **Revenue:** $48K-240K/year at 2-4 engagements/month
- **Investment:** 0 — uses existing product as diagnostic tool
- **Go-to-market:** LinkedIn posts with benchmark screenshots, dev.to articles, n8n community
- **Target customer:** Companies spending >$1K/month on AI API calls with multi-tool agents
- **Why now:** 98% of orgs now actively managing AI spend (FinOps Foundation 2026). The expertise is rare

#### A2. "Savings-as-a-Service" — Token Savings Revenue Share
- **Model:** Deploy code-mode, take 10-15% of measured monthly savings
- **Deliverable:** Instrumented deployment with monthly savings reports
- **Revenue:** $36K+/year at 10 customers × $300/month average
- **Investment:** Billing/measurement dashboard (20-30h dev)
- **Go-to-market:** Upgrade consulting clients to ongoing revenue share
- **Target customer:** High-volume automation companies (>10K AI agent executions/month)
- **Why it works:** Zero customer risk, you only earn when they save

### Track B: Content & Reputation (Weeks 1-8)

#### B1. "The Token Whisperer" — Premium Content Brand
- **Model:** Newsletter (free → $10/month paid), workshops ($500-2K/seat), course ($200-500)
- **Revenue:** $24K-60K/year from newsletter + 2-3 workshops/year
- **Investment:** 4-8h/week content creation
- **Go-to-market:** dev.to articles → newsletter funnel → workshop launches
- **Target customer:** AI automation builders, n8n power users, prompt engineers
- **Why now:** Zero established thought leaders in "AI agent cost optimization"
- **Content topics:** Token savings techniques, code-mode patterns, MCP integration, agent architecture

### Track C: Product Revenue (Months 3-6)

#### C1. "Sandbox Cloud" — Managed Code Execution API
- **Model:** Hosted sandboxes, $99/month for 10K executions or $0.001/execution
- **Revenue:** $50K-200K/year at scale
- **Investment:** 40-60h dev + $200-500/month infrastructure
- **Go-to-market:** "Deploy code-mode without managing isolated-vm"
- **Target customer:** No-code automation builders who can't self-host
- **Architecture:** Cloudflare Workers or Fly.io + pre-connected MCP server catalog
- **Comparable:** E2B ($0.05/hr/vCPU), Modal (per-second billing)

#### C2. Open Core + Enterprise
- **Model:** Core SDK free, enterprise adapters + support $50-200/month/seat
- **Revenue:** $100K+ at 50+ enterprise seats
- **Investment:** Core extraction (already planned), enterprise features (SSO, audit logs, SLAs)
- **Go-to-market:** Free adoption → enterprise upsell when compliance team asks
- **Comparable:** LangChain (open framework, $125M Series B for LangSmith)

### Track D: Moonshots (Year 2+)

#### D1. Protocol Standardization
- **Model:** Formalize code-mode as open spec. Certification for platforms. Consulting for implementation
- **Revenue:** $50K-500K/year per platform partnership
- **Like:** Solomon Hykes: Docker (implementation) → OCI (standard)

#### D2. The Coalition — Multi-Platform Efficiency Alliance
- **Model:** Partner with 3-5 AI agent platforms. Each integrates code-mode natively
- **Revenue:** Partnership fees $50K-500K/year per platform
- **Like:** Every platform wants to say "96% AI cost savings"

#### D3. Equity-for-Integration
- **Model:** Integrate code-mode into AI startups for 0.5-2% equity instead of cash
- **Revenue:** Portfolio upside. One winner pays for all

---

## Decision Framework

### Scientific Validation Protocol

**Hypothesis template:**
```
IF we build [feature],
THEN [measurable outcome] within [timeframe],
BECAUSE [falsifiable assumption].
KILL IF [specific failure criterion].
```

**Validation ladder (fastest first):**
1. **Signal scan** (1h): GitHub issues, npm downloads, community questions mentioning the need
2. **Lightweight experiment** (4h): Feature announcement post, poll, landing page
3. **Prototype** (2-20h): MVP testing core assumption only
4. **Ship + measure** (full effort): Build if prototype validates

**Bayesian updates:**
- Prototype succeeds → confidence +20%
- Prototype fails with workaround → confidence +5%
- Prototype fails hard → confidence -30%
- 5+ users request feature → confidence +15%
- Competitor ships equivalent → urgency +50%

**Kill protocol:**
1. Time gate: >2x estimated hours → pause and reassess
2. Technical gate: core assumption falsified → kill immediately
3. Market gate: <10 downloads/week after 4 weeks → deprioritize
4. Sunk cost rule: never cite "we already invested X hours" as reason to continue

---

## Priority Matrix (Combined Technical + Commercial)

| Priority | Action | Type | Timeline | Expected Impact |
|----------|--------|------|----------|----------------|
| **1** | Code Caching (v1.2) | Technical | Week 1-2 | 95% faster repeat executions |
| **2** | Core SDK Extraction (v2.0) | Technical | Week 2-6 | Platform-agnostic foundation |
| **3** | Token Audit consulting | Commercial | Week 1+ | First revenue, market learning |
| **4** | Sandbox Replay (v1.3) | Technical | Week 3-4 | Debugging DX, enterprise value |
| **5** | Content brand launch | Commercial | Week 1+ | Distribution, reputation |
| **6** | Auto-Register Siblings (v2.1) | Technical | Week 4-6 | n8n UX improvement |
| **7** | Execution Contracts (v3.0) | Technical | Week 8-12 | Enterprise trust, premium feature |
| **8** | Ghost Execution (v3.1) | Technical | Week 10-14 | Compliance, premium feature |
| **9** | Sandbox Cloud SaaS | Commercial | Month 3-6 | Recurring product revenue |
| **10** | Platform partnerships | Commercial | Month 6+ | Scale distribution |

---

## Key Insights

### From First Principles
- The atomic value is **O(n²) → O(1) LLM calls**. This is universal, not n8n-specific
- Only hard constraints: LLM calls cost tokens, context grows O(n²), sandboxing is necessary
- Challenged assumptions: n8n lock-in, single sandbox per execution, code generated from scratch each time

### From Market Research (Codex)
- 98% of orgs now actively managing AI spend (FinOps Foundation 2026)
- E2B used by ~50% of Fortune 500 for sandboxed execution
- Replit grew from $16M to $253M ARR via usage-based AI pricing
- LangChain reached $1.25B valuation with open framework + paid observability
- Apify top creators earn $10K+/month on 80/20 rev share
- n8n Expert Partner Program and paid marketplace are emerging

### From Creative Brainstorm
- 14 novel features generated across 9 domains
- Strongest near-term: Sandbox Replay, Execution Contracts, Ghost Execution
- Strongest long-term moats: Code Cookbook (network effects), Genetic Evolution (data flywheel)
- Most novel: Speculative Execution (CPU architecture → AI agents)

### From Scientific Framework
- Code Caching has highest priority score (9.2/10) — high confidence, low effort, high impact
- Cross-Platform SDK is second (8.8/10) — unlocks entire commercial strategy
- Workflow-as-Tool has lowest priority (5.5/10) — high impact but very uncertain

---

## Risk Monitor

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Anthropic PTC native n8n integration | 20% in 6mo | Critical | Platform-agnostic core makes this irrelevant |
| isolated-vm breaks on Node 22→24 | 30% | High | Abstract sandbox runtime, support Deno fallback |
| n8n changes supplyData internals | 15% | Medium | Thin wrapper pattern isolates core from n8n |
| Solo dev bandwidth | 80% | Medium | Prioritize ruthlessly. Build foundation before features |
| No user adoption despite features | 40% | High | Consulting validates market. Content builds distribution |

---

*This roadmap is a living document. Update after each feature ships or hypothesis is tested.*

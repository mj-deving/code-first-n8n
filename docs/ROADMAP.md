---
summary: Code-mode project roadmap — ranked next projects with research data from templates, patterns, and market analysis
read_when: planning next project, choosing what to build, project ideas, roadmap, what's next
---

# Code-Mode Roadmap

> Last updated: 2026-04-16
> Research: 4 parallel streams — upstream status, 7700+ community templates, Gemini market research, n8n-skills pattern analysis

## Current State

- **5 proven POC workflows** — all complete with .ts/.json/test/benchmark/README
- **3 published npm packages** — n8n-nodes-utcp-codemode@2.1.2, code-mode-tools@0.2.0, n8nac-tools@1.0.0
- **Project template** — github.com/mj-deving/n8n-project-template (clone to start new projects)
- **Upstream** — @utcp/code-mode@1.2.11 is latest, @utcp/mcp@1.1.1 is latest (no updates since Feb 2026)
- **Benchmark baseline** — 96% token savings on 5-tool pipeline (4,847 → 202 tokens)

---

## Tier 1 — Top 3 Candidates (Build One)

### 1. RAG Pipeline Factory (Meta-Workflow)

**What:** A code-mode workflow that *builds other RAG workflows*. Describe your data sources (Drive, Confluence, Notion, S3), vector store (Pinecone, Qdrant, Supabase), and query interface (chat, API, Slack) — the agent generates a complete n8n workflow via n8nac, deploys it, and tests it.

**Why code-mode wins:** Code writing code — the ultimate showcase. The agent writes TypeScript that generates TypeScript workflow definitions, pushes via n8nac, validates and tests — all in one sandbox execution. Directly extends WF04 Dev Loop.

| Metric | Value |
|---|---|
| Tool calls per run | 15-25 |
| Token savings | 96%+ |
| Build time | 3-4 weeks |
| Community demand | 613 RAG templates exist, no factory to generate them |
| Complexity | Medium — leverages existing n8nac + code-mode stack |
| Revenue potential | Medium — community tool, not enterprise product |

**Key community templates to study:**
- Template 9933 — Multi-Format Document Processing for RAG (Google Drive + Supabase)
- Template 5819 — Interactive AI Agent with Multiple Tools

**Strengths:** Uniquely showcases code-mode. Builds on proven WF04. Largest community demand.
**Risks:** Meta-programming complexity. Need robust error handling for generated workflows.

---

### 2. SOC Alert Triage (Security Operations)

**What:** Ingest security alerts from SIEM (Wazuh, Elastic, Splunk), enrich each with threat intel (VirusTotal, AbuseIPDB, Shodan, MITRE ATT&CK), score severity, deduplicate into incidents, route to response playbooks — all in one code-mode execution using Promise.all for parallel enrichment.

**Why code-mode wins:** Parallel threat intel enrichment. Traditional n8n serializes 8-15 API calls with compounding context. Code-mode fires VirusTotal + AbuseIPDB + Shodan simultaneously in the sandbox, merges results locally, scores without the LLM re-reading large JSON blobs.

| Metric | Value |
|---|---|
| Tool calls per run | 8-15 per alert |
| Token savings | 95%+ |
| Build time | 3-4 weeks |
| Market demand | Massive — SOC analyst burnout is #1 cybersecurity staffing problem |
| Complexity | Medium-High — security domain expertise needed |
| Revenue potential | High — security teams pay for tooling |

**Key community templates to study:**
- Template 6913 — Multi-Agent Customer Support (similar multi-agent routing pattern)
- Template 8578 — Parallel Tasks with Async Processing (Promise.all pattern)

**Strengths:** Highest enterprise revenue potential. Most tool calls per run. Clear before/after demo.
**Risks:** Security domain expertise required. Longer trust-building cycle with buyers.

---

### 3. Multi-Source Lead Intelligence Engine

**What:** Takes inbound leads, enriches with company data (Clearbit/Apollo), social presence (LinkedIn), tech stack (BuiltWith), financial signals (Crunchbase), scores against ICP, generates personalized outreach, pushes to CRM with full context.

**Why code-mode wins:** Embarrassingly parallel enrichment. All API calls fire simultaneously in the sandbox. Traditional n8n forces serial enrichment with full context replay at each step.

| Metric | Value |
|---|---|
| Tool calls per run | 10-12 per lead |
| Token savings | 94-96% |
| Build time | 2-3 weeks |
| Market demand | Very high — #1 n8n template category by volume |
| Complexity | Low-Medium — APIs well-documented, n8n has native integrations |
| Revenue potential | Medium — B2B SaaS sales teams spend $500-2K/month on enrichment |

**Key community templates to study:**
- Template 6941 — Lead Generation & Qualification with GPT-4o + Google Workspace
- Template 11371 — Lead Enrichment with Web Scraping, GPT-4o, Airtable & Slack

**Strengths:** Fastest to build. Broadest market. Clearest ROI story.
**Risks:** Competitive space — many existing enrichment tools.

---

## Tier 2 — Strong Candidates

### 4. Self-Healing Data Pipeline Orchestrator

**What:** Monitors ETL/ELT pipelines, detects schema drift and data quality anomalies, diagnoses issues (query source, check logs, compare schemas), generates fixes (migration, transform update), applies them, validates, and alerts the team.

| Metric | Value |
|---|---|
| Tool calls per run | 12-20 per incident |
| Token savings | 96%+ |
| Build time | 4-6 weeks |
| Market timing | Perfect — Meta published their approach April 2026, "biggest trend data scientists can't ignore in 2026" |
| Complexity | High — pipeline tool connectors (Airflow/Dagster/dbt), schema introspection |

**Note:** Codex already started an n8n-self-healing project. Could build on that work.

---

### 5. E-Commerce Operations Brain

**What:** Unified AI agent handling order exceptions, returns, inventory alerts, supplier comms, and support escalation across Shopify/WooCommerce. Investigates across all systems, makes decisions, takes action.

| Metric | Value |
|---|---|
| Tool calls per run | 8-12 per incident |
| Token savings | 93-96% |
| Build time | 3-4 weeks |
| Market demand | Very high — e-commerce is #1 n8n use case by template count |

**Key template:** 8323 — WhatsApp Customer Support for Shopify with LLM Agents

---

### 6. DevOps Incident Response Autopilot

**What:** Receives PagerDuty/OpsGenie alerts, queries monitoring (Datadog, Grafana), pulls recent deploys (GitHub), correlates with past incidents, runs diagnostics, suggests/applies remediation, posts structured Slack updates.

| Metric | Value |
|---|---|
| Tool calls per run | 10-18 per incident |
| Token savings | 95%+ |
| Build time | 4-5 weeks |
| Market timing | AWS just launched their own DevOps Agent in preview |

---

### 7. Multi-Channel Customer Support Dispatcher

**What:** Receives from email/Slack/Discord/Telegram/web, classifies intent, RAG lookup, checks account status, auto-resolves or escalates with full context.

| Metric | Value |
|---|---|
| Tool calls per run | 6-10 per ticket |
| Token savings | 90-94% |
| Build time | 2-3 weeks |

**Key templates:** 6913 (multi-agent support), 9161 (GPT-4 KB agent for Gmail)

---

### 8. Compliance Document Analyzer

**What:** Ingests regulatory docs (SOC 2, GDPR, audit artifacts), cross-references against compliance frameworks, identifies gaps, generates remediation recommendations, produces audit-ready reports.

| Metric | Value |
|---|---|
| Tool calls per run | 10-15 per batch |
| Token savings | 95%+ |
| Build time | 4-5 weeks |
| Market timing | Gartner: 80% of enterprises will adopt vertical AI agents by 2026, compliance as top use case |

---

## Tier 3 — Solid Projects

### 9. Financial Data Aggregator & Analyst

Pull from bank APIs (Plaid), accounting (Xero/QuickBooks), payment (Stripe), reconcile, categorize, detect anomalies, forecast, generate reports.

- 10-15 tool calls, 95%+ savings, 3-4 weeks

### 10. Content Production Pipeline

Topic research → multi-channel drafts (LinkedIn, blog, Twitter, email) → image generation → SEO optimization → scheduling → tracking.

- 12-18 tool calls, 94-96% savings, 2-3 weeks

### 11. Recruitment Pipeline Automator

Resume parsing → skill extraction → requirement matching → LinkedIn/GitHub enrichment → scoring → outreach → interview scheduling → ATS update.

- 8-12 tool calls, 93-95% savings, 3-4 weeks

### 12. IoT Fleet Monitoring & Predictive Maintenance

Telemetry ingestion → anomaly detection → maintenance history correlation → failure prediction → work order generation → technician dispatch.

- 8-12 tool calls, 94-96% savings, 5-6 weeks

---

## Open: Benchmarking Production Projects

All 3 production projects claim token savings but lack reproducible before/after benchmarks like POC-01. Each needs:
1. **Traditional version** — how many nodes/LLM calls would this take without code-mode?
2. **Code-mode version** — measured nodes/calls in current implementation
3. **Token measurement** — actual token counts from n8n execution data
4. **Upgrade prompts** — see `docs/SESSION-BENCHMARK-*.md` in each project repo

| Project | Claimed Savings | Measured? | Benchmark Prompt |
|---|---|---|---|
| RAG Pipeline Factory | "15-25 calls → 1" | No | `rag-pipeline-factory/docs/SESSION-BENCHMARK.md` |
| SOC Alert Triage | "95%+ savings" | No | `soc-alert-triage/docs/SESSION-BENCHMARK.md` |
| Self-Healing v2 | "5 nodes → 1" | No | `n8n-self-healing/docs/SESSION-BENCHMARK.md` |

---

## Code-Mode Optimization Patterns (from n8n-skills analysis)

| Pattern | Current n8n Nodes | Code-Mode | Simplification |
|---|---|---|---|
| AI Agent with 4+ tools | 8-10 | 1 | 8-10x |
| Nested batch loops | 5-7 | 1 | 5-7x |
| API pagination + transform | 5-6 | 1 | 5-6x |
| ETL (3 sources) | 6-8 | 1 | 6-8x |
| Data enrichment per-item | 5-6 | 1 | 5-6x |

---

## Community Templates Worth Studying

| ID | Name | Code-Mode Opportunity |
|---|---|---|
| 6913 | Multi-Agent Customer Support (O3 + GPT-4.1-mini) | Multi-agent team, 3+ tools per sub-agent |
| 13589 | Medical Claims Multi-Agent Processing | Document extraction → validation → coding → approval chain |
| 5819 | Interactive AI Agent with Multiple Tools | Canonical code-mode use case |
| 9933 | Multi-Format Document Processing for RAG | Parse → chunk → embed → upsert pipeline |
| 8578 | Parallel Tasks with Async Processing | Promise.all() pattern |
| 6493 | Weekly ETL: QuickBooks → BigQuery | Classic ETL → one TypeScript function |
| 7066 | Multi-Step Reasoning with Thinking Tools | Chain-of-thought with tool calls per step |
| 6941 | Lead Gen & Qualification with GPT-4o | 5-step tool chain |
| 8460 | Invoice PDF → JSON with Gemini | Data transformation chain |
| 8569 | Multi-Agent Trading Analysis | Market data → analysis → logging across 4+ services |

---

## Selection Criteria

When choosing the next project, weigh:

1. **Token savings potential** — more sequential tool calls = bigger win
2. **Code-mode advantage** — is this specifically better with code-mode, or just "another n8n workflow"?
3. **Build time vs. impact** — 2-3 week projects can ship fast; 4-6 week projects have higher ceilings
4. **Market timing** — self-healing pipelines and SOC triage are trending now
5. **Stack leverage** — projects using n8nac + code-mode together multiply our existing work
6. **Demo-ability** — can you show before/after in a 2-minute video?

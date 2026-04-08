# Workflow Template System

> Develop workflows in the monorepo, distribute via n8n-native sharing. Packages graduate to standalone repos.

## Philosophy

1. **During development**, a monorepo is better — shared tooling, shared context, one git checkout
2. **For distribution**, workflows and packages have different paths:
   - **Workflows** stay in the proving ground and distribute via n8n community templates, JSON export, and blog posts. A repo with one JSON file and a README is overhead for no benefit — people consume n8n workflows by importing JSON, not cloning repos.
   - **Packages** (npm libraries like `code-mode-tools`, `n8nac-tools`) graduate to standalone repos — they need independent versioning, npm publishing, and their own issue trackers.

## Workflow Lifecycle

```
┌─────────┐    ┌─────────┐    ┌────────────┐
│ Scaffold │ →  │  Prove  │ →  │ Distribute │
│ (here)   │    │ (here)  │    │ (from here)│
└─────────┘    └─────────┘    └────────────┘
  monorepo       monorepo       monorepo
```

1. **Scaffold** — `./scripts/new-workflow.sh agents/06-slack-triage "Slack Triage"`
2. **Prove** — build, test, benchmark, document in the monorepo
3. **Distribute** — export workflow.json, submit to n8n community, include in blog posts

### Package Lifecycle (separate)

Packages like `code-mode-tools` and `n8nac-tools` follow a different path: develop in their own repo, publish to npm, reference from the proving ground.

## Directory Structure

### Per-Workflow (inside `workflows/`)

Two layout patterns coexist:

**Flat layout** (existing POCs 01-03, 05):
```
workflows/<slug>/
├── README.md
├── workflow/
│   ├── workflow.ts
│   └── workflow.json
├── test.json
└── benchmark.md
```

**Categorized layout** (new workflows going forward):
```
workflows/<category>/<slug>/
├── README.md
├── workflow/
│   ├── workflow.ts
│   └── workflow.json
├── test.json
└── benchmark.md
```

Existing flat workflows stay where they are (moving them would break links). New workflows should use the categorized layout with one of the categories below.

### Categories

| Category | What Goes Here |
|---|---|
| `agents` | AI agent workflows (LLM-driven, tool-calling) |
| `pipelines` | Data processing pipelines (ETL, enrichment) |
| `triggers` | Event-driven automations (webhook, schedule, RSS) |
| `utilities` | Helper workflows (health checks, monitoring) |

### Shared (repo root)

```
scripts/
├── new-workflow.sh            ← Scaffold from template
├── check-secrets.sh           ← Pre-commit credential detection
template/                      ← The scaffold source files
playbook/                      ← Portable knowledge (lifecycle, benchmarks, architecture)
```

## Workflow README Sections

Every workflow README must have:

| Section | Required | Purpose |
|---|---|---|
| **Overview** | Yes | 2-3 sentences + trigger/nodes/LLM metadata |
| **Flow** | Yes | Mermaid `graph LR` diagram showing node connections |
| **Nodes** | Yes | Table: node name, type, purpose |
| **Test** | Yes (webhooks) | curl command + expected output |
| **Benchmark** | If applicable | Before/after comparison table |
| **Install** | Yes | n8nac push command + JSON import alternative |
| **What This Proves** | Yes | Lifecycle layer + thesis claim |
| **Status** | Yes | Checklist of completion criteria |

## Distribution Readiness

A workflow is ready to distribute when:

- [ ] All status checklist items are complete
- [ ] workflow.json exists and can be imported via n8n UI
- [ ] Test payloads in test.json all pass
- [ ] README has all required sections filled in
- [ ] Mermaid diagram matches actual workflow structure
- [ ] Benchmark data documented (if applicable)

## Creating a New Workflow

```bash
# Scaffold
./scripts/new-workflow.sh agents/06-slack-triage "Slack Message Triage"

# Develop
# (build in n8n UI or write workflow.ts directly)

# Deploy + Test
npx n8nac push 06-slack-triage.workflow.ts
curl -X POST http://$WIN_IP:5678/webhook/slack-triage -d '...'

# Document
# (fill README.md sections, add mermaid diagram)

# Commit
git add workflows/agents/06-slack-triage/
git commit -m "workflow: add slack triage agent"
```

## Inherited Patterns

| Pattern | From | What It Does |
|---|---|---|
| Mermaid per workflow | n8n-autopilot | Visual flow in README + GitHub Pages |
| `<workflow-map>` header | n8n-autopilot | Self-documenting code (node index, routing, AI connections) |
| check-secrets.sh | n8n-autopilot | Pre-commit credential leak detection |
| AGENTS.md | n8n-autopilot | AI agent context for autonomous development |
| Per-workflow README | n8n-workflow-template | Professional, focused docs per workflow |
| Issue templates | n8n-workflow-template | Structured bug/feature reporting |
| workflow.json export | n8n-workflow-template | One-click import into n8n UI |
| Lifecycle framing | code-mode proving ground | "What does this prove?" context |
| Benchmark data | code-mode proving ground | Before/after evidence |

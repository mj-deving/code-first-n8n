# POC Template Structure

Every POC in `pocs/` follows this structure:

```
pocs/NN-descriptive-name/
├── README.md           ← What this POC proves, which lifecycle layer, results summary
├── benchmark.md        ← Before/after measurements (if applicable)
├── workflow.ts         ← n8nac-compatible workflow definition (when available)
├── test.ts             ← Automated test harness (when available)
├── deploy.sh           ← Push + activate via n8nac (when available)
└── assets/             ← Screenshots, execution logs, etc.
```

## Required Fields in README.md

```markdown
# POC-NN: Title

## What This Proves
- **Lifecycle layer:** (Write | Deploy | Test | Debug | Runtime | Full lifecycle)
- **Thesis claim:** (one sentence from THESIS.md this POC validates)

## The Scenario
(What automation this POC implements)

## Results
(Benchmark table or qualitative assessment)

## Status
- [ ] Workflow built
- [ ] Benchmarked
- [ ] workflow.ts exported
- [ ] test.ts written
- [ ] Reproducible from terminal
```

## Lifecycle Layer Mapping

| POC Focus | Lifecycle Layers Proven |
|---|---|
| Token savings benchmark | Runtime |
| MCP tool integration | Runtime + external tools |
| Sibling auto-register | Runtime + zero-config |
| n8nac push + test | Write + Deploy + Test |
| Full dev loop | All layers |

## Graduation

A POC "graduates" when:
1. Results are documented and reproducible
2. `workflow.ts` exists and can be pushed via `n8nac push`
3. `test.ts` exists and passes
4. The README clearly states which thesis claim it validates

Graduated POCs can be extracted into standalone repos or published as n8n workflow templates.

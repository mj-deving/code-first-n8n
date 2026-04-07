# Build & Test Reference

## n8n-nodes-utcp-codemode (monorepo at ~/projects/n8n-nodes-utcp-codemode/)

```bash
# Workspace-level
npm run build          # tsc in core then n8n
npm test               # jest in core (47 tests) then n8n (31 tests)
npm run lint           # tsc --noEmit in both

# Per-package
cd packages/core && npm test    # 47 tests (engine, schema-to-ts, replay, integration)
cd packages/n8n && npm test     # 31 tests (node description, siblingAdapter, CodeModeTool)

# IMPORTANT: build core before n8n (n8n imports core's dist/)
cd packages/core && npm run build && cd ../n8n && npm run build
```

Jest configs are `jest.config.cjs` in each package.

## code-mode-tools (at ~/projects/code-mode-mcp-server/)

```bash
npm run build          # tsc
npm test               # jest (44 tests)
npm run lint           # tsc --noEmit
```

## n8nac-tools (at ~/projects/n8nac-tools/)

```bash
npm run build          # tsc
npm test               # node --experimental-vm-modules jest (50 tests)
npm run lint           # tsc --noEmit
```

## Upstream Library (repo/typescript-library/)

```bash
npm install
npx jest --config jest.config.cjs    # 18/19 pass (1 stale assertion)
```

Jest config renamed from `.js` to `.cjs` for ESM compat.

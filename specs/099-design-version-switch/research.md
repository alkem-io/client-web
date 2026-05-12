# Phase 0 — Research

All open questions from Technical Context resolved here. Each entry follows the Decision / Rationale / Alternatives format.

## R1. CRD `UserMenu` integration consumer

**Decision**: Wire the new `designVersionSwitch` prop into the CRD `UserMenu` from `src/crd/layouts/Header.tsx` (lines 172–185). The Sentry log, the Apollo mutation, and the LS read all live in `useDesignVersionToggle()` (in `src/main/crdPages/`), which `Header.tsx` calls and then passes the resulting props down to `UserMenu`.

**Rationale**: `UserMenu.tsx` is presentational by `src/crd/CLAUDE.md` rules — no Apollo, no GraphQL types, no `@/domain/*` imports. `Header.tsx` is already the integration layer that pulls `user`, `authenticated`, `navigationHrefs`, `onLogout`, etc. via Apollo hooks and converts them into plain props for `UserMenu`. Adding `designVersionSwitch` follows the established pattern.

**Alternatives considered**:
- *Make `UserMenu` itself call the toggle hook* — rejected: violates the CRD presentational contract.
- *New wrapper component between `Header` and `UserMenu`* — rejected: extra indirection for a single prop.

## R2. Sentry info-log helper

**Decision**: Use the existing `info` export from `src/core/logging/sentry/log.ts`. Signature:

```ts
export const info: (error: Error | string, tags?: Tags) => void;
```

Call site shape (in `useDesignVersionToggle`):

```ts
import { info as logInfo } from '@/core/logging/sentry/log';
logInfo(`Design version changed to "${enabled ? '2' : '1'}"`, {
  label: 'DESIGN_VERSION_SWITCH',
  category: 'user-action',
});
```

**Rationale**: This helper is the project's canonical info-level logger — used by `src/main/versionHandling.tsx` for `VERSION_MISMATCH` and similar events. No custom analytics layer exists. Reuse keeps observability consistent.

**Alternatives considered**:
- *New analytics module* — rejected: out of scope, no existing precedent.
- *Generic `console.info`* — rejected: not captured by Sentry, not searchable in dashboards.

## R3. `designVersion` schema state (today)

**Decision**: Treat `designVersion` as **absent** today and gate the codegen step. The PR for this feature MUST be opened after the server deploy that adds `UserSettings.designVersion`. Once `pnpm codegen` runs against the deployed schema, `designVersion: String | null` (string per server spec — values `"1"`/`"2"`) appears in `UserSettings` and `UpdateUserSettingsEntityInput`.

**Rationale**: Confirmed by grep of `src/core/apollo/generated/graphql-schema.ts` — no `designVersion` field anywhere as of branch `099-design-version-switch`. The server plan referenced in the spec (`alkem-io/server@1391196`) defines the field but it's not yet exposed in the deployed schema this repo's backend points at.

**Alternatives considered**:
- *Author a local schema stub for development* — rejected: introduces drift from the server contract and violates Constitution §III (GraphQL Contract Fidelity).
- *Use a typed cast / `any`* — rejected: same reason.

## R4. Reconciliation reload contract

**Decision**:
- `useDesignVersionSync` runs once at app shell (called from `src/root.tsx`).
- On every render where `useCurrentUserContext()` reports `isAuthenticated && !loading && designVersion != null`:
  - Compute `desiredLS = designVersion === '2'`.
  - If `readCrdEnabledFromStorage()` (returns `boolean | null`) equals `desiredLS` → no-op.
  - Otherwise: `writeCrdEnabledToStorage(desiredLS)` then `window.location.reload()`.
- Reload is guarded by a **module-level `let`** flag (`let hasReloaded = false`), set immediately before `reload()`. React Strict Mode's double-effect cannot trigger a second reload because the flag is module-scoped, not state-scoped.
- If the query errors (Apollo's `error` is set), the hook returns without any side effects (FR-008a).

**Rationale**: Plain functional logic — no memoization, no `useEffect` cleanup. Synchronous LS read keeps the existing `useCrdEnabled()` contract intact. The reload-once-per-page-load guarantee comes from the module flag, not from React state, sidestepping concurrency concerns.

**Alternatives considered**:
- *Subscribe to `storage` events for cross-tab live sync* — rejected: spec edge case says "two browser tabs" only needs to follow saved preference on next reload.
- *Block app rendering until preference resolves* — rejected by clarification 2026-05-12 Q1: render cached design immediately, reconcile asynchronously.

## R5. Inverted default for `useCrdEnabled()`

**Decision**: When the LS key is unset (no value cached), `useCrdEnabled()` now returns `true` (CRD/new design). When the LS key is `'true'` → `true`. When the LS key is `'false'` → `false`. The single `try`/`catch` keeps SSR/private-mode safety: any LS access failure falls back to `true` (the new default).

**Rationale**: Clarification 2026-05-12 Q3 makes the new design the platform default for any "no preference known" state, including the first-ever page load before any reconciliation has run. This is the migration-push behavior.

**Implication for existing users**: Users who currently have LS unset (the majority) will see the new design on the next deploy. Anyone who has explicitly toggled (LS set to `'true'` or `'false'`) sees no change.

**Alternatives considered**:
- *Leave default as `false`, rely on server preference only* — rejected: most users don't have a saved preference yet, so they'd remain on the old design indefinitely.
- *Delete the LS key entirely and rely on server* — rejected: would require an async wait at every page load to determine the design, contradicting R4's "render cached design immediately".

## R6. i18n key placement

**Decision**:
- **MUI side**: 2 keys in `src/core/i18n/en/translation.en.json` only:
  - `topBar.designVersion.label` — short label next to the switch
  - `topBar.designVersion.beta` — caption (one sentence)
- **CRD side**: 2 keys × 6 locales under `src/crd/i18n/layout/layout.{en,nl,es,bg,de,fr}.json`:
  - `designVersion.label`
  - `designVersion.beta`

**Rationale**: Per project CLAUDE.md and constitution §3. Main app namespace uses Crowdin (English source only); CRD namespace is AI-assisted with all six locales edited directly.

**Alternatives considered**:
- *Share a single key set across both menus* — rejected: namespaces are isolated by design (translation vs. crd-layout).

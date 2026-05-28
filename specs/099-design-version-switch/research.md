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

## R3. `designVersion` schema state (verified after codegen)

**Decision**: Treat `designVersion` as **absent until codegen** and gate the codegen step. The PR for this feature MUST be opened after the server deploy that adds `UserSettings.designVersion`. Once `pnpm codegen` runs against the deployed schema, `designVersion: Int` (non-null `Scalars['Int']`, server reserves `3+` for future design generations) appears on `UserSettings`, and `designVersion?: InputMaybe<Scalars['Int']['input']>` appears on `UpdateUserSettingsEntityInput`.

**Rationale**: Initial assumption was `String` per the server spec wording; the deployed schema confirmed `Int`. The client narrows the field to `1 | 2 | undefined` in `CurrentUserModel.designVersion` — unexpected values (including `3+`) collapse to `undefined` and are treated as "no preference".

**Alternatives considered**:
- *Author a local schema stub for development* — rejected: introduces drift from the server contract and violates Constitution §III (GraphQL Contract Fidelity).
- *Use a typed cast / `any`* — rejected: same reason.

## R4. Reconciliation reload contract

**Decision**:
- `useDesignVersionSync` runs once at app shell (mounted from `src/root.tsx`).
- On every render where `useCurrentUserContext()` reports `isAuthenticated && !loadingMe && designVersion !== undefined`:
  - Read the cached version via `readDesignVersionFromStorage()` (returns `DesignVersion | null`).
  - If `current === designVersion` → no-op.
  - Otherwise: `writeDesignVersionToStorage(designVersion)` then `window.location.reload()`.
- Reload is guarded by a **module-level** `lastReconciledUserID` (keyed by user id), so React Strict Mode's double-mount cannot trigger a second reload and sign-out → sign-in as a different user re-evaluates exactly once.
- If `designVersion` is `undefined` (Apollo error, unauthenticated, unrecognized `3+` value), the hook returns without any side effects (FR-008a).

**Rationale**: Plain functional logic — no memoization, no `useEffect` cleanup. Synchronous LS read keeps the existing `useCrdEnabled()` contract intact. The reload-once-per-page-load guarantee comes from the module flag, not from React state, sidestepping concurrency concerns.

**Alternatives considered**:
- *Subscribe to `storage` events for cross-tab live sync* — rejected: spec edge case says "two browser tabs" only needs to follow saved preference on next reload.
- *Block app rendering until preference resolves* — rejected by clarification 2026-05-12 Q1: render cached design immediately, reconcile asynchronously.

## R5. Default behavior for `useCrdEnabled()` (~~unchanged~~ → flipped 2026-05-26) + versioned LS

**Decision** *(original 2026-05-12)*: The LS contract changes from boolean (`alkemio-crd-enabled = 'true'/'false'`) to versioned (`alkemio-design-version = '1'/'2'`) — mirroring the server's `Int` field. The default-when-unset semantic is unchanged: `useCrdEnabled()` returns `false` (MUI/old design) when the new key is unset.

**Amendment 2026-05-26**: The "unchanged" half no longer holds — the previously deferred default flip has shipped. `useCrdEnabled()` now returns `readDesignVersionFromStorage() !== DESIGN_VERSION_OLD`, so every "no preference known" state (anonymous, fresh device, missing/unrecognized LS, server field unset) renders CRD. Only an explicit `'1'` opt-in renders MUI. The inversion is non-destructive — existing `'1'` opt-ins are preserved, and authenticated users with a stale `'1'` in LS get corrected by the next `useDesignVersionSync` run after the backend's parallel default flip. The versioned LS half of this decision (boolean → integer key) is unchanged. New exports in `useCrdEnabled.ts`:
- Constants `DESIGN_VERSION_OLD = 1`, `DESIGN_VERSION_NEW = 2` (with a `DesignVersion` union type).
- `readDesignVersionFromStorage()` → `DesignVersion | null`.
- `writeDesignVersionToStorage(version: DesignVersion): void`.
- A one-time module-level migration block that converts any existing `alkemio-crd-enabled` value to the new key and removes the legacy key. The legacy key + migration are scheduled for removal in T025 (~3 releases after #099 ships).

**Rationale**: Clarification 2026-05-13 (superseding 2026-05-12 Q3) keeps the platform default as the old design; flipping it to the new design is deferred to a separate, later milestone. The versioned LS removes the boolean↔integer impedance mismatch between client cache and server preference.

**Implication for existing users**: None visible. Users with `alkemio-crd-enabled = 'true'` are silently migrated to `alkemio-design-version = '2'` on first load; `'false'` → `'1'`; unset stays unset.

**Alternatives considered**:
- *Invert the default to push migration now* — rejected per 2026-05-13 clarification: the team prefers a deliberate, later flip.
- *Delete the LS key entirely and rely on server* — rejected: would require an async wait at every page load to determine the design, contradicting R4's "render cached design immediately".

## R6. i18n key placement

**Decision**:
- **MUI side**: 3 keys in `src/core/i18n/en/translation.en.json` only (English source — Crowdin handles non-EN):
  - `topBar.designVersion.label` — label next to the switch (e.g. "New design (beta)")
  - `topBar.designVersion.caption` — sub-caption (e.g. "The old design will remain available for a short time.")
  - `topBar.designVersion.errorSaving` — non-blocking error notification when the update mutation fails
- **CRD side**: `label` + `caption` × 6 locales under `src/crd/i18n/layout/layout.{en,nl,es,bg,de,fr}.json` (`header.designVersion.label`, `header.designVersion.caption`). The error notification is shown via the integration layer (`useDesignVersionToggle`) which lives outside `src/crd/`, so it reuses the MUI `topBar.designVersion.errorSaving` key.

**Rationale**: Per project CLAUDE.md and constitution §3. Main app namespace uses Crowdin (English source only); CRD namespace is AI-assisted with all six locales edited directly. The beta status is folded into the label string itself (`"New design (beta)"`) rather than a separate "Beta —" prefix on the caption.

**Alternatives considered**:
- *Share a single key set across both menus* — rejected: namespaces are isolated by design (translation vs. crd-layout).

## R7. Migration-nudge modal design *(added 2026-05-26)*

**Decision**: A one-shot CRD-styled dialog mounted at the app shell (in `src/root.tsx`, next to `DesignVersionSyncMount`, outside `TopLevelRoutes`) gates on a 5-part predicate:

```ts
isAuthenticated && !loadingMe && designVersion === DESIGN_VERSION_OLD && !isDismissed && toggle.isVisible
```

The dialog itself is a pure CRD presentational component (`src/crd/components/common/DesignVersionUpgradeDialog.tsx`) that knows nothing about Apollo, auth, or LS. The controller (`src/main/crdPages/DesignVersionUpgradePromptMount.tsx`) reads `useCurrentUserContext()` for the `designVersion` gate, reads `useDesignVersionToggle()` for the confirm action, and owns the per-device dismissal LS marker (`alkemio-design-version-upgrade-dismissed`). Both buttons (Confirm / Dismiss) write the marker, so the modal never re-fires on this device — even if the user later switches back to MUI via the avatar-menu toggle.

**Rationale**:
- **Mount location**: above the route tree so the modal surfaces on any page, not just `/`. Below the providers it needs (UserProvider for current user, AlkemioApolloProvider for the mutation that the toggle hook uses).
- **Cross-shell rendering**: target users are on MUI (`designVersion === 1`). To get the CRD look-and-feel in a Radix portal mounted at `document.body`, `DialogContent` carries `className="crd-root"` — Tailwind preflight scopes via `.crd-root *`, so the dialog's children pick up the CRD resets and theme even though the surrounding shell is MUI.
- **Dismissal-on-confirm**: the confirm flow calls `toggle.onChange(true)` which reloads the page; once the user lands in CRD the gate's `designVersion === 1` check fails so the modal wouldn't re-fire anyway. Writing the marker on confirm is belt-and-suspenders for the case where the user later switches back to MUI.
- **Inline LS helpers, not in `useCrdEnabled.ts`**: this marker is prompt-state, not design-state. Keeping the helpers inline avoids polluting the centralized design-version storage module with unrelated concerns. Two LS keys, two separate concerns.
- **No `useMemo` / `useCallback`**: React Compiler handles memoization; inline handlers are fine.

**Alternatives considered**:
- *Server-side dismissal flag* — rejected for now: requires a new schema field, slower iteration. Per-device LS is acceptable for a one-time welcome — users who clear browser storage seeing it again is fine. Revisit if the modal's CTR is too high to attribute to genuine non-dismissal.
- *Inline modal under each MUI page* — rejected: would require touching every page or every layout. Single mount at the shell is one file.
- *Reuse MUI's Dialog* — rejected: defeats the whole point of giving users a CRD-styled preview of the new design before they commit.
- *Make the modal blocking (no dismiss action, only confirm)* — rejected: contradicts the user-respect framing. Users can opt out for now; the eventual hard cutover is a separate, later decision (T025-style follow-up).

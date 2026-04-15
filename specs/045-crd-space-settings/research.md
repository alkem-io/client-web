# Phase 0 Research: CRD Space Settings Page

**Feature**: 045-crd-space-settings
**Date**: 2026-04-15

All Technical Context items were resolved during the clarification session (spec.md → Clarifications → Session 2026-04-15). Remaining items are design and technology choices relative to the existing 039/041/042/043 migrations.

---

## Decision 1 — Route wiring and toggle gating

**Decision**: Mount CRD Space Settings at the same paths as the current MUI settings area (`/space/:nameID/settings` with sub-paths for each tab). In `TopLevelRoutes.tsx`, branch on `useCrdEnabled()` at the settings route level: when true, render `CrdSpaceSettingsPage`; when false, render the existing MUI `SpaceAdminPage`.

**Rationale**: Same pattern used by 041/042/043 — keeps URLs stable, avoids deep links breaking across the toggle, and localizes the branch to a single route. FR-018 requires a single-release rollout once all 8 tabs are ready, so a coarse-grained branch is sufficient.

**Alternatives considered**:
- Branch per tab: needlessly fine-grained and rejected by Clarification Q1 (no mixed-shell fallback).
- Separate routes for CRD (`/space/:nameID/crd/settings`): breaks deep-link parity and duplicates route config.

---

## Decision 2 — Accessible drag-and-drop library

**Decision**: Add `@dnd-kit/core` + `@dnd-kit/sortable` (and `@dnd-kit/accessibility`) as runtime dependencies for the Layout tab. Implement the keyboard grab-mode specified in FR-021 using dnd-kit's `KeyboardSensor` with a custom coordinate-getter that maps Arrow keys to within-column and cross-column moves; announce grab state, movement, and drop via its built-in `LiveRegion`.

**Rationale**: dnd-kit is the de-facto React 19-compatible DnD library with first-class keyboard and ARIA support; WCAG 2.1 AA compliance is required (FR-020) and the spec's keyboard alternative (FR-021) maps directly onto dnd-kit primitives with no custom screen-reader plumbing required. It is pointer-, keyboard-, and touch-capable out of the box.

**Alternatives considered**:
- `react-beautiful-dnd`: unmaintained; lacks React 19 support.
- `react-dnd`: lower-level; requires custom ARIA live-region handling that dnd-kit already provides.
- Hand-rolled DnD using `pointerdown` + native HTML5 DnD: rejected — keyboard accessibility would be reinvented.

---

## Decision 3 — Dirty-state guard placement

**Decision**: Implement `useDirtyTabGuard()` in `src/main/crdPages/topLevelPages/spaceSettings/`. It wires:
(a) the CRD tab strip's `onTabChange` to open the CRD confirmation dialog when the current tab is dirty,
(b) `react-router-dom`'s `useBlocker` (v6) to intercept full-page navigation,
(c) a `beforeunload` listener for browser-level close/refresh.
It exposes `isDirty`, `markDirty()`, `clearDirty()`, `confirmSwitch(nextTab)` to the page.

**Rationale**: Constitution Principle IV requires side-effects to funnel through shared adapters in `src/main` — routing and browser APIs belong there, not in `src/crd/`. Keeping the hook at the page level also means only one tab can be dirty at a time (Clarification Q2 — Option A).

**Alternatives considered**:
- Per-tab dirty state inside CRD components: violates Principle IV and contradicts the clarification.
- `Prompt`-based gating: removed from react-router v6; `useBlocker` is the supported replacement.

---

## Decision 4 — Per-tab data mapper shape

**Decision**: Each tab gets a pair of files under `src/main/crdPages/topLevelPages/spaceSettings/<tab>/`:
- `use<Tab>TabData.ts` — thin orchestrator: calls existing generated Apollo hooks, exposes `{ data, loading, error, onSave, onReset, isDirty, mutationError }` shaped by the CRD view props.
- `<tab>Mapper.ts` — pure function converting `SpaceSettingsQuery` payloads into the CRD `*View` props.

**Rationale**: Consistent with 043's mapper split. Keeps mutation wiring (impure) separate from data shaping (pure/testable). Each mapper is unit-testable with static fixtures.

**Alternatives considered**:
- Single monolithic `useSpaceSettingsData()`: violates SRP (ISP/SRP in Arch #6) — each tab has distinct mutations.
- Inlined mapping inside components: violates the hard CRD restriction "no GraphQL types in CRD".

---

## Decision 5 — Layout tab pool model and pinned-item detection

**Decision**: The Layout tab's four columns (Home / Community / Subspaces / Knowledge) correspond to the existing tabset definition returned by `SpaceSettingsQuery`. Each page/entry is typed as either **system** (pinned) or **callout** (movable). The mapper flags each entry by inspecting the GraphQL response: entries whose `__typename` resolves to `Callout` (a user-created content / callout) map to `kind: 'callout'`; everything else — collaboration tabs backed by system-provided pages such as the Home tab, Community members list, Subspaces list, and Knowledge base root — map to `kind: 'system'`. The concrete check lives in `layoutMapper.ts` and is the single source of truth; if backend shapes diverge in future, only the mapper changes. Pinned rows render with a lock icon and no grab handle; their `onDragStart` is never wired. Drop targets filter out pinned rows.

**Rationale**: Matches Clarification Q3 answer — "parity with the current behavior, only user-created content/callouts are movable". No backend change required; the discriminator already exists.

**Alternatives considered**:
- Introduce a new `isPinned` field on the server: would violate FR-019 (no GraphQL changes).
- Treat everything as movable and silently revert disallowed moves server-side: poor UX; drops would feel broken.

---

## Decision 6 — Preview card (About tab) update cadence

**Decision**: Preview card updates on every keystroke using the live form state (not the saved state). No debouncing. Since the Preview reads from the dirty form buffer (not Apollo), there is no query or mutation traffic on change.

**Rationale**: FR-005 mandates "live Preview", and since the update is purely a React render with no network cost, debouncing adds latency without any saving. React Compiler memoizes derived props automatically.

**Alternatives considered**:
- Debounce at 200ms: adds perceptible lag for no benefit.
- Update only on blur: contradicts "live" in FR-005.

---

## Decision 7 — i18n namespace strategy

**Decision**: One new namespace, `crd-spaceSettings`, lazy-loaded the same way as `crd-exploreSpaces` / `crd-search`. All 8 tabs share the namespace (no sub-namespacing) because strings are authored for this feature as a unit and are few enough (<200 keys) to stay readable.

**Rationale**: Matches 043's single-namespace-per-feature convention. Tab-level sub-namespaces would force coordinating 8 JSON files for no operational benefit.

**Alternatives considered**:
- Per-tab namespaces: unnecessary fragmentation.
- Reuse `translation` (default): would mix CRD-only copy with the legacy MUI pool; violates `src/crd/CLAUDE.md` guidance.

---

## Decision 8 — Confirmation dialog (delete + tab-switch)

**Decision**: Two CRD primitives in `src/crd/primitives/` cover all confirmation needs:
- `ConfirmDeleteDialog` — destructive action, red confirm button, title/body/confirm-label props.
- `ConfirmDiscardDialog` — neutral dialog used for "You have unsaved changes" on tab switch and page exit; offers **Save**, **Discard & leave**, **Cancel**.

Both are composed from the existing CRD `Dialog` primitive shipped in earlier CRD work. No new Radix components are introduced.

**Rationale**: Two focused components are easier to reason about than one configurable super-dialog (ISP). Both are re-usable by future CRD migrations.

**Alternatives considered**:
- Single generic `ConfirmDialog` with a `variant` prop: weaker types; ISP violation.
- Use browser `confirm()`: lacks styling and a11y focus trap.

---

## Decision 10 — Reuse existing CRD assets instead of creating parallels

**Decision**: Audited `src/crd/**` and confirmed the following assets already exist and MUST be reused (not duplicated) by this feature:

| Asset | Path | Used by |
|---|---|---|
| `ConfirmationDialog` | `src/crd/components/dialogs/ConfirmationDialog.tsx` | FR-014 (destructive delete) and FR-015 (discard-on-tab-switch) — extend in place to cover both variants |
| `MarkdownEditor` | `src/crd/forms/markdown/MarkdownEditor.tsx` | About (vision / mission / impact / who), Community guidelines |
| `MarkdownContent` | `src/crd/components/common/MarkdownContent.tsx` | Read-only markdown rendering if needed |
| `TagsInput` | `src/crd/forms/tags-input.tsx` | About tab tags field |
| `SpaceHeader` | `src/crd/components/space/SpaceHeader.tsx` | Settings hero (verbatim, no changes) |
| `SpaceCard` | `src/crd/components/space/SpaceCard.tsx` | About tab Preview |
| `pickColorFromId` | `src/crd/lib/pickColorFromId.ts` | Called by `aboutMapper.ts` for Preview accent color |

Three primitives exist in the prototype but not yet in `src/crd/primitives/` — they MUST be ported once and then shared: `tabs.tsx`, `textarea.tsx`, `table.tsx` (T004a–T004c). No ad-hoc reimplementations are permitted.

**Rationale**: CRD CLAUDE.md Golden Rule 2 (DRY) and Constitution Arch #6.f. Duplicating `ConfirmationDialog` or the tab primitive would fork maintenance and drift styling.

**Alternatives considered**:
- Creating new `ConfirmDeleteDialog` and `ConfirmDiscardDialog` primitives: rejected — duplicates existing asset.
- Keeping `vision` / `mission` as plain textareas (no markdown): rejected — regression from current MUI Tiptap-based editing; a `MarkdownEditor` already exists.
- Rolling a custom tab bar on pure Tailwind: rejected — Radix Tabs (via shadcn) gives correct ARIA semantics and arrow-key navigation for free.

---

## Decision 9 — Testing scope

**Decision**: Three layers:
1. **Pure-function unit tests** for each `<tab>Mapper.ts` using Vitest and fixtures derived from generated types (converted to plain objects in the test file).
2. **Component tests** for the CRD `*View` components using Vitest + `@testing-library/react` to verify keyboard navigation (tab strip arrow keys, Layout grab-mode), dirty-state emission, and save/reset callbacks.
3. **Integration smoke test** for `useDirtyTabGuard` using a rendered shell with a mocked tab content that toggles dirty, verifying tab-switch is blocked and the confirmation dialog renders.

End-to-end tests (Playwright / Cypress) are out of scope; the project does not run them in CI.

**Rationale**: Matches the testing footprint of 043. Focus is on the high-risk logic (mapping, keyboard DnD, dirty gate) without redoing Apollo mock plumbing that is already covered by existing MUI tests.

**Alternatives considered**:
- Full E2E coverage: not a project convention; disproportionate cost.
- Snapshot tests only: brittle and don't validate behavior.

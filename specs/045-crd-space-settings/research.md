# Phase 0 Research: CRD Space Settings Page

**Feature**: 045-crd-space-settings
**Date**: 2026-04-15

All Technical Context items were resolved during clarification. This document captures the design and technology decisions that inform the 8-tab implementation.

---

## Decision 1 — Route wiring and toggle gating

**Decision**: Mount the CRD Space Settings at the same URL paths as the current MUI settings area (`/space/:nameID/settings` with sub-paths for each tab). `TopLevelRoutes.tsx` branches on `useCrdEnabled()` at the settings route level: true → `CrdSpaceSettingsPage`; false → existing MUI `SpaceAdminPage`.

**Rationale**: Same pattern used by 041/042/043 — keeps URLs stable, preserves deep links across the toggle, and localizes the branch to a single route. FR-030 requires a single-release rollout once all 8 tabs are ready, so a coarse-grained branch is sufficient.

**Alternatives considered**: per-tab branch (fine-grained; rejected by the single-release constraint); separate CRD routes (breaks deep-link parity).

---

## Decision 2 — Accessible drag-and-drop library (Layout tab)

**Decision**: Reuse the already-installed `@dnd-kit/core` + `@dnd-kit/sortable`. No additional dependency is required — the `Announcements` API built into `@dnd-kit/core` covers FR-011's live-region needs (the separate `@dnd-kit/accessibility` package only helps when building a live region **outside** a `DndContext`, which we are not). Implement the keyboard grab-mode via dnd-kit's `KeyboardSensor` with a custom coordinate-getter that maps Arrow keys to within-column and cross-column moves; announce grab state, movement, drop, and cancel via `Announcements`.

**Rationale**: dnd-kit is the de-facto React 19-compatible DnD library with first-class keyboard + ARIA support; FR-011 maps directly onto its primitives with no custom screen-reader plumbing.

**Alternatives considered**: `react-beautiful-dnd` (unmaintained; lacks R19 support); `react-dnd` (lower-level; requires custom ARIA plumbing); hand-rolled DnD (a11y regressions almost guaranteed); adding the separate `@dnd-kit/accessibility` convenience package (redundant given `@dnd-kit/core`'s built-in `Announcements`).

---

## Decision 3 — Dirty-state guard (Layout only)

**Decision**: Implement `useDirtyTabGuard()` in `src/main/crdPages/topLevelPages/spaceSettings/`. It wires:
(a) the CRD tab strip's `onTabChange` to open the CRD `ConfirmationDialog` (discard variant) when the current tab is dirty,
(b) `react-router-dom` v6's `useBlocker` to intercept full-page navigation,
(c) a `beforeunload` listener for browser-level close/refresh.

The hook exposes `isDirty`, `markDirty()`, `clearDirty()`, `confirmSwitch(nextTab)` to the page.

**Important scope narrowing**: Only **Layout** produces dirty state — About uses per-field autosave (Decision 3a) and never sets a dirty flag. The other six tabs commit per-action and never enter a dirty state either. `useDirtyTabGuard` is a no-op on every tab except Layout.

When the admin switches from About to any other tab, the page calls `useAboutTabData().flushPending()` first so that any in-flight debounced autosave fires immediately instead of being dropped. No confirm dialog is needed on About because the user never loses data.

**Rationale**: Principle IV requires side-effects to funnel through shared adapters in `src/main`. One dirty tab at a time per Clarification Q2.

**Alternatives considered**: per-tab dirty state inside CRD (violates Principle IV and the one-dirty-at-a-time invariant); `Prompt`-based gating (removed from react-router v6).

---

## Decision 3a — About save model: per-field autosave

**Decision**: The About tab has NO Save Changes button and NO Reset button (FR-005a). Instead, each field autosaves:

- **Text fields** — 2-second idle debounce. After the admin stops typing for 2 seconds, the hook fires the mutation scoped to that single field (or the minimum mutation set the backend requires). `onChange(patch)` updates the local form state immediately so the Preview card can re-render; the debounce runs on a per-field timer keyed by `AboutFieldKey`.
- **File uploads** — immediate (no debounce). Selecting a file IS the commit.
- **References + Visuals list operations** — add / remove fires immediately.

The view receives an `AboutAutosaveStateMap` and renders the appropriate indicator next to each field's label:
- `saving` → spinner.
- `saved` → grayed "Saved!" text held for exactly **2 seconds**, after which the hook transitions the state back to `idle` and the indicator disappears.
- `error` → inline error; remains until the next `onChange` for that field clears it and restarts the cycle. No auto-retry.

Every indicator slot is a `role="status"` element with `aria-live="polite"` and a descriptive `aria-label` so screen readers announce the state transitions.

The hook exposes `flushPending()` so the page can force any in-flight debounce to fire immediately when the admin navigates away or switches tabs. This removes the need for a confirm dialog on About.

**Rationale**: User instruction. Matches common data-grid / form UX ("keeps typing → autosaves quietly"). Avoids a Save/Reset bar that is forbidden per FR-005a.

**Alternatives considered**:
- Tab-wide Save / Reset (what the earlier iteration of this spec had): rejected by the user.
- Immediate per-keystroke save (no debounce): rejected — would fire a mutation on every keystroke.
- Single debounced flush of the whole form: rejected — per-field indicators are clearer for the admin.

---

## Decision 4 — Layout save model: local dirty buffer + Reset

**Decision**: The Layout tab uses a single in-memory buffer rooted at `useLayoutTabData.ts`. It shadows the backend `SpaceSettingsQuery` payload. Every user action — drag within column, drag across columns, Move-to, Remove from Tab, Undo removal, inline rename of column title, inline rename of column description, flip of the Post description display toggle — mutates the buffer **only**. Individual callout title and description are NOT editable here (edited from the post's own page); they're rendered read-only. The sticky Save Changes / Reset bar appears when the buffer diverges from the backend snapshot.

**Zero-mutations-until-Save invariant (FR-008a)**: The hook MUST NOT call any mutation, deletion query, or optimistic-update helper before Save Changes is clicked. Every intermediate state — including pending removals — lives exclusively in the in-memory buffer. If the admin resets, refreshes, closes the tab, or chooses Discard in the navigation-confirm dialog, the backend is bit-for-bit unchanged.

Specifically:

- **Drag / keyboard move / Move to** edit the buffer's column assignment for the callout; the `callouts-set` membership on the server is untouched.
- **Remove from Tab** sets `pendingRemoval: true` on the buffered callout. The row stays visible with pending-removal styling; the buffer continues to own the callout's position and metadata.
- **Undo removal** clears `pendingRemoval`.
- **Inline rename of a column** updates the buffer's column `title` / `description`; the backend is untouched. (Callouts themselves are not renamed here.)
- **Post description display toggle** updates the buffered `calloutDescriptionDisplayMode`; the space's `settings.layout` is untouched.

**Save Changes** flushes the buffer in a single `useTransition` block. The hook computes the minimum set of mutations needed to bring the backend into alignment with the buffer:
- callouts whose column assignment differs from the backend snapshot → reorder / move mutations.
- callouts with `pendingRemoval: true` → unassign against the existing tabset-assignment / callouts-set membership mutation (NO callout deletion).
- columns whose title or description differs → column-rename mutations.
- Post description display differs → `updateSpaceSettings`.

If any mutation errors, the hook marks `saveBarState = { kind: 'saveError', message }`, keeps the buffer dirty, and surfaces an inline error banner in the Layout view. Partial success is not stored — the whole buffer remains pending so the admin can Retry or Reset.

**Reset** discards the buffer and re-seeds it from the latest backend snapshot; the action bar disappears.
**Backend snapshot** is retained on the hook; an Apollo `refetch` advances the snapshot after Save success.

**Rationale**: Matches the user's explicit instruction (session 2 clarifications). Batching on Save avoids per-drag network chatter and lets the admin stage a complex reorganization before committing.

**Alternatives considered**: per-action auto-save (user explicitly rejected); optimistic-update-then-reconcile (more complex and does not add value for this flow).

---

## Decision 5 — Layout deferred **per-column** menu

**Decision**: Implement the two **per-column** (innovation-flow step) actions the current MUI exposes — **Active phase** and **Default post template** — as a first-class part of the Layout feature **now**, but hide their UI trigger until the designer specifies placement on the column header. These are column-level (innovation-flow-step-level) concerns, NOT per-callout.

Implementation:

- `src/main/crdPages/topLevelPages/spaceSettings/layout/useDeferredColumnMenu.ts` exposes: `onChangeActivePhase(columnId, phaseId): void`, `onSetAsDefaultPostTemplate(columnId, templateId): void`, and the supporting query/mutation wiring.
- The hook returns `isDeferredMenuVisible: false` (hard-coded) so the Layout view renders **no** visible overflow trigger on column headers.
- Both callbacks are covered by unit tests that exercise the mutation paths end-to-end against mocked Apollo responses for each column.
- When the designer provides the CTA location on the column header, a follow-up patch flips `isDeferredMenuVisible` to `true` and places the overflow trigger on whichever column-header subsurface the designer chooses — no other code changes required.

**Rationale**: The user explicitly wants the mutations ready so surfacing the menu later is a one-line component change. This matches SC-009.

**Alternatives considered**: waiting for the designer before implementing (adds a release cycle delay); shipping the CTA in an unapproved location (designer review blocks merge).

---

## Decision 5a — Visible per-callout kebab menu (Layout tab)

**Decision**: The prototype specifies a three-entry kebab on every movable callout row:

1. **Move to** — submenu listing the other three columns (the current column is omitted). Buffered like drag-and-drop; re-uses the same `onReorder` pipeline under the hood with the target index appended to the destination column.
2. **View Post** — navigates to the post's existing route. Immediate; blocked by the FR-026 discard-confirm dialog if the Layout buffer is dirty.
3. **Remove from Tab** — **unassigns** the callout from its current column (by updating the existing tabset-assignment / callouts-set membership). It does NOT delete the callout. Buffered like any other layout change; flushed via Save Changes.

This visible kebab is **per-callout** and is **separate** from the deferred **per-column** "Active phase" / "Default post template" actions in Decision 5. The two menus attach to different surfaces (callout row vs column header). Flipping `isDeferredMenuVisible` surfaces the column menu without touching the per-callout kebab.

**Pending-removal state.** "Remove from Tab" does NOT immediately hide the row. It sets `pendingRemoval: true` on the callout in the buffer. The row stays visible with reduced opacity + strikethrough (or a small "will be removed" badge — designer's final pick) and the kebab swaps its Remove entry for an **Undo removal** entry. Save Changes flushes the pending unassignment; Reset clears the flag; navigating away discards it. This matches the FR-008a zero-mutations-until-Save invariant and keeps the intermediate state legible and reversible.

**Rationale**: The prototype screenshot is the designer's source of truth for this kebab. Reusing the existing `onReorder` + unassign mutations keeps GraphQL changes at zero (FR-031). Keeping removed rows visible (instead of hiding them) mirrors what Save Changes will do with far less cognitive load than "where did my callout go?" invites.

**Alternatives considered**:
- Only exposing drag-and-drop (no kebab): rejected — the designer specified this kebab; keyboard-first admins benefit from a menu alternative that doesn't require targeting a drop zone.
- Adding a dedicated "delete callout" action here: rejected — callouts are created and deleted elsewhere in the product (FR-007). "Remove from Tab" is the correct unassign-only semantic.
- Requiring a confirm dialog for Remove from Tab: rejected — equivalent to dragging a callout off the board; consistent with drag-and-drop which has no confirm.

---

## Decision 6 — Per-tab data mapper shape

**Decision**: Each tab has a pair of files under `src/main/crdPages/topLevelPages/spaceSettings/<tab>/`:

- `use<Tab>TabData.ts` — thin orchestrator: calls existing generated Apollo hooks, wraps mutations in `useTransition`, returns the CRD view props shape for that tab.
- `<tab>Mapper.ts` — pure function converting `SpaceSettingsQuery` / tab-specific payloads into the CRD `*View` props. Pure and fixture-unit-testable.

**Rationale**: Consistent with 043. Keeps mutation wiring (impure) separate from data shaping (pure).

**Alternatives considered**: monolithic `useSpaceSettingsData()` (violates SRP — each tab has distinct mutations); inlined mapping inside components (violates "no GraphQL types in CRD").

---

## Decision 7 — Layout pool model and pinned-item detection

**Decision**: The Layout tab's four columns (Home / Community / Subspaces / Knowledge) correspond to the existing tabset definition returned by `SpaceSettingsQuery`. Each entry is typed as either **system** (pinned) or **callout** (movable). The mapper flags entries by inspecting `__typename === 'Callout'` (movable) versus any other shape (pinned). `layoutMapper.ts` is the single source of truth; if backend shapes diverge later, only the mapper changes.

**Rationale**: Matches the user's "only callouts move" instruction. No backend change required.

**Alternatives considered**: new `isPinned` field (would violate FR-031 / no-GraphQL-changes); silent server-side reverts (poor UX).

---

## Decision 8 — Preview card update cadence (About tab)

**Decision**: Preview updates on every keystroke using live form state (not the saved state). No debouncing. Since Preview reads from the dirty form buffer (not Apollo), there is zero network cost on change. React Compiler memoizes derived props automatically.

**Rationale**: FR-005 mandates "live Preview"; no benefit to debouncing a pure render.

**Alternatives considered**: 200ms debounce (adds lag for no gain); update-on-blur (contradicts "live").

---

## Decision 9 — Community tab table composition

**Decision**: The Community tab renders three independent tables, each a `CommunityUsersTable.tsx` / `CommunityOrgsTable.tsx` / `CommunityVirtualContributorsTable.tsx` composition over the shared `table.tsx` primitive and a shared `MemberRow` template component. The main users table is always visible and shows ~10 rows per page. The Organizations and Virtual Contributors sections are collapsed by default; on expand, each renders its own table with ~5 rows visible.

Each table gets its own mutations but shares search / filter / kebab / row primitives. This avoids merging three different entity shapes (user / org / VC) into a single discriminated-union component (ISP).

**Rationale**: The user explicitly wants three tables, not a merged super-table. Shared row template keeps DRY.

**Alternatives considered**: one super-table with a discriminator column (user / org / VC) — rejected; breaks ISP and mixes domain concepts.

---

## Decision 10 — i18n namespace strategy

**Decision**: One new namespace, `crd-spaceSettings`, lazy-loaded like `crd-exploreSpaces` / `crd-search`. All 8 tabs share the namespace.

**Rationale**: 043 convention. Tab-level sub-namespaces would fragment 8 JSON files for no operational benefit (<300 keys total expected).

**Alternatives considered**: per-tab namespaces (fragmentation); `translation` default (mixes with MUI pool — forbidden by `src/crd/CLAUDE.md`).

---

## Decision 11 — Confirmation dialog reuse (destructive + discard)

**Decision**: Reuse and extend the existing `src/crd/components/dialogs/ConfirmationDialog.tsx`. If its current API does not already cover the three-action "Save / Discard & leave / Cancel" case used by FR-026, extend it in place with a discriminated-union `variant: 'delete' | 'discard'`. Keep the destructive `variant: 'delete'` (red confirm button) for tabs that delete items.

**Rationale**: DRY (Arch #6.f) and CRD folder convention. A single confirmation primitive is easier to maintain than a family.

**Alternatives considered**: separate `ConfirmDeleteDialog` and `ConfirmDiscardDialog` primitives (rejected — duplicates an existing asset); browser `confirm()` (no styling / focus trap).

---

## Decision 12 — Testing scope

**Decision**: Three layers:

1. **Pure-function unit tests** for each `<tab>Mapper.ts` using Vitest and plain-object fixtures (no generated-type imports in tests — fixtures are shaped by hand).
2. **Component tests** for CRD `*View` components via Vitest + `@testing-library/react` to verify keyboard navigation (tab strip arrows, Layout grab-mode), dirty-state emission (Layout only), save / reset callbacks (Layout), per-field autosave-state rendering (About), and the absence of Save / Reset buttons on About.
3. **Integration smoke tests** for `useDirtyTabGuard` (blocked tab-switch while dirty) and `useDeferredColumnMenu` (both per-column Active-phase and Default-post-template actions exercised end-to-end with the flag both off and on, so flipping the flag in a follow-up requires no additional test work).

End-to-end tests (Playwright / Cypress) are out of scope — not a project convention.

**Rationale**: Matches 043's testing footprint. Focus on high-risk logic (mapping, keyboard DnD, dirty buffer, deferred menu) without redoing Apollo mock plumbing already covered by MUI tests.

**Alternatives considered**: full E2E (disproportionate cost); snapshot tests only (brittle).

---

## Decision 13 — Reuse existing CRD assets instead of creating parallels

**Decision**: Audited `src/crd/**` and confirmed these assets already exist and MUST be reused:

| Asset | Path | Used by |
|---|---|---|
| `ConfirmationDialog` | `src/crd/components/dialogs/ConfirmationDialog.tsx` | FR-026 / FR-027 — extended in place |
| `MarkdownEditor` | `src/crd/forms/markdown/MarkdownEditor.tsx` | About (What / Why / Who), Community guidelines |
| `MarkdownContent` | `src/crd/components/common/MarkdownContent.tsx` | Read-only markdown rendering if needed |
| `TagsInput` | `src/crd/forms/tags-input.tsx` | About tab tags field |
| `SpaceHeader` | `src/crd/components/space/SpaceHeader.tsx` | Settings hero (verbatim, no changes — SC-008) |
| `SpaceCard` | `src/crd/components/space/SpaceCard.tsx` | About tab Preview |
| `pickColorFromId` | `src/crd/lib/pickColorFromId.ts` | Called by `aboutMapper.ts` for Preview accent color |

Three primitives exist in the prototype but not yet under `src/crd/primitives/` and MUST be ported once and shared: `tabs.tsx`, `textarea.tsx`, `table.tsx`. One NEW shared composite: `src/crd/components/common/InlineEditText.tsx` — used by the Layout column title, column description, and per-callout title / description (four call sites, one implementation).

**Rationale**: `src/crd/CLAUDE.md` Golden Rules 2 (DRY) and Constitution Arch #6.f. Duplicating any of these would fork maintenance.

**Alternatives considered**: creating parallel confirm dialogs / tab components (rejected — duplicates existing asset); skipping `InlineEditText` and inlining the inline-edit pattern into each component (rejected — four call sites demand a shared primitive).

---

## Decision 14 — Subspaces scope reduction

**Decision**: The Subspaces tab retains every capability the current MUI Subspaces page offers — Default Subspace Template selector, Create Subspace, and the per-subspace kebab with **Pin / Unpin (alphabetical only), Save as Template, Delete**. It additionally adopts the prototype's search / filter-by-archived / Grid-List view toggle and routes subspace-title clicks to the subspace page.

Explicitly excluded in this iteration:

- **"Edit Details"** kebab entry (prototype-only) — deferred pending designer review.
- **"Archive"** kebab entry (prototype-only) — deferred pending designer review. (Note: `SpaceVisibility.Archived` already exists on the schema; filtering by it is in scope. **Setting** it from the kebab is not.)
- **Reordering / drag-sort** — not in scope. The user explicitly stated it is not in the current UI from the admin's perspective and should not be invented.
- **Kebab "View" entry** (prototype-only) — redundant with title-click; dropped.

**Rationale**: User instruction, session 2 clarifications. Holds scope bounded until designer review.

**Alternatives considered**: shipping the full prototype kebab (rejected by user); shipping zero kebab changes (rejected — Archive filter is valuable).

---

## Decision 15 — Storage tab: retain current tree browser

**Decision**: The Storage tab keeps the current MUI hierarchical document browser: folders + files with expand/collapse, size / uploader / uploaded-at columns, Open-in-new-tab and Delete actions. It is restyled with the CRD `table.tsx` primitive but the UX is preserved verbatim. The prototype's info-card-only view is NOT adopted.

**Rationale**: The prototype design is a functional regression (no way to see or manage documents). User explicitly chose to keep current UX.

**Alternatives considered**: adopt prototype info-card (rejected — removes capability).

---

## Decision 16 — Post description display toggle placement

**Decision**: The `calloutDescriptionDisplayMode` setting (Collapsed / Expanded) currently lives on the MUI Settings page under Collaboration. In CRD Space Settings it moves to the **Layout** tab because it controls how callouts render on the public Space page. Reuse the existing `updateSpaceSettings` mutation. The toggle value is included in the Layout dirty buffer and committed with Save Changes.

**Rationale**: Matches the user's explicit request ("we have this in the old design and we need to have it under Layout again") and aligns the setting with the rest of Layout's callout-rendering concerns.

**Alternatives considered**: leaving it under Settings (mismatches user instruction); duplicating it in both places (confusing UX and no value).

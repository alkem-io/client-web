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

**Decision**: The Layout tab uses a single in-memory buffer rooted at `useLayoutTabData.ts`. It shadows the backend `InnovationFlowSettingsQuery` + `SpaceSettingsQuery` payload. Every user action — drag within column, drag across columns, Move-to, inline rename of column title, inline rename of column description, flip of the Post description display toggle — mutates the buffer **only**. Individual callout title and description are NOT editable here (edited from the post's own page); they're rendered read-only. The sticky Save Changes / Reset bar appears when the buffer diverges from the backend snapshot.

**Zero-mutations-until-Save invariant (FR-008a)**: The hook MUST NOT call any buffered mutation before Save Changes is clicked. If the admin resets, refreshes, closes the tab, or chooses Discard in the navigation-confirm dialog, the backend is bit-for-bit unchanged. **Exception**: the per-column overflow menu's Active phase and Default post template actions (see Decision 5) are immediate — not buffered — because they are column-level metadata, not layout-reorder operations.

Specifically (buffered):

- **Drag / keyboard move / Move to** edit the buffer's column assignment for the callout.
- **Inline rename of a column** updates the buffer's column `title` / `description`.
- **Post description display toggle** updates the buffered `calloutDescriptionDisplayMode`.

**Save Changes** flushes the buffer in a single `useTransition` block. The hook computes the minimum set of mutations needed:
- callouts whose column assignment or order differs from the backend snapshot → `updateCallout` (classification.flowState tagset rewrite) + `updateCalloutsSortOrder`.
- columns whose title or description differs → `updateInnovationFlowState` mutation, PLUS cascading re-tag of every callout tagged with the old displayName (backend links callouts by state-name string, not FK — see `useInnovationFlowSettings` for the pattern).
- Post description display differs → `updateSpaceSettings`.

If any mutation errors, the hook marks `saveBarState = { kind: 'saveError', message }`, keeps the buffer dirty, and surfaces an inline error banner in the Layout view. Partial success is not stored — the whole buffer remains pending so the admin can Retry or Reset.

**Reset** discards the buffer and re-seeds it from the latest backend snapshot; the action bar disappears.
**Backend snapshot** is retained on the hook; an Apollo `refetch` advances the snapshot after Save success.

**Rationale**: Matches the user's explicit instruction (session 2 clarifications). Batching on Save avoids per-drag network chatter and lets the admin stage a complex reorganization before committing.

**Alternatives considered**: per-action auto-save (user explicitly rejected); optimistic-update-then-reconcile (more complex and does not add value for this flow).

---

## Decision 5 — Layout per-**column** overflow menu

**Decision**: Render a three-dot overflow button in the top-right of each column header card. Clicking it opens a dropdown with the two per-**column** (innovation-flow step) actions the current MUI exposes — **Active phase** and **Default post template**. These are column-level concerns, NOT per-callout.

Implementation:

- `src/main/crdPages/topLevelPages/spaceSettings/layout/useColumnMenu.ts` exposes: `onChangeActivePhase(columnId, phaseId): void`, `onSetAsDefaultPostTemplate(columnId, templateId): void`, and the supporting query/mutation wiring (`availablePhases`, `availablePostTemplates`).
- **Concrete mutations** (already in the codebase — reused unchanged):
  - Active phase → `useUpdateInnovationFlowCurrentStateMutation` (GraphQL: `updateInnovationFlowCurrentState`); reference implementation in `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx`.
  - Default post template (set) → `useSetDefaultCalloutTemplateOnInnovationFlowStateMutation` (GraphQL: `setDefaultCalloutTemplateOnInnovationFlowState`).
  - Default post template (clear) → `useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation` (GraphQL: `removeDefaultCalloutTemplateOnInnovationFlowState`).
  - All three are wrapped in `useTransition` per Constitution Principle II.
- `LayoutPoolColumn.tsx` renders the three-dot button and the dropdown; the column header contains **only** the inline-editable title, the inline-editable description, and this menu — no icon, no count badge, no collapse arrow.
- Both callbacks are covered by unit tests that exercise the mutation paths end-to-end against mocked Apollo responses for each column.

**Rationale**: The user explicitly wants the mutations ready so surfacing the menu later is a one-line component change. This matches SC-009.

**Alternatives considered**: waiting for the designer before implementing (adds a release cycle delay); shipping the CTA in an unapproved location (designer review blocks merge).

---

## Decision 4a — Inline-edit hover pattern

**Decision**: `InlineEditText` (shared primitive used by Layout column title, Layout column description, and any About-tab field the designer places as plain-text-with-edit) MUST render its value as plain text by default. On hover it MUST show a subtle underline on the text and a small trailing pencil icon. Clicking the text OR the pencil enters edit mode. Matches the prototype's Home-tab title affordance (the one shown with the pencil on hover).

**Rationale**: FR-006a pins this as the canonical inline-edit affordance. A single shared primitive keeps all call sites visually identical.

**Alternatives considered**:
- Always-visible pencil button: rejected — visually noisy on forms with many fields; doesn't match the prototype.
- Click-to-edit with NO pencil hint: rejected — poor discoverability; screen-reader users need the pencil as a keyboard-focusable affordance.

---

## Decision 5a — Visible per-callout kebab menu (Layout tab)

**Decision**: Each callout row exposes a two-entry kebab:

1. **Move to** — submenu listing the other columns on the current board (dynamic count). Buffered; re-uses the same `onReorder` pipeline under the hood with the target index appended to the destination column.
2. **View Post** — navigates to the post's existing route. Immediate; blocked by the FR-026 discard-confirm dialog if the Layout buffer is dirty.

No "Remove from Tab" / "Undo removal" — the backend has no unassigned state for a callout, so there's nothing to unassign to. Deleting a callout happens from the post's own page.

This visible kebab is **per-callout** and is **separate** from the per-**column** "Active phase" / "Default post template" menu in Decision 5. The two menus attach to different surfaces — the per-callout kebab lives on each row; the per-column overflow menu lives in the top-right of each column header.

**Rationale**: The backend `classification.flowState` tagset requires at least one tag per callout; there is no null / unassigned state. Removing from a tab would require a backend schema change, which is explicitly out of scope (FR-031).

**Alternatives considered**:
- Only exposing drag-and-drop (no kebab): rejected — keyboard-first admins benefit from a menu alternative that doesn't require targeting a drop zone.
- Adding a "Remove from Tab" action: rejected — backend constraint (every callout must carry at least one flowState tag).
- Adding a dedicated "delete callout" action here: rejected — callouts are created and deleted elsewhere in the product (FR-007).

---

## Decision 6 — Per-tab data mapper shape

**Decision**: Each tab has a pair of files under `src/main/crdPages/topLevelPages/spaceSettings/<tab>/`:

- `use<Tab>TabData.ts` — thin orchestrator: calls existing generated Apollo hooks, wraps mutations in `useTransition`, returns the CRD view props shape for that tab.
- `<tab>Mapper.ts` — pure function converting `SpaceSettingsQuery` / tab-specific payloads into the CRD `*View` props. Pure and fixture-unit-testable.

**Rationale**: Consistent with 043. Keeps mutation wiring (impure) separate from data shaping (pure).

**Alternatives considered**: monolithic `useSpaceSettingsData()` (violates SRP — each tab has distinct mutations); inlined mapping inside components (violates "no GraphQL types in CRD").

---

## Decision 7 — Layout column model (dynamic, no pinned items)

**Decision**: Columns on the Layout board are DYNAMIC — count and order come from `innovationFlow.states` returned by `useInnovationFlowSettingsQuery`. Each column's `id` is the state UUID; its `title` is the state `displayName`; its `description` is the state `description`. Callouts are grouped into columns by matching the callout's `classification.flowState.tags[0]` (a state displayName string) to the column's `title`. `layoutMapper.ts` is the single source of truth.

**No pinned / system items.** The backend has no concept of a pinned or immovable callout — every callout can be dragged and moved freely. The earlier draft's "pinned system entries" language was removed after confirming with the audit.

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
3. **Integration smoke tests** for `useDirtyTabGuard` (blocked tab-switch while dirty) and `useColumnMenu` (both per-column Active-phase and Default-post-template actions exercised end-to-end).

End-to-end tests (Playwright / Cypress) are out of scope — not a project convention.

**Rationale**: Matches 043's testing footprint. Focus on high-risk logic (mapping, keyboard DnD, dirty buffer, per-column menu wiring) without redoing Apollo mock plumbing already covered by MUI tests.

**Alternatives considered**: full E2E (disproportionate cost); snapshot tests only (brittle).

---

## Decision 12a — Shared Explore-Spaces card component

**Decision**: The About tab's live Preview card uses the SAME CRD component that will power the CRD Explore Spaces page when it is built. The component is introduced as shared infrastructure in this feature (About is the first consumer) so a future Explore Spaces migration consumes the same primitive instead of forking a near-duplicate.

Behavior:
- Visual: banner image (with deterministic `pickColorFromId` fallback), space avatar overlaid on the banner, public / private badge, name, description, tags (truncated to ~3 visible), LEADS row with small avatars, member count with icon.
- Props are plain TypeScript (per CRD CLAUDE.md) — no GraphQL types. The About mapper and any future Explore mapper each produce the component's prop shape.
- File location: `src/crd/components/space/SpaceCard.tsx`. If a component with the same name already exists, it is extended BC-safely rather than duplicated (DRY per Arch #6.f).

**Audit outcome (existing component vs target)**: The current `src/crd/components/space/SpaceCard.tsx` already renders the full target visual the About Preview needs — banner + gradient fallback, avatar, public/private badge, name, description line-clamp, tags (≤3 + `+N`). The card also supports LEADS rows + parent indicators + a membership badge, but those are not editable from About and therefore simply aren't populated by the About mapper (the SpaceCard already hides sections whose data is absent). **Conclusion: no changes needed to `SpaceCard.tsx` for the About Preview** — the About mapper simply constructs a minimal `SpaceCardData` from live form state, passes it to the existing component, and lets unset sections render empty. The component stays untouched; all 8 existing call sites are unaffected.

**Rationale**: User instruction — the About Preview shows a card that matches Explore exactly. Shipping it once here avoids a second port later.

**Alternatives considered**:
- About-only Preview built inline: rejected — when Explore is migrated, it would either duplicate the card or retrofit a shared primitive.
- Defer the shared component until Explore is spec'd: rejected — About needs a faithful Preview today.

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

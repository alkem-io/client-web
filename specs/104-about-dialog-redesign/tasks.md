---
description: "Task list for About Dialog Redesign (Prototype → CRD)"
---

# Tasks: About Dialog Redesign (Prototype → CRD)

**Input**: Design documents from `/specs/104-about-dialog-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/SpaceAboutView.contract.ts, quickstart.md

**Tests**: No new component tests requested (presentational re-skin). The automated gate is the existing `src/crd/i18n/space/space.parity.test.ts` + `pnpm lint`. New unit tests are NOT generated; verification is via the standalone preview, the running app, lint, and the i18n parity suite.

**Organization**: Tasks are grouped by user story. Note: this is a re-skin concentrated in two CRD files (`SpaceAboutView.tsx`, `SpaceAboutDialog.tsx`). US1 rebuilds the shared layout; US2–US4 preserve/relocate specific behaviors **within** that rebuilt layout, so they build on US1 rather than being fully file-independent. `[P]` is only marked where tasks genuinely touch different files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 / US4 (maps to spec user stories)

## Path Conventions

CRD presentational layer: `src/crd/components/space/`, `src/crd/i18n/space/`, `src/crd/app/pages/`.
Integration layer: `src/main/crdPages/{space,subspace}/about/`. Reference: `prototype/src/app/components/space/AboutThisSpaceDialog.tsx` (read-only).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the baseline and confirm reuse so no scaffolding is built unnecessarily.

- [ ] T001 Capture the current dialog's behavior as the regression baseline: open the About dialog from both the sidebar trigger and the `/about` route on a fully-populated space, and note the exact settings destinations each edit pencil navigates to (description/why/who/references/members), the apply/member states, the lock state, and the guidelines read-more — recorded against `src/main/crdPages/space/about/CrdSpaceAbout.tsx` and `src/main/crdPages/subspace/about/CrdSubspaceAbout.tsx` as the parity reference for this feature.
- [ ] T002 Re-read the prototype reference `prototype/src/app/components/space/AboutThisSpaceDialog.tsx` and confirm every reused CRD primitive exists (`tooltip`, `scroll-area`, `avatar`, `separator`, `button`, `dialog` in `src/crd/primitives/`) — confirming research R8 (no new primitives, no new runtime deps).

**Checkpoint**: Baseline behavior + prototype layout understood; reuse confirmed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared assets every story renders against — i18n labels and the optional prop surface. MUST complete before the story phases.

**⚠️ CRITICAL**: The view/dialog rebuild in US1 references these keys/props.

- [ ] T003 [P] Add any new design-system labels the redesign needs (e.g. specific edit-affordance `aria-label`s/tooltips such as "Edit space profile" and "Manage community", plus any section labels not already present) under the `about.*` group in `src/crd/i18n/space/space.en.json`. Reuse existing keys (`about.edit`, `about.members`, `about.leads`, `about.hostedBy`, `about.references`, `about.contactHost`, `about.readMore`, `about.close`, `about.lockTooltip`, `about.context.*`) wherever they already cover the label.
- [ ] T004 [P] Mirror the exact keys added in T003 into `src/crd/i18n/space/space.nl.json`, `space.es.json`, `space.bg.json`, `space.de.json`, and `space.fr.json` (translated values; English brand terms per the Dutch glossary). All 6 files MUST end with identical key sets so `space.parity.test.ts` passes.
- [ ] T005 Extend the prop contract per `contracts/SpaceAboutView.contract.ts`: add the OPTIONAL `onEditProfile?: () => void` to `SpaceAboutViewProps` (and pass-through on `SpaceAboutDialogProps`) in `src/crd/components/space/SpaceAboutView.tsx` and `src/crd/components/space/SpaceAboutDialog.tsx`, defaulting the panel's profile-edit affordance to `onEditDescription` when omitted so no integration site is forced to change.

**Checkpoint**: Labels exist in all languages; optional prop surface is in place.

---

## Phase 3: User Story 1 - Visitor reads about a space in the redesigned dialog (Priority: P1) 🎯 MVP

**Goal**: The About dialog presents existing space information using the prototype's layout: name+tagline header, a prominent space-info panel (description, location, member count, leads), and Why/Who/Guidelines/References/Hosted-by sections — with sticky header, scrollable body, clean omission of missing sections, rich-text rendering, and avatar fallbacks.

**Independent Test**: Open the dialog on a fully-populated space and on a sparse space; confirm layout parity with the prototype, name+tagline heading, all data present, missing sections omitted cleanly, header/close pinned while the body scrolls.

### Implementation for User Story 1

- [ ] T006 [US1] Redesign the dialog shell header in `src/crd/components/space/SpaceAboutDialog.tsx`: make the visible `DialogTitle` the space **name** with the **tagline** rendered beneath it (italic), keep an accessible sr-only description, keep the `lockTooltipSlot` pinned in the header, and preserve the sticky-header / `flex-1 min-h-0 overflow-y-auto` scroll-body shell with a `max-h-[85vh]` height cap (matching the prototype; replaces the current `h-[95vh]`) (FR-001, FR-008, FR-009; R2/R7).
- [ ] T007 [US1] Rebuild the space-info panel at the top of `src/crd/components/space/SpaceAboutView.tsx` to match the prototype: a prominent accent panel containing the description (via `MarkdownContent`), a meta row with location + member count, and the leads (people + organizations) showing avatar/fallback + name only — **do NOT render per-lead location** (explicit decision; the host card in T010 still shows location) — using Tailwind + design tokens (no literal `rgb()`/inline styles) and semantic typography tokens (FR-001, FR-002, FR-012, FR-013; R3).
- [ ] T008 [US1] Convert the Why and Who sections in `src/crd/components/space/SpaceAboutView.tsx` to the prototype's bordered cards with leading icons (Target for Why, Users for Who) and the level-aware `whyTitle`/`whoTitle` headings; render bodies via `MarkdownContent` (FR-001, FR-012, FR-014; R4).
- [ ] T009 [US1] Convert the References section in `src/crd/components/space/SpaceAboutView.tsx` to the prototype's bordered tiles (external-link icon, title, optional description, host-domain link) (FR-001; R4) — link behavior verified in US4.
- [ ] T010 [US1] Restyle the "Hosted by" block in `src/crd/components/space/SpaceAboutView.tsx` to the prototype's host card (avatar/fallback, name, location) keeping the `contactHostSlot` affordance in place; preserve the existing fallback layout when there are no leads vs. when leads occupy the top area (FR-001, FR-002, FR-013, FR-015; R4).
- [ ] T011 [US1] Position the `guidelinesSlot` (`CommunityGuidelinesBlock`) within the new section order to match the prototype; do not change its behavior here (FR-001; alignment only — read-more verified in US4).
- [ ] T012 [US1] Enforce clean omission across `src/crd/components/space/SpaceAboutView.tsx`: every section renders only when its data is present OR the viewer can edit it; no empty placeholders or layout gaps for sparse spaces (FR-011, SC-006).
- [ ] T013 [US1] Accessibility pass on `src/crd/components/space/SpaceAboutView.tsx` and `SpaceAboutDialog.tsx`: interactive elements are `<a>`/`<button>`, icon-only buttons have `t()`-sourced `aria-label`, decorative icons `aria-hidden`, visible `focus-visible:ring`, lists use `<ul>`/`<li>`; no hardcoded user-facing strings (FR-016, FR-017).

**Checkpoint**: The redesigned dialog renders the full prototype layout from real data; MVP visual parity achieved and verifiable on both entry points.

---

## Phase 4: User Story 2 - Visitor applies to join from the About dialog (Priority: P1)

**Goal**: The apply/join CTA and member indication behave exactly as before within the new layout.

**Independent Test**: As a non-member, confirm the apply/join control appears (only after apply data loads) and launches the existing flow + dialogs; as a member, confirm the member indication appears and no apply control shows.

### Implementation for User Story 2

- [ ] T014 [US2] Place the `joinSlot` in the redesigned `src/crd/components/space/SpaceAboutView.tsx` at the prototype-appropriate position and render the member indication (driven by `isMember`) — preserving the current "shown only to eligible non-members once apply data loaded" gating that the integration layer controls (FR-003, FR-004).
- [ ] T015 [US2] Verify (no logic change expected) that `src/main/crdPages/space/about/CrdSpaceAbout.tsx` and `src/main/crdPages/subspace/about/CrdSubspaceAbout.tsx` still pass `joinSlot`/`isMember` unchanged and that the apply flow + its follow-up `dialogs` still mount correctly with the redesigned dialog (FR-003).

**Checkpoint**: Apply/join and member states work identically to the pre-redesign dialog.

---

## Phase 5: User Story 3 - Admin edits space content from the dialog (Priority: P2)

**Goal**: Edit affordances appear only for privileged users and navigate to the same settings destinations as today, including the prototype's space-info panel profile/community edits.

**Independent Test**: As an admin, confirm edit pencils on description/panel, Why, Who, Guidelines, References, and members/community; activate each and confirm it lands on the same settings destination recorded in T001. As a non-admin, confirm no edit affordances.

### Implementation for User Story 3

- [ ] T016 [US3] Render the edit affordances in the redesigned `src/crd/components/space/SpaceAboutView.tsx`, gated by `hasEditPrivilege`: per-section pencils (description, why, who, references) wired to the existing callbacks, the space-info panel's "edit space profile" wired to `onEditProfile ?? onEditDescription`, and "manage community" wired to `onEditMembers`; each icon-only control gets a `t()` `aria-label` (FR-005, FR-016; R3).
- [ ] T017 [P] [US3] In `src/main/crdPages/space/about/CrdSpaceAbout.tsx`, pass `onEditProfile` if a distinct profile destination is desired (otherwise rely on the `onEditDescription` fallback); confirm all `onEdit*` callbacks still navigate to the same `buildSettingsUrl(...)` destinations as before (FR-005).
- [ ] T018 [P] [US3] Mirror the T017 change in `src/main/crdPages/subspace/about/CrdSubspaceAbout.tsx` so the subspace About keeps identical edit-destination behavior (FR-005, FR-010).

**Checkpoint**: All edit affordances visible only to admins and land on unchanged settings destinations across space + subspace.

---

## Phase 6: User Story 4 - Visitor reads guidelines, references, and contacts the host (Priority: P2)

**Goal**: Guidelines expand to full text, references open externally without dismissing the dialog, and the host-contact affordance keeps its current behavior.

**Independent Test**: On a space with long guidelines + several references + a host: expand guidelines to full text, open a reference in a new tab (dialog stays open), and use the host affordance to reach the host.

### Implementation for User Story 4

- [ ] T019 [US4] Align the `CommunityGuidelinesBlock` header (icon + title) with the prototype's guidelines card in `src/crd/components/space/CommunityGuidelinesBlock.tsx` WITHOUT changing its read-more/expand behavior (FR-006; R5).
- [ ] T020 [US4] Confirm each reference tile in `src/crd/components/space/SpaceAboutView.tsx` opens its destination via `target="_blank" rel="noopener noreferrer"` and does not dismiss/navigate the dialog (FR-007).
- [ ] T021 [US4] Keep the host-contact affordance as the existing link within the "Hosted by" card (restyled), and confirm the prototype's standalone message-compose sub-dialog is intentionally NOT added — `contactHostSlot` continues to come from the integration layer unchanged in `src/crd/components/space/SpaceAboutView.tsx` (FR-015; R6).

**Checkpoint**: Guidelines/references/host behaviors preserved within the new layout.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Keep the standalone preview building, guard invariants, and run the verification gates from quickstart.md.

- [ ] T022 [P] Update the standalone preview `src/crd/app/pages/SpacePage.tsx` so its mock props satisfy the redesigned `SpaceAboutDialog`/`SpaceAboutView` (including any new optional prop) and the About renders correctly under `pnpm crd:dev`.
- [ ] T023 [P] Grep `src/crd/components/space/SpaceAboutView.tsx`, `SpaceAboutDialog.tsx`, and `CommunityGuidelinesBlock.tsx` for forbidden imports (`@mui/*`, `@emotion/*`, `@/core/apollo`, `@/domain/*`, `react-router-dom`) and any GraphQL generated types — confirm zero (CRD golden rules; Constitution II/III).
- [ ] T024 Run `pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic` and confirm i18n key parity across all 6 language files passes.
- [ ] T025 Run `pnpm lint` (TypeScript + Biome + ESLint incl. react-compiler) and `pnpm vitest run`; fix any issues introduced by the redesign.
- [ ] T026 Execute the `quickstart.md` acceptance walk-through (10 checks) against the running app for both entry points (sidebar trigger + `/about`) and both space levels (L0 + subspace), confirming zero functional regressions vs. the T001 baseline (SC-001..SC-006).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: After Setup. Blocks all story phases (US1 references the keys/props).
- **US1 (Phase 3, P1)**: After Foundational. Rebuilds the shared layout — the MVP.
- **US2 (Phase 4, P1)**: After US1 (places the join CTA inside the rebuilt view).
- **US3 (Phase 5, P2)**: After US1 (edit affordances live inside the rebuilt view); T017/T018 (integration files) are parallel to each other.
- **US4 (Phase 6, P2)**: After US1 (guidelines/references/host live inside the rebuilt view); independent of US2/US3.
- **Polish (Phase 7)**: After all desired stories complete.

### User Story Dependencies

- US1 is the foundation for the visual; US2, US3, US4 each preserve a distinct behavior within US1's rebuilt view and are independently testable once US1 is in place.
- US2, US3, US4 do not depend on each other.

### Within Each User Story

- US1: shell header (T006) and view sections (T007–T012) can proceed once Foundational is done; the a11y pass (T013) comes last.
- US3: the view-side affordances (T016) before/with the integration wiring (T017, T018).

### Parallel Opportunities

- T003 and T004 (en vs. the 5 translated files) — different files, parallel.
- T017 and T018 (space vs. subspace integration) — different files, parallel.
- T022 and T023 (preview vs. import audit) — parallel.
- NOTE: T006–T013 mostly touch the two shared files (`SpaceAboutView.tsx`, `SpaceAboutDialog.tsx`); sequence them to avoid edit conflicts — they are NOT marked [P].

---

## Parallel Example: Foundational i18n

```bash
# After T003 defines the keys in en, mirror them across languages in parallel:
Task: "Mirror new about.* keys into src/crd/i18n/space/space.nl.json / es / bg / de / fr (T004)"
# And later, integration wiring for both levels in parallel:
Task: "Wire onEditProfile + confirm edit destinations in CrdSpaceAbout.tsx (T017)"
Task: "Mirror onEditProfile + confirm edit destinations in CrdSubspaceAbout.tsx (T018)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1.
4. **STOP and VALIDATE**: open the dialog from both entry points; confirm prototype layout parity and that all data renders. This is a demoable MVP (the dialog already preserves apply/edit wiring from the integration layer).

### Incremental Delivery

1. Setup + Foundational → ready.
2. US1 → visual parity (MVP) → demo.
3. US2 → confirm apply/member parity.
4. US3 → confirm admin edit parity (incl. subspace).
5. US4 → confirm guidelines/references/host parity.
6. Polish → preview + lint + parity test + quickstart walk-through.

### Notes

- `[P]` = different files, no incomplete dependencies.
- This is a re-skin with **no GraphQL/schema/data-model changes** — never edit `src/domain/space/about/*` (legacy MUI).
- Commit after each logical group (commits handled manually by the user).
- Stop at any checkpoint to validate a story independently against the T001 baseline.
</content>

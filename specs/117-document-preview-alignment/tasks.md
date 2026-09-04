# Tasks: Document Preview Alignment

**Input**: Design documents from `specs/117-document-preview-alignment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No project initialization needed — all infrastructure exists. This feature modifies existing files only.

(No tasks — existing project, existing dependencies, existing test infrastructure.)

---

## Phase 2: Foundational

**Purpose**: No foundational/blocking prerequisites — all shared modules (`collaboraDocumentPreview.ts`, `contributionDataMapper.ts`) already exist and are unchanged.

(No tasks — both user stories can start immediately.)

---

## Phase 3: User Story 1 - Document contributions use the overlay "+N more" pattern (Priority: P1)

**Goal**: Document contributions with >4 items display the overlay "+N more" card (blurred overlay on the 4th slot) instead of the dashed placeholder, matching whiteboard and memo contributions.

**Independent Test**: Render `ContributionsPreviewConnector` with a callout containing 5 document contributions and confirm the 4th slot renders the overlay pattern (icon + blurred "+2 more" count) rather than a dashed placeholder card.

### Implementation for User Story 1

- [X] T001 [US1] Add `CalloutContributionType.CollaboraDocument` to the `usesOverlayPattern` check in `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx` — extend the boolean condition on the `usesOverlayPattern` variable to include Document alongside Whiteboard and Memo
- [X] T002 [US1] Add a Document branch to the `OverlayMoreCard` function in `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx` — when `contributionType === CollaboraDocument`, render the type icon (from `iconByType`) centered with accent color (from `colorByType`), using `lastContribution?.documentType ?? 'text'` as the type key; import `iconByType` and `colorByType` from `@/crd/lib/collaboraDocumentPreview` and `toCollaboraPreviewType` from the local `collaboraDocumentTypeMap`
- [X] T003 [US1] Pass `previewUrl` from `ContributionCardData` to `ContributionDocumentCard` in the `ContributionCard` switch's `CollaboraDocument` case in `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx` — thread the field so the card receives it when eventually populated

**Checkpoint**: Document contributions with >4 items now render with the overlay "+N more" pattern matching whiteboard/memo. Verify with `pnpm vitest run` and `pnpm lint`.

---

## Phase 4: User Story 2 - Document contribution card supports a preview image (Priority: P2)

**Goal**: `ContributionDocumentCard` accepts an optional `previewUrl` and renders it full-bleed with hover zoom when present, falling back to the type-icon treatment when absent or on load error.

**Independent Test**: Render `ContributionDocumentCard` with a mock `previewUrl` and confirm image renders; render without and confirm icon renders; simulate image error and confirm fallback.

### Implementation for User Story 2

- [X] T004 [P] [US2] Add `previewUrl?: string` prop to `ContributionDocumentCardProps` and implement the image-or-icon rendering branch in `src/crd/components/contribution/ContributionDocumentCard.tsx` — when `previewUrl` is provided and loadable, render `<img>` with `object-cover` and `group-hover/doc:scale-105`; when absent or errored, render the existing type-icon treatment; use `useState` to track errored URL for fallback (same pattern as `CalloutCollaboraPreview`)
- [X] T005 [P] [US2] Create unit tests in `src/crd/components/contribution/ContributionDocumentCard.test.tsx` — cover: (1) renders type icon when no `previewUrl`, (2) renders `<img>` when `previewUrl` provided, (3) falls back to type icon on image load error via `fireEvent.error`, (4) renders correct icon per `documentType` variant, (5) hover overlay and gradient footer present in both branches

**Checkpoint**: `ContributionDocumentCard` now supports preview images with proper fallback. All tests pass with `pnpm vitest run`.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across both user stories.

- [X] T006 Run `pnpm vitest run` — all existing + new tests pass
- [X] T007 Run `pnpm lint` — zero new warnings or errors
- [X] T008 Run `pnpm build` — production build succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — no setup needed
- **Foundational (Phase 2)**: Skipped — no blocking prerequisites
- **User Story 1 (Phase 3)**: Can start immediately; T001 → T002 → T003 (sequential within one file)
- **User Story 2 (Phase 4)**: Can start immediately (independent of US1); T004 and T005 are parallel (different files)
- **Polish (Phase 5)**: Depends on both US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Modifies only `ContributionsPreviewConnector.tsx`.
- **User Story 2 (P2)**: No dependencies on other stories. Modifies only `ContributionDocumentCard.tsx` + creates test file.

US1 and US2 touch different files and can be implemented in parallel.

### Parallel Opportunities

- T004 and T005 within US2 are parallel (component file vs test file)
- US1 (T001-T003) and US2 (T004-T005) are fully parallel (different files)

---

## Parallel Example

```bash
# US1 and US2 can run simultaneously:
# Worker A: T001 → T002 → T003 (all in ContributionsPreviewConnector.tsx)
# Worker B: T004 + T005 in parallel (ContributionDocumentCard.tsx + test file)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T003 (overlay pattern alignment)
2. **STOP and VALIDATE**: `pnpm vitest run` + `pnpm lint`
3. This alone closes the visible alignment gap

### Incremental Delivery

1. US1 (T001-T003): Overlay pattern — visible user improvement
2. US2 (T004-T005): Image branch — structural forward-compatibility
3. Polish (T006-T008): Full gate pass

---

## Notes

- All tasks modify existing files — no new files except the test (T005)
- No GraphQL, no schema, no new dependencies, no new i18n keys
- The `previewUrl` field already exists on `ContributionCardData` — no mapper changes needed
- Commit after each user story phase for clean git history

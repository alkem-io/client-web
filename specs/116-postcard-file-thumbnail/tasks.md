---
description: "Task list for 116-postcard-file-thumbnail (story #9872)"
---

# Tasks: Render File Thumbnail / Preview in Post Cards

**Input**: Design documents from `/specs/116-postcard-file-thumbnail/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓
**Story**: alkem-io/client-web#9872

**Tests**: REQUIRED — the constitution's testing gate and this repo's exit gates mandate `pnpm lint` + `pnpm vitest run`; new/changed behaviour gets unit coverage. Tests are written test-first where feasible.

**Scope of this PR**: **US1 (P1) + US2 (P2) + US3 (P3) all ship in this one PR** — the whole feature is one small, cohesive component change; there is no reason to split it across PRs (unlike 107-crd-error-pages, there is no P4-style deferred cleanup).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = type-differentiated card preview, US2 = card/dialog parity, US3 = forward-compatible `previewImageUrl` seam

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the worktree builds and the existing suite is green before changes.

- [ ] T001 Verify deps installed and baseline gates pass in the worktree: `pnpm install` (if needed), `pnpm vitest run` (record baseline pass count), `pnpm lint`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the existing building blocks this story extends are present and unchanged before touching them — no new i18n keys, no new dependencies are needed (research.md R4/R5).

- [ ] T002 Confirm reusable infra is present and unchanged: `CalloutCollaboraPreview`'s existing `iconByType`/`typeLabelKey` maps, `CollaboraDocumentPreviewType`, `mapCollaboraDocumentTypeToPreviewType` (in `calloutDataMapper.ts`), the existing `callout.documentText`/`documentSpreadsheet`/`documentPresentation` i18n keys (all six locales, `src/crd/i18n/space/space.<lang>.json`), and `PostCardData.framingImageUrl`'s whiteboard precedent in `PostCard.tsx`. No code change — verification only.

**Checkpoint**: Building blocks confirmed; no i18n or dependency work needed for this story.

---

## Phase 3: User Story 1 - Type-differentiated preview in the feed card (Priority: P1) 🎯 MVP

**Goal**: A member sees a distinct icon color per OfficeDocs kind (Doc=blue, Sheet=green, Slide=orange) on the Post card, replacing the flat, undifferentiated icon.

**Independent Test**: Render `PostCard`/`CalloutCollaboraPreview` with each of the three `CollaboraDocumentPreviewType` values and confirm distinct colors on both the badge and the centered fallback icon.

### Tests for User Story 1 (write first, expect FAIL before impl)

- [ ] T003 [US1] Create `src/crd/components/callout/CalloutCollaboraPreview.test.tsx` per the contract's test list items 1–3, 7, 8 (per-type badge text + icon color for `text`/`spreadsheet`/`presentation`; `onReplace` gating regression; `size="compact"`/`size="default"` render without throwing). Expect the color assertions to FAIL (component not yet changed).

### Implementation for User Story 1

- [ ] T004 [US1] Edit `src/crd/components/callout/CalloutCollaboraPreview.tsx`: add a `colorByType: Record<CollaboraDocumentPreviewType, string>` map (`text → 'text-blue-600'`, `spreadsheet → 'text-green-600'`, `presentation → 'text-orange-600'`) alongside the existing `iconByType`; apply `colorByType[documentType]` to both the centered fallback `Icon` (replacing `text-muted-foreground/50`) and the badge `Icon` (previously uncolored). Leave the outer box, background, hover overlay, and buttons untouched (FR-003). Makes T003's color assertions PASS.

**Checkpoint**: Feed card shows type-differentiated colors; T003 fully green; hover/click/Replace-file behaviour unchanged.

---

## Phase 4: User Story 2 - Card/dialog parity (Priority: P2)

**Goal**: The post/callout detail dialog shows the identical treatment as the feed card for the same document — verified explicitly, not assumed from shared-component incidence.

**Independent Test**: Render `CalloutCollaboraPreview` at `size="compact"` and `size="default"` with the same `documentType` and confirm identical icon colors (already exercised by T003/T004 since both sizes go through the one component); additionally confirm `CollaboraFramingConnector` (the dialog's actual call site) passes `documentType` through unchanged.

### Implementation for User Story 2

- [ ] T005 [US2] Read `src/main/crdPages/space/callout/CollaboraFramingConnector.tsx` and confirm it needs **no code change** — it already renders `<CalloutCollaboraPreview documentType={...} onOpen={...} onReplace={...} />` (no `size` override, defaults to `"default"`), so T004's color mapping applies automatically. Add a one-line comment-free verification note is not needed; instead extend T003 (already covers both sizes) — this task is a documented no-op confirmation, not a file edit.

**Checkpoint**: Dialog and card verified to share identical treatment by construction; no divergence risk (spec FR-008/SC-002).

---

## Phase 5: User Story 3 - Forward-compatible real-thumbnail seam (Priority: P3)

**Goal**: `CalloutCollaboraPreview` can render a real preview image the instant one is supplied, with graceful failure handling; `PostCardData`/`calloutDataMapper.ts` carry the (currently always-`undefined`) field so a future backend change is a one-line mapper edit only.

**Independent Test**: Render `CalloutCollaboraPreview` with a mocked `previewImageUrl` → image renders, correct `alt`; omit it → icon fallback (today's real behaviour); fire `onError` → falls back to icon. Render `PostCard` and confirm `framingDocumentPreviewUrl` flows through to the underlying `CalloutCollaboraPreview`'s `previewImageUrl` prop. Assert `mapCalloutDetailsToPostCard(...).framingDocumentPreviewUrl` is `undefined` for a `CollaboraDocument` framing fixture (documents current production state).

### Tests for User Story 3 (write first, expect FAIL before impl)

- [ ] T006 [P] [US3] Extend `src/crd/components/callout/CalloutCollaboraPreview.test.tsx` with the contract's test list items 4–6 (image renders in place of icon when `previewImageUrl` present; `onError` falls back to icon; no `<img>` when `previewImageUrl` omitted). Expect FAIL (prop does not exist yet).
- [ ] T007 [P] [US3] Create `src/main/crdPages/space/dataMappers/calloutDataMapper.test.ts`: a minimal `CalloutDetailsModelExtended`-shaped fixture with `framing.type = CalloutFramingType.CollaboraDocument`, asserting `mapCalloutDetailsToPostCard(...).framingDocumentPreviewUrl === undefined` and `.framingDocumentType` is correctly derived (regression coverage — this mapper had no prior test file). Should PASS immediately (field doesn't exist yet, so accessing it is `undefined` — this test therefore also validates T008/T009 don't accidentally start returning a value).

### Implementation for User Story 3

- [ ] T008 [US3] Edit `src/crd/components/callout/CalloutCollaboraPreview.tsx`: add optional `previewImageUrl?: string` prop and a local `imageErrored` boolean (`useState`, visual-only, reset not required); when `previewImageUrl && !imageErrored`, render `<img src={previewImageUrl} alt={typeLabel} className="w-full h-full object-cover" onError={() => setImageErrored(true)} />` in place of the centered icon; otherwise render the icon fallback from T004. Makes T006 PASS.
- [ ] T009 [P] [US3] Edit `src/crd/components/space/PostCard.tsx`: add `framingDocumentPreviewUrl?: string` to `PostCardData` (documented as "document framing only", mirroring `framingImageUrl`'s doc comment), and pass `previewImageUrl={post.framingDocumentPreviewUrl}` to the `CalloutCollaboraPreview` call in the `post.type === 'document'` branch.
- [ ] T010 [P] [US3] Edit `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`'s `mapCalloutDetailsToPostCard`: add `framingDocumentPreviewUrl: undefined` (with a comment referencing that no backend field exists yet — see spec Assumptions A-001/A-002) alongside the existing `framingDocumentType` assignment, keeping the field's presence and typing testable even though its value is always `undefined` today. Keeps T007 PASS.

**Checkpoint**: The forward-compatible seam exists end-to-end (mapper → `PostCardData` → `PostCard` → `CalloutCollaboraPreview`) and is fully covered by tests using mocked data, even though production data never populates it yet.

---

## Phase 6: Polish & Verification

- [ ] T011 Run targeted tests: `pnpm vitest run src/crd/components/callout/CalloutCollaboraPreview.test.tsx src/main/crdPages/space/dataMappers/calloutDataMapper.test.ts src/crd/components/space/PostCard.test.tsx --reporter=basic` — all green.
- [ ] T012 Run full exit gates: `pnpm vitest run` (no regressions vs T001 baseline) and `pnpm lint` (TypeScript + Biome + ESLint clean). Fix any failures and re-run.
- [ ] T013 Self-review the diff against the contract (`contracts/CalloutCollaboraPreview.md`): confirm BG-1 through BG-7 all hold; confirm zero new GraphQL/i18n/dependency changes (FR-010/FR-011/SC-003); confirm `CollaboraFramingConnector.tsx` is untouched (US2 by construction); confirm no `@mui/*`/`@emotion/*` anywhere in the diff.

**Checkpoint**: PR mergeable — spec, plan, and contract all satisfied; gates green.

---

## Dependencies & Execution Order

### Phase dependencies
- Setup (T001) → first.
- Foundational (T002) → after Setup; verification-only, blocks nothing but confirms assumptions before edits begin.
- US1 (T003–T004) → after Foundational. Test-first: T003 before T004.
- US2 (T005) → after US1 (relies on T004's color mapping already applying to `size="default"`); no file edit, verification only.
- US3 (T006–T010) → after US1 (extends the same component/file T004 already touched). T006/T007 [P] (different files) before T008/T009/T010. T009 and T010 [P] (different files) after T008 (both consume the same component's new prop shape, but only T009's compile depends on nothing from T008 — kept sequential-safe by doing T008 first regardless).
- Polish (T011–T013) → after US1+US2+US3.

### Within US1
- T003 (test) before T004 (impl) — test-first.

### Within US3
- T006, T007 in parallel (different files: component test vs mapper test).
- T008 (component prop) before T009/T010 are *not* strictly blocked code-wise (T009/T010 only touch `PostCard.tsx`/`calloutDataMapper.ts`), but do them after T008 so the whole seam is reviewed as one coherent unit.
- T009, T010 in parallel after T008 (different files: `PostCard.tsx` vs `calloutDataMapper.ts`).

### Parallel opportunities
- T006 and T007: independent test files (component vs mapper).
- T009 and T010: independent implementation files (`PostCard.tsx` vs `calloutDataMapper.ts`).

## Implementation Strategy

MVP = US1 only (the visible fix for #9575's outstanding AC). US2 is a verification checkpoint with zero extra code. US3 is the "don't build a parallel mechanism" seam explicitly requested by the story (AC3) — small enough, and tightly coupled enough to US1's same file, to ship in the same PR rather than deferring. Complete Setup → Foundational → US1 → US2 → US3 → Polish → open PR as one slice.

## Notes
- [P] = different files, no dependency.
- Commit in logical slices: (a) US1 color mapping + test, (b) US3 `previewImageUrl` seam (component + `PostCard` + mapper) + tests, (c) polish/gate fixes if any.
- All commits signed (repo requirement).
- Keep the tree green between commits.

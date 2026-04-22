# Tasks: CRD Memo Migration

**Feature**: CRD Memo Migration (sub-spec of `042-crd-space-page`)
**Branch**: `042-crd-space-page-5`
**Spec**: [./spec.md](./spec.md) | **Plan**: [./plan.md](./plan.md)

## User Stories (derived from spec acceptance criteria)

- **US1 (P1)** — Memo framing preview: a callout framed by a memo shows a bordered, cropped preview with an "Open memo" button inside `PostCard`; click stacks the callout dialog and the memo dialog.
- **US2 (P1)** — Memo contribution cards + unified "+N more": memo contributions render with visual parity to whiteboard cards; overlay-on-last-visible-card pattern applies to both whiteboards and memos.
- **US3 (P1)** — CRD collaborative memo editor: full-screen memo dialog in CRD with shared toolbar and a `CollaborativeMarkdownEditor` that accepts opaque `ydoc` + `provider` props; Hocuspocus/Yjs stay in the integration layer.
- **US3b (P1)** — Memo contribution lifecycle: members on a memo-contribution callout can (a) add a new memo contribution via an "Add memo" card, and (b) open an existing memo contribution from the feed preview or the detail dialog grid for real-time collaborative editing. Contribution-mode editor footer exposes Delete (permission-gated), which calls `useDeleteContributionMutation`.
- **US4 (P2)** — Parity, a11y, cleanup: i18n keys, keyboard & focus-trap QA across the stacked dialogs, removal of any residual MUI memo-dialog imports from CRD pages.

Each user story is independently testable: US1 and US2 render with a stub `onOpen` that logs; US3 is verifiable via a throwaway integration that passes a fresh provider to `MemoEditorShell`; US4 is a pass/fail checklist.

---

## Phase 1: Setup

> **Note on folder creation**: The folder `src/main/crdPages/memo/` is created implicitly when T021/T022/T023 land their files. No placeholder `index.ts` — per constitution Architecture Standard #5, barrel `index.ts` files are forbidden.

- [X] T001 [P] Audit existing CRD whiteboard components referenced by the plan to confirm file paths are current: read `src/crd/components/callout/CalloutWhiteboardPreview.tsx`, `src/crd/components/contribution/ContributionWhiteboardCard.tsx`, `src/crd/components/whiteboard/WhiteboardEditorShell.tsx`, `src/crd/components/whiteboard/WhiteboardDisplayName.tsx`, and `src/main/crdPages/whiteboard/whiteboardFooterMapper.ts`. Note any drift from the plan in a scratch comment on this task.
- [X] T002 [P] Audit existing MUI memo implementation to lock down the extension list and provider shape: read `src/domain/collaboration/callout/CalloutFramings/CalloutFramingMemo.tsx`, `src/domain/collaboration/memo/MemoPreview/MemoPreview.tsx`, `src/domain/collaboration/memo/MemoDialog/MemoDialog.tsx`, `src/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput.tsx`, and the Tiptap extensions hook used by both editors. Record exact extension imports and options so T015 / T018 can port them verbatim.
- [X] T003 [P] Audit existing CRD `CalloutDetailDialog` at `src/main/crdPages/space/callout/CalloutDetailDialog.tsx` (path assumed — confirm). Verify it renders an open memo dialog slot or an `initialMemoOpen`/`openMemoOnMount` prop. If neither exists, record the gap so T010 can extend it rather than assume the prop exists.
- [X] T003a [P] **Resolved by audit** — `src/crd/i18n/space/space.en.json` already exists (442 lines) and `crd-space` is registered in `src/core/i18n/config.ts`. No work required. T008/T014/T016 just add new keys to the existing file.

---

## Phase 2: Foundational (blocking prerequisites)

- [X] T004 Add a `CroppedMarkdown` primitive at `src/crd/primitives/croppedMarkdown.tsx`. Props: `content: string`, `maxHeight?: string` (default `8rem`), `className?: string`. Renders `MarkdownContent` inside a bounded-height div with a Tailwind `mask-image` linear-gradient fade on the bottom edge. No MUI. No business logic.
- [X] T005 [P] Add a `collaborative?: boolean` prop to `src/crd/forms/markdown/MarkdownToolbar.tsx`. When `true`, hide (do not merely disable) undo and redo buttons. Default `false`. Update any existing callers to pass `collaborative={false}` explicitly only if the linter flags it; otherwise rely on the default.
- [X] T006 [P] Define opaque collab shapes in a new file `src/crd/forms/markdown/collabProviderTypes.ts`:
  - `CollabProviderLike`: `{ awareness: { setLocalStateField: (k: string, v: unknown) => void; getStates: () => Map<number, unknown> }; status: 'connecting' | 'connected' | 'disconnected'; on(event: string, cb: (...args: unknown[]) => void): void; off(event: string, cb: (...args: unknown[]) => void): void; destroy(): void }`
  - `YDocLike`: minimal shape the Tiptap `Collaboration` extension needs — exported as an opaque structural type that `Y.Doc` satisfies without the CRD side importing `yjs`. Recommended definition: `export type YDocLike = { readonly __ydocBrand: unique symbol } & Record<string, unknown>` — a branded opaque handle. The integration layer creates a real `Y.Doc` and casts once at the boundary (`ydoc as unknown as YDocLike`). This keeps the spec's "zero `yjs` imports under `src/crd/`" acceptance criterion literally true (no `import`, no `import type`).
  - Zero import from `@hocuspocus/provider` or `yjs` anywhere in this file or any `src/crd/` file.

**Checkpoint**: After T004–T006, US1 can start (needs `CroppedMarkdown`). US2 can start in parallel. US3 needs `CollabProviderLike` + toolbar prop before its editor implementation.

---

## Phase 3: User Story 1 — Memo framing preview (P1)

**Goal**: When a callout's framing is a memo, `PostCard` renders a bordered, cropped memo preview with an "Open memo" button. Clicking it opens the callout detail dialog with the memo dialog stacked on top.

**Independent test**: With CRD on, open a Space containing a memo-framed callout. Verify the preview renders inside `PostCard`, the fade mask is visible when content overflows, and clicking "Open memo" fires the `onOpen` handler (verifiable with a stub before US3 exists; real dialog wiring lands in US3/T023).

- [X] T007 [US1] Create `src/crd/components/callout/CalloutMemoPreview.tsx`. Props: `{ content: string; onOpen: () => void; openLabel?: string }`. Mirrors `CalloutWhiteboardPreview` layout: bordered block, `<CroppedMarkdown content={content} maxHeight="16rem" />` filling the content area (framing uses the larger of the two heights per plan M4), explicit "Open memo" button (visual language matches the whiteboard preview — button is inside the block, not seamless inline). No MUI, no GraphQL.
- [X] T008 [P] [US1] Add CRD i18n keys for memo framing to `src/crd/i18n/space/space.en.json` (namespace `crd-space`, per plan decision M7): `memo.openMemo`, `memo.preview.readonly` (reserved for US3 but cheaper to add in one pass). Consumer uses `useTranslation('crd-space')`.
- [X] T009 [US1] Wire `CalloutMemoPreview` — implemented as `MemoFramingConnector` (mirrors `WhiteboardFramingConnector`), wired into `CalloutDetailDialogConnector` into `src/main/crdPages/space/callout/CalloutListConnector.tsx`: when `framing.type === CalloutFramingType.Memo` (confirm exact enum name from the existing switch on framing type), render `CalloutMemoPreview` in the `PostCard` framing slot. Pass the memo markdown from the framing payload. `onOpen` opens the callout detail dialog and sets local `memoDialogOpen` state (see T010).
- [X] T010 [US1] Extend `src/crd/components/callout/CalloutDetailDialog.tsx` with a new optional slot prop `memoFramingSlot?: ReactNode` (mirrors the existing `whiteboardFramingSlot`). Render it in the same region as the whiteboard slot. Integration owns opening state — the connector passes either a stub dialog (US1 demo) or the real `<CrdMemoDialog>` (US3) via this slot. No `openMemoOnMount` flag on the detail dialog.
- [X] T035 [US1] Extend `src/crd/components/space/PostCard.tsx` and `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` so memo-framed callouts show a feed-level preview (mirrors the whiteboard thumbnail):
  - `PostType` union gains `'memo'`.
  - `PostCardData` gains `framingMemoMarkdown?: string`.
  - `typeIcons['memo'] = StickyNote`, `typeLabels['memo'] = 'callout.memo'`.
  - Add a conditional branch alongside the existing `post.type === 'whiteboard' && post.framingImageUrl` branch: when `post.type === 'memo' && post.framingMemoMarkdown`, render a compact `<CroppedMarkdown content={post.framingMemoMarkdown} maxHeight="10rem" />` with the same hover overlay + "Open memo" button treatment the whiteboard branch uses (button is wired to the same `onClick` callback as the card title, so clicking it opens the callout detail dialog).
  - `mapFramingTypeToPostType` returns `'memo'` for `CalloutFramingType.Memo`.
  - `mapCalloutDetailsToPostCard` populates `framingMemoMarkdown` from `callout.framing.memo?.markdown` when the framing type is memo. (The lightweight list-query mapper `mapCalloutLightToPostCard` does NOT populate it — the markdown isn't fetched in the light query; the preview simply doesn't show until the full details load, same pattern whiteboard uses for `framingImageUrl`.)

---

## Phase 4: User Story 2 — Contribution cards + unified "+N more" (P1)

**Goal**: Memo contributions render cards that match the whiteboard card layout (aspect ratio, hover scale, gradient title/author footer, hover "Open memo" button). The "+N more" treatment for image-like contributions (Whiteboard, Memo) becomes an overlay on the last visible card; Posts keep the dashed card; Links stay as a list. Click target is always the callout detail dialog.

**Independent test**: Mount `ContributionsPreviewConnector` with 4 memo contributions — 4 cards render with cropped previews. Mount with 7 — 4th card shows translucent "+3 more memos" overlay. Same flow with 7 whiteboards confirms unified treatment. Posts retain the dashed card.

- [X] T011 [US2] Rework `src/crd/components/contribution/ContributionMemoCard.tsx` to match `ContributionWhiteboardCard`'s layout: same aspect ratio container, hover scale, gradient footer with title + author. Replace the sticky-note icon placeholder with `CroppedMarkdown` showing the memo body. Hover surfaces an "Open memo" button.
- [X] T012 [P] [US2] Extract a `renderPreviewGrid(items, type, total, onShowAll)` helper — implemented inline as `OverlayMoreCard` component + `usesOverlayPattern` branch inside `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx` (or a sibling file if the connector grows past ~150 lines). The helper decides overlay-vs-dashed-card based on `type`: `Whiteboard | Memo` → overlay on the 4th visible card; `Post` → dashed "+N more" card; `Link` → untouched list rendering. Overlay renders a translucent layer with the `+N more {type}` label and forwards clicks to `onShowAll`.
- [X] T013 [US2] Update `ContributionsPreviewConnector` callers for memo contribution type: map domain data to `ContributionMemoCard` props (title, author, memo markdown, `onOpen`) and pass through the new helper.
- [ ] T013a [US2] **Whiteboard regression guard** (the "+N more" unification from T012 rewrites the whiteboard render path too, so this is mandatory, not optional): toggle CRD on and verify for whiteboard contributions: (a) mount a callout with exactly 1, 3, 4, and 7 whiteboards → grids render correctly at each count; (b) overlay on the 4th card still reads from the *same* whiteboard thumbnail it did before the refactor (no thumbnail reshuffle); (c) overlay click still opens `CalloutDetailDialog` for the whiteboard callout, not the individual whiteboard; (d) hover "Open whiteboard" button position, translucent overlay color, and `+N more` copy are visually unchanged vs. `develop`. Record a before/after screenshot pair in the PR description. Any drift must be fixed in T012's helper before US2 closes.
- [ ] T013b [US2] **Post/Link regression spot-check**: mount callouts with 7 posts and 7 links; confirm posts still render the dashed "+N more" card (no accidental overlay) and links still render their list view. One screenshot per type in the PR description.
- [X] T014 [P] [US2] Add i18n keys to `src/crd/i18n/space/space.en.json` — `openMemo`, `moreMemos`, `memo.close`, `memo.stubDialog.message` added: `memo.contribution.moreOverlay` (plural-aware, e.g. `"+{{count}} more memo" / "+{{count}} more memos"` via i18next plurals), `memo.contribution.openMemo`, `memo.contribution.authoredBy`.

---

## Phase 5: User Story 3 — CRD collaborative memo editor (P1)

**Goal**: CRD owns the full memo editor dialog chrome. Two users typing in the same memo see each other's cursors and edits identical to the MUI dialog. Closing the memo dialog leaves the callout detail dialog open at the same scroll position. Zero `@mui/*`, `@emotion/*`, `@hocuspocus/provider`, or `yjs` imports under `src/crd/`.

**Independent test**: Launch two browsers, toggle CRD on, open the same memo. Type in both. Cursors and text sync in real time. Close one — the callout dialog behind is still mounted. Grep `src/crd/` for the forbidden imports — zero hits.

- [X] T015 [US3] Create `src/crd/components/memo/MemoDisplayName.tsx`. Mirrors `WhiteboardDisplayName` prop-for-prop: `{ displayName: string; value?: string; readOnly?: boolean; editing?: boolean; saving?: boolean; onChange?(value: string): void; onEdit?(): void; onSave?(): void; onCancel?(): void }`. Three render branches: read-only (`<h2>` only), editing (Input + Check/X buttons with `saving` state), view (`<h2>` + pencil button). Keyboard: Enter → `onSave()`, Escape → `onCancel()`.
- [X] T016 [P] [US3] Create `src/crd/components/memo/MemoCollabFooter.tsx`. Props: `{ status: 'connecting' | 'connected' | 'disconnected'; memberCount: number; isGuest: boolean; readonlyReason?: string; onDelete?: () => void }`. Pure UI. i18n keys under `crd-space`: `memo.footer.connecting`, `memo.footer.connected`, `memo.footer.disconnected`, `memo.footer.guestWarning`, `memo.footer.readonly`, `memo.footer.delete`, `memo.footer.membersOnline`.
- [X] T017 [US3] Create `src/crd/components/memo/MemoEditorShell.tsx`, mirroring `WhiteboardEditorShell` API exactly for consistency. Props: `{ open: boolean; fullscreen?: boolean; onClose: () => void; title: ReactNode; titleExtra?: ReactNode; headerActions?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }`. Integration composes `<MemoDisplayName />` into the `title` prop. Structure: Radix Dialog → header (title + titleExtra + headerActions + close button), body (`flex-1 min-h-0` holding `children` = Tiptap `EditorContent`), optional `footer`. Escape keydown calls `onClose()`. Shell focuses its own root on mount; the editor component (T019) auto-focuses its Tiptap instance.
- [X] T018 [US3] Port the Tiptap extension list from `src/core/ui/forms/MarkdownInput/hooks/useEditorConfig.ts` into a new CRD file `src/crd/forms/markdown/sharedExtensions.ts`: StarterKit (with `link: false` and, when collaborative, `undoRedo: false` — note: Tiptap v3 uses `undoRedo`, not `history`), Link (custom), Highlight, Image (with `inline: true`), Iframe (custom), Table, TableRow, TableHeader, TableCell. Exported as a discriminated-union-typed function `buildCrdMarkdownExtensions(config)` where `config` is either `{ collaborative: false }` or `{ collaborative: true; ydoc: YDocLike; provider: CollabProviderLike; user: { name: string; color: string } }`. When `collaborative`, sets `StarterKit.configure({ link: false, undoRedo: false })` and appends `Collaboration.configure({ document: ydoc as never })` + `CollaborationCaret.configure({ provider: provider as never, user })` (Tiptap v3 extension name; NOT `CollaborationCursor`). The `as never` casts cross the opaque-to-concrete boundary inside this CRD file without importing `yjs`/`@hocuspocus/provider` — add a one-line comment explaining why `as never` (opaque-to-concrete handoff). When not collaborative, `StarterKit.configure({ link: false })` keeps undoRedo default-on. Consumer: `MarkdownEditor` and the new `CollaborativeMarkdownEditor`.
- [X] T019 [US3] Create `src/crd/forms/markdown/CollaborativeMarkdownEditor.tsx`. Props: `{ ydoc: YDocLike; provider: CollabProviderLike; user: { name: string; color: string }; disabled?: boolean; placeholder?: string; onReady?(editor): void }`. Internally uses `useEditor` with `buildCrdMarkdownExtensions({ collaborative: true, ydoc, provider, user })`, renders `MarkdownToolbar` with `collaborative` prop, followed by `EditorContent`. **No `yjs` import of any kind** (runtime or `import type`) — the opaque `YDocLike` from T006 is the only contract. Integration layer (T023) is responsible for producing a real `Y.Doc` and casting.
- [X] T019a [US3] Port collaboration caret/cursor CSS styles from MUI `CollaborativeMarkdownInputStyles.tsx` into `src/crd/forms/markdown/styles.css`. Scoped under `.crd-markdown-editor`: `.collaboration-carets__caret` (thin vertical line, relative positioning) and `.collaboration-carets__label` (compact rounded badge above cursor with user name). Without these styles the remote cursor renders as a full-width block instead of a narrow inline caret.
- [X] T020 [US3] Refactor the existing CRD `MarkdownEditor` — now uses `buildCrdMarkdownExtensions({ collaborative: false })`; deleted unused `useEditorExtensions.ts` to consume `buildCrdMarkdownExtensions({ collaborative: false })` so both editors share the exact same base extension list (plan decision M3). No behavior change for existing callers.
- [X] T021 [P] [US3] Create `src/main/crdPages/memo/useCrdMemoProvider.ts` — thin wrapper over existing `useCollaboration` (literal 1:1 reuse, no new retry/auth logic), adds member count via awareness subscription and CollabStatus mapping. Hook that returns `{ ydoc: Y.Doc; provider: TiptapCollabProvider; status: 'connecting'|'connected'|'disconnected'; user: { name: string; color: string }; destroy(): void }`. Mirrors `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts` 1:1. Concretely: (a) URL = `env.VITE_APP_COLLAB_DOC_URL` + `env.VITE_APP_COLLAB_DOC_PATH`; (b) create `TiptapCollabProviderWebsocket({ baseUrl, connect: false })` then `TiptapCollabProvider({ websocketProvider, name: collaborationId, document: ydoc })`; (c) derive user via `useUserCursor()` (from `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useUserCursor.ts` — confirm exact path) off `useCurrentUserContext()` — DO NOT re-implement the 16-color hex map; import and reuse the existing hook; (d) event listeners (status, synced, authenticationFailed, stateless) registered via `provider.on` and cleaned up in effect return before `provider.destroy()`; (e) no custom reconnect/backoff — Hocuspocus defaults. Document each mirrored behaviour with a `// mirrors useCollaboration.ts:<line>` comment at the point of use. Do NOT introduce new retry or auth-refresh logic.
- [X] T022 [P] [US3] Create `src/main/crdPages/memo/memoFooterMapper.ts`. Pure function `mapMemoFooterProps(state)` → `MemoCollabFooter` props. Resolves readonly reason (guest, non-member, permission denied), member/guest state, member count from awareness. Symmetric with `whiteboardFooterMapper.ts`.
- [X] T023 [US3] Create `src/main/crdPages/memo/CrdMemoDialog.tsx` — wires `useCrdMemoProvider` + `useMemoManager` + `useUpdateMemoDisplayNameMutation` + `useAuthenticationContext`; replaced the stub dialog in `MemoFramingConnector`. Uses `useCrdMemoProvider` for real `Y.Doc` + `TiptapCollabProvider` + user. Consumes `useMemoManager(memoId)` and reads these fields (confirm exact names against the current hook signature — do not invent): `content`, `displayName`, `updateDisplayName(name)`, `canDelete`, `deleteMemo()`, `readonlyReason`. Renders `<MemoEditorShell open={open} onClose={onClose} title={<MemoDisplayName ... />} footer={<MemoCollabFooter {...} />}>` with `<CollaborativeMarkdownEditor ydoc={ydoc as unknown as YDocLike} provider={provider as unknown as CollabProviderLike} user={user} />` as `children` (single boundary where real `yjs`/Hocuspocus types cast to opaque shapes). Footer: `<MemoCollabFooter {...mapMemoFooterProps({ connectionStatus: status, readonlyReason, isGuest, memberCount, onDelete: canDelete ? deleteMemo : undefined })} />`. Error/loading states from `useMemoManager` render inside the shell body as a dedicated status pane, not as a toast. Integration in `CalloutListConnector` (T009/T010) passes `<CrdMemoDialog ...>` into `CalloutDetailDialog`'s new `memoFramingSlot` when the framing type is memo.
- [X] T024 [US3] Verify zero forbidden imports in `src/crd/` — grep for `@mui/`, `@emotion/`, `@hocuspocus/provider`, `from 'yjs'`, `import type ... from 'yjs'` returned zero hits in code (only doc/comment references in CLAUDE.md and explanatory comments): `Grep` for `@mui/`, `@emotion/`, `@hocuspocus/provider`, and `yjs` (both `import from 'yjs'` AND `import type ... from 'yjs'`) under `src/crd/`. Zero hits expected — the opaque `YDocLike` / `CollabProviderLike` shapes from T006 make this literally achievable. Fix any hits before closing the phase.

---

## Phase 5b: User Story 3b — Memo contribution lifecycle (P1)

**Goal**: On a memo-contribution callout, members can create a new memo contribution from an "Add memo" card and open any existing memo contribution for collaborative editing. Contribution-mode `CrdMemoDialog` exposes a Delete action gated by privileges.

**Independent test**: On a callout configured for memo contributions with create privileges: (a) the trailing "Add memo" card appears; clicking it asks for a display name and, on confirm, creates a memo and immediately opens `CrdMemoDialog` for editing. (b) Clicking an existing memo contribution card (feed OR detail dialog grid) opens `CrdMemoDialog`. (c) With delete privileges, the footer Delete button removes the contribution and closes the dialog.

- [X] T030 [US3b] Create `src/main/crdPages/space/callout/MemoContributionAddConnector.tsx`. Mirrors `WhiteboardContributionAddConnector`: renders `ContributionAddCard` (with a `StickyNote` or similar icon) → opens a small Dialog asking for a display name → calls `useCreateMemoOnCalloutMutation` with `refetchQueries: ['CalloutContributions']`. On success, opens `<CrdMemoDialog isContribution={true} memoId={createdMemoId} ...>` so the user is immediately editing (CRD-only divergence from MUI, which navigates to a memo URL — matches the existing CRD whiteboard add behaviour). Default display name: `callout.contributionDefaults?.defaultDisplayName ?? t('callout.defaultMemoName')`.
- [X] T031 [US3b] Create `src/main/crdPages/space/callout/MemoContributionConnector.tsx`. Mirrors `WhiteboardContributionConnector`: receives `{ open, calloutId, contributionId, onClose }`, renders `<CrdMemoDialog open memoId={contributionId} isContribution onClose onDelete={handleMemoDeleted} />`. `handleMemoDeleted` calls `useDeleteContributionMutation` with `awaitRefetchQueries + refetchQueries: ['CalloutDetails', 'CalloutContributions']` then invokes `onClose`.
- [X] T032 [US3b] Rename the `initialWhiteboardContributionId` — renamed to `initialContributionId` + added `initialMemoId`; `LazyCalloutItem` updated; click signature extended to `(id, memoId?)` through `ContributionGridConnector`, `ContributionsPreviewConnector`; `ContributionCardData` gained a `memoId` field prop on `CalloutDetailDialogConnector` to type-agnostic `initialContributionId`, and update `src/main/crdPages/space/callout/LazyCalloutItem.tsx` accordingly (state + passed prop). Inside `CalloutDetailDialogConnector`, on mount, set either `whiteboardContributionId` or `memoContributionId` based on `callout.settings.contribution.type` (i.e. `getCalloutContributionType(callout)`).
- [X] T033 [US3b] In `CalloutDetailDialogConnector`, replace the inline `CrdMemoDialog` memo overlay with `<MemoContributionConnector>` so delete plumbing lives in one place. Extend the `trailingSlot` in `ContributionsSlot` to render `<MemoContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />` when `canCreateContribution && contributionType === CalloutContributionType.Memo`.
- [X] T034 [P] [US3b] Add i18n keys — `callout.addMemo`, `callout.createMemo`, `callout.defaultMemoName`, `callout.memoNameLabel` added alongside the whiteboard equivalents under `memo.*` in `src/crd/i18n/space/space.en.json`: `memo.contribution.addLabel` ("Add memo"), `memo.contribution.createTitle` ("Create memo"), `memo.contribution.nameLabel` ("Memo title"), `memo.contribution.defaultName` ("New Memo"), `callout.defaultMemoName` (alias for symmetry with `callout.defaultWhiteboardName`).

---

## Phase 6: User Story 4 — Parity, a11y, cleanup (P2)

- [ ] T025 [US4] Manual a11y + parity pass (MUI vs CRD side by side with the CRD toggle). Keyboard path: callout detail dialog → memo dialog → close memo → focus returns to the "Open memo" button. Verify each row, recording pass/fail per item in the PR description:
  - Cursor color assignment (same hash/color function as MUI)
  - Awareness display name matches the user/guest name shown in MUI
  - Readonly banner copy and condition (guest, non-member, permission denied)
  - Delete button visibility and permission gating
  - Guest warning copy and placement
  - Member count updates as users join/leave
  - Escape closes memo dialog only, not the underlying callout dialog
  - Focus trap stays inside the topmost dialog; Tab does not escape to the callout behind
  - Scroll position of `CalloutDetailDialog` preserved after closing the memo dialog
- [ ] T025a [US4] Manual collab sync verification (two browsers): open the same memo, type in both, confirm cursors and text sync in real time and match MUI behaviour. This is the only coverage for the spec acceptance bullet on multi-user cursors — T027 only covers extension parity, not Yjs sync. Record pass/fail in the PR description.
- [ ] T026 [P] [US4] Confirm all memo-facing strings route through i18n. Grep `src/crd/components/memo/`, `src/crd/components/callout/CalloutMemoPreview.tsx`, `src/crd/components/contribution/ContributionMemoCard.tsx` for string literals inside JSX. Each should resolve via `useTranslation('crd-space')`.
- [ ] T027 [P] [US4] Add a parity test: round-trip a reference markdown document through `MarkdownEditor` and `CollaborativeMarkdownEditor` and assert the emitted HTML matches, to catch future extension drift (plan risk entry). Location: `src/crd/forms/markdown/__tests__/extensionParity.test.tsx`. **Scope note**: this test covers extension-set parity only; it does NOT verify Yjs sync behaviour (automated multi-editor sync testing is out of scope for this migration — the acceptance bullet on multi-user cursors is covered manually by T025a).
- [X] T028 [US4] Remove any residual imports of the MUI `MemoDialog` — confirmed zero `MemoDialog` / `CalloutFramingMemo` / `MemoPreview` imports under `src/main/crdPages/` / `CalloutFramingMemo` / `MemoPreview` from files under `src/main/crdPages/` (the CRD routes should exclusively use the new CRD components). Leave the MUI files themselves untouched — they still serve the non-CRD routes until the feature toggle is removed.
- [X] T029 [US4] Final forbidden-import sweep — grep on `src/crd/` for `@mui/`, `@emotion/`, `@hocuspocus/provider`, `yjs` (runtime and type-only) returned zero hits of `src/crd/` (second pass after T024): re-run the greps from T024 across all files landed by US3 and US4. Also confirm no `import type` re-introduced `yjs` during iteration.

---

## Dependencies

```
Setup (T001–T003, T003a)
   │
Foundational (T004–T006)
   │
   ├──► US1 (T007–T010)          ← T008 depends on T003a (crd-space namespace)
   │
   ├──► US2 (T011–T014, T013a/b) ← T014 depends on T003a; parallel with US1
   │
   └──► US3 (T015–T024)          ← T010's stub consumed by T023; T016 depends on T003a
                │
                └──► US4 (T025–T029, T025a)
```

- US1 and US2 have **no cross-dependency** beyond the shared `CroppedMarkdown` primitive (T004) — they can be implemented in parallel by two contributors.
- US3 is the heaviest phase and needs `CollabProviderLike` (T006) + the toolbar `collaborative` prop (T005) before the editor lands.
- US4 is gating — do not start until US1–US3 have merged green.

## Parallel Execution Examples

**After Foundational completes:**
- Contributor A: T007 → T009 → T010 (US1 end-to-end)
- Contributor B: T011 → T013 (US2 main path), T012 + T014 in parallel tabs

**Inside US3:**
- T015, T016, T018 are all `[P]`-safe (different files, no runtime coupling).
- T021 + T022 ship in parallel with any of the `src/crd/components/memo/` files since they live under `src/main/crdPages/memo/`.

## Implementation Strategy

- **MVP = US1 + US2 demo-ready with a stub memo dialog.** Stakeholders can validate the framing preview and contribution grid without the editor risk. The stub should render a plain `<Dialog>` that says "memo editor coming in US3" so the two-layer stacking behaviour is observable.
- **Ship US3 behind the existing CRD toggle** — it's already opt-in per user/dev, no new flag needed.
- **Defer US4 until parity QA** — accessibility and i18n cleanup are faster with the full flow in place.

## Format Validation

All tasks follow `- [ ] TNNN [P?] [USn?] Description with file path` — checkboxes present, IDs T001–T029 plus inserted T003a, T013a, T013b, T025a (total **33 tasks**), story labels on Phase 3–6 tasks only, file paths included on every implementation task.

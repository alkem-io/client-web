# Implementation Plan: CRD Memo Migration

**Branch**: `042-crd-space-page-5` | **Parent**: [../plan.md](../plan.md) | **Spec**: [./spec.md](./spec.md)

## Summary

Migrate the full memo experience to CRD: inline framing preview, contribution card visual parity, the "+N more" contribution overlay rule (unified with whiteboards), the memo editor dialog chrome, and a new CRD `CollaborativeMarkdownEditor` that reuses the existing CRD `MarkdownToolbar`. Hocuspocus + Yjs stay in the integration layer and are passed into the CRD editor as opaque props (provider + Y.Doc + user), symmetric with how Excalidraw is kept out of the CRD whiteboard shell.

## Component Inventory

### New in `src/crd/`

| Path | Role | Notes |
|---|---|---|
| `primitives/croppedMarkdown.tsx` | Bounded-height markdown with masked fade | Tailwind `mask-image` gradient; accepts `content`, `maxHeight?`, `className?` |
| `components/callout/CalloutMemoPreview.tsx` | Framing block inside `PostCard` | Mirrors `CalloutWhiteboardPreview`; renders `CroppedMarkdown` + "Open memo" button |
| `components/memo/MemoEditorShell.tsx` | Full-screen dialog shell | Header (title+close+actions) + editor slot + footer slot |
| `components/memo/MemoDisplayName.tsx` | Inline-editable title | Read-only / edit modes; mirrors `WhiteboardDisplayName` |
| `components/memo/MemoCollabFooter.tsx` | Footer UI | Readonly reason, delete, guest warning, member count |
| `forms/markdown/CollaborativeMarkdownEditor.tsx` | Collab Tiptap editor | Takes `ydoc`, `provider`, `user`; reuses `MarkdownToolbar`; no undo/redo (Yjs owns history) |

Refinements to existing CRD files:
- `components/contribution/ContributionMemoCard.tsx` — rework to match `ContributionWhiteboardCard`'s layout (aspect ratio, gradient title overlay, hover button). Replace icon with `CroppedMarkdown`.
- `forms/markdown/MarkdownToolbar.tsx` — add `collaborative?: boolean` prop; hide undo/redo buttons when true.

### New in `src/main/crdPages/memo/`

| Path | Role |
|---|---|
| `CrdMemoDialog.tsx` | Creates Hocuspocus provider + Y.Doc; renders `MemoEditorShell` with `CollaborativeMarkdownEditor` as slot; wires `useMemoManager` for load/save |
| `memoFooterMapper.ts` | Pure mapper: domain state → `MemoCollabFooter` props |
| `useCrdMemoProvider.ts` | Hook encapsulating provider lifecycle (auth, guest, reconnect) — keeps `CrdMemoDialog` thin |

Refinements to existing integration:
- `src/main/crdPages/space/callout/CalloutListConnector.tsx` — when `framing.type === Memo`, render `CalloutMemoPreview` inside `PostCard`; wire `onOpen` → open callout detail dialog → memo dialog on top.
- `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx` — extract `renderPreviewGrid(...)`; use overlay-on-last-visible-card for `Whiteboard` and `Memo`; keep dashed card for `Post`; continue `Link` as list.

## Design Decisions

### M1: Collab infrastructure stays out of `src/crd/`
Hocuspocus provider, WebSocket URL, auth headers, guest handling all live in `src/main/crdPages/memo/`. The CRD editor accepts a minimal `CollabProviderLike` shape (awareness, status, destroy) and a `Y.Doc`. This matches whiteboard pattern (Excalidraw stays out of the CRD shell) and preserves the design-system rule that components must be reusable by any consumer.

### M2: Shared toolbar between CRD editors
`MarkdownToolbar` is the single source of truth for both `MarkdownEditor` (non-collab) and `CollaborativeMarkdownEditor`. A `collaborative?: boolean` prop hides undo/redo in collab mode. This mirrors the MUI arrangement where `MarkdownInput` and `CollaborativeMarkdownInput` share `MarkdownInputControls`.

### M3: Extension parity with undo/redo disabled in collab
Extensions: StarterKit (with `link: false, history: false` in collab mode), Link, Highlight, Image, Iframe, Table + family, Collaboration, CollaborationCursor. Non-collab keeps `history: true`. Matches the MUI extension set precisely.

### M4: `CroppedMarkdown` as a primitive
The masked-fade cropped-markdown treatment is used in at least three places (memo framing preview, memo contribution card, possibly future post contribution previews). It becomes a CRD primitive built on `MarkdownContent`, accepting `maxHeight` (default ~8rem for contribution cards, ~16rem for framing) and using a Tailwind `mask-image` linear-gradient to fade the bottom edge.

### M5: Unify the contribution "+N more" treatment
Image-like contribution types (Whiteboard, Memo) use an overlay on the last visible card. Text-like types (Post) use a dashed card. This is a single helper in `ContributionsPreviewConnector`, not duplicated logic. Click target is always the callout detail dialog.

### M6: Dialog stacking — memo-on-callout
Memos opened from inside `CalloutDetailDialog` stack on top. The callout dialog stays mounted, scroll position preserved. The integration layer owns both `dialogOpen` states; the CRD dialogs have no awareness of each other. Matches the existing whiteboard behavior verified in `LazyCalloutItem.tsx:53`.

### M7: i18n
All memo-specific labels ("Open memo", "Close", "N more memos", "You are viewing a read-only memo", etc.) go under the existing `crd-space` namespace (or a new `crd-memo` if volume warrants — TBD during implementation). No new backend strings.

### M8: No single-user memo mode
The domain has no concept of a non-collaborative memo. For non-collaborative markdown authoring (callout description field), the existing CRD `MarkdownEditor` is the correct component. `CollaborativeMarkdownEditor` is used only by `CrdMemoDialog`.

### M9: Scope boundary — `useMemoManager` unchanged
GraphQL queries, mutations, and the memo content refresh loop are reused as-is. The integration layer wraps `useMemoManager` and passes its outputs to the CRD editor as props.

## Phased Implementation

| Phase | What ships | Effort |
|---|---|---|
| P0 | `CroppedMarkdown` primitive + `CalloutMemoPreview` + `CalloutListConnector` wiring | S |
| P1 | `ContributionMemoCard` rework + generalized "+N more" in `ContributionsPreviewConnector` | S |
| P2 | `CollaborativeMarkdownEditor` (CRD) + toolbar `collaborative` prop + extension config | M |
| P3 | `MemoEditorShell` + `MemoDisplayName` + `MemoCollabFooter` + `memoFooterMapper` | M |
| P4 | `CrdMemoDialog` integration (Hocuspocus provider, useMemoManager wiring) + dialog-stacking | M |
| P5 | i18n keys, a11y pass, parity QA with MUI version, remove MUI memo dialog usages from CRD pages | S |

## Complexity Tracking

| Risk | Mitigation |
|---|---|
| Tiptap extension mismatch between CRD and MUI editor → content renders differently | Port extension list verbatim from `useEditorConfig.ts`; add a test that round-trips a reference markdown document through both editors and compares the HTML. |
| Hocuspocus provider lifecycle bugs (reconnect, auth refresh) | `useCrdMemoProvider` mirrors the MUI hook's provider wiring 1:1; no new reconnect/auth logic. |
| `mask-image` browser support | `mask-image` is ≥95% supported. Fallback: plain `overflow: hidden` without fade — acceptable degradation. |
| Dialog stack focus trapping | Both dialogs use Radix Dialog; Radix already handles focus-trap nesting correctly. Verify with keyboard-only QA. |

## Open Items (resolved during implementation)

- **Namespace**: reuse `crd-space` or introduce `crd-memo`? Start with `crd-space`; split if key count grows past ~15.
- **Toolbar undo/redo in collab mode**: confirmed hidden (not disabled) — matches the MUI omission pattern.
- **`CollabProviderLike` location**: define inside `CollaborativeMarkdownEditor.tsx` to keep the CRD contract self-contained.

# CRD Memo Migration

## Problem

Memos are one of Alkemio's two rich collaborative content types (the other is whiteboards). Like whiteboards, they appear in two places inside a Space:

1. As the **framing** ("Additional content") of a Callout/Post — one memo owned by the callout.
2. As a **contribution** — members add their own memo in response to a callout configured for memo contributions.

Today memos are fully MUI: the inline preview, the contribution card, the full-screen editing dialog, and the Tiptap + Hocuspocus + Yjs collaboration stack inside `CollaborativeMarkdownInput`. Nothing memo-specific has been migrated to CRD yet. The parent Space migration (042) currently renders memo framings as plain text inside `PostCard` and memo contributions via a minimal `ContributionMemoCard` that shows truncated markdown but lacks visual parity with the whiteboard treatment (no banner overlay, no "+N more" card pattern, no "Open memo" action).

This sub-spec migrates the full memo experience to CRD, mirroring the structure used for the whiteboard migration (dialog chrome in CRD, collaboration infrastructure in the integration layer via opaque slots).

## Current MUI Implementation (reference)

| Concern | File | Role |
|---|---|---|
| Inline framing preview | `src/domain/collaboration/callout/CalloutFramings/CalloutFramingMemo.tsx` | Fetches memo, renders `MemoPreview`, opens `MemoDialog` on click |
| Generic preview | `src/domain/collaboration/memo/MemoPreview/MemoPreview.tsx` | `CroppedMarkdown` (masked fade) + optional "Click to see" affordance |
| Contribution card | Existing CRD `ContributionMemoCard` is a placeholder (sticky-note icon + 3-line clamp) | Needs visual parity with the whiteboard card pattern |
| Editor dialog | `src/domain/collaboration/memo/MemoDialog/MemoDialog.tsx` | Dialog shell + `CollaborativeMarkdownInput` + display name + footer |
| Collab input | `src/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput.tsx` | Tiptap + `TiptapCollabProvider` (Hocuspocus + Yjs). Uses shared `MarkdownInputControls` toolbar |
| Non-collab input | `src/core/ui/forms/MarkdownInput/MarkdownInput.tsx` | Same toolbar; StarterKit + undo/redo enabled |
| Cropped render | `src/core/ui/markdown/CroppedMarkdown.tsx` | `OverflowGradient` mask fade for bounded-height previews |

Key facts verified in the MUI layer:
- The single-user and collaborative editors **share one toolbar component** (`MarkdownInputControls`) and the **same Tiptap extension set**. Collab only *disables* undo/redo because Yjs owns history.
- `CroppedMarkdown` uses a **masked CSS fade**, not `line-clamp`.
- Opening a memo from inside `CalloutDetailDialog` **stacks** the memo dialog on top — the callout dialog stays mounted behind it.

## Solution

### Scope

This sub-spec is **full-stack**: framing preview, contribution card (with visual parity and the generic "+N more" rule), dialog chrome in CRD, and a new CRD collaborative markdown editor. The Hocuspocus/Yjs provider and WebSocket plumbing stay in the integration layer and are passed into the CRD editor as opaque props — mirroring how Excalidraw is handled for whiteboards. No single-user memo mode exists (for non-collaborative authoring we already ship the CRD `MarkdownEditor`).

### Visual treatments

**Framing preview on `PostCard`** (new CRD `CalloutMemoPreview`, mirrors `CalloutWhiteboardPreview`):
- A bordered block placed in the same slot as whiteboard framing previews.
- Renders the memo's markdown via a new CRD `CroppedMarkdown` primitive (masked-fade, bounded max-height, Tailwind gradient).
- Explicit "Open memo" button inside the preview (same visual language as whiteboard: button overlays/sits beside the content, not seamless inline prose).
- Click target: opens `CalloutDetailDialog`; then the memo dialog opens on top. The callout dialog remains mounted behind. Same two-layer stacking rule as whiteboards.

**Contribution card** (refined CRD `ContributionMemoCard`):
- Visual parity with `ContributionWhiteboardCard`: same aspect ratio, same hover scale, same title/author gradient footer, same "Open memo" hover button.
- The image/canvas area is replaced with a `CroppedMarkdown` preview of the memo body.

**Contribution preview grid "+N more"** (generalized in `ContributionsPreviewConnector`):
- Today: whiteboards show a translucent overlay **on top of the 4th thumbnail**; other types (memos, posts) show a separate dashed "+N more" card. The user's instruction is to unify. **Decision**: both memos and whiteboards use the overlay-on-last-visible-card pattern. Posts continue with the dashed card (they are not image-like). The overlay is rendered by the connector as a sibling inside the 4th slot, parameterized by type.
- Click target: opens `CalloutDetailDialog` (same rule as whiteboards).

### Editor dialog

New CRD `MemoEditorShell` component, structurally analogous to `WhiteboardEditorShell`:

```
MemoEditorShell
├── header: MemoDisplayName (inline-editable title)  + close + actions slot
├── body:   editor slot (opaque — Tiptap EditorContent rendered by integration)
└── footer: footer slot (collab status, delete, guest warning)
```

The shell knows nothing about Tiptap, Hocuspocus, or Yjs. It owns layout, focus behavior, keyboard handling (Escape to close), and the display-name inline-edit UI.

### CRD collaborative markdown editor

New component `src/crd/forms/markdown/CollaborativeMarkdownEditor.tsx`. Props:
- `ydoc: Y.Doc` — opaque, provided by integration layer
- `provider: CollabProviderLike` — a minimal shape the editor needs (awareness, status, destroy) so the CRD side never imports `@hocuspocus/provider` directly
- `user: { name: string; color: string }` — rendered in awareness
- `disabled?: boolean`, `placeholder?: string`, `onReady?(editor)` — standard

Critically, **it reuses the existing `MarkdownToolbar` component** from the CRD `MarkdownEditor`. Just like the MUI side, the two CRD editors share one toolbar. The collaborative variant configures Tiptap with:
- The same base extension set as `useEditorExtensions` (StarterKit with link disabled, Link, Highlight, Image, Iframe, Table + family)
- **Minus** `StarterKit`'s history (Yjs owns undo/redo via `Collaboration` + `CollaborationCursor` extensions)

The toolbar's undo/redo buttons become no-ops (hidden or disabled) when the editor is in collaborative mode — driven by a `collaborative?: boolean` flag the toolbar already needs to accept. No text-input-specific business logic lives in the editor.

Alkemio-specific concerns — WebSocket URL, auth headers, guest session handling, reconnect policy — stay entirely in the integration layer.

### Integration layer

New files under `src/main/crdPages/memo/`:
- `CrdMemoDialog.tsx` — instantiates Hocuspocus provider (using `VITE_APP_COLLAB_DOC_URL`, auth, guest name), creates the `Y.Doc`, renders `MemoEditorShell` with `CollaborativeMarkdownEditor` as the editor slot. Wires `useMemoManager` for load/save and display-name updates.
- `memoFooterMapper.ts` — pure mapper: resolves readonly reason, member/guest state → props for a footer component (symmetric with `whiteboardFooterMapper.ts`).
- Updates to `CalloutListConnector`: when callout framing type is Memo, render `CalloutMemoPreview` in the PostCard framing slot; wire `onOpen` to open the callout detail dialog and then the memo dialog on top.
- Updates to `ContributionsPreviewConnector`: extract a single `renderPreviewGrid(items, type, total, onShowAll)` function; use the overlay-on-last-visible-card treatment for image-like types (whiteboard, memo), dashed card for text-like types (post, link).

### Out of scope

- Single-user memo mode (doesn't exist in the domain).
- Public memo route (no equivalent to `/public/whiteboard/:id`).
- Mentions, slash commands, or other editor feature expansions — parity with the current MUI editor only.
- Any change to the Hocuspocus server, the memo GraphQL schema, or the `useMemoManager` hook.

## Open questions

- **Provider prop shape**: should `CollabProviderLike` be defined in CRD (and the integration layer conform), or imported from a shared type file in `src/core/`? Leaning toward CRD-defined, since the CRD editor defines its own contract.
- **Toolbar behavior for undo/redo in collab mode**: hide the buttons, or leave visible and disabled? MUI today leaves them out of the extension set entirely so they never render. We can match that (cleaner) or show disabled buttons for visual consistency with the non-collab editor (less cognitive jump when switching contexts). **Leaning hide**.

## Acceptance

- Toggle CRD on → open a Space with a memo-framed callout → inline memo preview renders as a bordered block with cropped markdown and an "Open memo" button. Clicking it opens the callout detail dialog with the memo dialog stacked on top.
- Open a callout with ≤4 memo contributions → grid shows one memo card per contribution with cropped preview + title.
- Open a callout with >4 memo contributions → 4th slot shows the last memo with a translucent "+N more memos" overlay; clicking opens the callout detail dialog.
- Open the memo dialog → two or more users typing simultaneously see each other's cursors and edits in real time, identical behavior to the MUI dialog.
- Close the memo dialog → the underlying callout detail dialog remains open and scrolled to the same position.
- Zero `@mui/*`, `@emotion/*`, `@hocuspocus/provider`, or `yjs` imports anywhere under `src/crd/`.

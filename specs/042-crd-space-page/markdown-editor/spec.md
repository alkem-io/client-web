# CRD Markdown Editor for Callout Forms

## Problem

The CRD callout creation form (`AddPostModal`) has no description field. The `useCrdCalloutForm` hook already manages a `description: string` value, and `AddPostModal` has a `framingEditorSlot` with an explicit comment reserving space for a markdown editor — but no editor component exists in `src/crd/`.

The existing MUI markdown editor (`src/core/ui/forms/MarkdownInput/`) cannot be used inside `src/crd/` because it:
- Imports MUI components (`Tabs`, `Collapse`, `Box`, `IconButton`, MUI icons)
- Uses MUI's `InputBaseComponentProps` for its prop interface
- Embeds image upload via GraphQL mutations (`useUploadFileMutation`)
- Has deep coupling to MUI's `OutlinedInput` wrapper (`FormikMarkdownField`)

We need a **fresh CRD markdown editor** that:
- Uses the same **Tiptap 3.11** engine (preserving compatibility with the existing collaboration stack for future multi-user editing)
- Converts between **markdown strings** and Tiptap's internal HTML/ProseMirror representation (users and form state deal only with markdown)
- Has a **CRD-native toolbar** built with Tailwind + lucide-react
- Follows all CRD golden rules (no MUI, no business logic, plain TS props, callbacks for all behavior)

## Solution

### New component: `MarkdownEditor`

A self-contained markdown editor living in `src/crd/forms/markdown/`. It wraps Tiptap's `EditorContent` with a CRD toolbar, and bundles the markdown ↔ HTML conversion so consumers only see markdown strings in/out.

### Data flow

```
[Consumer form state: markdown string]
        │
        ▼
  MarkdownEditor (CRD component)
        │
        ├─ useMarkdownEditorState hook
        │    ├─ markdownToHtml() on inbound value
        │    ├─ creates Tiptap useEditor({ content: html })
        │    ├─ listens to editor 'update' events
        │    ├─ htmlToMarkdown(editor.getHTML()) on outbound
        │    └─ calls onChange(markdown) back to consumer
        │
        ├─ MarkdownToolbar (CRD sub-component)
        │    ├─ lucide-react icons
        │    ├─ Tailwind styling
        │    ├─ Reads editor state for active/disabled
        │    └─ Calls editor.chain().focus().command().run()
        │
        └─ EditorContent from @tiptap/react
             └─ ProseMirror editing surface
```

### Architecture

```
src/crd/forms/markdown/
├── MarkdownEditor.tsx           # Main component (props + layout)
├── MarkdownToolbar.tsx          # Toolbar with formatting buttons
├── ToolbarButton.tsx            # Individual toolbar button (active/disabled state)
├── ToolbarLinkDialog.tsx        # Popover for inserting/editing links
├── useMarkdownEditorState.ts    # Hook: Tiptap lifecycle + markdown ↔ HTML conversion
├── useEditorExtensions.ts       # Hook: Tiptap extension configuration
├── markdownConverter.ts         # Pure function: markdown ↔ HTML via unified pipeline
└── styles.css                   # ProseMirror content styles (prose typography)
```

### Key decisions

1. **Markdown in, markdown out.** The component accepts `value: string` (markdown) and calls `onChange(markdown: string)`. The unified converter pipeline is bundled inside `src/crd/forms/markdown/markdownConverter.ts`. Consumers never see HTML. This matches the existing `MarkdownInput` pattern and keeps form state clean.

2. **Same Tiptap extensions as the existing editor.** The extension set mirrors `useEditorConfig.ts`: StarterKit (bold, italic, headings 1-3, bullet/ordered lists, blockquote, code block, horizontal rule, hard break), Link, Highlight, Table + TableRow + TableHeader + TableCell. This ensures content created in the CRD editor is fully compatible with the collaborative editor and the markdown renderer.

3. **Image and Iframe extensions are deferred.** Image insertion requires a file upload callback (`onImageUpload?: (file: File) => Promise<string>`) — the prop slot is reserved but the toolbar button is hidden until wired. The Iframe extension depends on the iframe-whitelist spec. Both are designed for but not shipped in this phase.

4. **Fresh CRD toolbar.** All toolbar buttons use lucide-react icons and Tailwind classes. No MUI dependency. The toolbar is a horizontal scrollable row with icon buttons, matching the prototype's `MarkdownEditor` visual style (toolbar on top, separator, editor area below).

5. **Converter reuses the unified pipeline pattern.** The `markdownConverter.ts` file implements the same remark/rehype plugin chain as `UnifiedConverter.ts` but as a pair of standalone async functions (no React hooks, no class). It includes the same custom handlers for `<p>`/`<br>` round-tripping in tables and the `strong`/`emphasis` whitespace trimmer. The converter is instantiated once per component mount via a ref.

6. **Editor re-creation guard.** Like the existing `useMarkdownEditor`, the hook only updates the editor's HTML content when the user is not actively editing (`isFocused` guard). This prevents destroying the editor and losing cursor position mid-edit.

7. **Separate `descriptionSlot` on AddPostModal.** The description editor is independent of the framing type (every callout has a description, regardless of whether it also has a poll, whiteboard, link, etc.). A new `descriptionSlot: ReactNode` prop is added to `AddPostModal`, rendered between the title input and the attachment buttons.

8. **Accessibility.** The editor surface has `role="textbox"`, `aria-multiline="true"`, and `aria-label`. Toolbar buttons have `aria-label` and `aria-pressed` for toggle state. The toolbar is wrapped in `role="toolbar"` with `aria-label`.

## Props interface

```typescript
type MarkdownEditorProps = {
  value: string;                                    // Markdown string
  onChange: (value: string) => void;                 // Markdown string out
  placeholder?: string;                              // Placeholder text
  maxLength?: number;                                // Character limit (plain text count)
  disabled?: boolean;                                // Read-only mode
  className?: string;                                // Outer container class
  // Deferred — reserved for future phases:
  // onImageUpload?: (file: File) => Promise<string>; // Returns URL of uploaded image
  // iframeAllowedUrls?: string[];                    // Whitelist for embed button
};
```

## Toolbar buttons

All buttons from the existing `MarkdownInputControls`, minus image and iframe (deferred):

| # | Action | Tiptap command | Icon (lucide-react) | Toggle? | Disabled in table? |
|---|--------|---------------|--------------------|---------|--------------------|
| 1 | Undo | `undo()` | `Undo2` | No | No |
| 2 | Redo | `redo()` | `Redo2` | No | No |
| 3 | Bold | `toggleBold()` | `Bold` | Yes | No |
| 4 | Italic | `toggleItalic()` | `Italic` | Yes | No |
| 5 | Heading 1 | `toggleHeading({ level: 1 })` | `Heading1` | Yes | No |
| 6 | Heading 2 | `toggleHeading({ level: 2 })` | `Heading2` | Yes | No |
| 7 | Heading 3 | `toggleHeading({ level: 3 })` | `Heading3` | Yes | No |
| 8 | Bullet list | `toggleBulletList()` | `List` | Yes | Yes |
| 9 | Ordered list | `toggleOrderedList()` | `ListOrdered` | Yes | Yes |
| 10 | Blockquote | `toggleBlockquote()` | `Quote` | Yes | Yes |
| 11 | Code block | `toggleCodeBlock()` | `Code` | Yes | Yes |
| 12 | Horizontal rule | `setHorizontalRule()` | `Minus` | No | Yes |
| 13 | Insert table | `insertTable({ rows: 3, cols: 3 })` | `Table` | No | No |
| 14 | Delete table | `deleteTable()` | `TableOff` (custom) | No | Only enabled in table |
| 15 | Add column | `addColumnAfter()` | `Columns3` | No | Only enabled in table |
| 16 | Add row | `addRowAfter()` | `Rows3` | No | Only enabled in table |
| 17 | Delete column | `deleteColumn()` | `ColumnRemove` (custom) | No | Only enabled in table |
| 18 | Delete row | `deleteRow()` | `RowRemove` (custom) | No | Only enabled in table |
| 19 | Toggle link | Opens popover for URL input | `Link` | Yes | No |
| 20 | Emoji | Opens emoji picker (reuses `CommentEmojiPicker`) | `Smile` | No | No |

Table operations (13-18) are grouped in a separator-delimited section. They show/hide contextually: "Insert table" is visible when not in a table; the row/column operations are visible when inside a table.

## Scope

### In scope
- `MarkdownEditor` component in `src/crd/forms/markdown/`
- `MarkdownToolbar` with all buttons listed above
- `ToolbarButton` reusable sub-component
- `ToolbarLinkDialog` popover for link URL input
- `useMarkdownEditorState` hook (Tiptap lifecycle + conversion)
- `useEditorExtensions` hook (extension set configuration)
- `markdownConverter.ts` (unified pipeline, markdown ↔ HTML)
- `styles.css` for ProseMirror content typography
- New `descriptionSlot` prop on `AddPostModal`
- Wiring in `CalloutFormConnector` to connect `values.description` to the editor
- i18n keys for toolbar labels (aria-labels, link dialog)
- Standalone preview in `src/crd/app/`

### Out of scope (designed for, deferred)
- Image paste/upload (requires `onImageUpload` callback wired to a GraphQL mutation in the integration layer)
- Iframe embed button (depends on iframe-whitelist spec)
- Collaborative editing extensions (Yjs/Hocuspocus) — the architecture supports adding `additionalExtensions` later
- `maxLength` overflow highlight (the existing MUI version uses a shadow editor; can be added later)
- Memo framing type editor (the `FramingEditorConnector` memo stub — separate from the callout description)

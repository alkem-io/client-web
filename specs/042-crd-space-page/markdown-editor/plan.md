# Implementation Plan: CRD Markdown Editor

**Spec**: [spec.md](./spec.md) | **Branch**: `042-crd-space-page`

## File inventory

### New files

| File | Purpose |
|------|---------|
| `src/crd/forms/markdown/MarkdownEditor.tsx` | Main component: container with toolbar + editor surface |
| `src/crd/forms/markdown/MarkdownToolbar.tsx` | Toolbar: formatting buttons, link dialog trigger, emoji trigger |
| `src/crd/forms/markdown/ToolbarButton.tsx` | Reusable icon button with active/disabled state from editor |
| `src/crd/forms/markdown/ToolbarLinkDialog.tsx` | Popover for inserting/editing hyperlinks |
| `src/crd/forms/markdown/useMarkdownEditorState.ts` | Hook: creates Tiptap editor, manages markdown ↔ HTML sync |
| `src/crd/forms/markdown/useEditorExtensions.ts` | Hook: builds extension array (StarterKit + Link + Table + Highlight) |
| `src/crd/forms/markdown/markdownConverter.ts` | Pure async functions: `markdownToHtml`, `htmlToMarkdown` |
| `src/crd/forms/markdown/styles.css` | ProseMirror content styles (prose typography for the editing surface) |

### Modified files

| File | Change |
|------|--------|
| `src/crd/forms/callout/AddPostModal.tsx` | Add `descriptionSlot: ReactNode` prop, render between title and attachment buttons |
| `src/main/crdPages/space/callout/CalloutFormConnector.tsx` | Import `MarkdownEditor`, pass `values.description` + `setField('description', ...)`, render as `descriptionSlot` |
| `src/crd/i18n/space/space.en.json` | Add `editor.*` keys for toolbar aria-labels and link dialog |
| `src/crd/i18n/space/space.{bg,de,es,fr,nl}.json` | Mirror editor i18n keys |
| `src/crd/styles/crd.css` | Import `../forms/markdown/styles.css` |
| `src/crd/app/pages/SpacePage.tsx` | Add standalone preview of MarkdownEditor |

## Design details

### 1. markdownConverter.ts — Stateless conversion functions

No React, no hooks, no class. Two pure async functions that lazily build their unified pipelines on first call (cached via module-level `let`). Reuses the same plugin chain as `UnifiedConverter.ts`:

```typescript
// Markdown → HTML pipeline:
// remark-parse → remark-gfm → remark-rehype(custom handlers) → rehype-raw → rehype-sanitize → rehype-stringify

// HTML → Markdown pipeline:
// rehype-parse → rehype-raw → rehype-remark(custom handlers) → remark-gfm → remark-stringify
```

Custom handlers copied from `UnifiedConverter.ts`:
- **`p` handler** (HTML→MD): handles empty `<p>` in table cells (→ `<br>`) and at root level
- **`strong`/`emphasis` trimmer** (HTML→MD): moves interior whitespace outside markers to prevent `** text **` rendering bugs
- **`text` handler** (MD→HTML): wraps text-before-`<br>` in `<p>` for round-trip fidelity

Key difference from `UnifiedConverter.ts`:
- **No iframe handling** — iframe support will be added when the iframe-whitelist spec ships. The sanitize schema uses defaults (strips iframes).
- **No `useTranslation`** — the converter is a pure module, not a React hook.
- **Module-level caching** — pipelines are built on first call and cached at module scope. No need for `converterRef` in the hook since the module itself is the singleton.

### 2. useEditorExtensions.ts — Extension configuration

```typescript
export function useEditorExtensions(options?: {
  additionalExtensions?: Extensions;
}): Partial<EditorOptions> {
  const extensions = [
    StarterKit.configure({
      link: false,  // replaced by standalone Link extension
    }),
    Link,
    Highlight,
    Table,
    TableRow,
    TableHeader,
    TableCell,
    ...(options?.additionalExtensions ?? []),
  ];

  return {
    extensions,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
  };
}
```

No `Image` extension (deferred). No `Iframe` extension (deferred). No `Collaboration` extensions (deferred — will be injected via `additionalExtensions` when multi-user editing is added).

### 3. useMarkdownEditorState.ts — Editor lifecycle

Core responsibilities:
1. Convert inbound `value` (markdown) to HTML via `markdownToHtml()`
2. Create Tiptap editor with the HTML content
3. On editor update, convert `editor.getHTML()` back to markdown via `htmlToMarkdown()`
4. Call `onChange(markdown)` with the result
5. Guard against re-creating the editor while the user is typing (focus-based guard)

```typescript
type UseMarkdownEditorStateOptions = {
  value: string;
  onChange: (value: string) => void;
  extensions: Partial<EditorOptions>;
  disabled?: boolean;
};

// Returns: { editor: Editor | null }
```

The hook tracks `isFocused` via editor `focus`/`blur` events. Inbound value updates only refresh the editor content when `!isFocused` (prevents clobbering in-progress edits).

### 4. MarkdownToolbar.tsx — Toolbar layout

A horizontal scrollable `div` with `role="toolbar"` and `aria-label`. Buttons are grouped with visual separators:

```
[Undo][Redo] | [Bold][Italic] | [H1][H2][H3] | [List][OList] | [Quote][Code][HR] | [Table...] | [Link][Emoji]
```

Table operations are contextual:
- **Not in table**: show "Insert table" only
- **In table**: show "Delete table", "Add column", "Add row", "Delete column", "Delete row"

The toolbar detects table context via `editor.isActive('table')`.

### 5. ToolbarButton.tsx — Individual button

```typescript
type ToolbarButtonProps = {
  editor: Editor;
  icon: LucideIcon;
  label: string;           // aria-label
  command: (chain: ChainedCommands) => ChainedCommands;
  isActive?: string | [string, Record<string, unknown>]; // for toggle buttons
  disabled?: boolean;       // explicit override
};
```

On click: `editor.chain().focus()` → `command(chain)` → `.run()`.
Active state: `editor.isActive(...isActive)` when `isActive` is provided.
Disabled state: explicit `disabled` prop OR `!editor.can().chain().focus()...command...run()`.
Listens to editor `transaction` events to refresh state.

### 6. ToolbarLinkDialog.tsx — Link popover

Uses Radix Popover (from `@/crd/primitives/popover`). When triggered:
1. If cursor is on a link: pre-fills URL, shows "Remove link" button
2. If cursor is on selected text: shows URL input + "Apply" button
3. On apply: `editor.chain().focus().setLink({ href: url }).run()`
4. On remove: `editor.chain().focus().unsetLink().run()`

### 7. styles.css — ProseMirror content styles

Minimal CSS for the editing surface typography. Applied via a wrapper class (`.crd-markdown-editor`):

```css
.crd-markdown-editor .ProseMirror {
  outline: none;
  min-height: 120px;
  padding: 0.75rem;
}

/* Prose typography — headings, lists, blockquotes, code blocks, tables, links */
/* Matches the Tailwind prose scale used by MarkdownContent for visual consistency */
```

This ensures content looks the same while editing as it does when rendered by `MarkdownContent`.

### 8. AddPostModal change — new `descriptionSlot`

```diff
 type AddPostModalProps = {
   ...
+  descriptionSlot?: ReactNode;
   framingEditorSlot?: ReactNode;
   ...
 };
```

Rendered between the title input and the attachment buttons section:

```tsx
{/* Title */}
<div className="space-y-4">
  <input ... />
</div>

{/* Description editor */}
{descriptionSlot}

{/* Attachment buttons */}
{onAttachmentChange && ( ... )}
```

### 9. CalloutFormConnector wiring

```tsx
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';

<AddPostModal
  ...
  descriptionSlot={
    <MarkdownEditor
      value={values.description}
      onChange={v => setField('description', v)}
      placeholder={t('forms.descriptionPlaceholder')}
    />
  }
  framingEditorSlot={<FramingEditorConnector ... />}
  ...
/>
```

## Dependency on Tiptap packages

All required packages are **already installed** at 3.11.0:
- `@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`
- `@tiptap/extension-highlight`, `@tiptap/extension-link`
- `@tiptap/extension-table`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`, `@tiptap/extension-table-row`

No new packages needed.

## Dependency on unified ecosystem

All required packages are **already installed**:
- `unified`, `remark-parse`, `remark-gfm`, `remark-stringify`
- `rehype-parse`, `rehype-raw`, `rehype-sanitize`, `rehype-stringify`
- `remark-rehype`, `rehype-remark`
- `unist-util-visit`

No new packages needed.

## Risk assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Converter divergence from `UnifiedConverter.ts` | Content created in CRD may not round-trip correctly with the MUI editor | Copy the exact custom handler logic; add a round-trip test that converts markdown → html → markdown and asserts equality |
| Tiptap editor re-creation on value change | Cursor position lost, flickering | Focus guard: only update content when editor is not focused; same pattern as existing `useMarkdownEditor` |
| ProseMirror CSS conflicts with Tailwind preflight | Lists/headings may lose styling | Scoped styles in `styles.css` under `.crd-markdown-editor` class; explicit heading/list/table styles |
| Large bundle from unified ecosystem | Increases chunk size for callout form | All unified packages are already in the bundle (used by `MarkdownContent` + existing `MarkdownInput`); no incremental cost |
| Table editing UX complexity | Users may struggle with table operations | Match the existing toolbar UX — contextual show/hide of table buttons; same behavior as current MUI editor |

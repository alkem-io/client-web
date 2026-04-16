# Tasks: CRD Markdown Editor

**Input**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## Phase 1: Converter + Editor Core (no UI dependencies)

- [X] T1 [P] Create `src/crd/forms/markdown/markdownConverter.ts`
  - **File**: new
  - **Description**: Two pure async functions: `markdownToHtml(md: string): Promise<string>` and `htmlToMarkdown(html: string): Promise<string>`. Uses the unified pipeline (remark-parse → remark-gfm → remark-rehype → rehype-raw → rehype-sanitize → rehype-stringify for MD→HTML; rehype-parse → rehype-raw → rehype-remark → remark-gfm → remark-stringify for HTML→MD). Custom handlers copied from `UnifiedConverter.ts`: `p` handler for table cell `<br>` round-tripping, `strong`/`emphasis` trimmer for interior whitespace, `text` handler for text-before-`<br>` wrapping. Module-level lazy caching of built pipelines. No iframe handling (deferred). No React dependencies.
  - **Acceptance**: Import and call both functions from a test; `markdownToHtml('**bold**')` returns `<p><strong>bold</strong></p>`; round-trip `md → html → md` preserves content for bold, italic, headings, lists, blockquotes, code blocks, links, tables, horizontal rules.
  - **Dependencies**: none

- [X] T2 [P] Create `src/crd/forms/markdown/useEditorExtensions.ts`
  - **File**: new
  - **Description**: Hook returning `Partial<EditorOptions>` with extensions: StarterKit (link: false), Link, Highlight, Table, TableRow, TableHeader, TableCell. Accepts optional `additionalExtensions` for future collaboration. Sets `editorProps.attributes` for accessibility (`role="textbox"`, `aria-multiline="true"`, `aria-label`). Accepts `disabled?: boolean` for `editable`.
  - **Acceptance**: Hook returns a valid EditorOptions object; extensions array contains all 8 expected extensions; `editable` reflects `disabled` prop.
  - **Dependencies**: none

- [X] T3 Create `src/crd/forms/markdown/useMarkdownEditorState.ts`
  - **File**: new
  - **Description**: Hook that manages the Tiptap editor lifecycle and markdown ↔ HTML synchronization. Accepts `value` (markdown), `onChange`, `editorOptions` (from `useEditorExtensions`), `disabled`. Returns `{ editor: Editor | null }`. Converts inbound `value` to HTML on mount and when value changes while editor is not focused. Listens to editor `update` events, converts `getHTML()` back to markdown, calls `onChange`. Focus guard: tracks `isFocused` via editor focus/blur events; skips inbound updates while focused. Stores converter reference for stable pipeline reuse.
  - **Acceptance**: Editor renders content matching the markdown value; typing updates the markdown value via onChange; external value changes update editor content when not focused; cursor position is preserved during typing.
  - **Dependencies**: T1, T2

---

## Phase 2: Toolbar Components (parallel, no dependency on Phase 1)

- [X] T4 [P] Create `src/crd/forms/markdown/ToolbarButton.tsx`
  - **File**: new
  - **Description**: Reusable toolbar icon button. Props: `editor: Editor`, `icon: LucideIcon`, `label: string` (aria-label), `command: (chain: ChainedCommands) => ChainedCommands`, `isActive?: string | [string, Record<string, unknown>]`, `disabled?: boolean`. On click: `editor.chain().focus()` → command → `.run()`. Active state via `editor.isActive()`. Disabled state via explicit prop OR `!editor.can()...run()`. Listens to editor `transaction` for state refresh. Styled: `h-8 w-8 rounded-md` with `bg-muted` when active, `hover:bg-muted/50`, `disabled:opacity-40`. Uses `aria-pressed` for toggle buttons.
  - **Acceptance**: Button renders with correct icon; clicking triggers the Tiptap command; active state shows highlighted background; disabled state prevents clicks; aria-label and aria-pressed are correct.
  - **Dependencies**: none (needs Editor type from @tiptap/react but no project dependencies)

- [X] T5 [P] Create `src/crd/forms/markdown/ToolbarLinkDialog.tsx`
  - **File**: new
  - **Description**: Popover for inserting/editing links. Uses Radix Popover from `@/crd/primitives/popover`. Trigger is a `ToolbarButton` with Link icon. When opened: reads current link URL from editor (`editor.getAttributes('link').href`); shows URL input + "Apply" button; if editing existing link, shows "Remove" button. Apply: `editor.chain().focus().setLink({ href }).run()`. Remove: `editor.chain().focus().unsetLink().run()`. Validates URL starts with `http://` or `https://`. Enter submits. Escape closes. All text via `useTranslation('crd-space')` with `editor.link.*` keys.
  - **Acceptance**: Popover opens on click; URL input is pre-filled when cursor is on a link; Apply sets the link; Remove unsets it; invalid URLs show error; popover closes on apply/remove/escape.
  - **Dependencies**: none

- [X] T6 [P] Create `src/crd/forms/markdown/styles.css`
  - **File**: new
  - **Description**: ProseMirror content styles scoped under `.crd-markdown-editor`. Sets: `outline: none`, `min-height: 120px`, `padding: 0.75rem` on `.ProseMirror`. Prose typography for headings (h1: text-2xl bold, h2: text-xl bold, h3: text-lg bold), paragraphs (mb-3), lists (list-disc/list-decimal with pl-6 mb-3), blockquotes (border-l-4 border-border pl-4 italic text-muted-foreground), code blocks (bg-muted rounded-lg p-4 font-mono text-sm), inline code (bg-muted rounded px-1.5 py-0.5 font-mono text-sm), horizontal rules (border-border my-4), links (text-primary underline), tables (border-collapse, border-border, th bg-muted font-semibold, td/th padding, hover row highlighting). Uses CSS variables from theme.css for colors.
  - **Acceptance**: Editor content renders with correct typography; headings have appropriate sizes; lists are indented; blockquotes have left border; code blocks have muted background; tables have borders and header styling; links are colored and underlined.
  - **Dependencies**: none

---

## Phase 3: Main Component + Toolbar Assembly (depends on Phase 1 + Phase 2)

- [X] T7 Create `src/crd/forms/markdown/MarkdownToolbar.tsx`
  - **File**: new
  - **Description**: Horizontal scrollable toolbar. Props: `editor: Editor | null`, `className?: string`. Renders all buttons from the spec table using `ToolbarButton`. Groups separated by `<Separator orientation="vertical" />`. Table operations are contextual: when not in table, shows "Insert table" only; when in table, shows delete/add/remove column/row buttons. Detects table context via `editor.isActive('table')` with state refresh on `transaction`. Disables list/blockquote/code/hr buttons when inside a table. Includes `ToolbarLinkDialog` for link button. Includes emoji button that opens `CommentEmojiPicker` (reused from `@/crd/components/comment/CommentEmojiPicker`) — on emoji select, inserts text at cursor via `editor.chain().focus().insertContent(emoji).run()`. Wrapper has `role="toolbar"`, `aria-label={t('editor.toolbar')}`. All aria-labels from `useTranslation('crd-space')` `editor.*` keys.
  - **Acceptance**: All 20 toolbar buttons render; separator groups are visible; table buttons toggle contextually; all commands work; emoji picker opens and inserts; toolbar scrolls horizontally on narrow containers.
  - **Dependencies**: T4, T5

- [X] T8 Create `src/crd/forms/markdown/MarkdownEditor.tsx`
  - **File**: new
  - **Description**: Main component. Props: `MarkdownEditorProps` from spec (value, onChange, placeholder, maxLength, disabled, className). Composes `useEditorExtensions` + `useMarkdownEditorState` + `MarkdownToolbar` + `EditorContent`. Layout: vertical flex — toolbar on top (border-b), editor surface below (flex-1, min-h-[120px]). Outer container: `border border-border rounded-lg overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20`. Imports `styles.css`. Wrapper div has `.crd-markdown-editor` class for scoped ProseMirror styles. Shows character count when `maxLength` is set (bottom-right, `text-xs text-muted-foreground`; switches to `text-destructive` when over limit). Placeholder via Tiptap's `placeholder` extension OR CSS `::before` pseudo-element on empty editor. Returns `null` while editor is initializing.
  - **Acceptance**: Editor renders with toolbar and editing surface; typing produces markdown via onChange; external value changes update content; placeholder shows when empty; character count works; disabled state makes editor read-only and toolbar disabled; focus ring appears on focus; className is applied to outer container.
  - **Dependencies**: T3, T7, T6

---

## Phase 4: Integration + i18n (depends on Phase 3)

- [X] T9 [P] Add i18n keys to `src/crd/i18n/space/space.en.json` under `editor.*`
  - **Description**: Keys for toolbar aria-labels: `editor.toolbar` ("Formatting toolbar"), `editor.undo`, `editor.redo`, `editor.bold`, `editor.italic`, `editor.heading1`, `editor.heading2`, `editor.heading3`, `editor.bulletList`, `editor.orderedList`, `editor.blockquote`, `editor.codeBlock`, `editor.horizontalRule`, `editor.insertTable`, `editor.deleteTable`, `editor.addColumn`, `editor.addRow`, `editor.deleteColumn`, `editor.deleteRow`, `editor.link`, `editor.emoji`, `editor.link.url` ("URL"), `editor.link.apply` ("Apply"), `editor.link.remove` ("Remove link"), `editor.link.placeholder` ("https://..."), `editor.link.invalid` ("URL must start with http:// or https://"), `editor.charCount` ("{{count}}/{{max}} characters")
  - **Acceptance**: All keys present in en.json; no hardcoded strings in editor components.
  - **Dependencies**: none

- [X] T10 [P] Mirror T9 keys to `src/crd/i18n/space/space.{bg,de,es,fr,nl}.json`
  - **Dependencies**: T9

- [X] T11 Add `descriptionSlot` to `src/crd/forms/callout/AddPostModal.tsx`
  - **File**: modified
  - **Description**: Add `descriptionSlot?: ReactNode` prop. Render between title input and attachment buttons: `{descriptionSlot}`. No other changes to the component.
  - **Acceptance**: Slot renders content in the correct position; existing functionality unchanged; no descriptionSlot renders as before (backwards compatible).
  - **Dependencies**: none

- [X] T12 Wire `MarkdownEditor` in `src/main/crdPages/space/callout/CalloutFormConnector.tsx`
  - **File**: modified
  - **Description**: Import `MarkdownEditor` from `@/crd/forms/markdown/MarkdownEditor`. Pass as `descriptionSlot` to `AddPostModal`: `<MarkdownEditor value={values.description} onChange={v => setField('description', v)} placeholder={t('forms.descriptionPlaceholder')} />`. The `framingEditorSlot` (FramingEditorConnector) remains unchanged.
  - **Acceptance**: Opening the callout creation form shows the markdown editor below the title; typing in the editor updates `values.description`; formatting toolbar works; description is included in the submit payload.
  - **Dependencies**: T8, T11

- [X] T13 [P] Import `styles.css` in `src/crd/styles/crd.css`
  - **File**: modified
  - **Description**: Add `@import '../forms/markdown/styles.css';` to `crd.css` so ProseMirror content styles are available globally within `.crd-root`.
  - **Acceptance**: ProseMirror styles apply inside the editor; no style leakage outside `.crd-markdown-editor`.
  - **Dependencies**: T6

---

## Phase 5: Standalone Preview + Verification

- [X] T14 [P] Add `MarkdownEditor` to `src/crd/app/pages/SpacePage.tsx` standalone preview
  - **Description**: Add a section to the SpacePage preview showing the MarkdownEditor with sample markdown content (headings, bold, lists, a link, a table). Include a "Current value" `<pre>` block below showing the live markdown output.
  - **Acceptance**: Preview renders the editor with sample content; toolbar is functional; editing updates the value display.
  - **Dependencies**: T8

- [X] T15 [P] Verify zero forbidden imports in `src/crd/forms/markdown/`
  - **Description**: Grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `formik`, `react-router-dom` in all files under `src/crd/forms/markdown/`. Must be zero matches.
  - **Acceptance**: No forbidden imports found.
  - **Dependencies**: T8

- [X] T16 [P] Update `src/crd/components/index.md` component inventory
  - **Description**: Add `MarkdownEditor` entry under forms/markdown.
  - **Dependencies**: T8

---

## Dependency graph

```
T1 (converter) ──┐
                  ├─→ T3 (editor state hook) ──┐
T2 (extensions) ──┘                             │
                                                ├─→ T8 (MarkdownEditor) ──→ T12 (wire connector)
T4 (toolbar button) ──┐                         │                      ──→ T14 (preview)
T5 (link dialog) ─────┼─→ T7 (toolbar) ─────────┘                      ──→ T15 (verify)
T6 (styles) ──────────┘                                                 ──→ T16 (inventory)

T9 (i18n en) ──→ T10 (i18n other langs)

T11 (AddPostModal slot) ──→ T12 (wire connector)

T6 (styles) ──→ T13 (import in crd.css)
```

**Critical path**: T1 → T3 → T8 → T12 (converter → state hook → main component → wiring)

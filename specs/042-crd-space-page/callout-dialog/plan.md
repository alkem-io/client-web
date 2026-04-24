# Implementation Plan: CRD Callout Dialog — Create / Edit / Lifecycle

**Branch**: `042-crd-space-page-callout-dialog` | **Parent**: [../plan.md](../plan.md) | **Spec**: [./spec.md](./spec.md)

## Summary

Replace the current thin `AddPostModal` + stub `CalloutEditConnector` + dead `CalloutContextMenu` with a full callout lifecycle:

- A single `AddPostModal` serves both **create** and **edit**, wired by a single `CalloutFormConnector` that branches on `mode`.
- Form state is **plain `useState` + yup** (no Formik), mirroring `useCreateSubspace.ts`.
- `CalloutContextMenu` is wired into both `PostCard` (feed 3-dots) and `CalloutDetailDialog` (sticky-header actions cluster), with all actions reachable: edit, publish / unpublish, delete, sort contributions, move up / down / top / bottom, share, save as template.
- Sub-dialogs that live outside the main form are ported to CRD: visibility change, delete confirm, sort contributions, framing-to-None confirm, response defaults, discard-changes confirm. Three remain MUI portals (outside `.crd-root`): `ShareDialog`, `ImportTemplatesDialog`, `CreateTemplateDialog` (Save as Template).
- Poll-option incremental diffing (`addPollOption` / `removePollOption` / `updatePollOption` / `reorderPollOptions`) is ported from MUI into a shared hook.
- Media-gallery reorder / delete / add on edit reuses the existing `useUploadMediaGalleryVisuals` with `existingVisualIds` / `originalSortOrders`.
- Memo framing inline editor = CRD `MarkdownEditor`. Whiteboard framing on create = `CrdSingleUserWhiteboardDialog`; on edit = `CrdWhiteboardDialog` (collaborative).

## Technical Context

- TypeScript 5.x / React 19 / Node 24.14.0.
- No new dependencies. Use existing `yup`, `@dnd-kit`, `lucide-react`, `class-variance-authority`, Radix primitives.
- All mutations already exist: `updateCallout`, `updateCalloutVisibility`, `deleteCallout`, `updateCalloutsSortOrder`, plus the 4 poll-option mutations, plus `useUploadMediaGalleryVisuals` / `useUploadWhiteboardVisuals`.
- Validation pattern: `yup.object().shape(...).validateSync(values, { abortEarly: false })` inside a local `validate()` helper; errors keyed by field path and translated through `translateValidationMessage`.
- No React Compiler manual-memoization (`useMemo` / `useCallback` / `React.memo`).

## Architecture

Three-layer split follows the parent plan:

1. **CRD presentational** (`src/crd/forms/callout/`, `src/crd/components/callout/`, `src/crd/components/dialogs/`) — plain TS props, Tailwind, zero Apollo / domain / routing.
2. **Integration connectors** (`src/main/crdPages/space/callout/`) — Apollo queries/mutations, data mapping, dialog orchestration.
3. **Existing hooks reused** (`src/domain/collaboration/...`, `useCalloutManager`, `useCalloutsSet`, `usePollOptionManagement`, `useUploadMediaGalleryVisuals`, etc.) — unchanged.

## File Inventory

### New CRD components (`src/crd/`)

| Path | Role |
|---|---|
| `forms/callout/FramingChipStrip.tsx` | Horizontal 6-chip strip for ADD-TO-POST. Single-select with radiogroup semantics. Props: `value`, `onChange`, `disabled?`, `lockedTo?` (for edit mode). Document chip is rendered disabled. |
| `forms/callout/ResponseTypeChipStrip.tsx` | Horizontal 5-chip strip for RESPONSES. Same semantics. |
| `forms/callout/ResponsePanel.tsx` | Per-type expanded panel container; dispatches on the active type to render the right sub-panel (`LinksPanel` / `PostsPanel` / `MemosPanel` / `WhiteboardsPanel` / `DocumentsPanel`). |
| `forms/callout/LinksPanel.tsx` | Pre-populate-links editor (rows of title/url/description + actor switches). |
| `forms/callout/ActorSwitches.tsx` | Two-switch "Members can add" / "Admins can add" with the hierarchy rule baked in. Accepts `value: { members: boolean; admins: boolean }` and `onChange`. |
| `forms/callout/ResponseDefaultsDialog.tsx` | Nested dialog shown when "Set Default Response" is clicked. Props: `open`, `onOpenChange`, `type`, `values`, `onChange`, `templateSlot?`, `whiteboardEditorSlot?`. The integration layer injects the template picker and the whiteboard-editor launcher. |
| `forms/callout/ReferencesEditor.tsx` | Rows of (title, url, description) + Add Reference button + delete-row. |
| `forms/callout/MemoFramingEditor.tsx` | Inline card wrapping CRD `MarkdownEditor` with the memo icon and label. |
| `forms/callout/DocumentFramingPlaceholder.tsx` | Coming-soon panel shown when Document chip would be active (unreachable until the chip is enabled). |
| `components/callout/CalloutVisibilityChangeDialog.tsx` | CRD Radix `AlertDialog`. Props: `open`, `onOpenChange`, `action: 'publish' \| 'unpublish'`, `loading`, `notifyMembers?`, `onNotifyMembersChange?`, `onConfirm`. |
| `components/callout/CalloutContributionsSortDialog.tsx` | CRD Radix `Dialog` with `@dnd-kit` sortable list. Props: `open`, `onOpenChange`, `contributions: { id; title; icon? }[]`, `onConfirm(sortedIds: string[])`, `loading?`. |
| `components/dialogs/DiscardChangesDialog.tsx` | Thin wrapper over existing `ConfirmationDialog` with hard-coded copy for discard-on-close. |
| `components/dialogs/DeleteCalloutDialog.tsx` | Thin wrapper over existing `ConfirmationDialog` with delete copy. |
| `components/dialogs/DeleteFramingDialog.tsx` | Thin wrapper over existing `ConfirmationDialog` for framing-to-None. |

### Modified CRD components

| Path | Change |
|---|---|
| `forms/callout/AddPostModal.tsx` | Major rewrite. Accepts `mode: 'create' \| 'edit'`, richer slots, integrates `FramingChipStrip` / `ResponseTypeChipStrip` / `ResponsePanel` / `ReferencesEditor`. Keeps "Find Template" button in the header (create mode). Footer gains the notify-members switch (D16) + Save Draft / Publish (create) or Save (edit). |
| `components/space/PostCard.tsx` | Replace the current stub `onSettingsClick` with a `settingsSlot?: ReactNode` prop that the integration layer fills with `CalloutContextMenu`. The 3-dots trigger remains the card's existing icon button — its click opens the dropdown. |
| `components/callout/CalloutDetailDialog.tsx` | Add a `settingsSlot?: ReactNode` to the sticky-header actions cluster, rendered to the right of the close button. |
| `components/callout/CalloutContextMenu.tsx` | Unchanged. Already has the right prop shape; the integration connector wires callbacks. |

### New integration layer (`src/main/crdPages/space/callout/`)

| Path | Role |
|---|---|
| `CalloutSettingsConnector.tsx` | Hosts `CalloutContextMenu` + opens the edit dialog, `CalloutVisibilityChangeDialog`, `CalloutContributionsSortDialog`, `DeleteCalloutDialog`, and three MUI portal dialogs outside `.crd-root`: `ShareDialog`, `ImportTemplatesDialog` (Find Template), and `CreateTemplateDialog` (Save as Template, gated by `CRD_SAVE_AS_TEMPLATE_ENABLED`). Reuses `useCalloutManager` for visibility / delete. Accepts neighbour callback props for move actions. |
| `ResponseDefaultsConnector.tsx` | Wraps `ResponseDefaultsDialog`. Fetches content templates (`useSpaceContentTemplatesOnSpaceQuery`), provides the template-picker slot, and wires a `CrdSingleUserWhiteboardDialog` for the whiteboard default. |

### Modified integration layer

| Path | Change |
|---|---|
| `CalloutFormConnector.tsx` | Rewrite. Single connector for create + edit. Accepts `mode`, `calloutId?`, `calloutsSetId?`, `onFindTemplate?`, `defaultClassification?`. On `mode === 'edit'`, runs `useCalloutContentQuery` and pre-fills; on save, chooses create / update path; runs poll-option diff; uploads media-gallery + whiteboard visuals after save. Confirms on dirty close. |
| `CalloutEditConnector.tsx` | Keep as a thin wrapper around `CalloutFormConnector mode="edit"` (not a stub any more). |
| `FramingEditorConnector.tsx` | Wire the `memo` case to render `MemoFramingEditor` with the CRD `MarkdownEditor` (bound to `values.memoMarkdown`). Keep the other cases. Rename local state where needed. |
| `TemplateImportConnector.tsx` | Implement. Opens MUI `ImportTemplatesDialog` via portal. On select, fetches template content and calls `onTemplateSelected(mappedValues)` which pre-fills the main form (with a confirmation when the form already has content). |
| `LazyCalloutItem.tsx` | Render `CalloutSettingsConnector` as the `settingsSlot` on `PostCard`. Pass the neighbour context + move callbacks. |
| `CalloutListConnector.tsx` | Compute `topCallout` / `bottomCallout` / `onMoveUp` / `onMoveDown` / `onMoveToTop` / `onMoveToBottom` per callout, reusing `useCalloutsSet`'s sort-order helpers. Pass through `LazyCalloutItem`. |
| `CalloutDetailDialogConnector.tsx` | Pass `settingsSlot={<CalloutSettingsConnector callout={...} />}` to `CalloutDetailDialog`. |

### New hooks (`src/main/crdPages/space/hooks/`)

| Path | Role |
|---|---|
| `useCrdCalloutForm.ts` (rewrite) | Full form state + yup validation + dirty tracking + `prefill(calloutData)`. Exposes `values`, `errors`, `touched`, `dirty`, `setField`, `validate`, `reset`, `prefill`. |
| `useCrdCalloutPollOptionDiff.ts` | Pure diff helper: given `before` + `after` option arrays, returns `{ toAdd, toRemove, toUpdate, reorderedIds }`. Unit-tested. |
| `useCrdCalloutMoveActions.ts` | Given a callout list + callout id, returns `{ topCallout, bottomCallout, onMoveUp, onMoveDown, onMoveToTop, onMoveToBottom }`. Wraps `useUpdateCalloutsSortOrderMutation`. |
| `useCrdCalloutSettingsMenu.ts` | (optional) Packages the permission gates + move-ability into a single prop bag for the menu. |

### i18n

- `src/crd/i18n/space/space.en.json` — new keys under `callout.*`, `forms.*`, `framing.*`, `contextMenu.*`, `contributionSettings.*`, `responseDefaults.*`, `references.*`, `pollForm.*`, `validation.*`. Delete unused keys if any.
- Mirror into `space.nl.json`, `space.es.json`, `space.bg.json`, `space.de.json`, `space.fr.json`.

## Key Design Decisions

### D1 — No Formik. yup + manual state

Mirrors `useCreateSubspace.ts` (line 51-133) verbatim. The form hook exposes `values`, `errors`, `setField`, `validate`, `reset`, `prefill`, `dirty`. `validate()` returns a fresh error map; submission calls it and gates on emptiness. Schema is built once inside the hook with `MARKDOWN_TEXT_LENGTH` / `SMALL_TEXT_LENGTH` bounds and short error codes (`required` / `maxSmall` / `maxMarkdown` / `urlInvalid`) that a translator helper resolves into `crd-space` keys.

### D2 — Single connector for create + edit

`CalloutFormConnector` takes a `mode` prop. Both paths share the same form UI, just with different initial data and different mutation branches at submit. Framing and response-type chip strips accept a `locked?: boolean` prop the connector sets to `true` in edit mode (permits deselect-to-None only). This avoids a second dialog component and keeps the two flows identical from the user's view.

### D3 — Tags as string in form, tagsets on submit

Form state keeps `tags: string` (comma-separated). At submit time:

```ts
const tagArray = values.tags.split(',').map(t => t.trim()).filter(Boolean);
const tagsets = tagArray.length > 0
  ? [{ name: 'default', tags: tagArray }]
  : [{ name: 'default', tags: [] }];
```

On edit pre-fill: `values.tags = tagsets?.find(t => t.name === 'default')?.tags.join(', ') ?? ''`.

This isolates the messy `TagsetModel` from the CRD layer while keeping compatibility with the server's create / update input shape.

### D4 — Actor switches encode `CalloutAllowedActors` with a hierarchy rule

The UI exposes two independent switches. The `ActorSwitches` component enforces:

- If `admins` goes OFF, `members` is forced OFF too, and its switch is disabled.
- If `members` goes ON, `admins` is forced ON too.
- `{ members: false, admins: false }` → `CalloutAllowedActors.None` + `enabled: false`.
- `{ members: false, admins: true }` → `CalloutAllowedActors.Admins` + `enabled: true`.
- `{ members: true, admins: true }` → `CalloutAllowedActors.Members` + `enabled: true`.
- `{ members: true, admins: false }` is unreachable.

### D5 — Response defaults as a nested form inside a nested dialog

The defaults dialog holds its own transient state (`draftValues`) initialized from the parent form's current `contributionDefaults`. Save commits `draftValues` back to the parent via `onChange`; Cancel discards. The whiteboard default is itself edited by `CrdSingleUserWhiteboardDialog`, so the defaults dialog's whiteboard slot is a simple "Edit whiteboard" button that opens a third Radix dialog (acceptable: MUI today has the same depth).

*Terminology*: the user-facing label is **Response Defaults** (matches the dialog title and the `responseDefaults.*` i18n section). The internal form-state field and the server input both keep the name `contributionDefaults` (matches the GraphQL input shape). Both names refer to the same concept.

### D6 — Edit locking for framing and response-type chips

In edit mode, both chip strips are "one-way": you cannot select a different chip than the active one, and clicking the active chip triggers a confirmation dialog to switch to None. This is enforced in the CRD chip-strip component via `lockedTo?: ChipId`. Clicking a locked chip is a no-op; clicking the active chip fires `onDeselect`, which the connector wraps with the framing-to-None confirmation.

### D7 — Poll option incremental save via a shared hook

`useCrdCalloutPollOptionDiff` is pure; `usePollOptionManagement` (already in the domain layer) provides the four mutations. The connector composes them:

```ts
if (isEdit && pollChanged) {
  const diff = useCrdCalloutPollOptionDiff(before, after);
  // Order: add → remove → update → reorder (never drops below the min)
  for (const text of diff.toAdd) await addPollOption(text);
  for (const id of diff.toRemove) await removePollOption(id);
  for (const { id, text } of diff.toUpdate) await updatePollOption(id, text);
  if (diff.reorderedIds.length > 1) await reorderPollOptions(diff.reorderedIds);
}
```

Matches MUI's `savePollOptionChanges` exactly.

### D8 — Context menu rendering: slot, not raw button

`PostCard` exposes `settingsSlot: ReactNode` instead of `onSettingsClick: () => void`. The feed card's 3-dots icon becomes the menu's `DropdownMenuTrigger`. This avoids plumbing dialog state up and down, and keeps the CRD `PostCard` purely presentational (no Apollo, no navigation). The `CalloutDetailDialog` gets an equivalent `settingsSlot`.

### D9 — Move actions computed in the list connector

Only `CalloutListConnector` knows the ordered callout list. It computes per callout:

```ts
const index = callouts.findIndex(c => c.id === id);
const isTop = index === 0;
const isBottom = index === callouts.length - 1;
const move = (direction) => updateCalloutsSortOrder(newOrderIds);
```

and passes down `onMoveUp` / `onMoveDown` / `onMoveToTop` / `onMoveToBottom` (each returning `undefined` when at the edge, so `CalloutContextMenu`'s conditional rendering naturally hides the item). On mutation failure, the hook surfaces a localized toast via `useNotification` and leaves the local list order unchanged (no optimistic rollback needed since we refetch on success).

### D10 — Visibility change as a CRD dialog, not MUI portal

We port `CalloutVisibilityChangeDialog` to CRD because (i) it's small — just a title + body + Switch + confirm/cancel — and (ii) it's the only place the user sets "Notify members" outside of the create footer. Using Radix `AlertDialog` gives us focus trap + keyboard + overlay scoped under `.crd-root`.

### D11 — Sort dialog ported, not reused

MUI's `CalloutContributionsSortDialog` is 171 lines and uses MUI primitives; porting to CRD is straightforward with `@dnd-kit` (already in deps and already used by `PollOptionsEditor` / `MediaGalleryField`). The port gives us consistent visuals with the rest of the flow. The underlying data layer stays identical to MUI: fetch with `useCalloutContributionsSortOrderQuery` and persist with `useUpdateContributionsSortOrderMutation` (confirmed by reading `src/domain/collaboration/calloutContributions/calloutsContributionsSortDialog/CalloutContributionsSortDialog.tsx`).

### D12 — Save-as-template: wire the MUI dialog, fallback to hide

We do **not** port `CreateTemplateDialog`. It is wired as a sibling portal outside `.crd-root`, mirroring how `ShareDialog` and `ImportTemplatesDialog` are consumed. Import path is `@/domain/templates/...` (not `@mui/*` directly), so the `src/main/crdPages` letter-of-rule holds; CSS isolation holds because the dialog renders in its own portal outside `.crd-root`. A local `CRD_SAVE_AS_TEMPLATE_ENABLED` constant remains available as a kill-switch: if at runtime the dialog fails to integrate (missing context providers, incompatible props), flip it to `false` and open a follow-up issue — the menu item then disappears cleanly.

### D13 — Memo framing uses the CRD `MarkdownEditor` inline (single-user), not a dialog

"Single-user mode for memo" = the inline markdown editor. The CRD `MarkdownEditor` (from the `markdown-editor` sub-spec) is already Tiptap-based and CRD-clean; we reuse it. On **edit**, the framing editor is replaced by a read-only memo preview + an "Open memo" button that launches `CrdMemoDialog` (collaborative). This is symmetric with how whiteboard works.

### D14 — Dirty tracking is a value comparison

`isDirty = !deepEqual(values, initialValues)` is computed per render (lodash `isEqual`). Cheap enough for the dialog's state size. No ref-based "touched any field" tracking needed; this also handles "typed then deleted" as clean, which matches user expectations.

### D15 — "Beforeunload" guard

While the dialog is open and dirty, a `beforeunload` handler registers (mirror `useDirtyTabGuard.ts`). Cleaned up in the effect's teardown. The handler lives in the integration layer — inside `CalloutFormConnector` (or an extracted `useBeforeUnloadGuard(dirty)` hook co-located with it) — never inside `AddPostModal`, to keep the CRD component free of browser-API side effects (CRD Golden Rule #2).

### D16 — Notify members placement

Footer. A CRD `Switch` primitive (from `@/crd/primitives/switch`) paired with a visible `<label>` via `aria-labelledby`, consistent with FR-132 (all toggles in this form use `Switch`, not checkbox). Visible only when:
- `mode === 'create'` and the form is publish-ready (non-empty title).
- In edit mode, the notify-members option is only surfaced in the visibility-change dialog (never in the form footer).

The same `Switch` primitive is used inside `CalloutVisibilityChangeDialog` for the publish-path notify toggle (D10).

### D17 — Prefill on edit

The connector calls `useCalloutContentQuery({ variables: { calloutId }, skip: !calloutId || !open })`. When the data lands (`useEffect` on `data`), it calls `form.prefill(mapCalloutDetailsToFormValues(data))`. The form state becomes the authoritative source; the query is not polled.

### D18 — Response-type initial selection

Create: none selected. Edit: set from `callout.settings.contribution.allowedTypes` (single enum, mapped to the chip id). If `allowedTypes === 'none'` or `enabled === false`, no chip is selected.

### D19 — Pre-populate links are CreateCalloutContributionInput[]

Only at create time. On edit, `LinksPrePopulateRows` is **not rendered** — existing link contributions are managed through the callout detail dialog, not the edit form. The actor switches and "Enable comments" for the Links & Files response type remain editable in edit mode. The connector maps non-empty rows:

```ts
contributions: prePopulateLinks
  .filter(r => r.url.trim() && r.title.trim())
  .map(r => ({
    type: CalloutContributionType.Link,
    link: { uri: r.url.trim(), profile: { displayName: r.title.trim(), description: r.description?.trim() } },
  }));
```

### D20 — Translation of yup messages

Inside `useCrdCalloutForm`, yup schemas use short codes (`required`, `maxSmall`, `maxMarkdown`, `urlInvalid`, `minPollOptions`, `pollOptionRequired`, `referenceTitleRequired`, `linkRowTitleRequired`). A `translateValidationMessage(code, context?)` helper resolves each code to a `t('validation.<code>')` lookup. Same pattern as `useCreateSubspace`.

### D21 — Discard-changes confirmation dialog lives inside `AddPostModal`

The modal owns its close UX visually only. It receives `dirty: boolean` as a prop from the connector (the connector reads it from `useCrdCalloutForm`, where `isDirty = !isEqual(values, initialValues)` is computed per render — see D14). `AddPostModal` never imports `lodash`, never reads `initialValues`, never compares values. Close attempts go through a `handleCloseAttempt()` that either closes (when `dirty === false`) or opens `DiscardChangesDialog` (when `dirty === true`).

### D22 — Find Template flow reuses MUI `ImportTemplatesDialog`

Rendered as a sibling of `AddPostModal`, outside `.crd-root`. The CRD dialog stays open (z-index lower). When the user selects a template and the MUI dialog closes, the handler fires `prefill(...)` on the form hook. When the form is **dirty** (same `dirty` flag from D14/D21 — any field diverges from initial state), a `ConfirmOverwriteDialog` (reuse `ConfirmationDialog`) gates the prefill. Using `dirty` rather than a title-only check ensures users who entered framing or response data without a title are still warned.

## Data Flow

### Create flow

```
User clicks "Create" on a tab
  → setCreateOpen(true)
  → <CalloutFormConnector mode="create" open={true} calloutsSetId={...} />
  → User fills form (title, description, framing, responses, defaults, references, tags, notify)
  → User clicks Publish
  → connector: validate() → if OK, mapFormToCallout(visibility=Published)
  → connector: handleCreateCallout(input)
  → after response: uploadWhiteboardVisuals + uploadMediaGalleryVisuals
  → connector: reset(); onOpenChange(false)
```

### Edit flow

```
User clicks Edit in CalloutContextMenu
  → setEditOpen(true), setEditCalloutId(id)
  → <CalloutEditConnector open={true} calloutId={id} />
  → <CalloutFormConnector mode="edit" calloutId={id} />
  → useCalloutContentQuery({ variables: { calloutId } })
  → useEffect: form.prefill(map(data.lookup.callout))
  → User edits fields (framing content, responses, defaults, references, tags)
  → User clicks Save
  → connector: validate() → if OK, mapFormToUpdateInput()
  → connector: updateCalloutContent({ variables: { calloutData } })
  → if poll edited: runPollOptionDiff via usePollOptionManagement
  → if media gallery edited: uploadMediaGalleryVisuals with existingVisualIds + originalSortOrders
  → if whiteboard edited: uploadWhiteboardVisuals (if preview-image id known)
  → connector: reset(); onOpenChange(false)
```

### Context-menu lifecycle

```
User clicks PostCard 3-dots
  → DropdownMenuTrigger in CalloutSettingsConnector opens menu
  → User clicks item X:
    - Edit → setEditOpen(true)
    - Publish / Unpublish → setVisibilityDialogOpen(true)
    - Delete → setDeleteDialogOpen(true)
    - Sort Contributions → setSortDialogOpen(true)
    - Save as Template → setTemplateDialogOpen(true)
    - Move Up/Down/Top/Bottom → onMoveX() (computed by CalloutListConnector)
    - Share → setShareDialogOpen(true)  [MUI portal]
```

## Phased implementation

| Phase | User stories | What ships | Effort |
|---|---|---|---|
| P0 | US1, US11 | Form shell rewrite: chip strips, zones, dirty tracking, validation, confirm-on-close. Create-flow parity for text callouts. | Medium |
| P1 | US2, US3, US4, US5, US6 | All 5 working framings. Memo inline `MarkdownEditor` wired. Whiteboard / media-gallery / poll connectors touched to align with the new form hook. | Medium |
| P2 | US7, US8, US9, US10 | Responses zone (chip strip, actor switches, per-type panels), pre-populate links, references editor, tags wrapping into tagsets, response-defaults dialog (incl. template picker + whiteboard default). | High |
| P3 | US12 | Edit mode: prefill, chip-strip locking, framing-to-None confirmation, poll-option diff, media-gallery diff, save mutation wiring. | High |
| P4 | US13, US14, US15, US16, US17 | `CalloutSettingsConnector` + `CalloutContextMenu` wired in `PostCard` + `CalloutDetailDialog`. `CalloutVisibilityChangeDialog`, `DeleteCalloutDialog`, `CalloutContributionsSortDialog` (CRD ports). Move actions via `useCrdCalloutMoveActions`. Share via MUI portal. | Medium |
| P5 | US18, US19 | Find-Template (MUI `ImportTemplatesDialog` portal + prefill). Save-as-Template (MUI `CreateTemplateDialog` portal + kill-switch constant). | Medium |
| P6 | — | i18n pass across 6 languages. Cleanup: remove dead `TemplateImportConnector` stub, unused fields in `useCrdCalloutForm`. | Small |

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Porting `CreateTemplateDialog` pulls in too much Formik / domain code | Hide Save-as-Template behind a const, file a follow-up. Acceptable per D12. |
| Pre-populate links on edit has fuzzy semantics (the MUI edit dialog does not support editing pre-populated links — they become real contributions managed elsewhere) | Mirror MUI: hide the pre-populate editor in edit mode; surface a "Manage contributions" link to the callout detail dialog. |
| Whiteboard default inside the response-defaults dialog triggers a third nested Radix dialog | Acceptable (MUI has the same depth). Confirm the focus-trap stack works by manual testing in P2. |
| Edit mode + poll option diff can put the poll in an inconsistent state if a mutation fails mid-way | Port the MUI "add before remove" ordering + leave the dialog open on failure + show a toast. Matches MUI behaviour. |
| Media-gallery reorder + add + delete in a single save causes race conditions in visual IDs | Reuse the existing `useUploadMediaGalleryVisuals` which already handles this for the MUI edit flow. No new logic needed. |
| Framing chip Document is visually active but the form accidentally submits `type: Document` (invalid enum) | Document chip is disabled (pointer-events-none + aria-disabled + no click handler). Unit test the chip strip to confirm. |
| Tags lose ordering when the form re-renders from "A, B" to "A,B" | Keep raw string in form state; only split on submit. |
| The CRD Dialog's `onOpenChange(false)` is called by Radix on outside-click / Escape, bypassing our close handler | Wrap in `onOpenChange={nextOpen => handleCloseAttempt(nextOpen)}` which runs the dirty check before actually closing. |

## Testing

- **Vitest unit tests** for: `useCrdCalloutPollOptionDiff`, `mapFormToCalloutCreationInput`, `mapCalloutDetailsToFormValues`, `ActorSwitches` hierarchy rule, `useCrdCalloutForm.validate` per FR-80..FR-85, `FramingChipStrip` locked behaviour.
- **Vitest render tests** for the dialogs: `CalloutVisibilityChangeDialog`, `CalloutContributionsSortDialog`, `DiscardChangesDialog`, `DeleteCalloutDialog`.
- **Manual smoke test matrix**: create each framing type × each response type × notify yes/no × draft/published. Edit each. Publish → Unpublish → Delete.
- **No e2e**. The form is a CRD dialog; coverage lives in component tests.

## Constitution check

| Principle | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | PASS | CRD forms are presentational; Apollo stays in the connector. |
| II. React 19 Concurrent UX | PASS | No manual memoization. |
| III. GraphQL Contract Fidelity | PASS | No schema changes. |
| IV. State & Side-Effect Isolation | PASS | Form state owned by the hook; mutations in the connector. |
| V. Experience Quality & Safeguards | PASS | WCAG 2.1 AA requirements enumerated; dirty-guard + confirm dialogs. |
| Arch-1 Feature taxonomy | PASS | New files under existing subtrees. |
| Arch-2 Styling | PASS (with parent's known MUI-coexistence exception) | Only `ShareDialog` + `ImportTemplatesDialog` stay MUI. |
| Arch-3 i18n | PASS | `crd-space` namespace; 6 languages in the same PR. |
| Arch-5 Imports | PASS | No barrel exports; explicit paths. |
| Eng-5 Root cause | PASS | No workarounds; every gap traced to a concrete file and a concrete fix. |

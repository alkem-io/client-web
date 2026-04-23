# CRD Callout Dialog — Full Create / Edit / Lifecycle Migration

**Feature Branch**: `042-crd-space-page` (new sub-branch TBD)
**Parent**: [../spec.md](../spec.md)
**Status**: Draft

## Problem

The current CRD callout form (`src/crd/forms/callout/AddPostModal.tsx` + `src/main/crdPages/space/callout/CalloutFormConnector.tsx`) works only for trivial callouts. Hands-on testing and code inspection confirm the following gaps:

- **Memo framing is not wired**: the `FramingEditorConnector` renders a placeholder ("Tiptap editor will be rendered here") instead of a real markdown editor. A user picking "Memo" cannot set its content.
- **Contribution defaults are not collected or submitted**: the server accepts `contributionDefaults.defaultDisplayName`, `postDescription`, and `whiteboardContent`, but the CRD connector never writes them. New post / memo / whiteboard contributions created later get empty defaults.
- **Per-actor contribution settings (`CalloutAllowedActors`) are not exposed**: the form has no "Members can add" / "Admins can add" switches; the connector never writes `canAddContributions`.
- **Contribution `allowedTypes` is modelled as a multi-select array** in CRD but the server / product contract is a single enum (`None | Post | Memo | Whiteboard | Link`). The current form can produce invalid values.
- **References on the framing profile are not collected**: MUI and the prototype both show a references editor (title / url / description rows) inside "More options"; CRD has no UI for it.
- **Tags are stored as a raw comma-separated string** and never wrapped in the `tagsets: [{ name, tags[] }]` structure the mutation expects, so tags never persist correctly.
- **Pre-populated link contributions at create time are not supported**: when the chosen response type is Links, the prototype shows inline rows for title / url / description that create real `Contributions` on save. The CRD form has no such editor.
- **Edit is a stub**: `CalloutEditConnector.tsx` does not fetch the callout, does not pre-fill the form, does not save updates. Its body explicitly says "In the full implementation, this would: 1. Fetch callout details by ID 2. Map to form values 3. Pass to CalloutFormConnector with locked fields".
- **Lifecycle actions are unreachable**: the `CalloutContextMenu` CRD component exists with all the right items (edit, publish, unpublish, delete, sort contributions, save as template, move up/down/top/bottom, share) but is **not rendered anywhere** — the 3-dots on `PostCard` and `CalloutDetailDialog` are dead.
- **Move / sort actions have no plumbing**: `LazyCalloutItem` does not know its neighbours; the list connector never surfaces the callout position callbacks.
- **There is no confirm-on-close**: losing a half-written callout on accidental backdrop click is easy.
- **Template import and "save as template" are placeholder stubs** (`TemplateImportConnector.tsx` returns `null`).
- **Poll-option incremental diffing on edit is absent**: the MUI `EditCalloutDialog` carefully adds / removes / updates / reorders poll options via dedicated mutations; the CRD form does not.
- **Visibility toggle is duplicated**: the CRD form currently shows both a draft/published selector AND "Save Draft" / "Publish" buttons. The prototype only uses the buttons.
- **The prototype has moved on**: PR #9574 expanded `prototype/src/app/components/space/AddPostModal.tsx` from ~75 → 723 lines. It now covers all the responses / defaults / references / nested-dialogs UI that CRD is missing.

## Solution

One subspec, one branch, one PR sequence. Scope: **full callout lifecycle parity with MUI**, driven by a single `AddPostModal` used for create and edit, plus a `CalloutContextMenu` wired into both the feed card and the detail dialog's header. Port the follow-up dialogs (visibility change, sort contributions, save-as-template, delete-confirm) to CRD. Keep two MUI portal dependencies that aren't worth porting right now: `ShareDialog` and `ImportTemplatesDialog` (find-template).

### Goals

1. A user can **create** a callout with any supported framing (`None`, `Whiteboard`, `Memo`, `Link`, `MediaGallery`, `Poll`) and any allowed contribution configuration (`None | Post | Memo | Whiteboard | Link`, with per-actor settings and contribution defaults), and see it appear in the feed.
2. A user can **edit** an existing callout. Framing type and contribution `allowedTypes` are locked (except switching framing to `None` to drop the framing, with a confirmation). Framing content, contribution actors, contribution comments, framing comments, contribution defaults, tags, references, and poll options are editable. Poll option changes save via the dedicated add / remove / update / reorder mutations.
3. A user can **publish / unpublish / delete / share / sort contributions / move (up, down, top, bottom) / save as template** a callout from a `CalloutContextMenu` exposed in two places: the 3-dots on the feed `PostCard`, and the more-options button in `CalloutDetailDialog`'s sticky header.
4. **Closing the dialog when the form is dirty** prompts a confirmation; closing a clean (empty or unchanged) form closes immediately.
5. All user-visible strings live in the `crd-space` namespace; no raw Tailwind typography combos (tokens only); all interactive elements are keyboard- and screen-reader-accessible per WCAG 2.1 AA.
6. **No Formik**. Form state uses `useState` + `yup.validateSync` + a manual error map, following `useCreateSubspace.ts` precedent.
7. Ported/shared dialogs are CRD-styled (shadcn + Tailwind). Only `ShareDialog` and `ImportTemplatesDialog` remain MUI portals.

### Prototype reference

Primary: `prototype/src/app/components/space/AddPostModal.tsx` (723 lines, PR #9574). The prototype expresses the new layout — four zones in the scrollable body (Title + description, ADD-TO-POST chip strip with inline editors, RESPONSES chip strip with per-type panels, MORE OPTIONS with tags / comments toggle / references), plus a nested RESPONSE-DEFAULTS dialog. The prototype does not show the notify-members checkbox; we add one in the footer.

### Non-goals

- Porting `ShareDialog` (MUI). Used as-is via portal.
- Porting `ImportTemplatesDialog` (MUI, Formik-heavy). Used as-is via portal.
- Collaborative memo / whiteboard editing in the callout dialog. On **create** the framing uses single-user mode (markdown for memo, `CrdSingleUserWhiteboardDialog` for whiteboard). On **edit** the framing opens the multi-user collaborative dialog (`CrdMemoDialog`, `CrdWhiteboardDialog`) — that wiring is already done by this repo's existing memo/whiteboard subspecs and is only referenced here.
- Contribution creation flows (add post / add memo / add whiteboard / add link from inside a live callout). Already wired in `MemoContributionAddConnector`, `WhiteboardContributionAddConnector`, and peers. This subspec only configures the **allowed types, actors, and defaults** for contributions; it does not create them.
- `Document` framing and `Document` contribution type. Chip renders as a disabled placeholder with a "coming soon" tooltip; no mutation wiring.

## User Scenarios

### US1 — Create a simple text callout (Priority P0)

A user opens the create dialog from a tab header, types a title and description, picks no framing and no response type, clicks **Publish**. The callout appears in the feed as a text post.

**Acceptance**:
1. **Given** the user clicks "Create" on a tab, **When** the dialog opens, **Then** it shows an empty title field focused, an empty description editor, the six framing chips all unselected, no response type selected, and empty tags / references / more options.
2. **Given** the user enters a title, **When** the title is non-empty after trim, **Then** the Publish and Save Draft buttons become enabled; until then, both are disabled.
3. **Given** the user clicks Publish with a valid title, **When** the mutation resolves, **Then** the dialog closes, form state resets, and the new callout appears at the top of the feed with `visibility = Published`.
4. **Given** Publish is clicked and `notifyMembers` is checked in the footer, **When** the mutation runs, **Then** `sendNotification: true` is included in the create input.

### US2 — Create a memo-framed callout (Priority P0)

A user picks **Memo** from the framing chips. An inline card with the CRD `MarkdownEditor` appears. The user writes markdown, then publishes.

**Acceptance**:
1. **Given** the user clicks the Memo chip, **When** the chip becomes active, **Then** an inline framing-editor card appears beneath the chip strip containing the CRD `MarkdownEditor` pre-filled with empty markdown.
2. **Given** the user types markdown in the memo editor, **When** the form is submitted, **Then** the create mutation sends `framing.type = Memo` and `framing.memo.markdown = <the markdown>` with a `framing.memo.profile.displayName` equal to the callout title (trimmed) or a localized fallback when empty.
3. **Given** the user switches chip from Memo to Whiteboard mid-composition, **When** the switch happens and the memo has content, **Then** a confirmation dialog asks to discard the memo; confirming clears the memo content.

### US3 — Create a whiteboard-framed callout (Priority P0)

A user picks **Whiteboard**. An inline card shows "New Whiteboard — Ready to be created" and a **Configure** button. Clicking Configure opens `CrdSingleUserWhiteboardDialog` in fullscreen. The user edits and saves; the card now reads "Configured" and shows **Edit**. On form submit, the whiteboard content + preview images are uploaded post-save (mirrors the MUI flow).

**Acceptance**:
1. Matches the existing CRD behaviour in `FramingEditorConnector`'s `whiteboard` case. No regressions.

### US4 — Create a poll (Priority P1)

A user picks **Poll**. Inline fields appear: poll question, option rows (min 2), and a settings-gear button that opens the CRD `PollSettingsDialog`. The user fills in the question, 3 options, and enables "allow multiple". On publish, the poll is created with its settings.

**Acceptance**:
1. **Given** the Poll chip is active and fewer than `MIN_POLL_OPTIONS` options have non-empty text, **When** Publish is clicked, **Then** a validation error "At least two options are required" is shown; the mutation is not sent.
2. **Given** the user opens `PollSettingsDialog` and toggles "allow multiple", **When** the dialog is closed, **Then** subsequent submit sends `maxResponses: 0` (= multi) instead of `1`.
3. **Given** the user toggles "allow custom options", **When** Publish runs, **Then** `allowContributorsAddOptions: true` is sent.
4. **Given** the user toggles "hide results until voted", **When** Publish runs, **Then** `resultsVisibility: Hidden` is sent.
5. **Given** the user toggles "show voter avatars" **off**, **When** Publish runs, **Then** `resultsDetail: Count` (vs `Full`) is sent.

### US5 — Create a link (call-to-action) callout (Priority P1)

A user picks **Call to Action**. Inline fields appear: Button Label (display name), Target URL. Both required; URL must start with `http://` or `https://`. On publish, `framing.link = { uri, profile: { displayName } }`.

**Acceptance**: inherits the existing CRD behaviour in `LinkFramingFields`.

### US6 — Create a media-gallery-framed callout (Priority P1)

Handled by the existing media gallery subspec; in this subspec we just ensure the `image` chip and `MediaGalleryFormFieldConnector` stay wired. On publish, the media-gallery id returned by the create mutation drives the post-save upload of each file.

### US7 — Configure allowed response type with per-actor settings and defaults (Priority P0)

A user picks **Posts** in the RESPONSES chip strip. A per-type panel expands showing: "Members can add" (switch), "Admins can add" (switch), "Enable comments" (switch), and a **Set Default Response** button.

- Only one response type can be selected at a time (radio semantics, rendered as chips).
- If "Admins can add" is switched off, "Members can add" is forced off and disabled (mirrors the MUI hierarchy in `ContributionsSettings.tsx`).
- Switching "Members can add" on forces "Admins can add" on.
- The three states map to `CalloutAllowedActors`: `None` (both off) / `Admins` / `Members`.
- "Enable comments" is shown for the **Posts** type only — the other contribution types do not yet support per-response comments.

Clicking **Set Default Response** opens a nested dialog with, per type:
- **Posts**: default title (input), default description (CRD `MarkdownEditor`).
- **Memos**: default title, default description (CRD `MarkdownEditor`).
- **Whiteboards**: default title, default whiteboard content (opens `CrdSingleUserWhiteboardDialog`).
- **Documents**: placeholder panel (coming soon).
- **Posts / Whiteboards**: also a Template picker (search-in-dropdown) showing the space's content templates, which, when selected, pre-fills the defaults from the template.

**Acceptance**:
1. **Given** no response type is selected, **When** Publish runs, **Then** `settings.contribution.allowedTypes = 'none'` and `settings.contribution.enabled = false`.
2. **Given** the user picks Posts and leaves both actor switches on, **When** Publish runs, **Then** `allowedTypes: Post`, `canAddContributions: Members`, `enabled: true`.
3. **Given** the user turns "Members can add" off but "Admins can add" on, **When** Publish runs, **Then** `canAddContributions: Admins`.
4. **Given** both actor switches are off, **When** Publish runs, **Then** `canAddContributions: None`, `enabled: false`.
5. **Given** the user enters "Share your thoughts..." as the Posts default description, **When** Publish runs, **Then** `contributionDefaults.postDescription = 'Share your thoughts...'`.

### US8 — Pre-populate link contributions at create time (Priority P1)

A user picks **Links & Files** as the response type. A "Pre-populate collection" editor appears: rows of (title, url, description), with an **Add another link** button and a delete affordance per row. On publish, each valid row becomes a `CreateCalloutContributionInput` of type `Link`.

**Acceptance**:
1. **Given** the user adds two non-empty rows, **When** Publish runs, **Then** the create input includes `contributions: [{ type: Link, link: { uri, profile: { displayName } } }, …]` for each row.
2. Empty rows (no uri) are dropped silently.

### US9 — Add references to the callout framing (Priority P1)

Inside "More options" the user expands **References**, adds rows of (title, url, description). On publish, these become `framing.profile.references[]`.

**Acceptance**:
1. **Given** the user enters one row with title "Docs" and url "https://docs.example.com", **When** Publish runs, **Then** `framing.profile.references` contains `[{ name: 'Docs', uri: 'https://docs.example.com', description: '' }]`.
2. Empty rows are filtered out on submit.

### US10 — Add tags (Priority P1)

Inside "More options" the user enters comma-separated tags. The form keeps the raw string; on submit it's split / trimmed / filtered, then wrapped as `framing.profile.tagsets: [{ name: 'default', tags: [...] }]` (matching the MUI mutation shape).

### US11 — Confirm on close when dirty (Priority P0)

A user types a title, then clicks the X or outside the dialog, or presses Escape.

**Acceptance**:
1. **Given** the form is untouched (all fields at their initial values), **When** the user closes, **Then** the dialog closes without confirmation.
2. **Given** the form is dirty (any field diverges from initial state), **When** the user closes, **Then** a CRD `ConfirmationDialog` appears ("Discard your changes?" / "Keep editing" / "Yes, close"). Only "Yes, close" actually closes.

### US12 — Edit an existing callout (Priority P0)

A user clicks **Edit** in the callout context menu. The same `AddPostModal` opens, pre-filled with the callout's current data fetched via `useCalloutContentQuery`.

- The framing chips are locked (visually inactive, aria-disabled) — the user may change the currently-active framing to "None" only, via a confirmation ("Delete framing?"), which sets `framing.type = None` on save. No other framing switches are possible.
- The response type chips are locked with the same rules — only switching to "None" is allowed (with confirmation). Per-actor switches, comments switches, and defaults are all editable.
- Framing content **is** editable: memo body, whiteboard (opens `CrdWhiteboardDialog` collaborative), link fields, media-gallery visuals, poll question + options.
- Poll options save incrementally via `addPollOption`, `removePollOption`, `updatePollOption`, `reorderPollOptions` (ported from the MUI `savePollOptionChanges` diff routine).
- Media-gallery uploads / deletes on save use the existing `useUploadMediaGalleryVisuals` path with `existingVisualIds` + `originalSortOrders` to detect reorder / delete.
- The footer shows a single **Save** button (plus the notify-members checkbox when applicable); Save Draft is not surfaced in edit — visibility changes are done from the context menu (Publish / Unpublish).

**Acceptance**:
1. **Given** a user clicks Edit on a published callout, **When** the dialog opens, **Then** title / description / tags / references / framing content / contribution settings / contribution defaults all reflect the server state.
2. **Given** the user changes the title and clicks Save, **When** the mutation resolves, **Then** `updateCallout` is called with the new title and the dialog closes.
3. **Given** the user attempts to pick a different framing chip (e.g. Whiteboard while the callout is Poll), **When** they click the chip, **Then** nothing happens (aria-disabled).
4. **Given** the user clicks the active framing chip (to deselect = switch to None), **When** they confirm the "Delete framing?" dialog, **Then** on save `framing.type = None` and the existing framing entity is dropped server-side.
5. **Given** the user edits a poll option, adds a new one, and deletes another, **When** Save runs, **Then** the three corresponding poll-option mutations are called in order (add-new → remove → update → reorder).

### US13 — Publish / Unpublish from the context menu (Priority P1)

A user clicks the 3-dots on a `PostCard`, then **Publish** (or **Unpublish** if already published). A CRD visibility-change dialog confirms with a "Notify members" checkbox (only for publishing). On confirm, the visibility mutation runs with the chosen `sendNotification` value.

**Acceptance**:
1. **Given** a draft callout, **When** the user clicks Publish in the menu, **Then** a CRD dialog opens with title "Publish callout", body copy explaining the effect, and a "Notify members" checkbox (default off).
2. **Given** the user checks "Notify members" and confirms, **When** the mutation runs, **Then** `updateCalloutVisibility({ calloutID, visibility: Published, sendNotification: true })`.
3. **Given** a published callout, **When** Unpublish is chosen, **Then** the dialog shows "Unpublish callout"; the notify-members checkbox is not rendered.

### US14 — Delete from the context menu (Priority P1)

A user clicks **Delete**. A CRD `ConfirmationDialog` confirms ("Delete callout? This cannot be undone."). On confirm, `deleteCallout` runs and the feed refetches.

### US15 — Sort contributions (Priority P2)

A user clicks **Sort contributions** (visible only when the callout has a live contribution set). A CRD `CalloutContributionsSortDialog` opens with a `@dnd-kit` list of the contributions. On confirm, `updateCalloutsSortOrder` (or the equivalent contribution-sort mutation — to be verified during implementation) persists the order.

### US16 — Move callout up / down / top / bottom (Priority P2)

A user clicks a move item. The integration layer computes the new sort order and calls `useUpdateCalloutsSortOrderMutation`. The menu items are conditionally rendered based on whether the callout is at top / bottom of the list.

### US17 — Share (Priority P2)

A user clicks **Share**. The existing MUI `ShareDialog` opens via portal (outside `.crd-root`). No CRD port.

### US18 — Save as Template (Priority P2)

A user clicks **Save as Template**. A CRD `SaveAsTemplateDialog` opens (ported from MUI `CreateTemplateDialog`) — **if feasible**. If porting exceeds the budget, this menu item is hidden for now and a follow-up issue tracks the port.

### US19 — Find Template on create (Priority P2)

A user clicks **Find Template** in the dialog header. The existing MUI `ImportTemplatesDialog` opens via portal. On selection, the form is pre-filled from the chosen template. If the form already has data, a confirmation warns that the current content will be overwritten.

## Functional Requirements

### Form shell (`AddPostModal`)

- **FR-01** The dialog renders as a centered Radix `Dialog` with `max-w-5xl`, `max-h-[90vh]`, scrollable body, sticky header and footer (already true).
- **FR-02** Header shows the dialog title (`Create post` or `Edit post`), a **Find Template** button (create mode only), and a close button.
- **FR-03** Title input is borderless, large (`text-section-title md:text-page-title`), auto-focused on open.
- **FR-04** Description uses the CRD `MarkdownEditor`.
- **FR-05** Below the description, a Zone 1b: ADD-TO-POST chip strip with 6 chips — Whiteboard, Memo, Document (disabled placeholder), Call to Action, Image, Poll. Single-select semantics.
- **FR-06** Below the chip strip, the active framing's inline editor card renders.
- **FR-07** Zone 2: RESPONSES. Always visible. Label "RESPONSES" + chip strip — Links & Files, Posts, Memos, Whiteboards, Documents (disabled placeholder). Single-select semantics.
- **FR-08** Below the response chip strip, the active response type's per-type panel renders — actor switches + optional "Enable comments" + Set Default Response button (except Links, which shows the pre-populate-links editor).
- **FR-09** Zone 3: MORE OPTIONS (collapsible). Contains Tags input, "Allow Comments" toggle (framing-level), References editor.
- **FR-10** Footer shows (left-aligned) nothing, (right-aligned) a "Notify members" checkbox (visible only in create mode and only when the form is publish-ready), then **Save Draft** and **Publish** buttons in create mode; in edit mode, **Cancel** and **Save**. The notify checkbox is visible but inert when Save Draft is the active intent.
- **FR-11** Framing chip strip is horizontally scrollable on narrow viewports.

### Framing editors

- **FR-20** Whiteboard framing: inline card with icon + "New Whiteboard" + status text + Configure/Edit button. Clicking opens `CrdSingleUserWhiteboardDialog` (create) or `CrdWhiteboardDialog` (edit).
- **FR-21** Memo framing: inline card with icon + "Memo" + CRD `MarkdownEditor` field. Empty placeholder "Write your memo…".
- **FR-22** Document framing: chip present but disabled with tooltip "Coming soon".
- **FR-23** Call-to-Action framing: inline card with two inputs (Button Label, Target URL). URL validated against `^https?://`.
- **FR-24** Image framing: inline dropzone + thumbnail grid (existing `MediaGalleryFormFieldConnector`). Behaviour unchanged.
- **FR-25** Poll framing: inline card with question input, 2..N option rows, **+ Add option**, and a gear button opening `PollSettingsDialog`.

### Responses zone

- **FR-30** Response type chips are single-select. Clicking the active chip deselects (response type = None).
- **FR-31** **Links**: per-type panel shows (i) a "Pre-populate collection" editor with title / url / description rows and an "Add another link" button, (ii) an actor-switches row ("Members can add", "Admins can add").
- **FR-32** **Posts**: per-type panel shows actor switches + "Enable comments" switch + **Set Default Response** button.
- **FR-33** **Memos**: per-type panel shows actor switches + **Set Default Response** button.
- **FR-34** **Whiteboards**: per-type panel shows actor switches + **Set Default Response** button.
- **FR-35** **Documents**: per-type panel is a placeholder. No switches, no defaults button.
- **FR-36** Actor switches enforce the hierarchy rule: Members OFF allows Admins either state; Admins OFF forces Members OFF + disabled.

### Response defaults dialog

- **FR-40** A nested dialog titled `{TypeName} defaults`, rendered as a second Radix `Dialog` above the main one (lower max-width, `sm:max-w-lg`).
- **FR-41** For Posts / Whiteboards types: shows a **Template** field — a popover dropdown with search + a scrollable list of this space's content templates. Selecting one pre-fills the defaults below.
- **FR-42** All types: **Default title** input.
- **FR-43** Posts + Memos: **Default description** CRD `MarkdownEditor`.
- **FR-44** Whiteboards: **Default whiteboard** — a preview panel + Edit button that opens `CrdSingleUserWhiteboardDialog`.
- **FR-45** Documents: disabled placeholder.
- **FR-46** Save / Cancel buttons. Cancel discards changes; Save commits them to the parent form's `contributionDefaults` state.

### References section

- **FR-50** References editor in "More options": rows of (title, url, description). Delete row (except when 1 row remains). **Add another reference** button.
- **FR-51** Empty rows are dropped on submit.
- **FR-52** URL is not validated at form level — the server accepts arbitrary strings in the reference field.

### Tags

- **FR-60** Comma-separated string input with Hash icon prefix.
- **FR-61** On submit, `tags = raw.split(',').map(t => t.trim()).filter(Boolean)`, wrapped into `tagsets: [{ name: 'default', tags }]`.

### Visibility, notify, and actions

- **FR-70** Create mode: **Save Draft** = `visibility: Draft, sendNotification: false`. **Publish** = `visibility: Published, sendNotification: notifyMembersChecked`.
- **FR-71** Edit mode: **Save** preserves current visibility; there is no "Publish" / "Save Draft" branch. Visibility changes happen through the context menu.
- **FR-72** "Notify members" checkbox is visible only in create mode, only when the form has a non-empty title (so Publish is enabled).
- **FR-73** Save Draft / Publish / Save buttons show an `aria-busy` spinner during the mutation; the rest of the form is disabled.

### Validation (yup, standalone)

- **FR-80** Title: required (trimmed), `max: SMALL_TEXT_LENGTH`.
- **FR-81** Description: optional, `max: MARKDOWN_TEXT_LENGTH`.
- **FR-82** Link framing: displayName required (trimmed); uri required, must start with `http://` or `https://`.
- **FR-83** Poll framing: question required (trimmed); at least 2 option rows have non-empty text; each option text ≤ `SMALL_TEXT_LENGTH`.
- **FR-84** References: each row with non-empty uri must have non-empty title.
- **FR-85** Pre-populate links: each row with non-empty uri must have non-empty title.
- **FR-86** Messages are short codes translated via a `translateValidationMessage` helper into `crd-space` keys (pattern from `useCreateSubspace.ts`).
- **FR-87** Validation runs on Save Draft / Publish / Save and gates the submission. Field-level errors show as red text under the field; the first invalid field scrolls into view.

### Dirty state and confirm on close

- **FR-90** Dirty = any form value diverges from its initial state (for create, initial = empty defaults; for edit, initial = server-mapped values).
- **FR-91** Closing a dirty form triggers a CRD `ConfirmationDialog` (Discard your changes? / Keep editing / Yes, close).
- **FR-92** Closing a clean form closes immediately.
- **FR-93** `browserbeforeunload` listener while the form is dirty (matches the MUI-style safety net; same pattern as `useDirtyTabGuard.ts`).

### Context menu & lifecycle

- **FR-100** `CalloutContextMenu` is rendered in two places: (i) the 3-dots on the feed `PostCard`, driven by `onSettingsClick`; and (ii) the more-options button in the sticky header of `CalloutDetailDialog`.
- **FR-101** Menu items are gated on permissions and visibility:
  - Edit — visible when `authorization.myPrivileges` contains `Update`.
  - Publish — visible when the callout is draft and the user can `Update`.
  - Unpublish — visible when the callout is published and the user can `Update`.
  - Share — always visible.
  - Sort contributions — visible when the callout is a contribution collection and has ≥ 2 contributions.
  - Save as Template — visible when `canSaveAsTemplate` evaluates to true (user has template-create privilege on the space) **and** the CRD save-as-template dialog is implemented. Hidden otherwise.
  - Move Up / Down / To Top / To Bottom — visible when the user can `Update` and the callout has a neighbour in the relevant direction.
  - Delete — visible when the user can `Delete` or the equivalent privilege.
- **FR-102** Publish / Unpublish open a CRD `CalloutVisibilityChangeDialog` (ported). It shows the action title, the effect description, and — when publishing — a "Notify members" checkbox. Confirming runs `updateCalloutVisibility` (reused from `useCalloutManager`).
- **FR-103** Delete opens a CRD `ConfirmationDialog`. Confirming runs `deleteCallout` (reused from `useCalloutManager`).
- **FR-104** Sort contributions opens a CRD `CalloutContributionsSortDialog` (ported). Confirming runs the contribution-order mutation.
- **FR-105** Move actions call `useUpdateCalloutsSortOrderMutation`, with the sort-order array computed by the list connector (neighbours + callout id).
- **FR-106** Share opens the MUI `ShareDialog` via portal, unchanged.
- **FR-107** Save as Template opens the CRD `SaveAsTemplateDialog` (ported from MUI `CreateTemplateDialog`) if implemented; otherwise the menu item is not rendered.

### Edit-mode specifics

- **FR-110** `useCalloutContentQuery` is the single source for edit pre-fill.
- **FR-111** Framing chip strip: only the currently-active framing chip is interactive; clicking it deselects (= switch to None, with confirmation).
- **FR-112** Response chip strip: only the currently-active response type is interactive; clicking it deselects (= None, with confirmation). All actor switches / comments / defaults remain editable.
- **FR-113** Poll-option diff: the connector computes `added` / `removed` / `updated` sets from the initial option set vs current, then calls:
  1. `addPollOption` for each new option (before removals so the option count never drops below 2),
  2. `removePollOption` for each removed id,
  3. `updatePollOption` for each text change,
  4. `reorderPollOptions` when order changes (including newly-added ids).
  Failures show a localized notification and leave the dialog open for retry.
- **FR-114** Media-gallery diff: the connector passes `existingVisualIds` + `originalSortOrders` into `useUploadMediaGalleryVisuals` so the existing path handles adds / deletes / reorders.
- **FR-115** Whiteboard framing in edit mode: the "Edit" button opens `CrdWhiteboardDialog` (collaborative). Changes are saved inside the dialog; the main form does not need to track whiteboard content on edit.

### i18n

- **FR-120** All new strings live in `src/crd/i18n/space/space.<lang>.json` under existing / new keys in the `callout`, `forms`, `framing`, `contextMenu`, `contributionSettings`, `responseDefaults`, `references`, and `validation` sections.
- **FR-121** Six languages (en, nl, es, bg, de, fr) updated in the same PR; EN is authoritative, others translated AI-assisted per `src/crd/CLAUDE.md`.

### Accessibility (WCAG 2.1 AA)

- **FR-130** All chip buttons use `aria-pressed` to expose single-select state. The chip strip has `role="radiogroup"` with an `aria-label`.
- **FR-131** Disabled chips (Document) have `aria-disabled="true"` and a tooltip "Coming soon".
- **FR-132** Switches use the CRD `Switch` primitive with `aria-labelledby` / visible `<label>`.
- **FR-133** Dialog `aria-describedby` points to the description-slot region (sr-only when empty).
- **FR-134** Validation errors are announced via `aria-live="polite"` region near the field.
- **FR-135** Icon-only buttons (delete row, gear settings, 3-dots menu trigger) have `aria-label`.

## Out of scope (explicitly deferred)

- `Document` framing and contribution type — chip is a visual-only placeholder.
- `ShareDialog` and `ImportTemplatesDialog` CRD ports — remain MUI portals.
- Template management CRUD inside space settings — covered by the existing templates spec.
- Drag-and-drop reordering of poll options — the CRD `PollOptionsEditor` already has it via `@dnd-kit`; no changes.
- Search + keyboard navigation inside the MUI `ImportTemplatesDialog` — left as-is.
- Real-time whiteboard framing collaborative edit opened from inside the callout form on **create** (single-user only on create, per product decision).

## Assumptions

- `yup` is already a project dependency (confirmed — used in `ApplicationFormDialog`, `useCreateSubspace`, and broadly elsewhere).
- The existing `useUpdateCalloutContentMutation`, `useDeleteCalloutMutation`, `useUpdateCalloutVisibilityMutation`, `useUpdateCalloutsSortOrderMutation`, `useCalloutContentQuery`, `useCalloutsSet`, and poll-option mutations (`addPollOption` etc.) cover all the edit paths without schema changes.
- The MUI `CreateTemplateDialog`'s API is stable enough to wrap in a CRD shell; if it proves to pull too much Formik / MUI transitive baggage we hide Save-as-Template instead of porting poorly.
- Prototype PR #9574 is the source of truth for visual treatment.

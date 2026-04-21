# CRD Whiteboard Migration

## Problem

The whiteboard system renders entirely in MUI. Within CRD-enabled space pages, clicking "Open Whiteboard" or navigating to `/public/whiteboard/:id` opens a full MUI experience -- creating a jarring design-language switch from the CRD layout.

The 042 spec originally scoped the whiteboard collaboration system as out-of-scope (research R2: inline previews to CRD, dialog stays MUI portal). While the inline components (`CalloutWhiteboardPreview`, `ContributionWhiteboardCard`) are already CRD, the full whiteboard experience remains MUI:

- **WhiteboardDialog** (~400 lines) -- the **multi-user** editor shell wrapping `CollaborativeExcalidrawWrapper` (MUI `DialogWithGrid`, `DialogHeader`, `DialogContent`). Used when opening a whiteboard from a callout contribution or from a callout framing preview.
- **SingleUserWhiteboardDialog** (~333 lines) -- the **single-user** editor shell wrapping `ExcalidrawWrapper` (no real-time collaboration). Used for **template editing** and **callout creation** where the whiteboard content is local-only until the user clicks Save. Has explicit Save/Delete footer buttons and unsaved changes detection on close.
- **WhiteboardDialogFooter** (~245 lines) -- collaborative footer: delete, readonly reason, guest warning, restart (MUI `Actions`, `Button`, `Caption`, deep domain hooks)
- **WhiteboardDisplayName** (~100 lines) -- inline-editable title (MUI `TextField`, `Button`, `IconButton`)
- **WhiteboardPreviewSettingsDialog** (~210 lines) -- preview image mode selector: Auto (full canvas), Custom (user-defined crop), Fixed (locked crop). 3 mode buttons with loading states.
- **WhiteboardPreviewCustomSelectionDialog** (~270 lines) -- image crop/zoom/pan dialog using `react-image-crop`. Renders a canvas-exported PNG and lets the user define a crop region with aspect-ratio constraint.
- **PublicWhiteboardPage** (~220 lines) -- the `/public/whiteboard/:id` standalone route
- **JoinWhiteboardDialog** (~165 lines) -- guest name prompt (MUI `Dialog`, `Button`, Formik)
- **PublicWhiteboardLayout** (~30 lines) -- full-viewport wrapper (MUI `Box`)
- **PublicWhiteboardError** (~70 lines) -- error state (MUI `Box`, `Typography`, `Button`)

## Solution

Migrate the whiteboard **user-facing chrome** to CRD while preserving the Excalidraw collaboration infrastructure unchanged. The Excalidraw canvas and its collaboration stack (WebSocket real-time sync, file management, preview generation) are treated as an opaque third-party system.

### Architecture: Slot Pattern

The CRD editor shell wraps the Excalidraw system via a **slot pattern** -- the integration layer renders the appropriate Excalidraw wrapper and passes it as `children` to the CRD shell:

```
CRD WhiteboardEditorShell (full-screen dialog)
  |-- Header: WhiteboardDisplayName + headerActions slot (share, fullscreen, save indicator)
  |-- Content: children slot --> Excalidraw canvas (rendered by integration layer)
  +-- Footer slot: ReactNode (integration layer decides which footer variant)
```

### Two Modes: Multi-User vs Single-User

Whiteboards operate in two distinct modes depending on context:

| Mode | Excalidraw Wrapper | Footer | Contexts |
|---|---|---|---|
| **Multi-user** (collaborative) | `CollaborativeExcalidrawWrapper` | Readonly reason, restart, guest warning | Viewing/editing a whiteboard from a callout contribution or framing. Public guest whiteboard. |
| **Single-user** (local-only) | `ExcalidrawWrapper` | Save + Delete buttons | Editing a whiteboard template. Creating/editing a callout with whiteboard framing. |

Both modes use the **same `WhiteboardEditorShell`**. The difference is in the `children` (which Excalidraw wrapper) and the `footer` slot (which buttons/status to show). The integration layer decides.

### Whiteboard Contexts in Alkemio

Whiteboards appear in two callout contexts, plus the public page:

1. **Callout Framing** -- A whiteboard is the primary content of a callout (the "cover"). Inline preview shows `CalloutWhiteboardPreview` (already CRD). Clicking "Open Whiteboard" opens the multi-user editor dialog.
2. **Callout Contribution** -- Users contribute whiteboards to a callout. Cards show `ContributionWhiteboardCard` (already CRD). Clicking a card opens the multi-user editor dialog.
3. **Callout Creation/Editing** -- When creating a callout with whiteboard framing, the whiteboard editor opens in single-user mode. Content is saved locally until the callout is submitted.
4. **Template Editing** -- Whiteboard templates are edited in single-user mode.
5. **Public Guest Access** -- `/public/whiteboard/:id` -- multi-user mode with guest session management.

### Excalidraw Isolation Rule

**Hard rule**: Nothing in `src/crd/` may import from `@alkemio/excalidraw` or reference Excalidraw types. The CRD shell receives the canvas as an opaque `children: ReactNode` slot. It does not know whether it's rendering Excalidraw, a static image, or an empty div.

**Demo app** (`src/crd/app/`): The standalone preview app must NOT depend on Excalidraw. Instead, it renders a **static screenshot image** (PNG) inside the WhiteboardEditorShell to demonstrate the layout. This keeps the demo app lightweight and Excalidraw-free.

### Footer Domain Dependency Resolution

The current MUI footer (`WhiteboardDialogFooter`) calls `useSpace()`, `useSubSpace()`, `useUrlResolver()`, `useAuthenticationContext()`, and `useDirectMessageDialog()` internally. These are domain-level hooks forbidden in `src/crd/`.

In the CRD version, the footer is purely presentational -- it receives everything as props:
- `readonlyReason?: { message: string; links?: ReactNode }` -- pre-rendered by integration layer
- `canDelete`, `onDelete`, `deleteDisabled` -- simple props
- `canRestart`, `onRestart` -- simple props
- `guestWarningVisible`, `guestAccessBadgeVisible` -- booleans

The integration layer (`CrdWhiteboardDialog`) resolves space context, membership, authentication, and readonly reasons, then maps them to these flat props.

### MUI Components Rendered Inside CRD Shell (via slots)

The editor shell accepts `headerActions` and `titleExtra` as `ReactNode` slots. The integration layer renders existing MUI components into these slots:

| MUI Component | Slot | Notes |
|---|---|---|
| `ShareButton` | `headerActions` | Opens MUI ShareDialog portal |
| `FullscreenButton` | `headerActions` | Toggles fullscreen |
| `SaveRequestIndicatorIcon` | `headerActions` | Save status dot |
| `WhiteboardPreviewSettingsButton` | `headerActions` | Opens MUI preview settings dialog |
| `WhiteboardDialogTemplatesLibrary` | `titleExtra` | Opens MUI template import dialog |

These stay MUI until their respective domains are migrated. They render as portals or small self-contained icons, so no visual conflict.

## Scope

### In Scope

- CRD whiteboard editor shell (full-screen dialog: header, canvas slot, footer slot) -- serves both multi-user and single-user modes
- CRD collaborative footer (delete, readonly reason, guest warning, restart, guest access badge)
- CRD save footer (Save + Delete buttons for single-user mode)
- CRD inline-editable display name component
- CRD preview settings dialog (Auto/Custom/Fixed mode selector)
- CRD preview crop dialog (image crop/zoom/pan with `react-image-crop`)
- CRD public whiteboard page (`/public/whiteboard/:id` route)
- CRD guest join dialog (name input + sign-in button)
- CRD error state for public whiteboard page
- CRD "Add Response" card for creating a new whiteboard contribution from inside the callout detail dialog (dashed-border card with pen icon, matches prototype `PostDetailDialog`)
- Integration layer for multi-user mode (`CrdWhiteboardDialog` replacing `WhiteboardDialog`)
- Integration layer for single-user mode (`CrdSingleUserWhiteboardDialog` replacing `SingleUserWhiteboardDialog`)
- Integration layer for public page (`CrdPublicWhiteboardPage`)
- Integration layer for whiteboard contribution creation (`WhiteboardContributionAddConnector` replacing `CreateContributionButtonWhiteboard`)
- Route toggle for `/public/whiteboard/:id` (CRD vs MUI based on feature flag)
- i18n namespace `crd-whiteboard` for whiteboard-specific CRD translations
- Demo app preview page with static screenshot (no Excalidraw dependency)

### Out of Scope (stays unchanged)

- **Excalidraw engine**: `ExcalidrawWrapper`, `CollaborativeExcalidrawWrapper` -- rendered by integration layer, passed to CRD shell as opaque `children`
- **Collaboration stack**: `Collab` class (scene sync, mode management), `Portal` class (WebSocket + Y.js)
- **File management**: `useWhiteboardFilesManager`, `FileUploader`, `FileDownloader`, `WhiteboardFileCache`
- **Preview image generation logic**: `useGenerateWhiteboardVisuals`, `getWhiteboardPreviewImage`, canvas-to-PNG export -- stays in integration layer, passes Blob to CRD crop dialog
- **Template library**: `WhiteboardDialogTemplatesLibrary` -- complex MUI template import, rendered in title slot
- **Share dialog system**: `ShareButton`, `ShareDialog`, `WhiteboardGuestAccessControls`, `WhiteboardGuestAccessSection` -- separate migration scope
- **Collaboration settings**: `CollaborationSettings` -- separate concern
- **Guest session infrastructure**: `GuestSessionContext`, `useGuestSession`, `useGuestWhiteboardAccess`, `useGuestAnalytics`, utilities -- non-visual, reused as-is
- **GraphQL layer**: queries, mutations, fragments, `WhiteboardProvider`, `useWhiteboardActions`

## Existing CRD Components (already done)

| Component | Location | Status |
|---|---|---|
| `CalloutWhiteboardPreview` | `src/crd/components/callout/CalloutWhiteboardPreview.tsx` | Complete |
| `ContributionWhiteboardCard` | `src/crd/components/contribution/ContributionWhiteboardCard.tsx` | Complete |
| `ConfirmationDialog` | `src/crd/components/dialogs/ConfirmationDialog.tsx` | Complete (reusable) |

## Component Mapping

| New CRD Component | Old MUI Component | Prototype Reference |
|---|---|---|
| **Editor Shell** | | |
| `crd/components/whiteboard/WhiteboardEditorShell` | `WhiteboardDialog` + `SingleUserWhiteboardDialog` (chrome) | -- |
| `crd/components/whiteboard/WhiteboardDisplayName` | `WhiteboardDialog/WhiteboardDisplayName` | -- |
| `crd/components/whiteboard/WhiteboardCollabFooter` | `WhiteboardDialog/WhiteboardDialogFooter` | -- |
| `crd/components/whiteboard/WhiteboardSaveFooter` | `SingleUserWhiteboardDialog` footer (Save+Delete) | -- |
| **Preview Settings** | | |
| `crd/components/whiteboard/PreviewSettingsDialog` | `WhiteboardPreviewSettings/WhiteboardPreviewSettingsDialog` | -- |
| `crd/components/whiteboard/PreviewCropDialog` | `WhiteboardPreviewSettings/WhiteboardPreviewCustomSelectionDialog` | -- |
| **Public Page** | | |
| `crd/components/whiteboard/JoinWhiteboardDialog` | `main/public/whiteboard/JoinWhiteboardDialog` | -- |
| `crd/components/whiteboard/WhiteboardErrorState` | `main/public/whiteboard/PublicWhiteboardError` | -- |
| **Contribution creation** | | |
| `crd/components/contribution/ContributionAddCard` | `calloutContributions/CreateContributionButton` (the card variant in prototype) | `PostDetailDialog` "Add Response" card (dashed border + icon + label) |
| **Integration Layer** | | |
| `main/crdPages/whiteboard/CrdWhiteboardDialog` | `WhiteboardDialog` (multi-user, full wiring) | -- |
| `main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog` | `SingleUserWhiteboardDialog` (single-user, full wiring) | -- |
| `main/crdPages/whiteboard/CrdWhiteboardView` | `WhiteboardsManagement/WhiteboardView` | -- |
| `main/crdPages/whiteboard/CrdPublicWhiteboardPage` | `main/public/whiteboard/PublicWhiteboardPage` | -- |
| `main/crdPages/space/callout/WhiteboardContributionAddConnector` | `calloutContributions/whiteboard/CreateContributionButtonWhiteboard` | -- |

## User Stories

### US-WB1: Public Whiteboard Page in CRD (Priority: P1)

A guest user navigates to `/public/whiteboard/:whiteboardId`. The page renders with CRD styling: the join dialog has CRD typography, buttons, and input styling. After entering a name, the whiteboard editor opens in a CRD-styled full-screen shell. Error states use CRD components.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and a guest navigates to a valid public whiteboard URL, **When** the page loads, **Then** the join dialog renders with CRD styling (no MUI visual elements)
2. **Given** a guest enters a valid name and clicks "Join as Guest", **When** the whiteboard loads, **Then** the editor shell renders with CRD header/footer chrome wrapping the Excalidraw canvas
3. **Given** a guest navigates to an invalid whiteboard URL, **When** the page loads, **Then** the error state renders with CRD styling (lucide-react icon, Tailwind classes)
4. **Given** CRD is disabled, **When** a guest navigates to the public whiteboard URL, **Then** the existing MUI page renders (toggle works)

### US-WB2: Whiteboard Editor Shell in CRD (Priority: P2)

An authenticated user opens a whiteboard from a callout in a CRD space page. The whiteboard editor shell (dialog chrome) renders with CRD styling: the header with title, share/fullscreen/save actions; the footer with delete, readonly reason, and guest warning. The Excalidraw canvas renders unchanged inside the shell.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and a user clicks "Open Whiteboard" on a callout, **When** the dialog opens, **Then** the shell (header, footer) is CRD-styled while the Excalidraw canvas renders normally
2. **Given** the user has edit privileges, **When** the display name edit button is clicked, **Then** an inline CRD input replaces the title with save/cancel buttons
3. **Given** the user is in read-only mode (inactivity timeout), **When** the footer renders, **Then** a readonly reason message appears with a "Restart" button
4. **Given** guest contributions are enabled on the whiteboard, **When** the footer renders, **Then** a guest contributions warning badge is visible
5. **Given** the user clicks delete, **When** the confirmation dialog appears, **Then** it uses the CRD `ConfirmationDialog` component

### US-WB3: Single-User Whiteboard in CRD (Priority: P2)

A space admin creates a new callout with whiteboard framing. The whiteboard editor opens in **single-user mode** -- no real-time collaboration, explicit Save button, unsaved changes warning on close. The editor shell is CRD. The same shell is used when editing whiteboard templates.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and a user creates a callout with whiteboard framing, **When** the whiteboard editor opens, **Then** it renders in CRD with a Save + Delete footer (not the collaborative footer)
2. **Given** the user makes changes and clicks Save, **When** the save completes, **Then** the content is persisted and the button shows loading state
3. **Given** the user has unsaved changes and clicks close, **When** the close handler fires, **Then** a browser confirm dialog warns about unsaved changes (same behavior as MUI)
4. **Given** a user edits a whiteboard template, **When** the editor opens, **Then** it uses the same single-user CRD shell with Save/Delete footer

### US-WB4: Preview Settings in CRD (Priority: P2)

A space admin opens the preview settings for a whiteboard to control how the thumbnail appears in callout cards. The preview mode selector and crop dialog render with CRD styling.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and a user clicks the preview settings button in the editor header, **When** the dialog opens, **Then** it renders with CRD styling (3 mode buttons: Auto, Custom, Fixed)
2. **Given** the user selects Custom or Fixed mode, **When** the crop dialog opens, **Then** the canvas preview image is shown with an interactive crop region, zoom slider, and reset/cancel/confirm buttons
3. **Given** the user confirms a crop selection, **When** the settings save, **Then** the preview thumbnail updates to reflect the new crop

### US-WB5: Add Whiteboard Contribution from Callout Detail (Priority: P2)

A community member with `Contribute` + `CreateWhiteboard` privilege opens a callout that accepts whiteboard contributions. Inside the contributions grid they see an "Add Response" card — a dashed-border tile with a pen icon — rendered after the existing contribution cards. Clicking it opens a lightweight CRD dialog with a single "Whiteboard title" input and Create/Cancel buttons. Creating the whiteboard refreshes the grid to include the new card.

**Acceptance Scenarios**:

1. **Given** CRD is enabled, the user has the required privileges, and `settings.contribution.allowedTypes` contains `Whiteboard`, **When** the callout detail dialog opens, **Then** the contributions grid shows an "Add Response" card at the end of the list (dashed border, pen icon, "Add Response" label).
2. **Given** the user does NOT have `Contribute` + `CreateWhiteboard` privileges, **When** the grid renders, **Then** the "Add Response" card is not shown.
3. **Given** the allowed contribution type is NOT Whiteboard (e.g., Post or Memo), **When** the grid renders, **Then** the "Add Response" card is not shown (this iteration ships whiteboard only; other types follow the same pattern in later iterations).
4. **Given** the user clicks the "Add Response" card, **When** the dialog opens, **Then** the whiteboard title input is pre-filled with the localized default name (`callout.defaultWhiteboardName`), focused, and submit is disabled while the name is empty.
5. **Given** the user confirms, **When** the mutation completes, **Then** the `CalloutContributions` query refetches, the new whiteboard card appears in the grid, and the create dialog closes.
6. **Given** the mutation fails, **When** the error returns, **Then** the dialog stays open, the loading state clears, and the global Apollo error handler surfaces the failure.

## Functional Requirements

### Public Whiteboard Page (US-WB1)

- **FR-WB-001**: Join dialog must render with CRD Dialog primitive, CRD Button, CRD Input -- zero MUI imports
- **FR-WB-002**: Join dialog must validate guest name (non-empty, trimmed) with inline error display
- **FR-WB-003**: "Sign In to Alkemio" button must navigate to login URL preserving the return path
- **FR-WB-004**: Error state must display error icon (lucide-react), title, message, and optional retry button
- **FR-WB-005**: Error state must distinguish 404/403 (not found) from 500 (server error) error types
- **FR-WB-006**: Public page layout must be full-viewport (100vw x 100vh, overflow hidden)
- **FR-WB-007**: Route toggle must gate CRD vs MUI version based on `useCrdEnabled()` in `TopLevelRoutes.tsx`
- **FR-WB-008**: Guest session flow (name storage, derived name, analytics) must work identically to MUI version
- **FR-WB-009**: Authenticated users must skip the join dialog and see the whiteboard directly (same behavior as MUI)
- **FR-WB-010**: Disabled guest contributions must show the 404 error state (same behavior as MUI)

### Whiteboard Editor Shell (US-WB2)

- **FR-WB-011**: Editor shell must use CRD Dialog primitive in full-screen mode (or a full-viewport overlay)
- **FR-WB-012**: Header must render: display name (left), headerActions slot (right), titleExtra slot (after title)
- **FR-WB-013**: Display name component must support three modes: read-only (plain text), view (text + edit button), edit (input + save/cancel)
- **FR-WB-014**: Display name save must call `onSave` callback and show loading state on the save button
- **FR-WB-015**: Footer must render: left section (delete button + status message + restart button), right section (guest warning + guest access badge)
- **FR-WB-016**: Delete button must use lucide-react `Trash2` icon, `destructive` variant, disabled when user cannot edit
- **FR-WB-017**: Readonly reason message must be plain text/links received as props (no domain logic in CRD)
- **FR-WB-018**: Guest contributions warning must show a bordered badge with globe icon and warning text
- **FR-WB-019**: Guest access badge slot must accept ReactNode for the existing `GuestVisibilityBadge`
- **FR-WB-020**: Shell must pass `onClose` through to the dialog, triggering save-before-close in the integration layer
- **FR-WB-021**: Content area must render `children` (the Excalidraw canvas) as a flex-grow region filling available space

### Accessibility

- **FR-WB-022**: Join dialog must have `aria-labelledby` pointing to the title element
- **FR-WB-023**: Guest name input must have persistent `aria-label` (not just placeholder)
- **FR-WB-024**: Submit button must show loading state with `aria-busy={true}` and `disabled` while submitting
- **FR-WB-025**: Editor shell dialog must have `aria-label` or `aria-labelledby`
- **FR-WB-026**: Delete button must have `aria-label` with translated text
- **FR-WB-027**: Display name edit/save/cancel buttons must have `aria-label`
- **FR-WB-028**: Focus must be trapped within the editor shell dialog when open
- **FR-WB-029**: Escape key must trigger the close handler (save-before-close flow)

### Single-User Mode (US-WB3)

- **FR-WB-030**: Save footer must render: Delete button (left, destructive variant), Save button (right, primary variant with loading spinner)
- **FR-WB-031**: Save button must be disabled when form validation fails
- **FR-WB-032**: Close with unsaved changes must trigger `window.confirm()` with warning message (same behavior as current MUI). `window.confirm()` is intentionally preserved for simplicity — it's browser-native, works reliably, and matches the existing UX. Replacing with a CRD ConfirmationDialog is a future enhancement (would require async close handling).
- **FR-WB-033**: Single-user integration layer must use `ExcalidrawWrapper` (not `CollaborativeExcalidrawWrapper`) and serialize content via `serializeAsJSON` on save

### Preview Settings (US-WB4)

- **FR-WB-034**: Preview settings dialog must render 3 mode buttons (Auto, Custom, Fixed) with icons, titles, and descriptions
- **FR-WB-035**: Selected mode must be visually highlighted (e.g., primary border)
- **FR-WB-036**: Clicking Auto must save immediately and close the dialog
- **FR-WB-037**: Clicking Custom or Fixed must open the crop dialog
- **FR-WB-038**: Crop dialog must render: image preview (from canvas export Blob passed as prop), interactive crop region with aspect-ratio constraint, zoom slider (1x-8x), pan via pointer drag
- **FR-WB-039**: Crop dialog must have Reset, Cancel, Confirm buttons
- **FR-WB-040**: The crop region coordinates are passed to the integration layer via `onCropSave` callback -- the CRD component never calls Excalidraw APIs
- **FR-WB-041**: `react-image-crop` is acceptable inside `src/crd/` -- it is a pure UI crop overlay library with no business logic

### Excalidraw Isolation

- **FR-WB-042**: Zero imports from `@alkemio/excalidraw` in any file under `src/crd/` -- enforced by grep verification task
- **FR-WB-043**: The standalone demo app (`src/crd/app/`) must render a static PNG screenshot inside `WhiteboardEditorShell`, never an actual Excalidraw instance
- **FR-WB-044**: CRD components must not reference Excalidraw types (`ExcalidrawImperativeAPI`, `ExportedDataState`, etc.) even transitively

### i18n

- **FR-WB-045**: All user-visible strings in CRD whiteboard components must use `useTranslation('crd-whiteboard')` -- no hardcoded text
- **FR-WB-046**: Translation files must cover all 6 languages (en, nl, es, bg, de, fr)

### Add Whiteboard Contribution (US-WB5)

- **FR-WB-047**: `ContributionAddCard` is a presentational CRD component that renders a dashed-border card with a lucide icon, a label, and a click handler — matches the prototype "Add Response" tile shape. Props: `{ label: string; icon: LucideIcon; onClick?: () => void; disabled?: boolean; className?: string }`. No business logic, no GraphQL, no routing.
- **FR-WB-048**: `WhiteboardContributionAddConnector` lives in `src/main/crdPages/space/callout/`. It owns the dialog state (open/closed, draft name), calls `useCreateWhiteboardOnCalloutMutation`, and refetches `CalloutContributions` after success. Props: `{ calloutId: string; defaultDisplayName?: string; defaultContent?: string; onCreated?: () => void }`.
- **FR-WB-049**: The create dialog is a CRD `Dialog` with a single `Input` for the whiteboard title (aria-labelled, autofocus), a Cancel button, and a Create button. Create is disabled when the trimmed name is empty or while the mutation is in flight; `aria-busy` reflects the loading state.
- **FR-WB-050**: The default whiteboard name is sourced from `callout.contributionDefaults?.defaultDisplayName` when available, otherwise the localized `callout.defaultWhiteboardName` key. Empty whiteboard content uses `EmptyWhiteboardString` from `@/domain/common/whiteboard/EmptyWhiteboard`.
- **FR-WB-051**: `ContributionGridConnector` gains an optional `trailingSlot: ReactNode` prop, appended after the contribution cards inside `ContributionGrid`. The grid's `totalCount` accounts for the trailing slot so the collapse-threshold logic remains accurate.
- **FR-WB-052**: The "Add Response" card is only rendered when `useCalloutCollaborationPermissions({ callout, contributionType })` returns `canCreateContribution === true` AND the callout's allowed contribution type is `Whiteboard`. Other contribution types follow the same pattern in later iterations and must not render this card yet.
- **FR-WB-053**: Translation keys added to the `crd-space` namespace (all 6 languages): `callout.addResponse`, `callout.createWhiteboard`, `callout.defaultWhiteboardName`, `callout.whiteboardNameLabel`, `dialogs.create`.

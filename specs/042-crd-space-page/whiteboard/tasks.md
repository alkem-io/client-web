# Tasks: CRD Whiteboard Migration

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md)

---

## Phase 1: i18n Setup + CRD Presentational Components (Public Page)

**Goal**: CRD components for the public whiteboard page: join dialog, error state. Plus the i18n namespace.

- [X] T1 [P] Create `src/crd/i18n/whiteboard/whiteboard.en.json` with keys:
  - `join.welcome` ("Welcome to"), `join.title` ("Join Whiteboard"), `join.description` ("Enter your name to join..."), `join.placeholder` ("Your name"), `join.guestNameLabel` ("Guest display name"), `join.joinButton` ("Join as Guest"), `join.joiningButton` ("Joining..."), `join.signInButton` ("Sign In to Alkemio")
  - `error.notFound.title` ("Whiteboard Not Found"), `error.notFound.message` ("This whiteboard doesn't exist or is no longer available."), `error.serverError.title` ("Something Went Wrong"), `error.serverError.message` ("We couldn't load this whiteboard. Please try again."), `error.retry` ("Try Again")
  - `editor.editDisplayName` ("Edit title"), `editor.saveDisplayName` ("Save title"), `editor.cancelEdit` ("Cancel editing"), `editor.delete` ("Delete whiteboard"), `editor.restart` ("Restart collaboration"), `editor.guestContributionsWarning` ("Guest contributions are enabled"), `editor.closeWhiteboard` ("Close whiteboard")
  - `footer.guestContributionsWarning` ("Anyone with the link can edit")
  - **File**: new
  - **Acceptance**: JSON is valid, all keys present with English values
  - **Dependencies**: none

- [X] T2 [P] Create translation files for remaining languages: `src/crd/i18n/whiteboard/whiteboard.{bg,de,es,fr,nl}.json` — mirror structure of T1 with AI-assisted translations
  - **Files**: 5 new files
  - **Acceptance**: All 5 files have identical key structure to English version
  - **Dependencies**: T1

- [X] T3 Register `crd-whiteboard` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports` with lazy imports for all 6 languages; add type declaration in `@types/i18next.d.ts`
  - **File**: modified (2 files)
  - **Acceptance**: `useTranslation('crd-whiteboard')` works in CRD components; lazy loading triggers on first use
  - **Dependencies**: T1

- [X] T4 [P] Create `src/crd/components/whiteboard/JoinWhiteboardDialog.tsx`
  - **File**: new
  - **Description**: Guest name prompt dialog using CRD Dialog primitive. Layout: welcome subtitle (text-muted-foreground), large title (text-3xl font-medium text-primary), description text, name input, "Join as Guest" primary button, "Sign In" outline button. Internal `useState` for name value and validation error. Validates on change (non-empty after trim). Submit calls `onSubmit(trimmedName)`. Sign-in calls `onSignIn`. Join button disabled while `submitting || empty || hasError`. Uses `useTranslation('crd-whiteboard')` for all text. `aria-labelledby` on dialog pointing to title. `aria-label` on input. `aria-busy` + `disabled` on submit button while submitting.
  - **Props**: `open: boolean`, `onSubmit: (name: string) => void`, `onSignIn: () => void`, `submitting?: boolean`, `validate?: (name: string) => string | undefined`
  - **Acceptance**: Dialog renders with CRD styling; name validation works; submit/sign-in callbacks fire; loading state disables button; zero MUI imports; all text via `t()`; accessible (aria-labelledby, aria-label on input, aria-busy on button)
  - **Dependencies**: T3

- [X] T5 [P] Create `src/crd/components/whiteboard/WhiteboardErrorState.tsx`
  - **File**: new
  - **Description**: Centered error display. Layout: `flex flex-col items-center justify-center min-h-screen p-6 text-center`. `AlertCircle` icon from lucide-react (64px, `text-destructive`). Title (`text-2xl font-bold`). Message (`text-muted-foreground max-w-[600px]`). Retry button (CRD Button, hidden if `onRetry` not provided).
  - **Props**: `title: string`, `message: string`, `onRetry?: () => void`
  - **Acceptance**: Error renders centered; retry button appears only when handler provided; zero MUI imports; all text via props (caller uses `t()`)
  - **Dependencies**: none

**Checkpoint**: Join dialog and error state render in isolation with CRD styling. i18n namespace works.

---

## Phase 2: Public Whiteboard Page Integration (US-WB1)

**Goal**: Wire CRD components into the public whiteboard route with feature toggle.

- [X] T6 Create `src/main/crdPages/whiteboard/CrdPublicWhiteboardPage.tsx`
  - **File**: new
  - **Description**: Integration component replacing `src/main/public/whiteboard/PublicWhiteboardPage.tsx`. Same logic structure: `GuestSessionProvider` wrapper, inner `CrdPublicWhiteboardPageContent` component. Uses `useGuestSession`, `useGuestWhiteboardAccess`, `useGuestAnalytics`, `useCurrentUserLightQuery` (all reused unchanged). Renders:
    - Loading: `<div class="w-screen h-screen overflow-hidden relative"><Loading /></div>` (reuse existing `Loading` component)
    - Error: `<WhiteboardErrorState>` (CRD) with error type detection (404/403 vs 500)
    - Join: `<JoinWhiteboardDialog>` (CRD) with `onSubmit={handleGuestNameSubmit}`, `onSignIn={handleSignIn}`, `validate={name => { const v = validateGuestName(name); return v.valid ? undefined : v.error; }}`
    - Guest access disabled: `<WhiteboardErrorState>` with 404 message
    - Whiteboard loaded: `<WhiteboardDialog>` (MUI, **temporarily** — replaced in Phase 3) with same props as current `PublicWhiteboardPage`
  - Layout wrapper: `<div className="w-screen h-screen overflow-hidden relative">` (replaces MUI Box)
  - **Must NOT import from `@mui/*`** except for the temporary `WhiteboardDialog` import (documented as Phase 3 replacement target)
  - **Acceptance**: Public whiteboard page works end-to-end: join dialog → whiteboard editor. Guest name persists in sessionStorage (`alkemio_guest_name`). Derived anonymized names work for authenticated users (e.g., "John Doe" → "John D."). Analytics events fire (`trackWhiteboardLoadSuccess`, `trackGuestNameSubmitted`, `trackDerivedNameUsed`). Error states display correctly. Sign-in redirects to login URL with return path preserved.
  - **Dependencies**: T4, T5

- [X] T7 Update `src/main/routing/TopLevelRoutes.tsx` — add CRD toggle for the public whiteboard route:
  - Lazy import: `const CrdPublicWhiteboardPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/whiteboard/CrdPublicWhiteboardPage'))`
  - Route: `{crdEnabled ? <CrdPublicWhiteboardPage /> : <PublicWhiteboardPage />}` (NOT inside CrdLayoutWrapper — immersive full-screen experience)
  - **File**: modified
  - **Acceptance**: CRD toggle ON → CRD public page renders. Toggle OFF → MUI public page renders. Both lazy-loaded.
  - **Dependencies**: T6

**Checkpoint**: `/public/whiteboard/:id` renders with CRD join dialog and error states when toggle is on. Whiteboard editor still uses MUI WhiteboardDialog temporarily. Toggle off returns to full MUI experience.

---

## Phase 3: Whiteboard Editor Shell (US-WB2)

**Goal**: CRD replacement for the WhiteboardDialog chrome. The Excalidraw canvas and all collaboration infrastructure stay unchanged.

- [X] T8 [P] Create `src/crd/components/whiteboard/WhiteboardDisplayName.tsx`
  - **File**: new
  - **Description**: Inline-editable title with three modes:
    - `readOnly`: `<h2 class="text-lg font-semibold truncate">{displayName}</h2>`
    - View (default when not `readOnly` and not `editing`): `<h2>` + `<button>` with `Pencil` icon
    - Edit: `<Input autoFocus>` + `<button>` with `Check` icon (save) + `<button>` with `X` icon (cancel)
  - Internal `useState` for `editValue`. Save button shows spinner when `saving`. Enter submits. Escape cancels. All buttons have `aria-label` via `useTranslation('crd-whiteboard')`.
  - **Props**: `displayName: string`, `readOnly?: boolean`, `editing?: boolean`, `onEdit?: () => void`, `onSave?: (name: string) => void`, `onCancel?: () => void`, `saving?: boolean`
  - **Acceptance**: Three modes render correctly; edit input auto-focuses; Enter saves; Escape cancels; loading state on save; zero MUI imports
  - **Dependencies**: T3

- [X] T9 [P] Create `src/crd/components/whiteboard/WhiteboardCollabFooter.tsx`
  - **File**: new
  - **Description**: Footer bar. Layout: `flex items-center justify-between px-4 py-2 border-t border-border flex-wrap gap-2`.
    - Left: optional delete button (`<Button variant="ghost" size="sm" className="text-destructive">` with `Trash2` icon), optional `readonlyMessage` (ReactNode), optional restart button (`<Button variant="outline" size="sm">`)
    - Right: optional guest warning badge (`border border-destructive rounded px-2 py-1 text-destructive` with `Globe` icon + text), optional `guestAccessBadge` slot (ReactNode)
  - **Props**: see data-model.md `WhiteboardCollabFooterProps`
  - **Acceptance**: All slots render conditionally; delete button disabled when `deleteDisabled`; guest warning styled as bordered badge; zero MUI imports; all visible text via `useTranslation('crd-whiteboard')`
  - **Dependencies**: T3

- [X] T10 [P] Create `src/crd/components/whiteboard/WhiteboardEditorShell.tsx`
  - **File**: new
  - **Description**: Full-screen dialog shell using CRD Dialog primitive. Layout:
    - Dialog overlay: `bg-background/80 backdrop-blur-sm`
    - Dialog content: `flex flex-col` — fills viewport when `fullscreen`, otherwise `max-w-[95vw] max-h-[90vh] rounded-lg`
    - Header: `flex items-center gap-2 px-4 py-2 border-b border-border shrink-0` — `{title}` (flex-1 min-w-0 truncate), `{titleExtra}`, `{headerActions}`, close button (`X` icon)
    - Content: `flex-1 min-h-0 relative` — `{children}` (Excalidraw canvas)
    - Footer area: `shrink-0` — `{footer}` (ReactNode slot — collab or save footer, decided by integration)
  - Must prevent `onOpenAutoFocus` on the Radix Dialog (`e.preventDefault()`) so Excalidraw can manage its own focus.
  - Close button calls `onClose`. Escape also calls `onClose`.
  - `fullscreen` prop: defaults to `true` on small screens (sm breakpoint and below), toggleable via FullscreenButton on larger screens — matching current MUI behavior. The shell itself doesn't detect screen size; the integration layer passes the prop.
  - **Props**: see data-model.md `WhiteboardEditorShellProps`
  - **Acceptance**: Dialog opens full-screen and windowed modes; Excalidraw canvas renders in content area; header shows title + actions; footer renders; close works via button and Escape; focus trapping works (Radix Dialog default); verify no conflict with Excalidraw internal focus by testing canvas click after dialog open; zero MUI imports
  - **Dependencies**: T3

- [X] T11 Create `src/main/crdPages/whiteboard/whiteboardFooterMapper.ts`
  - **File**: new
  - **Description**: Pure mapper function `mapWhiteboardFooterProps(params) => Partial<WhiteboardFooterProps>`. Resolves:
    - `canDelete`: from authorization privileges + `preventWhiteboardDeletion` flag
    - `deleteDisabled`: `!canEdit || updating`
    - `canRestart`: `readonlyReason === 'readonly' && (!modeReason || modeReason === INACTIVITY)`
    - `guestWarningVisible`: `guestContributionsAllowed === true`
  - Does NOT resolve `readonlyMessage` (that needs `<Trans>` with React components, done in connector)
  - **Acceptance**: Pure function, no React imports needed, maps domain state to flat props correctly
  - **Dependencies**: none

- [X] T12 Create `src/main/crdPages/whiteboard/CrdWhiteboardDialog.tsx`
  - **File**: new
  - **Description**: Integration component replacing MUI `WhiteboardDialog`. Same interface (`WhiteboardDialogProps` shape). Renders:
    1. `CollaborativeExcalidrawWrapper` with same entities/actions/options (unchanged)
    2. Uses the render prop `{ children, mode, modeReason, collaborating, connecting, restartCollaboration, isReadOnly }` from CollaborativeExcalidrawWrapper
    3. Wraps `children` inside `<WhiteboardEditorShell>`:
       - `title`: `<WhiteboardDisplayName>` with display name and editing state from Formik
       - `titleExtra`: `<WhiteboardDialogTemplatesLibrary>` (MUI, existing)
       - `headerActions`: composed from `options.headerActions(collabState)` (existing MUI components in slots)
       - `children`: Excalidraw canvas from render prop
       - `footer`: `<WhiteboardFooter>` with props from `whiteboardFooterMapper` + pre-rendered `readonlyMessage`
    4. Manages Formik context for display name (same as existing)
    5. Wires `useWhiteboardFilesManager`, `useGenerateWhiteboardVisuals`, `useUpdateWhiteboardPreviewSettings` (reused)
    6. Renders CRD `ConfirmationDialog` for delete (replaces MUI version)
    7. Renders `WhiteboardPreviewSettingsDialog` (MUI initially — replaced with CRD version in T14 after Phase 5 delivers it)
  - The `readonlyMessage` is built with `<Trans>` + `RouterLink` + click handlers (same logic as current footer, but in the integration layer instead of the CRD component)
  - **Acceptance**: Whiteboard opens and collaborates identically to MUI version. CRD shell renders around Excalidraw. All actions work: save on close, delete, display name edit, template import, share, fullscreen, preview settings. Real-time collaboration unaffected.
  - **Dependencies**: T10, T11

- [X] T13 Create `src/main/crdPages/whiteboard/CrdWhiteboardView.tsx`
  - **File**: new
  - **Description**: Integration component replacing MUI `WhiteboardView`. Same interface (`WhiteboardViewProps` shape). Maps authorization to `CrdWhiteboardDialog` props:
    - Calls `useWhiteboardViewState` (reused, unchanged) for privileges, guest access, actions
    - Computes `headerActions` with MUI components in slots: `ShareButton` (with guest access controls as children), `FullscreenButton`, `SaveRequestIndicatorIcon`, `WhiteboardPreviewSettingsButton`
    - Renders `<CrdWhiteboardDialog>` with mapped props
  - **Acceptance**: Whiteboard opens from callout contribution with correct privileges. Share, fullscreen, save indicator, preview settings all work.
  - **Dependencies**: T12

**Checkpoint**: Opening a whiteboard from a CRD space page shows a CRD-styled editor shell. Excalidraw canvas works normally. All header actions and footer states render correctly. Real-time collaboration works. Delete, display name edit, template import all functional.

---

## Phase 4: Single-User Mode (US-WB3)

**Goal**: CRD support for single-user whiteboards (template editing, callout creation with whiteboard framing).

- [X] T15 [P] Create `src/crd/components/whiteboard/WhiteboardSaveFooter.tsx`
  - **File**: new
  - **Description**: Single-user footer bar. Layout: `flex items-center justify-between px-4 py-2 border-t border-border`. Left: Delete button (`<Button variant="ghost" size="sm" className="text-destructive">` with `Trash2` icon, hidden if `onDelete` not provided). Right: Save button (`<Button variant="default">` with `Save` icon from lucide-react, `saving` prop shows spinner, `saveDisabled` prop disables). Uses `useTranslation('crd-whiteboard')` for button labels.
  - **Props**: `onDelete?: () => void`, `onSave: () => void`, `saving?: boolean`, `saveDisabled?: boolean`
  - **Acceptance**: Delete appears conditionally; Save shows loading state; zero MUI imports; all text via `t()`
  - **Dependencies**: T3

- [X] T16 Create `src/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog.tsx`
  - **File**: new
  - **Description**: Integration component replacing MUI `SingleUserWhiteboardDialog`. Same interface. Renders:
    1. `ExcalidrawWrapper` (NOT Collaborative) with whiteboard content + file manager
    2. Wraps canvas inside `<WhiteboardEditorShell>` with `<WhiteboardSaveFooter>` as footer
    3. Title: `<WhiteboardDisplayName>` (from CRD)
    4. `titleExtra`: `<WhiteboardDialogTemplatesLibrary>` (MUI, existing)
    5. `headerActions`: passed from caller (existing pattern)
    6. Manages Formik for display name + preview settings
    7. Save handler: calls `serializeAsJSON` (lazy-imported from `@alkemio/excalidraw`), converts local files to remote via filesManager, generates preview images, calls `onUpdate`
    8. Close handler: detects unsaved changes via `isWhiteboardContentEqual`, shows `window.confirm` if dirty
    9. Renders `PreviewSettingsDialog` (CRD, from Phase 5) if `previewSettingsDialogOpen`
  - **Acceptance**: Single-user whiteboard works: open, edit, save, close with unsaved warning. Template import works. Preview settings accessible. Zero MUI in CRD components (MUI only in integration slots).
  - **Dependencies**: T10, T15

**Checkpoint**: Creating a callout with whiteboard framing opens a CRD-styled single-user editor. Template editing uses the same shell. Save/Delete/Close all work identically to MUI version.

---

## Phase 5: Preview Settings (US-WB4)

**Goal**: CRD preview mode selector and crop dialog.

- [X] T17 [P] Create `src/crd/components/whiteboard/PreviewSettingsDialog.tsx`
  - **File**: new
  - **Description**: Preview mode selector dialog. CRD Dialog primitive. Renders 3 mode buttons as bordered cards: each with lucide-react icon (`Wand2`/`Crop`/`Lock`), title, description. Selected mode has `border-primary`. Loading spinner replaces icon when saving. Close button in header. Uses `useTranslation('crd-whiteboard')` for all text.
  - **Props**: `open`, `onClose`, `selectedMode: 'auto' | 'custom' | 'fixed'`, `onSelectAuto`, `onSelectCustom`, `onSelectFixed`, `loadingAuto?`, `loadingCrop?`
  - **Acceptance**: 3 modes render with correct icons; selected state highlighted; loading states work; zero MUI imports
  - **Dependencies**: T3

- [X] T18 [P] Create `src/crd/components/whiteboard/PreviewCropDialog.tsx`
  - **File**: new
  - **Description**: Image crop/zoom/pan dialog. CRD Dialog primitive. Content area: `react-image-crop` (`ReactCrop`) component wrapping an `<img>` rendered from a `Blob` prop (via `URL.createObjectURL`). Zoom: CRD Slider primitive (or `<input type="range">`) with 1x-8x range. Pan: pointer events on image container (pointerdown/move/up for drag). Buttons: Reset (`RotateCcw` icon), Cancel, Confirm (primary). Aspect ratio constraint from props. Internal state for crop region, zoom scale, pan offset.
  - **Props**: `open`, `onClose`, `title?`, `previewImage?: Blob`, `initialCrop?`, `aspectRatio: number`, `onCropSave: (crop) => void`
  - **Acceptance**: Image renders from Blob; crop overlay enforces aspect ratio; zoom and pan work; Reset restores default crop; Confirm passes coordinates to callback; zero MUI imports; no Excalidraw imports
  - **Dependencies**: T3

- [X] T19 Add i18n keys to `src/crd/i18n/whiteboard/whiteboard.en.json` under `preview.*`: `settings.title`, `settings.subtitle`, `modes.auto.title`, `modes.auto.description`, `modes.custom.title`, `modes.custom.description`, `modes.fixed.title`, `modes.fixed.description`, `crop.previewArea`, `crop.reset`, `crop.cancel`, `crop.confirm`; mirror to `whiteboard.{bg,de,es,fr,nl}.json`
  - **Files**: modified (6 files)
  - **Acceptance**: All preview-related i18n keys present in all 6 languages
  - **Dependencies**: T1

- [X] T14 Update `src/main/crdPages/whiteboard/CrdWhiteboardDialog.tsx` — replace the MUI `WhiteboardPreviewSettingsDialog` import with CRD `PreviewSettingsDialog` + `PreviewCropDialog`. Wire: `onSelectAuto` calls `updateWhiteboardPreviewSettings({ mode: Auto })`, `onSelectCustom`/`onSelectFixed` opens the crop dialog. Crop dialog receives preview image Blob from `getWhiteboardPreviewImage(excalidrawAPI)` (integration layer call), passes crop coordinates back via `onCropSave`.
  - **File**: modified
  - **Acceptance**: Preview settings in the multi-user editor use CRD dialogs. Auto/Custom/Fixed modes work. Crop dialog shows canvas export. Zero MUI preview settings imports remaining.
  - **Dependencies**: T12, T17, T18

**Checkpoint**: Preview settings dialog opens from editor header. Mode selection and crop dialog work with CRD styling. Crop coordinates saved correctly. Both multi-user (T14) and single-user (T16) dialogs use CRD preview settings.

---

## Phase 6: Full Public Page CRD + Demo App

**Goal**: Complete the public page migration and add demo app preview.

- [X] T20 Update `src/main/crdPages/whiteboard/CrdPublicWhiteboardPage.tsx` — replace the temporary MUI `WhiteboardDialog` import with `CrdWhiteboardDialog`. Map the same props. Remove the MUI import comment.
  - **File**: modified
  - **Acceptance**: Public whiteboard page is fully CRD end-to-end (join dialog, error state, editor shell). Zero MUI imports in the file.
  - **Dependencies**: T12

- [X] T21 [P] Create `src/crd/app/pages/WhiteboardPage.tsx` — demo page rendering `WhiteboardEditorShell` with:
  - A static PNG screenshot as `children`. Export a real whiteboard canvas screenshot and save as `src/crd/app/data/whiteboard-screenshot.png`. Render as `<img src={screenshotUrl} className="w-full h-full object-contain" alt="Whiteboard preview" />`.
  - `WhiteboardDisplayName` in read-only mode with mock title "Design Workshop"
  - Mock header action buttons (placeholder icons using lucide-react)
  - `WhiteboardCollabFooter` with sample props (readonly message as plain text, guest warning visible)
  - Also show `WhiteboardSaveFooter` as a second example below
  - **No Excalidraw dependency** — only a static image
  - **File**: new (+ `src/crd/app/data/whiteboard-screenshot.png`)
  - **Acceptance**: Demo page renders at `/whiteboard` in `pnpm crd:dev`. Shows realistic whiteboard editor layout with screenshot. No `@alkemio/excalidraw` in the demo app bundle.
  - **Dependencies**: T10, T15

- [X] T22 Update `src/crd/app/CrdApp.tsx` — add route for `WhiteboardPage`
  - **File**: modified
  - **Dependencies**: T21

**Checkpoint**: `/public/whiteboard/:id` is fully CRD. Demo app shows whiteboard editor layout at `localhost:5200/whiteboard`.

---

## Phase 7a: Add Whiteboard Contribution (US-WB5)

**Goal**: Community members can create a new whiteboard contribution from the callout detail dialog. The prototype's "Add Response" dashed-border card is rendered at the end of the contributions grid; clicking it opens a CRD dialog with a single title input.

- [X] TP7a-1 [P] Add translation keys to `src/crd/i18n/space/space.{en,es,nl,bg,de,fr}.json`
  - `callout.addResponse` ("Add Response" / localized)
  - `callout.createWhiteboard` ("Create new whiteboard" / localized)
  - `callout.defaultWhiteboardName` ("New Whiteboard" / localized)
  - `callout.whiteboardNameLabel` ("Whiteboard title" / localized)
  - `dialogs.create` ("Create" / localized)
  - **Acceptance**: All 6 files have identical key structure; JSON valid
  - **Dependencies**: none

- [X] TP7a-2 [P] Create `src/crd/components/contribution/ContributionAddCard.tsx`
  - **File**: new
  - **Description**: Presentational dashed-border card matching prototype "Add Response" tile. `<button type="button">` with `border-2 border-dashed`, rounded-xl, `min-h-[180px]`, centered icon-in-circle + label. Hover: `border-primary/50 bg-muted/5 text-primary`. Focus ring. Disabled state with opacity + non-interactive hover.
  - **Props**: `{ label: string; icon: LucideIcon; onClick?: () => void; disabled?: boolean; className?: string }`
  - **Acceptance**: Zero forbidden imports (no MUI, no domain, no routing); `lucide-react` icon prop; `cn()` for classes; keyboard accessible
  - **Dependencies**: none

- [X] TP7a-3 Create `src/main/crdPages/space/callout/WhiteboardContributionAddConnector.tsx`
  - **File**: new
  - **Description**: Integration connector. Renders `ContributionAddCard` with `PenTool` icon + `t('callout.addResponse')`. On click, opens a CRD `Dialog` containing a labelled `Input` for the whiteboard title (autofocus, pre-filled with default name) and Cancel/Create buttons. Calls `useCreateWhiteboardOnCalloutMutation` with `refetchQueries: ['CalloutContributions'], awaitRefetchQueries: true`. Uses `useLoadingState` for the create action — disables Create button and sets `aria-busy` during mutation. Empty content is `EmptyWhiteboardString` from `@/domain/common/whiteboard/EmptyWhiteboard`.
  - **Props**: `{ calloutId: string; defaultDisplayName?: string; defaultContent?: string; onCreated?: () => void }`
  - **Acceptance**: Clicking the card opens the dialog; submitting with empty name is blocked; successful create refetches + closes; failed create leaves dialog open with loading cleared; global Apollo error handler surfaces failures
  - **Dependencies**: TP7a-1, TP7a-2

- [X] TP7a-4 Extend `src/main/crdPages/space/callout/ContributionGridConnector.tsx` with an optional `trailingSlot: ReactNode` prop
  - **File**: modified
  - **Description**: Append `trailingSlot` at the end of the grid children and include it in the `totalCount` passed to `ContributionGrid` so the collapse-threshold math still works. Early return on empty contributions only if there's no `trailingSlot`.
  - **Acceptance**: Passing `trailingSlot` renders it after cards; omitting it preserves existing behavior
  - **Dependencies**: TP7a-2

- [X] TP7a-5 Wire into `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`
  - **File**: modified
  - **Description**: In `ContributionsSlot`, call `useCalloutCollaborationPermissions({ callout, contributionType })`. When `canCreateContribution && contributionType === CalloutContributionType.Whiteboard`, build `trailingSlot = <WhiteboardContributionAddConnector calloutId={callout.id} />` and pass to `ContributionGridConnector`. Omit for other types (follow-up iterations handle Post/Memo/Link).
  - **Acceptance**: Whiteboard-type callouts with the right privileges show the card; other types / insufficient privileges don't; grid renders correctly when contributions list is empty and only the add card is shown
  - **Dependencies**: TP7a-3, TP7a-4

- [ ] TP7a-6 [future] Same pattern for Post / Memo / Link contribution types
  - Mirror `WhiteboardContributionAddConnector` for each. Separate connectors (one per type) keep each one simple and preserve the CRD presentational boundary.
  - Not in this iteration — called out here so it's tracked.

**Checkpoint**: Opening a callout whose allowed contribution type is Whiteboard shows an "Add Response" dashed card at the end of the contributions grid. Clicking it lets the user name and create a new whiteboard contribution. The grid refreshes to include the new card. User can then click the new card to open the whiteboard editor.

---

## Phase 7: Verification + Cleanup

- [X] T23 [P] Verify zero forbidden imports in all new `src/crd/components/whiteboard/` files — grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `formik`, `react-router-dom`, `@alkemio/excalidraw`
  - **Acceptance**: Zero matches
  - **Dependencies**: T18

- [X] T24 [P] Update `src/crd/components/index.md` component inventory — add all whiteboard components: `WhiteboardEditorShell`, `WhiteboardDisplayName`, `WhiteboardCollabFooter`, `WhiteboardSaveFooter`, `PreviewSettingsDialog`, `PreviewCropDialog`, `JoinWhiteboardDialog`, `WhiteboardErrorState`
  - **Acceptance**: Inventory reflects all new components
  - **Dependencies**: T18

- [X] T25 [P] Run `pnpm biome check --write` on all new/modified files; run `pnpm vitest run` — all tests must pass
  - **Acceptance**: No lint errors; all existing tests pass
  - **Dependencies**: T22

---

## Dependency Graph

```
Phase 1 (parallel):
  T1 ──> T2 (translations)
  T1 ──> T3 (register namespace)
  T3 ──> T4 (JoinWhiteboardDialog, needs i18n)
  T5 (WhiteboardErrorState, no deps)

Phase 2 (sequential):
  T4, T5 ──> T6 (CrdPublicWhiteboardPage)
  T6 ──> T7 (route wiring)

Phase 3 — Editor Shell (parallel, then sequential):
  T3 ──> T8 (WhiteboardDisplayName, needs i18n)
  T3 ──> T9 (WhiteboardCollabFooter, needs i18n)
  T3 ──> T10 (WhiteboardEditorShell — accepts ReactNode slots, only needs i18n for close button)
  T11 (whiteboardFooterMapper, no deps)
  T10, T11 ──> T12 (CrdWhiteboardDialog)
  T12 ──> T13 (CrdWhiteboardView)

Phase 4 — Single-User (after shell):
  T3 ──> T15 (WhiteboardSaveFooter)
  T10, T15 ──> T16 (CrdSingleUserWhiteboardDialog)

Phase 5 — Preview Settings (parallel with Phase 4):
  T3 ──> T17 (PreviewSettingsDialog)
  T3 ──> T18 (PreviewCropDialog)
  T1 ──> T19 (i18n keys)
  T12, T17, T18 ──> T14 (wire CRD preview into CrdWhiteboardDialog)

Phase 6 — Public Page + Demo:
  T12 ──> T20 (replace temp MUI in public page)
  T10, T15 ──> T21 (demo page)
  T21 ──> T22 (demo route)

Phase 7a — Add Response (after Phase 3 lands CalloutDetailDialogConnector contributions grid):
  TP7a-1 (translations, no deps)
  TP7a-2 (ContributionAddCard, no deps)
  TP7a-1, TP7a-2 ──> TP7a-3 (WhiteboardContributionAddConnector)
  TP7a-2 ──> TP7a-4 (ContributionGridConnector trailingSlot)
  TP7a-3, TP7a-4 ──> TP7a-5 (wire in CalloutDetailDialogConnector)

Phase 7 — Verification (parallel):
  T18 ──> T23 (import verification)
  T18 ──> T24 (inventory)
  T22, TP7a-5 ──> T25 (final lint + tests)
```

**Critical path**: T1 → T3 → T4 → T6 → T7 (Phase 1+2, delivers public page)
**Critical path**: T3 → T10 → T12 → T13 (Phase 3, delivers multi-user editor shell — T8/T9 run in parallel, not blocking T10)
**Critical path**: T3 → T15 → T16 (Phase 4, delivers single-user editor shell)
**Critical path**: T3 → T17/T18 + T12 → T14 (Phase 5, delivers preview settings + wires into multi-user dialog)

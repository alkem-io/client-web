# Implementation Plan: CRD Whiteboard Migration

**Spec**: [spec.md](./spec.md) | **Branch**: `042-crd-space-page`

## File Inventory

### New files

| File | Purpose |
|------|---------|
| `src/crd/components/whiteboard/WhiteboardEditorShell.tsx` | Full-screen dialog shell: header (title + actions) + children slot + footer slot. Shared by multi-user and single-user modes. |
| `src/crd/components/whiteboard/WhiteboardDisplayName.tsx` | Inline-editable title: read-only, view (with edit button), edit (input + save/cancel) |
| `src/crd/components/whiteboard/WhiteboardCollabFooter.tsx` | Multi-user footer: delete, readonly reason, restart, guest warning, badge slot |
| `src/crd/components/whiteboard/WhiteboardSaveFooter.tsx` | Single-user footer: Delete (left) + Save (right, primary, loading state) |
| `src/crd/components/whiteboard/PreviewSettingsDialog.tsx` | Preview mode selector: 3 mode buttons (Auto/Custom/Fixed) with icons and descriptions |
| `src/crd/components/whiteboard/PreviewCropDialog.tsx` | Image crop dialog: `react-image-crop` overlay, zoom slider, pan, reset/cancel/confirm |
| `src/crd/components/whiteboard/JoinWhiteboardDialog.tsx` | Guest name form: welcome text, name input, join button, sign-in button |
| `src/crd/components/whiteboard/WhiteboardErrorState.tsx` | Centered error display: icon, title, message, retry button |
| `src/crd/i18n/whiteboard/whiteboard.en.json` | English translations for crd-whiteboard namespace |
| `src/crd/i18n/whiteboard/whiteboard.bg.json` | Bulgarian translations |
| `src/crd/i18n/whiteboard/whiteboard.de.json` | German translations |
| `src/crd/i18n/whiteboard/whiteboard.es.json` | Spanish translations |
| `src/crd/i18n/whiteboard/whiteboard.fr.json` | French translations |
| `src/crd/i18n/whiteboard/whiteboard.nl.json` | Dutch translations |
| `src/main/crdPages/whiteboard/CrdPublicWhiteboardPage.tsx` | Integration: public whiteboard route entry point |
| `src/main/crdPages/whiteboard/CrdWhiteboardDialog.tsx` | Integration: multi-user — wires CRD shell + CollaborativeExcalidrawWrapper + Formik + file management |
| `src/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog.tsx` | Integration: single-user — wires CRD shell + ExcalidrawWrapper + Formik + serializeAsJSON save logic |
| `src/main/crdPages/whiteboard/CrdWhiteboardView.tsx` | Integration: replaces WhiteboardView, maps authorization to CRD shell props |
| `src/main/crdPages/whiteboard/whiteboardFooterMapper.ts` | Pure mapper: resolves readonly reason, guest state, delete permissions into collab footer props |

### Modified files

| File | Change |
|------|--------|
| `src/core/i18n/config.ts` | Register `crd-whiteboard` namespace in `crdNamespaceImports` |
| `@types/i18next.d.ts` | Add `crd-whiteboard` namespace type declaration |
| `src/main/routing/TopLevelRoutes.tsx` | Add CRD toggle for `/public/whiteboard/:id` route |
| `src/crd/components/index.md` | Add whiteboard components to inventory |
| `src/crd/app/pages/WhiteboardPage.tsx` | Demo page with static screenshot inside WhiteboardEditorShell |
| `src/crd/app/CrdApp.tsx` | Add route to whiteboard demo page |

## Design Details

### 1. WhiteboardEditorShell -- Full-screen dialog

Uses the CRD Dialog primitive (`@/crd/primitives/dialog`). Layout:

```
+----------------------------------------------------------+
| [Title] [TitleExtra]                    [Actions] [Close] |  <-- header
+----------------------------------------------------------+
|                                                          |
|              children (Excalidraw canvas)                 |  <-- flex-grow
|                                                          |
+----------------------------------------------------------+
| [Delete] [Readonly msg] [Restart]  [GuestWarn] [Badge]   |  <-- footer
+----------------------------------------------------------+
```

- Dialog uses `DialogContent` with `className="flex flex-col h-full p-0"` for full-height layout
- Header: `flex items-center justify-between px-4 py-2 border-b border-border`
- Content: `flex-1 min-h-0` (lets Excalidraw fill remaining space)
- Footer: rendered via the `footer` prop slot

When `fullscreen` is true, the dialog fills `100vw x 100vh`. When false, it uses `max-w-[95vw] max-h-[90vh]` with rounded corners. The `fullscreen` prop is controlled by the integration layer: defaults to `true` on sm breakpoints and below (via `useScreenSize().isSmallScreen`), toggleable via `FullscreenButton` on larger screens — matching the current MUI behavior in `WhiteboardView` and `PublicWhiteboardPage`.

### 2. WhiteboardDisplayName -- Three-mode inline editor

```
Mode: readOnly     --> <h2 class="text-lg font-semibold truncate">Title</h2>
Mode: view         --> <h2>Title</h2> <button aria-label="Edit">Pencil icon</button>
Mode: edit         --> <input value="Title" /> <button>Check</button> <button>X</button>
```

- Uses `useState` for `editValue` (local copy during editing)
- Save button shows spinner via `saving` prop (passed from integration layer which calls the mutation)
- Cancel resets `editValue` to `displayName` and calls `onCancel`
- Edit input uses `autoFocus` and submits on Enter

### 3. WhiteboardCollabFooter -- Multi-user footer

Layout: `flex items-center justify-between px-4 py-2 border-t border-border flex-wrap gap-2`

Left side:
- Delete button: `<Button variant="ghost" size="sm">` with `Trash2` icon, destructive text color
- Readonly message: `<span class="text-caption text-muted-foreground">{readonlyMessage}</span>`
- Restart button: `<Button variant="outline" size="sm">`

Right side:
- Guest warning: bordered badge with `Globe` icon + warning text
- Guest access badge: `{guestAccessBadge}` ReactNode slot

The `readonlyMessage` is a `ReactNode` -- the integration layer pre-renders it with `<Trans>` components, link handlers, and routing. The CRD footer simply renders `{readonlyMessage}`.

### 3b. WhiteboardSaveFooter -- Single-user footer

Layout: `flex items-center justify-between px-4 py-2 border-t border-border`

Left side:
- Delete button: `<Button variant="ghost" size="sm" className="text-destructive">` with `Trash2` icon (hidden if `onDelete` not provided)

Right side:
- Save button: `<Button variant="default">` with `Save` icon, loading state via `saving` prop, disabled via `saveDisabled` prop

Used by `CrdSingleUserWhiteboardDialog` for template editing and callout creation with whiteboard framing.

### 3c. PreviewSettingsDialog -- Mode selector

Uses CRD Dialog primitive. Layout:

```
+------------------------------------------+
| Preview Settings                [Close]  |
| Choose how the thumbnail looks           |
|                                          |
| [icon] Auto                              |
|        Full canvas view              [>] |
|                                          |
| [icon] Custom                            |
|        Choose your own crop area     [>] |
|                                          |
| [icon] Fixed                             |
|        Lock to a specific area       [>] |
+------------------------------------------+
```

- 3 mode buttons: each is a bordered card with icon (left), title + description (right)
- Selected mode has `border-primary` highlight
- Loading spinner replaces icon when saving
- Auto triggers `onSelectAuto` (saves and closes). Custom/Fixed trigger `onSelectCustom`/`onSelectFixed` (opens crop dialog).
- Icons: `Wand2` (auto), `Crop` (custom), `Lock` (fixed) from lucide-react

### 3d. PreviewCropDialog -- Image crop/zoom/pan

Uses CRD Dialog primitive. Layout:

```
+------------------------------------------+
| Custom / Fixed              [Close]      |
|                                          |
|  +------------------------------------+  |
|  |  [Image with crop overlay]         |  |
|  |  (zoom via wheel, pan via drag)    |  |
|  +------------------------------------+  |
|  [-------- zoom slider --------]         |
|                                          |
|  [Reset]          [Cancel] [Confirm]     |
+------------------------------------------+
```

- Image: rendered from a `Blob` prop via `URL.createObjectURL()`. The integration layer calls `excalidrawAPI.exportToBlob()` and passes the result -- the CRD component never touches Excalidraw.
- Crop overlay: `react-image-crop` (`ReactCrop`) with `aspect` constraint from props
- Zoom: CRD Slider primitive (1x-8x), also responds to mouse wheel
- Pan: pointer events on image (drag to move)
- Buttons: Reset (replay icon), Cancel, Confirm (primary)
- `onCropSave(coordinates)` callback passes crop region to integration layer

### 4. JoinWhiteboardDialog -- Guest name form

Uses CRD Dialog primitive with `max-w-[480px]`. Internal state for the name field value. Form submission calls `onSubmit(trimmedName)`.

Layout:
```
+--------------------------------+
| Welcome subtitle (muted)       |
| "Join Whiteboard" (title, lg)  |
|                                |
| Description text               |
| [Name input                  ] |
| [Join as Guest             ]   |
| [Sign In to Alkemio        ]   |
+--------------------------------+
```

- Name input: `<Input>` primitive with `aria-label`, validates on change/blur
- Join button: primary variant, disabled while `submitting || !valid || !dirty`
- Sign-in button: outline variant, calls `onSignIn`
- Uses `useTranslation('crd-whiteboard')` for all text

### 5. WhiteboardErrorState -- Centered error

Simple centered layout: `flex flex-col items-center justify-center min-h-screen p-6 text-center`

- Icon: `AlertCircle` from lucide-react (size 64, `text-destructive`)
- Title: `text-2xl font-bold`
- Message: `text-muted-foreground max-w-[600px]`
- Retry button: `<Button variant="default">` (hidden if `onRetry` not provided)

### 6. CrdWhiteboardDialog -- Integration layer

This is the **key integration component**. It replaces the MUI `WhiteboardDialog` by:

1. Rendering `CollaborativeExcalidrawWrapper` with the same entity/action/option props
2. Using the render prop pattern from `CollaborativeExcalidrawWrapper` to get `{ children, mode, modeReason, collaborating, connecting, restartCollaboration, isReadOnly }`
3. Wrapping `children` (Excalidraw canvas) inside `WhiteboardEditorShell`
4. Managing Formik context for display name validation
5. Wiring file management via `useWhiteboardFilesManager`
6. Wiring preview generation via `useGenerateWhiteboardVisuals`
7. Rendering existing MUI components in slots:
   - `headerActions`: `ShareButton` + `FullscreenButton` + `SaveRequestIndicatorIcon` + `WhiteboardPreviewSettingsButton`
   - `titleExtra`: `WhiteboardDialogTemplatesLibrary`
8. Rendering `WhiteboardFooter` as the `footer` prop with mapped props from `whiteboardFooterMapper`
9. Rendering `ConfirmationDialog` for delete (CRD version from `src/crd/components/dialogs/`)
10. Rendering `WhiteboardPreviewSettingsDialog` (stays MUI, portals from the CRD shell)

### 7. whiteboardFooterMapper -- Pure mapper function

```typescript
export function mapWhiteboardFooterProps(params: {
  whiteboard: WhiteboardDetails | undefined;
  canEdit: boolean;
  canDelete: boolean;
  collaboratorMode: CollaboratorMode | null;
  collaboratorModeReason: CollaboratorModeReasons | null;
  isAuthenticated: boolean;
  guestContributionsAllowed: boolean;
  guestAccessEnabled: boolean;
  contentUpdatePolicy: ContentUpdatePolicy | undefined;
  myMembershipStatus: CommunityMembershipStatus | undefined;
}): Omit<WhiteboardFooterProps, 'readonlyMessage' | 'guestAccessBadge'> {
  // Maps domain state to flat CRD footer props
  // readonlyMessage is built separately in the connector using <Trans> + routing
}
```

### 8. CrdPublicWhiteboardPage -- Public route integration

Same logic as existing `PublicWhiteboardPage`, but renders CRD components:
- `JoinWhiteboardDialog` (CRD) instead of MUI version
- `WhiteboardErrorState` (CRD) instead of MUI version
- Simple `<div class="w-screen h-screen overflow-hidden relative">` instead of MUI Box
- Still renders `CrdWhiteboardDialog` for the actual editor (Phase 2) or falls back to MUI `WhiteboardDialog` (Phase 1)

Reuses unchanged:
- `GuestSessionProvider` (context wrapper)
- `useGuestSession`, `useGuestWhiteboardAccess`, `useGuestAnalytics` (hooks)
- `useCurrentUserLightQuery` (auth check)
- All session storage utilities

### 9. Route wiring in TopLevelRoutes.tsx

```typescript
// CRD version
const CrdPublicWhiteboardPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/whiteboard/CrdPublicWhiteboardPage')
);
// MUI version (existing)
const PublicWhiteboardPage = lazyWithGlobalErrorHandler(
  () => import('@/main/public/whiteboard/PublicWhiteboardPage')
);

// In JSX -- the public whiteboard route is NOT inside CrdLayoutWrapper
// (it's a full-screen immersive experience, no header/footer)
<Route
  path={`${GUEST_SHARE_PATH}/:whiteboardId`}
  element={
    <Suspense fallback={<Loading />}>
      {crdEnabled ? <CrdPublicWhiteboardPage /> : <PublicWhiteboardPage />}
    </Suspense>
  }
/>
```

## Dependency Analysis

No new npm packages needed. All dependencies already installed:
- `lucide-react` (icons)
- `@/crd/primitives/dialog` (Radix Dialog wrapper)
- `@/crd/primitives/button` (Button)
- `@/crd/primitives/input` (Input)
- `@alkemio/excalidraw` (existing, unchanged)
- `@hocuspocus/provider` (existing, unchanged)
- `formik` (existing, used in integration layer only)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CollaborativeExcalidrawWrapper render prop pattern breaks with CRD shell | Low | High | The render prop returns `{ children }` which is a ReactNode -- wrapping it in a different dialog component is straightforward. Test with actual collaboration. |
| MUI components in slots look visually inconsistent with CRD shell | Medium | Low | These are small self-contained components (icons, buttons). Visual gap is minimal and temporary. |
| Footer readonly reason pre-rendering loses i18n reactivity on language switch | Low | Medium | The integration layer re-renders on language change (i18n triggers re-render), so the `<Trans>` output updates. |
| Focus management conflict between CRD Dialog and Excalidraw | Medium | Medium | Excalidraw manages its own focus. The Dialog's `onOpenAutoFocus` should be prevented (`e.preventDefault()`) to let Excalidraw handle initial focus. |

# Research: CRD Whiteboard Migration

**Branch**: `042-crd-space-page` | **Date**: 2026-04-15

## R-WB-1: Revising the R2 Boundary Decision

**Original Decision (042 R2)**: WhiteboardPreview (inline) to CRD, WhiteboardDialog (collaboration system) stays MUI portal.

**Revised Decision**: Migrate the WhiteboardDialog **chrome** (header, footer, display name) to CRD. The Excalidraw canvas and all collaboration infrastructure stays unchanged and is rendered as `children` inside the CRD shell.

**Rationale**: The original decision was correct for the initial space page migration -- the dialog portals outside `.crd-root` so MUI CSS doesn't conflict. However, as CRD coverage grows, the MUI dialog creates a visible design-language inconsistency. The dialog chrome (header, footer, title) is simple presentational UI -- it doesn't need MUI. The complex part (Excalidraw, WebSocket sync, file management) is not MUI at all; it's third-party libraries that are framework-agnostic.

**Risk assessment**: Low. The chrome is ~350 lines of JSX layout with props wiring. The collaboration stack (~2000+ lines) is untouched. The slot pattern ensures backward compatibility -- existing MUI action buttons (ShareButton, FullscreenButton, SaveRequestIndicatorIcon, WhiteboardPreviewSettingsButton, WhiteboardDialogTemplatesLibrary) render unchanged in ReactNode slots.

## R-WB-2: Footer Domain Dependencies

**Problem**: `WhiteboardDialogFooter` uses 5 domain-level hooks:
- `useSpace()` -- for space membership status and profile URL
- `useSubSpace()` -- for subspace membership status  
- `useUrlResolver()` -- for `spaceLevel` (L0/L1)
- `useAuthenticationContext()` -- for authentication state
- `useDirectMessageDialog()` -- for messaging the whiteboard creator

These are forbidden in `src/crd/`.

**Decision**: The CRD footer receives all resolved data as props. The integration layer (`CrdWhiteboardDialog`) calls these hooks and maps the results.

Specifically:
- `readonlyReasonKey` + `readonlyReasonValues` -- the integration layer resolves the reason enum and passes the i18n key + interpolation values as props. The CRD footer calls `t(key, values)`.
- Actually NO -- the footer uses `<Trans>` with component interpolation (`<RouterLink>`, `<span>`). The CRD component cannot use `react-router-dom`. Instead, the integration layer pre-renders the readonly reason as a `ReactNode` and passes it directly. The CRD footer just renders `{readonlyMessage}`.
- `canDelete`, `deleteDisabled` -- derived from authorization privileges
- `canRestart` -- derived from collaborator mode + reason
- Guest warning -- derived from `guestContributionsAllowed` on the whiteboard entity
- Direct message action -- stays in integration layer; if needed, passed as `onAuthorClick` callback

**Alternatives considered**:
- Keep footer MUI: Defeats the purpose of migrating the shell. The footer is the most visually prominent MUI piece.
- Pass all domain hooks results through context: Over-engineering. Props are sufficient.
- Create a "readonly reason" CRD component with i18n: The reason text contains links (author profile, space page, sign-in, "learn why") with click handlers. This is complex with `<Trans>` component interpolation. Pre-rendering as ReactNode in the integration layer is simpler and avoids leaking routing logic into CRD.

## R-WB-3: Public Whiteboard Page Route Strategy

**Decision**: The `/public/whiteboard/:id` route is toggled by `useCrdEnabled()` in `TopLevelRoutes.tsx`, same as all other CRD routes.

**Rationale**: Consistency with the existing pattern. The public page is a top-level route defined in `TopLevelRoutes.tsx` (line 72). The CRD version uses a minimal full-viewport layout (no `CrdLayoutWrapper` -- whiteboards are immersive, no header/footer needed). Both versions are lazy-loaded.

**Alternatives considered**:
- Always CRD for public page: Would break toggle-off testing. Keep toggle consistent.
- Use CrdLayoutWrapper: Whiteboards are full-screen immersive experiences. Adding header/footer would waste vertical space and conflict with the fullscreen mode.

## R-WB-4: Editor Shell as Dialog vs Full-Viewport Div

**Decision**: Use the CRD Dialog primitive in full-screen mode (the `fullscreen` variant already exists as a pattern).

**Rationale**: The current MUI version uses `DialogWithGrid` with `fullScreen={true}`. The CRD Dialog primitive wraps Radix Dialog, which provides focus trapping, escape handling, and scroll locking out of the box. A plain div would require reimplementing these behaviors.

When `fullscreen` is false (non-small-screen with manual fullscreen off), the dialog should still fill nearly the entire viewport but with some margin -- matching the current MUI `maxWidth={false} fullWidth={true}` behavior.

**Alternatives considered**:
- Plain `div` with fixed positioning: Loses Radix Dialog's focus management, scroll lock, and escape handling.
- Radix Portal without Dialog: Gets the portal but not the accessibility behaviors.

## R-WB-5: Confirmation Dialog Reuse

**Decision**: Reuse the existing CRD `ConfirmationDialog` from `src/crd/components/dialogs/ConfirmationDialog.tsx` for the delete confirmation.

**Rationale**: This component was already built during the 042 space page migration (Phase 19, T136 area). It wraps Radix AlertDialog with destructive variant support. No need to build another one.

## R-WB-6: i18n Namespace

**Decision**: Create a new `crd-whiteboard` namespace in `src/crd/i18n/whiteboard/`.

**Rationale**: The whiteboard is a distinct feature area that spans multiple pages (space callouts, public page). It deserves its own namespace rather than adding keys to `crd-space`. This follows the established pattern: `crd-layout` for header/footer, `crd-exploreSpaces` for the spaces explorer, `crd-space` for the space page, `crd-whiteboard` for whiteboard components.

Keys to include:
- `join.*` -- join dialog strings (welcome, title, description, placeholder, buttons)
- `error.*` -- error state strings (404 title/message, 500 title/message, retry)
- `editor.*` -- editor shell strings (edit display name, delete, readonly reasons, guest warning, restart)
- `footer.*` -- footer-specific strings

## R-WB-7: Phasing Strategy

**Decision**: Implement in two phases within this sub-spec.

- **Phase 1: Public Whiteboard Page** -- standalone route, lower complexity, immediate visual value. The WhiteboardDialog itself stays MUI in this phase (the public page wraps it). The join dialog, error state, and page layout become CRD.
- **Phase 2: Whiteboard Editor Shell** -- replaces dialog chrome. Higher complexity due to footer domain dependency resolution and the `CollaborativeExcalidrawWrapper` render prop pattern.

**Rationale**: Phase 1 can ship independently and delivers a fully CRD public whiteboard experience. Phase 2 builds on it by replacing the dialog chrome everywhere (public page + space callouts).

After Phase 2, the WhiteboardDialog from MUI is no longer rendered anywhere in CRD pages -- it's fully replaced by `CrdWhiteboardDialog`.

## R-WB-8: Single-User vs Multi-User Dialogs

**Decision**: Both modes share the same CRD `WhiteboardEditorShell`. The difference is in the `children` slot (which Excalidraw wrapper) and the `footer` slot (which buttons).

**Rationale**: The `SingleUserWhiteboardDialog` and `WhiteboardDialog` have nearly identical chrome: header with title + template library + actions, content area with Excalidraw, footer with buttons. The only differences are:
- Multi-user uses `CollaborativeExcalidrawWrapper` (WebSocket sync); single-user uses `ExcalidrawWrapper` (local-only)
- Multi-user footer: readonly reason, restart, guest warning; single-user footer: Save + Delete buttons
- Multi-user auto-saves on close; single-user shows unsaved changes confirm

A single CRD shell with two footer variants and two integration-layer connectors handles both. The CRD shell doesn't know which mode it's in -- it just renders slots.

**Alternatives considered**:
- Two separate CRD shell components: Code duplication for identical chrome. Rejected.
- A `mode` prop on the shell: Leaks business logic into CRD. The footer slot pattern is cleaner.

## R-WB-9: Preview Settings Migration

**Decision**: Migrate both `WhiteboardPreviewSettingsDialog` and `WhiteboardPreviewCustomSelectionDialog` to CRD.

**Rationale**: These dialogs are user-facing UI that controls how whiteboard thumbnails appear. They open from the editor header actions. If the editor shell is CRD, its sub-dialogs should match visually.

The crop dialog uses `react-image-crop`, a pure UI library (CSS crop overlay + pointer events). It has no business logic, no GraphQL, no routing -- it's a visual tool. It's acceptable in `src/crd/` the same way `lucide-react` is acceptable for icons.

The preview image Blob is generated by the integration layer (which calls `excalidrawAPI.exportToBlob()`). The CRD component receives the Blob as a prop and renders it as an `<img>`. The CRD component never touches Excalidraw APIs.

**Alternatives considered**:
- Keep preview settings as MUI portals: Works but creates visual inconsistency. The mode selector dialog is simple enough that MUI feels out of place inside a CRD editor.
- Build a custom crop overlay: Unnecessary -- `react-image-crop` is battle-tested and lightweight.

## R-WB-10: Demo App Excalidraw Isolation

**Decision**: The standalone preview app (`src/crd/app/`) renders a static PNG screenshot inside `WhiteboardEditorShell` instead of an Excalidraw instance.

**Rationale**: Excalidraw is a large dependency (~600KB+ gzipped) with WebSocket, Y.js, and binary encoding modules. Including it in the demo app would:
- Bloat the demo bundle unnecessarily
- Create a dependency on `@alkemio/excalidraw` (a custom fork) in `src/crd/app/`
- Violate the principle that `src/crd/` knows nothing about the host application's third-party integrations

A mock page with a screenshot PNG proves that the shell layout works. The screenshot can be a real whiteboard export (committed as a static asset in `src/crd/app/data/` or `public/`).

**What the demo page shows**:
- `WhiteboardEditorShell` open in full-screen mode
- `WhiteboardDisplayName` in read-only mode
- Mock header actions (placeholder buttons)
- `WhiteboardCollabFooter` with sample props (readonly message, guest warning visible)
- A static `<img>` in the content area showing a whiteboard screenshot

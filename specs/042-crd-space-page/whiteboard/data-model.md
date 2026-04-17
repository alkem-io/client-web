# Data Model: CRD Whiteboard Components

**Branch**: `042-crd-space-page` | **Date**: 2026-04-15

These are the CRD component prop types -- plain TypeScript, never GraphQL generated types. Data mappers in the integration layer transform GraphQL/domain data into these shapes.

## WhiteboardEditorShell

```typescript
type WhiteboardEditorShellProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Full-screen mode (fills entire viewport) */
  fullscreen?: boolean;
  /** Called when the user closes the shell (Escape, close button) */
  onClose: () => void;

  /** Title area: WhiteboardDisplayName or plain text */
  title: ReactNode;
  /** Extra content after the title (e.g., template library trigger) */
  titleExtra?: ReactNode;
  /** Action buttons in the header (share, fullscreen, save indicator, preview settings) */
  headerActions?: ReactNode;

  /** The Excalidraw canvas (opaque slot) */
  children: ReactNode;

  /** Footer content */
  footer?: ReactNode;

  /** Optional CSS class */
  className?: string;
};
```

## WhiteboardDisplayName

```typescript
type WhiteboardDisplayNameProps = {
  /** Current display name */
  displayName: string;
  /** Read-only mode: shows plain text, no edit button */
  readOnly?: boolean;
  /** Whether the edit input is currently shown */
  editing?: boolean;
  /** Called when the user clicks the edit button */
  onEdit?: () => void;
  /** Called when the user saves the new name */
  onSave?: (newName: string) => void;
  /** Called when the user cancels editing */
  onCancel?: () => void;
  /** Whether a save is in progress */
  saving?: boolean;
};
```

## WhiteboardCollabFooter (multi-user mode)

```typescript
type WhiteboardCollabFooterProps = {
  /** Whether to show the delete button */
  canDelete?: boolean;
  /** Called when the delete button is clicked */
  onDelete?: () => void;
  /** Whether the delete button is disabled (e.g., user cannot edit) */
  deleteDisabled?: boolean;

  /** Pre-rendered readonly reason message (may contain links) */
  readonlyMessage?: ReactNode;

  /** Whether the restart collaboration button should show */
  canRestart?: boolean;
  /** Called when the restart button is clicked */
  onRestart?: () => void;

  /** Whether to show the guest contributions warning badge */
  guestWarningVisible?: boolean;

  /** Slot for the guest access badge (right side) */
  guestAccessBadge?: ReactNode;

  /** Optional CSS class */
  className?: string;
};
```

## WhiteboardSaveFooter (single-user mode)

```typescript
type WhiteboardSaveFooterProps = {
  /** Called when the delete button is clicked */
  onDelete?: () => void;
  /** Called when the save button is clicked */
  onSave: () => void;
  /** Whether save is in progress */
  saving?: boolean;
  /** Whether save is disabled (form invalid) */
  saveDisabled?: boolean;
  /** Optional CSS class */
  className?: string;
};
```

## JoinWhiteboardDialog

```typescript
type JoinWhiteboardDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Called with the trimmed guest name on form submission */
  onSubmit: (guestName: string) => void;
  /** Called when the user clicks "Sign In to Alkemio" */
  onSignIn: () => void;
  /** Whether submission is in progress */
  submitting?: boolean;
  /** Validation function: returns error string or undefined */
  validate?: (name: string) => string | undefined;
};
```

## WhiteboardErrorState

```typescript
type WhiteboardErrorStateProps = {
  /** Error title */
  title: string;
  /** Error description */
  message: string;
  /** Called when the retry button is clicked (button hidden if not provided) */
  onRetry?: () => void;
};
```

## Integration Layer Types

These types are used by the integration layer (`src/main/crdPages/whiteboard/`) to wire domain data to CRD components. They are NOT part of `src/crd/`.

### CrdWhiteboardDialogProps

```typescript
/**
 * Props for the integration-layer whiteboard dialog.
 * Maps 1:1 to the existing WhiteboardDialogProps interface,
 * but renders CRD components instead of MUI.
 */
type CrdWhiteboardDialogProps = {
  entities: {
    whiteboard: WhiteboardDetails | undefined;
  };
  lastSuccessfulSavedDate: Date | undefined;
  actions: {
    onCancel: () => void;
    onUpdate: (
      whiteboard: WhiteboardDetails,
      previewImages?: WhiteboardPreviewImage[]
    ) => Promise<{ success: boolean; errors?: string[] }>;
    onChangeDisplayName: (whiteboardId: string | undefined, newDisplayName: string) => Promise<void>;
    onDelete: (whiteboard: Identifiable) => Promise<void>;
    setLastSuccessfulSavedDate: (date: Date) => void;
    setConsecutiveSaveErrors: React.Dispatch<React.SetStateAction<number>>;
    onClosePreviewSettingsDialog?: () => void;
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: (state: CollabState) => ReactNode;
    dialogTitle: ReactNode;
    fullscreen?: boolean;
    allowFilesAttached?: boolean;
    readOnlyDisplayName?: boolean;
    editDisplayName?: boolean;
    previewSettingsDialogOpen?: boolean;
  };
  state?: {
    loadingWhiteboardValue?: boolean;
    changingWhiteboardLockState?: boolean;
  };
};
```

Note: `WhiteboardDetails`, `WhiteboardPreviewImage`, `CollabState`, `Identifiable` are the same types used by the existing MUI `WhiteboardDialog`. The integration layer imports them from their existing locations.

## Preview Settings Components

### PreviewSettingsDialog

```typescript
type PreviewMode = 'AUTO' | 'CUSTOM' | 'FIXED';

type PreviewSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Currently active mode */
  selectedMode: PreviewMode;
  /** Called when user selects Auto (saves immediately) */
  onSelectAuto: () => void;
  /** Called when user selects Custom (opens crop dialog) */
  onSelectCustom: () => void;
  /** Called when user selects Fixed (opens crop dialog) */
  onSelectFixed: () => void;
  /** Whether Auto mode is saving */
  loadingAuto?: boolean;
  /** Whether Custom/Fixed mode is saving */
  loadingCrop?: boolean;
};
```

### PreviewCropDialog

```typescript
type CropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PreviewCropDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Dialog title (mode-specific: "Custom" or "Fixed") */
  title?: string;
  /** The whiteboard canvas exported as a Blob (rendered as <img>) */
  previewImage?: Blob;
  /** Initial crop region (if editing existing crop) */
  initialCrop?: CropRegion;
  /** Aspect ratio constraint for the crop (e.g., 1.78 for 16:9) */
  aspectRatio: number;
  /** Called with the final crop coordinates */
  onCropSave: (crop: CropRegion) => void;
};
```

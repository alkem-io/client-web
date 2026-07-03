import { Loader2 } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { type DocumentImportError, DocumentImportZone } from './DocumentImportZone';

export type ReplaceCollaboraDocumentDialogLabels = {
  /** Dialog title. */
  dialogTitle: string;
  /** Destructive-overwrite confirmation copy shown under the title (FR-007). */
  description: string;
  /** Headline inside the import zone. */
  importHint: string;
  /** Sub-line beneath the import headline (e.g. ".docx, .xlsx, .pptx up to 15 MB"). */
  importMaxSize: string;
  /** ARIA label for the staged-file remove button. */
  importRemoveFile: string;
  /** Label for the current document's title (FR-015). */
  currentTitleLabel: string;
  /** Label for the editable title field (FR-015). */
  titleFieldLabel: string;
  /** Confirm button label. */
  confirmLabel: string;
  /** Cancel button label. */
  cancelLabel: string;
};

export type ReplaceCollaboraDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // ---- import zone ----
  acceptAttr: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  importError: DocumentImportError | null;
  onImportError: (error: DocumentImportError | null) => void;
  /** Pre-formatted message for the current client-side validation error. */
  importErrorMessage: string | null;
  /** Pre-formatted message for a server-side rejection (lock / content / type). */
  serverErrorMessage: string | null;
  // ---- titles (FR-015) ----
  currentTitle: string;
  /** Human-readable name of the current document's type (e.g. "Presentation"), so the user knows what kind the replacement must be (FR-006). */
  currentTypeLabel?: string;
  titleValue: string;
  onTitleChange: (value: string) => void;
  // ---- actions ----
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  labels: ReplaceCollaboraDocumentDialogLabels;
};

/**
 * Purpose-built single dialog for replacing a Collabora document's backing file
 * (workspace#014-officedocs-replace-file, US3). Unlike the plain
 * `ConfirmationDialog`, it hosts the file import zone plus the title review
 * fields, and the dialog itself IS the overwrite confirmation (FR-007) — there
 * is no separate confirm step.
 *
 * Presentational only: validation, the same-type pre-check, i18n, and the
 * mutation live in the connector that renders this.
 */
export function ReplaceCollaboraDocumentDialog({
  open,
  onOpenChange,
  acceptAttr,
  file,
  onFileChange,
  importError,
  onImportError,
  importErrorMessage,
  serverErrorMessage,
  currentTitle,
  currentTypeLabel,
  titleValue,
  onTitleChange,
  onConfirm,
  onCancel,
  loading,
  labels,
}: ReplaceCollaboraDocumentDialogProps) {
  const titleFieldId = useId();

  const fileStaged = file != null && importError == null;

  return (
    <Dialog open={open} onOpenChange={next => (next ? onOpenChange(true) : onCancel())}>
      <DialogContent className="z-[90] sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{labels.dialogTitle}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
          {/* Current document title (FR-015) */}
          <div className="space-y-1">
            <p className="text-caption text-muted-foreground">{labels.currentTitleLabel}</p>
            <p className="text-body-emphasis text-foreground truncate" title={currentTitle}>
              {currentTitle}
            </p>
            {currentTypeLabel && <p className="text-caption text-muted-foreground">{currentTypeLabel}</p>}
          </div>

          <DocumentImportZone
            acceptAttr={acceptAttr}
            value={file}
            onChange={onFileChange}
            onError={onImportError}
            error={importError}
            errorMessage={importErrorMessage}
            busy={loading}
            labelHint={labels.importHint}
            labelMaxSize={labels.importMaxSize}
            labelRemoveFile={labels.importRemoveFile}
          />

          {/* Editable title field (FR-015) — shown once a valid file is staged. The
              staged-file card above already shows the replacement file, so its name
              is not repeated here. */}
          {fileStaged && (
            <div className="space-y-1">
              <Label htmlFor={titleFieldId}>{labels.titleFieldLabel}</Label>
              <Input
                id={titleFieldId}
                value={titleValue}
                onChange={event => onTitleChange(event.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {serverErrorMessage && (
            <p role="alert" className="text-caption text-destructive">
              {serverErrorMessage}
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {labels.cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!fileStaged || loading} aria-busy={loading}>
            {loading && <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden="true" />}
            {labels.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

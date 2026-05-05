import { FileText, Presentation, Sheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { type DocumentImportError, DocumentImportZone } from './DocumentImportZone';

export type CollaboraDocumentTypeValue = 'WORDPROCESSING' | 'SPREADSHEET' | 'PRESENTATION';

type CollaboraDocumentTypePickerProps = {
  value: CollaboraDocumentTypeValue;
  onChange: (value: CollaboraDocumentTypeValue) => void;
  /**
   * When true, the type cannot be changed (used in edit mode — the document
   * is provisioned with a fixed type at creation time and Collabora has no
   * server-side conversion path between text/spreadsheet/presentation).
   */
  readOnly?: boolean;
  className?: string;
  /**
   * Upload-zone props. Provided only on the create flow. When omitted, only
   * the three blank-create cards render (used in edit mode where the document
   * already exists and the upload path doesn't apply).
   */
  upload?: {
    acceptAttr: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    onError: (error: DocumentImportError | null) => void;
    error: DocumentImportError | null;
    errorMessage: string | null;
    busy?: boolean;
    labelHint: string;
    labelMaxSize: string;
    labelRemoveFile: string;
    labelOr: string;
  };
};

const options: Array<{
  value: CollaboraDocumentTypeValue;
  labelKey: 'callout.documentText' | 'callout.documentSpreadsheet' | 'callout.documentPresentation';
  Icon: typeof FileText;
}> = [
  { value: 'WORDPROCESSING', labelKey: 'callout.documentText', Icon: FileText },
  { value: 'SPREADSHEET', labelKey: 'callout.documentSpreadsheet', Icon: Sheet },
  { value: 'PRESENTATION', labelKey: 'callout.documentPresentation', Icon: Presentation },
];

export function CollaboraDocumentTypePicker({
  value,
  onChange,
  readOnly = false,
  className,
  upload,
}: CollaboraDocumentTypePickerProps) {
  const { t } = useTranslation('crd-space');

  // Mutual exclusion (FR-005): when a file is staged, the blank-create cards
  // are dimmed (they appear "inactive") but remain clickable — clicking one
  // clears the staged file as part of the same gesture (see the `onChange`
  // handler below). Only the `readOnly` edit-mode flag truly disables them.
  const fileStaged = upload?.file != null;
  const cardsDisabled = readOnly;

  return (
    <div className={cn('rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-in fade-in', className)}>
      <p className="text-body-emphasis text-foreground">{t('callout.createNew')}</p>
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label={t('callout.documentTypeLabel')}
      >
        {options.map(option => {
          const active = value === option.value && !fileStaged;
          // Visual dim when readOnly+inactive OR when a file is staged (cards
          // are still clickable in the staged case — the click clears the file).
          const dimmed = (cardsDisabled && !active) || fileStaged;
          return (
            <label
              key={option.value}
              aria-disabled={cardsDisabled ? 'true' : undefined}
              className={cn(
                'group flex flex-col items-center justify-center gap-2 p-6 rounded-lg border bg-background text-caption transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
                cardsDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
                active
                  ? 'border-primary ring-1 ring-primary/30 bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground',
                !active && !cardsDisabled && 'hover:border-foreground/20 hover:bg-muted',
                dimmed && 'opacity-50'
              )}
            >
              <input
                type="radio"
                name="collabora-document-type"
                value={option.value}
                checked={active}
                disabled={cardsDisabled}
                onChange={() => {
                  // Picking a card clears any staged file (mutual exclusion).
                  if (upload?.file) {
                    upload.onFileChange(null);
                    upload.onError(null);
                  }
                  onChange(option.value);
                }}
                className="sr-only"
              />
              <option.Icon
                className={cn('w-7 h-7', active ? 'text-primary' : 'text-muted-foreground/70')}
                aria-hidden="true"
              />
              <span className={cn('text-body-emphasis', active ? 'text-foreground' : 'text-foreground/90')}>
                {t(option.labelKey)}
              </span>
            </label>
          );
        })}
      </div>
      {upload && (
        <>
          <div className="flex items-center gap-3 text-caption text-muted-foreground">
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
            <span>{upload.labelOr}</span>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <DocumentImportZone
            acceptAttr={upload.acceptAttr}
            value={upload.file}
            onChange={upload.onFileChange}
            onError={upload.onError}
            error={upload.error}
            errorMessage={upload.errorMessage}
            busy={upload.busy}
            labelHint={upload.labelHint}
            labelMaxSize={upload.labelMaxSize}
            labelRemoveFile={upload.labelRemoveFile}
          />
        </>
      )}
    </div>
  );
}

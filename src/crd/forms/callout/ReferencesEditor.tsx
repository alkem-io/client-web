import { Loader2, Paperclip, Plus, Trash2 } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import type { ReferenceRow } from '@/crd/forms/callout/types';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';

type ReferencesEditorProps = {
  rows: ReferenceRow[];
  onChange: (rows: ReferenceRow[]) => void;
  /** Optional map keyed by `referenceRows.<index>.title` for title-required errors. */
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  /**
   * Optional file-attach integration. When provided, each row exposes a
   * paperclip button that opens a file picker; the resolved URL is written
   * into `row.url`. The connector layer (which lives outside `src/crd/`)
   * owns the upload mutation + storage-bucket config + user-facing errors.
   * Returning `null` means the upload failed — the editor leaves the row
   * unchanged and the connector is expected to have already notified the user.
   */
  onFileUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the file picker (extension list, e.g. ".pdf,.png"). */
  uploadAccept?: string;
};

const createEmptyRow = (): ReferenceRow => ({ title: '', url: '', description: '' });

/**
 * References editor rendered inside "More options". Each row is (title, URL,
 * description). Empty rows are filtered out on submit by the mapper. URL is
 * not validated at the form level (FR-52).
 */
export function ReferencesEditor({
  rows,
  onChange,
  errors,
  disabled,
  onFileUpload,
  uploadAccept,
}: ReferencesEditorProps) {
  const { t } = useTranslation('crd-space');
  // Pending delete confirmation — CRD rule 9: "every destructive action…
  // must go through ConfirmationDialog before the mutation fires."
  // We treat staged-not-yet-saved removals the same way as server-side
  // deletes, since once Save commits the row is gone with no client-side undo.
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  // Per-row upload spinner state. Keyed by row index — fine because the
  // editor is the sole owner of `rows` indexing inside any single render.
  const [uploadingRows, setUploadingRows] = useState<Record<number, boolean>>({});

  const updateRow = (index: number, patch: Partial<ReferenceRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleFileSelected = async (index: number, file: File | undefined) => {
    if (!file || !onFileUpload) return;
    setUploadingRows(prev => ({ ...prev, [index]: true }));
    try {
      const url = await onFileUpload(file);
      if (!url) return;
      // Compose the title autofill against the latest row state in `rows` —
      // the user may have typed something while the upload was in flight.
      const current = rows[index];
      const titleEmpty = !current?.title.trim();
      const filenameBase = file.name.replace(/\.[^./\\]+$/, '').trim();
      const patch: Partial<ReferenceRow> = { url };
      if (titleEmpty && filenameBase) patch.title = filenameBase;
      updateRow(index, patch);
    } finally {
      setUploadingRows(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, createEmptyRow()]);
  };

  const pendingDeleteRow = pendingDeleteIndex !== null ? rows[pendingDeleteIndex] : undefined;

  return (
    <div className="space-y-3">
      <Label className="text-body-emphasis text-foreground">{t('references.heading')}</Label>

      {rows.length === 0 && <p className="text-caption text-muted-foreground italic">{t('references.empty')}</p>}

      {rows.map((row, index) => {
        const titleError = errors?.[`referenceRows.${index}.title`];
        const urlError = errors?.[`referenceRows.${index}.url`];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are append-and-delete; no stable id exists in the row model
          <div key={index} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={row.title}
                  onChange={e => updateRow(index, { title: e.target.value })}
                  placeholder={t('references.titlePlaceholder')}
                  disabled={disabled}
                  aria-label={t('references.titleLabel')}
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? `ref-row-${index}-title-error` : undefined}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                {titleError && (
                  <p id={`ref-row-${index}-title-error`} className="text-caption text-destructive" aria-live="polite">
                    {titleError}
                  </p>
                )}
                <div className="flex items-start gap-2">
                  <input
                    type="url"
                    value={row.url}
                    onChange={e => updateRow(index, { url: e.target.value })}
                    onBlur={e => {
                      const normalized = ensureHttps(e.target.value);
                      if (normalized !== e.target.value) updateRow(index, { url: normalized });
                    }}
                    placeholder={t('references.urlPlaceholder')}
                    disabled={disabled}
                    aria-label={t('references.urlLabel')}
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? `ref-row-${index}-url-error` : undefined}
                    className="flex-1 h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                  {onFileUpload && (
                    <RowAttachFileButton
                      accept={uploadAccept}
                      disabled={disabled}
                      uploading={Boolean(uploadingRows[index])}
                      ariaLabel={t('references.attachFile')}
                      onFile={file => handleFileSelected(index, file)}
                    />
                  )}
                </div>
                {urlError && (
                  <p id={`ref-row-${index}-url-error`} className="text-caption text-destructive" aria-live="polite">
                    {urlError}
                  </p>
                )}
                <input
                  type="text"
                  value={row.description}
                  onChange={e => updateRow(index, { description: e.target.value })}
                  placeholder={t('references.descriptionPlaceholder')}
                  disabled={disabled}
                  aria-label={t('references.descriptionLabel')}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPendingDeleteIndex(index)}
                disabled={disabled}
                aria-label={t('references.removeRow')}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={disabled}>
        <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
        {t('references.addRow')}
      </Button>

      <ConfirmationDialog
        open={pendingDeleteIndex !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteIndex(null);
        }}
        title={t('references.removeConfirm.title')}
        description={t('references.removeConfirm.description', {
          name: pendingDeleteRow?.title.trim() || pendingDeleteRow?.url || t('references.removeConfirm.unnamed'),
        })}
        confirmLabel={t('references.removeConfirm.confirm')}
        cancelLabel={t('dialogs.cancel')}
        variant="destructive"
        onConfirm={() => {
          if (pendingDeleteIndex !== null) removeRow(pendingDeleteIndex);
          setPendingDeleteIndex(null);
        }}
      />
    </div>
  );
}

type RowAttachFileButtonProps = {
  accept?: string;
  disabled?: boolean;
  uploading: boolean;
  ariaLabel: string;
  onFile: (file: File | undefined) => void;
};

function RowAttachFileButton({ accept, disabled, uploading, ariaLabel, onFile }: RowAttachFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || uploading}
        aria-busy={uploading}
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
        className="shrink-0"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Paperclip className="size-4" aria-hidden="true" />
        )}
      </Button>
    </>
  );
}

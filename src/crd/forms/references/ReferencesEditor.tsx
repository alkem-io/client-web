import { Loader2, Paperclip, Plus, Trash2 } from 'lucide-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

/**
 * Canonical reference row shared by every CRD form that edits a list of links
 * (profiles, callouts, innovation packs, …). Mirrors the GraphQL `Reference`
 * shape (`name` / `uri`). Consumers map their local field names to this at the
 * boundary.
 */
export type ReferenceRow = {
  /** Server id on edit; undefined for rows the user just added. */
  id?: string;
  name: string;
  uri: string;
  description?: string;
};

type ReferencesEditorProps = {
  rows: ReferenceRow[];
  onChange: (rows: ReferenceRow[]) => void;
  /** Per-row error messages keyed by `${index}.name` / `${index}.uri` (any subset). */
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  /** Heading override; defaults to the shared `references.heading` label. */
  label?: string;
  /**
   * Optional file-attach integration. When provided, each row exposes a paperclip
   * button that opens a file picker; the resolved URL is written into `row.uri`.
   * The connector layer (outside `src/crd/`) owns the upload mutation + storage
   * bucket config + user-facing errors. Returning `null` means the upload failed —
   * the editor leaves the row unchanged and the connector has already notified.
   */
  onFileUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the file picker (extension list, e.g. ".pdf,.png"). */
  uploadAccept?: string;
};

const createEmptyRow = (): ReferenceRow => ({ name: '', uri: '', description: '' });

/**
 * Shared references editor. Each row is (name, URL, description). Empty rows are
 * filtered out by the consumer's mapper on submit. Deletion goes through
 * `ConfirmationDialog` (CRD rule 9) since a saved removal has no client-side undo.
 */
export function ReferencesEditor({
  rows,
  onChange,
  errors,
  disabled,
  label,
  onFileUpload,
  uploadAccept,
}: ReferencesEditorProps) {
  const { t } = useTranslation('crd-common');
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [uploadingRows, setUploadingRows] = useState<Record<number, boolean>>({});
  // Mirror of `rows` for post-await reads: a file upload takes seconds, and if
  // the user types into any row meanwhile the closure-captured `rows` is stale
  // by the time `await onFileUpload` resolves. Reading from the ref avoids
  // reverting concurrent keystrokes.
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const updateRow = (index: number, patch: Partial<ReferenceRow>) => {
    onChange(rowsRef.current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleFileSelected = async (index: number, file: File | undefined) => {
    if (!file || !onFileUpload) return;
    setUploadingRows(prev => ({ ...prev, [index]: true }));
    try {
      const uri = await onFileUpload(file);
      if (!uri) return;
      const current = rowsRef.current[index];
      const nameEmpty = !current?.name.trim();
      const filenameBase = file.name.replace(/\.[^./\\]+$/, '').trim();
      const patch: Partial<ReferenceRow> = { uri };
      if (nameEmpty && filenameBase) patch.name = filenameBase;
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
      <Label className="text-body-emphasis text-foreground">{label ?? t('references.heading')}</Label>

      {rows.length === 0 && <p className="text-caption text-muted-foreground italic">{t('references.empty')}</p>}

      {rows.map((row, index) => {
        const nameError = errors?.[`${index}.name`];
        const uriError = errors?.[`${index}.uri`];
        return (
          <div key={row.id ?? index} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  value={row.name}
                  onChange={e => updateRow(index, { name: e.target.value })}
                  placeholder={t('references.namePlaceholder')}
                  disabled={disabled}
                  aria-label={t('references.nameLabel')}
                  aria-invalid={!!nameError}
                />
                {nameError && (
                  <p className="text-caption text-destructive" aria-live="polite">
                    {nameError}
                  </p>
                )}
                <div className="flex items-start gap-2">
                  <Input
                    type="url"
                    value={row.uri}
                    onChange={e => updateRow(index, { uri: e.target.value })}
                    onBlur={e => {
                      const normalized = ensureHttps(e.target.value);
                      if (normalized !== e.target.value) updateRow(index, { uri: normalized });
                    }}
                    placeholder={t('references.uriPlaceholder')}
                    disabled={disabled}
                    aria-label={t('references.uriLabel')}
                    aria-invalid={!!uriError}
                    className="flex-1"
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
                {uriError && (
                  <p className="text-caption text-destructive" aria-live="polite">
                    {uriError}
                  </p>
                )}
                <Input
                  value={row.description ?? ''}
                  onChange={e => updateRow(index, { description: e.target.value })}
                  placeholder={t('references.descriptionPlaceholder')}
                  disabled={disabled}
                  aria-label={t('references.descriptionLabel')}
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
          name: pendingDeleteRow?.name.trim() || pendingDeleteRow?.uri || t('references.removeConfirm.unnamed'),
        })}
        confirmLabel={t('references.removeConfirm.confirm')}
        cancelLabel={t('cancel')}
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

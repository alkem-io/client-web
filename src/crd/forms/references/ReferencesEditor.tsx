import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { FileSelectionStatus } from '@/crd/forms/references/FileSelectionStatus';
import { RowAttachFileButton } from '@/crd/forms/references/RowAttachFileButton';
import { useRowFileUploads } from '@/crd/forms/references/useRowFileUploads';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import type { RowFileUpload } from '@/crd/lib/fileSelection';
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
  /** Omit the heading — for hosts that already title the editor (e.g. a settings section card). */
  hideLabel?: boolean;
  /**
   * Optional file-attach integration. When provided, each row exposes a paperclip
   * button that opens a file picker; the resolved URL is written into `row.uri`.
   * The connector layer (outside `src/crd/`) owns the upload mutation + storage
   * bucket config + user-facing errors. Returning `null` means the upload failed —
   * the editor leaves the row unchanged and the connector has already notified.
   * Picking several files adds one row per file, uploading them `{ silent: true }`
   * and reporting failures in the editor itself.
   */
  onFileUpload?: RowFileUpload;
  /** `accept` attribute for the file picker (extension list, e.g. ".pdf,.png"). */
  uploadAccept?: string;
};

const createEmptyRow = (): ReferenceRow => ({ name: '', uri: '', description: '' });

const fileNameBase = (file: File) => file.name.replace(/\.[^./\\]+$/, '').trim();

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
  hideLabel = false,
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
  const uploads = useRowFileUploads(onFileUpload, uploadAccept);

  // Every write refreshes the mirror first, so two uploads settling before the next render each
  // build on the other's result.
  const commit = (next: ReferenceRow[]) => {
    rowsRef.current = next;
    onChange(next);
  };

  const updateRow = (index: number, patch: Partial<ReferenceRow>) => {
    commit(rowsRef.current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleFileSelected = async (index: number, file: File | undefined) => {
    if (!file || !onFileUpload) return;
    setUploadingRows(prev => ({ ...prev, [index]: true }));
    try {
      const uri = await onFileUpload(file);
      if (!uri) return;
      const current = rowsRef.current[index];
      const nameEmpty = !current?.name.trim();
      const filenameBase = fileNameBase(file);
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

  // A result fills the clicked row only while that row still holds its pick-time values and an
  // empty URL; otherwise it is appended as a row of its own. Rows are compared by value because
  // hosts hand in freshly mapped row objects on every render.
  const handleFilesSelected = (index: number, files: File[]) => {
    const picked = rowsRef.current[index];
    uploads.uploadMany(files, (file, uri) => {
      const current = rowsRef.current[index];
      const name = fileNameBase(file);
      const fillsPicked =
        picked &&
        current &&
        !current.uri.trim() &&
        current.name === picked.name &&
        (current.description ?? '') === (picked.description ?? '');
      if (fillsPicked) {
        updateRow(index, current.name.trim() || !name ? { uri } : { uri, name });
      } else {
        commit([...rowsRef.current, { name, uri, description: '' }]);
      }
    });
  };

  const removeRow = (index: number) => {
    commit(rowsRef.current.filter((_, i) => i !== index));
  };

  const addRow = () => {
    commit([...rowsRef.current, createEmptyRow()]);
  };

  const pendingDeleteRow = pendingDeleteIndex !== null ? rows[pendingDeleteIndex] : undefined;

  return (
    <div className="space-y-3">
      {!hideLabel && <Label className="text-body-emphasis text-foreground">{label ?? t('references.heading')}</Label>}

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
                  aria-describedby={nameError ? `ref-row-${index}-name-error` : undefined}
                />
                {nameError && (
                  <p id={`ref-row-${index}-name-error`} className="text-caption text-destructive" aria-live="polite">
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
                    aria-describedby={uriError ? `ref-row-${index}-uri-error` : undefined}
                    className="flex-1"
                  />
                  {onFileUpload && (
                    <RowAttachFileButton
                      accept={uploadAccept}
                      disabled={disabled}
                      uploading={Boolean(uploadingRows[index])}
                      ariaLabel={t('references.attachFile')}
                      onFile={file => handleFileSelected(index, file)}
                      onFiles={files => handleFilesSelected(index, files)}
                    />
                  )}
                </div>
                {uriError && (
                  <p id={`ref-row-${index}-uri-error`} className="text-caption text-destructive" aria-live="polite">
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

      <FileSelectionStatus pending={uploads.pending} leftOut={uploads.leftOut} onDismiss={uploads.dismiss} />

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

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { FileSelectionStatus } from '@/crd/forms/references/FileSelectionStatus';
import { RowAttachFileButton } from '@/crd/forms/references/RowAttachFileButton';
import { useRowFileUploads } from '@/crd/forms/references/useRowFileUploads';
import { useRowsCommit } from '@/crd/forms/references/useRowsCommit';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { fileNameBase, type RowFileUpload } from '@/crd/lib/fileSelection';
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [uploadingIds, setUploadingIds] = useState<ReadonlySet<string>>(() => new Set());
  const { rowIds, rowById, updateRow, removeRow, appendRow } = useRowsCommit(rows, onChange);
  const uploads = useRowFileUploads(onFileUpload);
  // The row a multi-file pick fills: the clicked row, while its URL is empty and nothing has changed it since the pick.
  const fillableId = useRef<string | null>(null);
  const anyRowUploading = uploadingIds.size > 0;

  const editRow = (id: string, patch: Partial<ReferenceRow>) => {
    if (fillableId.current === id) fillableId.current = null;
    updateRow(id, patch);
  };

  const handleFileSelected = async (id: string, file: File | undefined) => {
    if (!file || !onFileUpload) return;
    setUploadingIds(prev => new Set(prev).add(id));
    try {
      const uri = await onFileUpload(file);
      const current = rowById(id);
      if (!uri || !current) return;
      const name = fileNameBase(file);
      updateRow(id, current.name.trim() || !name ? { uri } : { uri, name });
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleFilesSelected = (id: string, files: File[]) => {
    fillableId.current = rowById(id)?.uri.trim() ? null : id;
    uploads.uploadMany(files, (file, uri) => {
      const name = fileNameBase(file);
      const fillable = fillableId.current === id ? rowById(id) : undefined;
      if (fillable) {
        fillableId.current = null;
        updateRow(id, fillable.name.trim() || !name ? { uri } : { uri, name });
      } else {
        appendRow({ name, uri, description: '' });
      }
    });
  };

  const pendingDeleteRow = pendingDeleteId !== null ? rows[rowIds.indexOf(pendingDeleteId)] : undefined;

  return (
    <div className="space-y-3">
      {!hideLabel && <Label className="text-body-emphasis text-foreground">{label ?? t('references.heading')}</Label>}

      {rows.length === 0 && <p className="text-caption text-muted-foreground italic">{t('references.empty')}</p>}

      {rows.map((row, index) => {
        const id = rowIds[index];
        const nameError = errors?.[`${index}.name`];
        const uriError = errors?.[`${index}.uri`];
        return (
          <div key={id} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  value={row.name}
                  onChange={e => editRow(id, { name: e.target.value })}
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
                    onChange={e => editRow(id, { uri: e.target.value })}
                    onBlur={e => {
                      const normalized = ensureHttps(e.target.value);
                      if (normalized !== e.target.value) editRow(id, { uri: normalized });
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
                      disabled={disabled || uploads.busy || anyRowUploading}
                      uploading={uploadingIds.has(id)}
                      ariaLabel={t('references.attachFile')}
                      onFile={file => handleFileSelected(id, file)}
                      onFiles={files => handleFilesSelected(id, files)}
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
                  onChange={e => editRow(id, { description: e.target.value })}
                  placeholder={t('references.descriptionPlaceholder')}
                  disabled={disabled}
                  aria-label={t('references.descriptionLabel')}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPendingDeleteId(id)}
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

      <Button type="button" variant="outline" size="sm" onClick={() => appendRow(createEmptyRow())} disabled={disabled}>
        <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
        {t('references.addRow')}
      </Button>

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteId(null);
        }}
        title={t('references.removeConfirm.title')}
        description={t('references.removeConfirm.description', {
          name: pendingDeleteRow?.name.trim() || pendingDeleteRow?.uri || t('references.removeConfirm.unnamed'),
        })}
        confirmLabel={t('references.removeConfirm.confirm')}
        cancelLabel={t('cancel')}
        variant="destructive"
        onConfirm={() => {
          if (pendingDeleteId !== null) removeRow(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}

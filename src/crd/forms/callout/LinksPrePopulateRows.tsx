import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinkRow } from '@/crd/forms/callout/types';
import { FileSelectionStatus } from '@/crd/forms/references/FileSelectionStatus';
import { RowAttachFileButton } from '@/crd/forms/references/RowAttachFileButton';
import { useRowFileUploads } from '@/crd/forms/references/useRowFileUploads';
import { useRowsCommit } from '@/crd/forms/references/useRowsCommit';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { fileNameBase, type RowFileUpload } from '@/crd/lib/fileSelection';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';

type LinksPrePopulateRowsProps = {
  rows: LinkRow[];
  onChange: (rows: LinkRow[]) => void;
  /** Optional map keyed by `prePopulateLinkRows.<index>.title` for title-required errors. */
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  /**
   * Optional file-attach integration. When provided, each row exposes a
   * paperclip button that opens a file picker; the resolved URL is written
   * into `row.url`. The connector layer (which lives outside `src/crd/`) owns
   * the upload mutation + storage-bucket config + user-facing errors. Returning
   * `null` means the upload failed — the editor leaves the row unchanged and
   * the connector is expected to have already notified the user. This is what
   * makes the response type "Links **& Files**" — identical affordance to the
   * References editor. Picking several files adds one row per file.
   */
  onFileUpload?: RowFileUpload;
  /** `accept` attribute for the file picker (extension list, e.g. ".pdf,.png"). */
  uploadAccept?: string;
};

const createEmptyRow = (): LinkRow => ({ title: '', url: '', description: '' });

/**
 * "Pre-populate collection" editor shown inside the Links & Files response
 * panel on **create** mode. Hidden on edit (existing link contributions are
 * managed via the callout detail dialog — spec US12 acc. #6 / D19).
 */
export function LinksPrePopulateRows({
  rows,
  onChange,
  errors,
  disabled,
  onFileUpload,
  uploadAccept,
}: LinksPrePopulateRowsProps) {
  const { t } = useTranslation('crd-space');
  const [uploadingIds, setUploadingIds] = useState<ReadonlySet<string>>(() => new Set());
  const { rowIds, rowById, updateRow, removeRow, appendRow } = useRowsCommit(rows, onChange);
  const uploads = useRowFileUploads(onFileUpload);
  // The row a multi-file pick fills: the clicked row, while its URL is empty and nothing has changed it since the pick.
  const fillableId = useRef<string | null>(null);
  const anyRowUploading = uploadingIds.size > 0;

  const editRow = (id: string, patch: Partial<LinkRow>) => {
    if (fillableId.current === id) fillableId.current = null;
    updateRow(id, patch);
  };

  const handleFileSelected = async (id: string, file: File | undefined) => {
    if (!file || !onFileUpload) return;
    setUploadingIds(prev => new Set(prev).add(id));
    try {
      const url = await onFileUpload(file);
      const current = rowById(id);
      if (!url || !current) return;
      const title = fileNameBase(file);
      updateRow(id, current.title.trim() || !title ? { url } : { url, title });
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleFilesSelected = (id: string, files: File[]) => {
    fillableId.current = rowById(id)?.url.trim() ? null : id;
    uploads.uploadMany(files, (file, url) => {
      const title = fileNameBase(file);
      const fillable = fillableId.current === id ? rowById(id) : undefined;
      if (fillable) {
        fillableId.current = null;
        updateRow(id, fillable.title.trim() || !title ? { url } : { url, title });
      } else {
        appendRow({ title, url, description: '' });
      }
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-body-emphasis text-foreground">{t('contributionSettings.prePopulate.heading')}</Label>
      <p className="text-caption text-muted-foreground">{t('contributionSettings.prePopulate.description')}</p>

      {rows.length === 0 && (
        <p className="text-caption text-muted-foreground italic">{t('contributionSettings.prePopulate.empty')}</p>
      )}

      {rows.map((row, index) => {
        const id = rowIds[index];
        const titleError = errors?.[`prePopulateLinkRows.${index}.title`];
        const urlError = errors?.[`prePopulateLinkRows.${index}.url`];
        return (
          <div key={id} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={row.title}
                  onChange={e => editRow(id, { title: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.titlePlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.titleLabel')}
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? `link-row-${index}-title-error` : undefined}
                  className="w-full h-9 px-3 border border-border rounded-md bg-input-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                {titleError && (
                  <p id={`link-row-${index}-title-error`} className="text-caption text-destructive" aria-live="polite">
                    {titleError}
                  </p>
                )}
                <div className="flex items-start gap-2">
                  <input
                    type="url"
                    value={row.url}
                    onChange={e => editRow(id, { url: e.target.value })}
                    onBlur={e => {
                      const normalized = ensureHttps(e.target.value);
                      if (normalized !== e.target.value) editRow(id, { url: normalized });
                    }}
                    placeholder={t('contributionSettings.prePopulate.urlPlaceholder')}
                    disabled={disabled}
                    aria-label={t('contributionSettings.prePopulate.urlLabel')}
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? `link-row-${index}-url-error` : undefined}
                    className="flex-1 h-9 px-3 border border-border rounded-md bg-input-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                  {onFileUpload && (
                    <RowAttachFileButton
                      accept={uploadAccept}
                      disabled={disabled || uploads.busy || anyRowUploading}
                      uploading={uploadingIds.has(id)}
                      ariaLabel={t('contributionSettings.prePopulate.attachFile')}
                      onFile={file => handleFileSelected(id, file)}
                      onFiles={files => handleFilesSelected(id, files)}
                    />
                  )}
                </div>
                {urlError && (
                  <p id={`link-row-${index}-url-error`} className="text-caption text-destructive" aria-live="polite">
                    {urlError}
                  </p>
                )}
                <input
                  type="text"
                  value={row.description}
                  onChange={e => editRow(id, { description: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.descriptionPlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.descriptionLabel')}
                  className="w-full h-9 px-3 border border-border rounded-md bg-input-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(id)}
                disabled={disabled}
                aria-label={t('contributionSettings.prePopulate.removeRow')}
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
        {t('contributionSettings.prePopulate.addRow')}
      </Button>
    </div>
  );
}

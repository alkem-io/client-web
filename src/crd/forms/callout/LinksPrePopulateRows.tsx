import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinkRow } from '@/crd/forms/callout/types';
import { RowAttachFileButton } from '@/crd/forms/references/RowAttachFileButton';
import { ensureHttps } from '@/crd/lib/ensureHttps';
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
   * References editor.
   */
  onFileUpload?: (file: File) => Promise<string | null>;
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
  // Per-row upload spinner state, keyed by row index.
  const [uploadingRows, setUploadingRows] = useState<Record<number, boolean>>({});
  // Mirror of `rows` for post-await reads. A file upload takes seconds; if the
  // user types into any row while it's in flight, the closure-captured `rows`
  // is stale by the time `await onFileUpload` resolves. Reading from the ref
  // avoids reverting concurrent keystrokes. (Same pattern as ReferencesEditor.)
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const updateRow = (index: number, patch: Partial<LinkRow>) => {
    onChange(rowsRef.current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleFileSelected = async (index: number, file: File | undefined) => {
    if (!file || !onFileUpload) return;
    setUploadingRows(prev => ({ ...prev, [index]: true }));
    try {
      const url = await onFileUpload(file);
      if (!url) return;
      const current = rowsRef.current[index];
      const titleEmpty = !current?.title.trim();
      const filenameBase = file.name.replace(/\.[^./\\]+$/, '').trim();
      const patch: Partial<LinkRow> = { url };
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

  return (
    <div className="space-y-3">
      <Label className="text-body-emphasis text-foreground">{t('contributionSettings.prePopulate.heading')}</Label>
      <p className="text-caption text-muted-foreground">{t('contributionSettings.prePopulate.description')}</p>

      {rows.length === 0 && (
        <p className="text-caption text-muted-foreground italic">{t('contributionSettings.prePopulate.empty')}</p>
      )}

      {rows.map((row, index) => {
        const titleError = errors?.[`prePopulateLinkRows.${index}.title`];
        const urlError = errors?.[`prePopulateLinkRows.${index}.url`];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are append-and-delete; no stable id exists in the row model
          <div key={index} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={row.title}
                  onChange={e => updateRow(index, { title: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.titlePlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.titleLabel')}
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? `link-row-${index}-title-error` : undefined}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
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
                    onChange={e => updateRow(index, { url: e.target.value })}
                    onBlur={e => {
                      const normalized = ensureHttps(e.target.value);
                      if (normalized !== e.target.value) updateRow(index, { url: normalized });
                    }}
                    placeholder={t('contributionSettings.prePopulate.urlPlaceholder')}
                    disabled={disabled}
                    aria-label={t('contributionSettings.prePopulate.urlLabel')}
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? `link-row-${index}-url-error` : undefined}
                    className="flex-1 h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                  {onFileUpload && (
                    <RowAttachFileButton
                      accept={uploadAccept}
                      disabled={disabled}
                      uploading={Boolean(uploadingRows[index])}
                      ariaLabel={t('contributionSettings.prePopulate.attachFile')}
                      onFile={file => handleFileSelected(index, file)}
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
                  onChange={e => updateRow(index, { description: e.target.value })}
                  placeholder={t('contributionSettings.prePopulate.descriptionPlaceholder')}
                  disabled={disabled}
                  aria-label={t('contributionSettings.prePopulate.descriptionLabel')}
                  className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(index)}
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

      <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={disabled}>
        <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
        {t('contributionSettings.prePopulate.addRow')}
      </Button>
    </div>
  );
}

import { Plus, Trash2, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { FileSelectionStatus } from '@/crd/forms/references/FileSelectionStatus';
import { RowAttachFileButton } from '@/crd/forms/references/RowAttachFileButton';
import { useRowFileUploads } from '@/crd/forms/references/useRowFileUploads';
import type { RowFileUpload } from '@/crd/lib/fileSelection';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';

export type LinkContributionFormValues = {
  url: string;
  displayName: string;
  description: string;
};

type CommonProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  /** When provided, the URL row shows a paperclip that uploads a file and uses its URL and name.
   *  Create mode accepts several files at once, one row per file. */
  onFileUpload?: RowFileUpload;
  /** `accept` attribute for the file picker (extension list, e.g. ".pdf,.png"). */
  uploadAccept?: string;
  /** Static slot rendered below the URL input (e.g. terms-and-conditions helper text). */
  urlHelperSlot?: ReactNode;
};

type CreateProps = CommonProps & {
  mode: 'create';
  onSubmit: (rows: LinkContributionFormValues[]) => void;
};

type EditProps = CommonProps & {
  mode: 'edit';
  initialValues?: Partial<LinkContributionFormValues>;
  /** When provided, renders a Delete button in the footer. */
  onDelete?: () => void;
  onSubmit: (values: LinkContributionFormValues) => void;
};

type LinkContributionDialogProps = CreateProps | EditProps;

type Row = {
  id: string;
  url: string;
  displayName: string;
  description: string;
  urlError?: string;
  nameError?: string;
};

const URL_RE = /^https?:\/\/[^\s]+$/i;

let rowIdCounter = 0;
const newRowId = () => {
  rowIdCounter += 1;
  return `link-row-${rowIdCounter}`;
};

export function LinkContributionDialog(props: LinkContributionDialogProps) {
  if (props.mode === 'edit') {
    return <LinkEditDialog {...props} />;
  }
  return <LinkCreateDialog {...props} />;
}

function LinkCreateDialog({
  open,
  onOpenChange,
  saving,
  onFileUpload,
  uploadAccept,
  urlHelperSlot,
  onSubmit,
}: CreateProps) {
  const { t } = useTranslation('crd-space');
  const [rows, setRows] = useState<Row[]>(() => [
    { id: newRowId(), url: '', displayName: t('callout.linkDefaultName'), description: '' },
  ]);
  const uploads = useRowFileUploads(onFileUpload, uploadAccept);
  const contentRef = useRef<HTMLDivElement>(null);
  const justAddedRowId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setRows([{ id: newRowId(), url: '', displayName: t('callout.linkDefaultName'), description: '' }]);
    uploads.dismiss();
  }, [open, t]);

  useEffect(() => {
    if (!justAddedRowId.current) return;
    const node = contentRef.current?.querySelector(`[data-row-id="${justAddedRowId.current}"]`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    justAddedRowId.current = undefined;
  }, [rows.length]);

  const isDirty = rows.some(r => r.url.trim() || r.description.trim());

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => {
      uploads.cancel();
      onOpenChange(false);
    },
    blockClose: saving,
  });

  // Rows appear only as their uploads finish, so Create waits for every upload.
  const uploading = uploads.uploadingRows.length > 0 || uploads.pending.length > 0;

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleFile = (rowId: string, file: File | undefined) => {
    if (!file) return;
    void uploads.uploadOne(rowId, file, url =>
      updateRow(rowId, { url, urlError: undefined, displayName: file.name, nameError: undefined })
    );
  };

  // A result fills the clicked row only while no one-file pick holds it and it is still as it was at
  // pick time with an empty URL; otherwise it gets a row of its own.
  const handleFiles = (picked: Row, files: File[]) => {
    uploads.uploadMany(files, (file, url) => {
      const appendedId = newRowId();
      const reserved = uploads.isReserved(picked.id);
      setRows(prev => {
        const target = prev.find(r => r.id === picked.id);
        const fillsPicked =
          !reserved &&
          target &&
          !target.url.trim() &&
          target.displayName === picked.displayName &&
          target.description === picked.description;
        if (fillsPicked) {
          return prev.map(r =>
            r.id === picked.id ? { ...r, url, urlError: undefined, displayName: file.name, nameError: undefined } : r
          );
        }
        return [...prev, { id: appendedId, url, displayName: file.name, description: '' }];
      });
    });
  };

  const removeRow = (id: string) => {
    setRows(prev => (prev.length <= 1 ? prev : prev.filter(r => r.id !== id)));
  };

  const addRow = () => {
    const id = newRowId();
    const indexLabel = rows.length;
    setRows(prev => [
      ...prev,
      {
        id,
        url: '',
        displayName: t('callout.linkDefaultNameNumbered', { count: indexLabel + 1 }),
        description: '',
      },
    ]);
    justAddedRowId.current = id;
  };

  const handleSubmit = () => {
    let valid = true;
    const nextRows = rows.map(r => {
      const trimmedUrl = r.url.trim();
      const trimmedName = r.displayName.trim();
      let urlError: string | undefined;
      let nameError: string | undefined;
      if (!URL_RE.test(trimmedUrl)) {
        urlError = t('callout.linkUrlInvalid');
        valid = false;
      }
      if (!trimmedName) {
        nameError = t('callout.linkNameRequired');
        valid = false;
      }
      return { ...r, urlError, nameError };
    });
    if (!valid) {
      setRows(nextRows);
      return;
    }
    onSubmit(
      nextRows.map(r => ({
        url: r.url.trim(),
        displayName: r.displayName.trim(),
        description: r.description.trim(),
      }))
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('callout.createLink')}</DialogTitle>
          </DialogHeader>
          <div ref={contentRef} className="flex flex-col gap-6 overflow-y-auto pr-1">
            {rows.map((row, index) => (
              <LinkFormRow
                key={row.id}
                row={row}
                index={index}
                canRemove={rows.length > 1}
                saving={saving}
                attachButton={
                  onFileUpload && (
                    <RowAttachFileButton
                      accept={uploadAccept}
                      disabled={saving}
                      uploading={uploads.uploadingRows.includes(row.id)}
                      ariaLabel={t('contributionSettings.prePopulate.attachFile')}
                      onFile={file => handleFile(row.id, file)}
                      onFiles={files => handleFiles(row, files)}
                    />
                  )
                }
                urlHelperSlot={urlHelperSlot}
                onChange={patch => updateRow(row.id, patch)}
                onRemove={() => removeRow(row.id)}
              />
            ))}
            <FileSelectionStatus pending={uploads.pending} leftOut={uploads.leftOut} onDismiss={uploads.dismiss} />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={addRow} disabled={saving} className="gap-2">
                <Plus className="size-4" aria-hidden="true" />
                {t('callout.linkAddAnother')}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={requestClose} disabled={saving}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={saving || uploading} aria-busy={saving}>
              {t('callout.linkCreate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}

function LinkFormRow({
  row,
  index,
  canRemove,
  saving,
  attachButton,
  urlHelperSlot,
  onChange,
  onRemove,
}: {
  row: Row;
  index: number;
  canRemove: boolean;
  saving?: boolean;
  attachButton?: ReactNode;
  urlHelperSlot?: ReactNode;
  onChange: (patch: Partial<Row>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('crd-space');
  const urlId = `crd-link-row-${row.id}-url`;
  const nameId = `crd-link-row-${row.id}-name`;
  const descId = `crd-link-row-${row.id}-desc`;

  return (
    <div data-row-id={row.id} className="flex flex-col gap-3 border border-border rounded-lg p-4 relative">
      <div className="flex items-center justify-between">
        <span className="text-caption uppercase text-muted-foreground">{`#${index + 1}`}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          disabled={!canRemove || saving}
          onClick={onRemove}
          aria-label={t('callout.linkRemoveRow')}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={nameId} className="text-caption text-muted-foreground">
          {t('callout.linkNameLabel')}
        </label>
        <Input
          id={nameId}
          value={row.displayName}
          onChange={e => onChange({ displayName: e.target.value, nameError: undefined })}
          placeholder={t('callout.linkNamePlaceholder')}
          disabled={saving}
          className={cn(row.nameError && 'border-destructive')}
          aria-invalid={Boolean(row.nameError)}
        />
        {row.nameError && <p className="text-caption text-destructive">{row.nameError}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={urlId} className="text-caption text-muted-foreground">
          {t('callout.linkUrlLabel')}
        </label>
        <div className="flex items-stretch gap-1">
          <Input
            id={urlId}
            type="url"
            value={row.url}
            onChange={e => onChange({ url: e.target.value, urlError: undefined })}
            placeholder={t('callout.linkUrlPlaceholder')}
            disabled={saving}
            className={cn('flex-1', row.urlError && 'border-destructive')}
            aria-invalid={Boolean(row.urlError)}
          />
          {attachButton}
        </div>
        {urlHelperSlot && <div className="text-caption text-muted-foreground">{urlHelperSlot}</div>}
        {row.urlError && <p className="text-caption text-destructive">{row.urlError}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={descId} className="text-caption text-muted-foreground">
          {t('callout.linkDescriptionLabel')}
        </label>
        <textarea
          id={descId}
          value={row.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder={t('callout.linkDescriptionPlaceholder')}
          disabled={saving}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-control resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
      </div>
    </div>
  );
}

function LinkEditDialog({
  open,
  onOpenChange,
  initialValues,
  saving,
  onDelete,
  onSubmit,
  onFileUpload,
  uploadAccept,
  urlHelperSlot,
}: EditProps) {
  const { t } = useTranslation('crd-space');
  const [url, setUrl] = useState(initialValues?.url ?? '');
  const [displayName, setDisplayName] = useState(initialValues?.displayName ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [urlError, setUrlError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  // Renewed on every open, so an upload that resolves after the dialog was reopened (possibly for
  // another link) can tell it no longer belongs to this form.
  const rowIdRef = useRef<string>(newRowId());

  useEffect(() => {
    if (!open) return;
    rowIdRef.current = newRowId();
    setUrl(initialValues?.url ?? '');
    setDisplayName(initialValues?.displayName ?? '');
    setDescription(initialValues?.description ?? '');
    setUrlError(undefined);
    setNameError(undefined);
    setUploading(false);
  }, [open, initialValues?.url, initialValues?.displayName, initialValues?.description]);

  const handleFile = async (file: File | undefined) => {
    if (!file || !onFileUpload) return;
    const openCycle = rowIdRef.current;
    setUploading(true);
    try {
      const uploadedUrl = await onFileUpload(file);
      if (uploadedUrl && rowIdRef.current === openCycle) {
        setUrl(uploadedUrl);
        setUrlError(undefined);
        setDisplayName(file.name);
        setNameError(undefined);
      }
    } finally {
      if (rowIdRef.current === openCycle) setUploading(false);
    }
  };

  const isDirty =
    url !== (initialValues?.url ?? '') ||
    displayName !== (initialValues?.displayName ?? '') ||
    description !== (initialValues?.description ?? '');

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => onOpenChange(false),
    blockClose: saving,
  });

  const handleSubmit = () => {
    const trimmedUrl = url.trim();
    const trimmedName = displayName.trim();
    let valid = true;
    if (!URL_RE.test(trimmedUrl)) {
      setUrlError(t('callout.linkUrlInvalid'));
      valid = false;
    } else {
      setUrlError(undefined);
    }
    if (!trimmedName) {
      setNameError(t('callout.linkNameRequired'));
      valid = false;
    } else {
      setNameError(undefined);
    }
    if (!valid) return;
    onSubmit({ url: trimmedUrl, displayName: trimmedName, description: description.trim() });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('callout.editLink')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-1">
              <label htmlFor="crd-link-name" className="text-caption text-muted-foreground">
                {t('callout.linkNameLabel')}
              </label>
              <Input
                id="crd-link-name"
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value);
                  setNameError(undefined);
                }}
                placeholder={t('callout.linkNamePlaceholder')}
                disabled={saving}
                autoFocus={true}
                className={cn(nameError && 'border-destructive')}
                aria-invalid={Boolean(nameError)}
              />
              {nameError && <p className="text-caption text-destructive">{nameError}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="crd-link-url" className="text-caption text-muted-foreground">
                {t('callout.linkUrlLabel')}
              </label>
              <div className="flex items-stretch gap-1">
                <Input
                  id="crd-link-url"
                  type="url"
                  value={url}
                  onChange={e => {
                    setUrl(e.target.value);
                    setUrlError(undefined);
                  }}
                  placeholder={t('callout.linkUrlPlaceholder')}
                  disabled={saving}
                  className={cn('flex-1', urlError && 'border-destructive')}
                  aria-invalid={Boolean(urlError)}
                />
                {onFileUpload && (
                  <RowAttachFileButton
                    accept={uploadAccept}
                    disabled={saving}
                    uploading={uploading}
                    ariaLabel={t('contributionSettings.prePopulate.attachFile')}
                    onFile={handleFile}
                  />
                )}
              </div>
              {urlHelperSlot && <div className="text-caption text-muted-foreground">{urlHelperSlot}</div>}
              {urlError && <p className="text-caption text-destructive">{urlError}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="crd-link-description" className="text-caption text-muted-foreground">
                {t('callout.linkDescriptionLabel')}
              </label>
              <textarea
                id="crd-link-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('callout.linkDescriptionPlaceholder')}
                disabled={saving}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-control resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
          </div>
          <DialogFooter className="shrink-0 sm:justify-between">
            {onDelete ? (
              <Button
                variant="ghost"
                onClick={onDelete}
                disabled={saving}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-1.5 size-4" aria-hidden="true" />
                {t('callout.linkDelete')}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={requestClose} disabled={saving}>
                {t('dialogs.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={saving} aria-busy={saving}>
                {t('callout.linkSave')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}

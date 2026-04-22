import { Copy, ImageIcon, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';

export type TemplatePreviewData = {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  tags: string[];
  thumbnailUrl: string | null;
  /** Type-specific body preview (e.g. post default description markdown). Optional. */
  bodyMarkdown?: string;
  /** Label for the body preview section ("Default post description", etc). */
  bodyLabel?: string;
};

export type TemplatePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  template: TemplatePreviewData | null;
  canEdit: boolean;
  canDuplicate: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  duplicating?: boolean;
};

/**
 * Read-only preview of a template, matching MUI `PreviewTemplateDialog`'s role.
 * Action row mirrors MUI: Close + (optional) Edit + (optional) Duplicate.
 */
export function TemplatePreviewDialog({
  open,
  onOpenChange,
  loading = false,
  template,
  canEdit,
  canDuplicate,
  onEdit,
  onDuplicate,
  duplicating = false,
}: TemplatePreviewDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const handleOpenChange = (next: boolean) => {
    if (duplicating) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>
            {t('templates.preview.title', { defaultValue: 'Preview' })}
            {template ? ` — ${template.name}` : null}
          </DialogTitle>
        </DialogHeader>

        {loading || !template ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-2">
            {/* Thumbnail + profile meta */}
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  'aspect-video overflow-hidden rounded-md border bg-muted',
                  !template.thumbnailUrl && 'flex items-center justify-center'
                )}
              >
                {template.thumbnailUrl ? (
                  <img src={template.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" className="size-8 text-muted-foreground opacity-50" />
                )}
              </div>
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Right column — name / description / body */}
            <div className="flex flex-col gap-4">
              <Section label={t('templates.preview.name', { defaultValue: 'Name' })}>
                <p className="text-base font-medium">{template.name}</p>
              </Section>

              {template.tagline ? (
                <Section label={t('templates.preview.tagline', { defaultValue: 'Tagline' })}>
                  <p className="text-sm">{template.tagline}</p>
                </Section>
              ) : null}

              <Section label={t('templates.preview.description', { defaultValue: 'Description' })}>
                {template.description ? (
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{template.description}</pre>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    {t('templates.preview.noDescription', { defaultValue: 'No description provided.' })}
                  </p>
                )}
              </Section>

              {template.bodyMarkdown !== undefined && (
                <>
                  <Separator />
                  <Section label={template.bodyLabel ?? t('templates.preview.body', { defaultValue: 'Content' })}>
                    {template.bodyMarkdown.trim() ? (
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                        {template.bodyMarkdown}
                      </pre>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        {t('templates.preview.noBody', { defaultValue: 'No content.' })}
                      </p>
                    )}
                  </Section>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={duplicating}>
            {t('templates.preview.close', { defaultValue: 'Close' })}
          </Button>
          {canDuplicate && (
            <Button type="button" variant="outline" onClick={onDuplicate} disabled={duplicating || !template}>
              {duplicating ? (
                <>
                  <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                  {t('templates.preview.duplicating', { defaultValue: 'Duplicating…' })}
                </>
              ) : (
                <>
                  <Copy aria-hidden="true" className="mr-1.5 size-4" />
                  {t('templates.preview.duplicate', { defaultValue: 'Duplicate' })}
                </>
              )}
            </Button>
          )}
          {canEdit && (
            <Button type="button" onClick={onEdit} disabled={duplicating || !template}>
              <Pencil aria-hidden="true" className="mr-1.5 size-4" />
              {t('templates.preview.edit', { defaultValue: 'Edit' })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { TYPE_ICON } from './TemplateCard';
import { TemplateContentPreview } from './TemplateContentPreview';
import type { TemplatePreviewDialogProps } from './types';

export function TemplatePreviewDialog({
  open,
  onClose,
  header,
  content,
  contentLoading,
  onEdit,
}: TemplatePreviewDialogProps) {
  const { t } = useTranslation('crd-templates');
  const TypeIcon = TYPE_ICON[header.type];

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon aria-hidden="true" className="size-5 text-muted-foreground" />
            {header.name}
            <Badge variant="secondary" className="text-badge">
              {t(`manager.sections.${header.type}.title`)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="aspect-video w-full overflow-hidden rounded-md border">
          {header.bannerUrl ? (
            <img src={header.bannerUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center" style={backgroundGradient(header.color)}>
              <TypeIcon aria-hidden="true" className="size-10 text-white/70" />
            </div>
          )}
        </div>

        {header.description && <p className="text-body text-muted-foreground">{header.description}</p>}

        {content ? (
          <TemplateContentPreview content={content} loading={contentLoading} />
        ) : (
          <TemplateContentPreview content={{ type: 'post', defaultDescription: '' }} loading={true} />
        )}

        <DialogFooter>
          {onEdit && (
            <Button variant="default" onClick={onEdit}>
              <Pencil aria-hidden="true" className="size-4 mr-2" />
              {t('preview.edit')}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t('preview.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

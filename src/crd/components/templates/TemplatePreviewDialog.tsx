import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
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
      {/* Sticky-header + sticky-footer + scrollable-body layout — mirrors `TemplateFormDialog`.
          `sm:` prefix required on `sm:max-w-4xl` because `DialogContent` already sets `sm:max-w-lg`. */}
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon aria-hidden="true" className="size-5 text-muted-foreground" />
            {header.name}
            <Badge variant="secondary" className="text-badge">
              {t(`manager.sections.${header.type}.title`)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body. Single column on mobile; on md+ the template content sits to the right
            of the banner + description. The inner `TemplateContentPreview`'s built-in `max-h-[60vh]`
            ScrollArea is disabled here (`max-h-none`) so the entire dialog body scrolls as a single
            unit — one scrollbar instead of nested ones; left and right columns scroll together. */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                {header.bannerUrl ? (
                  <img src={header.bannerUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center" style={backgroundGradient(header.color)}>
                    <TypeIcon aria-hidden="true" className="size-10 text-white/70" />
                  </div>
                )}
              </div>

              {header.description && (
                <MarkdownContent content={header.description} className="text-body text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0">
              {content ? (
                <TemplateContentPreview content={content} loading={contentLoading} className="max-h-none pr-0" />
              ) : (
                <TemplateContentPreview
                  content={{ type: 'post', defaultDescription: '' }}
                  loading={true}
                  className="max-h-none pr-0"
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
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

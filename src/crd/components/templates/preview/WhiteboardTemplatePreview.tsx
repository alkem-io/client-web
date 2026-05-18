import { PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TemplateContent } from '../types';

type WhiteboardContent = Extract<TemplateContent, { type: 'whiteboard' }>;

export function WhiteboardTemplatePreview({ content }: { content: WhiteboardContent }) {
  const { t } = useTranslation('crd-templates');

  if (content.previewImageUrl) {
    return (
      <div className="overflow-hidden rounded-md border bg-muted">
        <img src={content.previewImageUrl} alt="" className="size-full object-contain" />
      </div>
    );
  }

  const hasDrawing = Boolean(content.whiteboardContent && content.whiteboardContent.trim().length > 2);
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-16 text-center text-muted-foreground">
      <PenTool aria-hidden="true" className="size-10 opacity-30" />
      <p className="text-body">{hasDrawing ? t('framingKind.whiteboard') : t('preview.whiteboard.empty')}</p>
    </div>
  );
}

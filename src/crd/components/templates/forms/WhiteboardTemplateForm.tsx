import { PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/crd/primitives/label';
import type { WhiteboardTemplateFormProps } from '../types';

/**
 * Whiteboard template form — presentational. Shows whether the template currently has a drawing.
 *
 * The live whiteboard editor is hosted by the integration layer (`src/main/crdPages/templates/
 * WhiteboardTemplateFormConnector`), which renders an "Edit drawing" button next to this slot and
 * writes the result (the drawing JSON + the editor-generated preview screenshot) back through
 * `onChange`. There is intentionally no separate "upload preview image" control — the template's
 * card image is the screenshot the editor produces on save.
 */
export function WhiteboardTemplateForm({ value }: WhiteboardTemplateFormProps) {
  const { t } = useTranslation('crd-templates');
  const hasDrawing = Boolean(value.whiteboardContent && value.whiteboardContent.trim().length > 2);

  return (
    <div className="space-y-1.5">
      <Label>{t('form.whiteboard.drawing')}</Label>
      <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-muted-foreground">
        <PenTool aria-hidden="true" className="size-6 opacity-40" />
        <span className="text-body">{hasDrawing ? t('framingKind.whiteboard') : t('preview.whiteboard.empty')}</span>
      </div>
    </div>
  );
}

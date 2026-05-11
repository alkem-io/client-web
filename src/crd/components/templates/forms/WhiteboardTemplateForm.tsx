import { PenTool, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import type { WhiteboardTemplateFormProps } from '../types';

/**
 * Whiteboard template form — presentational.
 *
 * NOTE: the live whiteboard editor (`WhiteboardEditorShell` + Excalidraw) and the
 * preview-settings dialogs are wired by the integration layer (`src/main/crdPages/templates/`),
 * which renders them around / alongside this form and writes back through `onChange`
 * (`value.whiteboardContent`, `value.previewSettings`). This component only owns the static
 * bits that need no Apollo: the captured-drawing indicator and the preview-image upload.
 *
 * The integration layer may also render an "Edit whiteboard" button next to this slot.
 */
export function WhiteboardTemplateForm({ value, onChange }: WhiteboardTemplateFormProps) {
  const { t } = useTranslation('crd-templates');
  const hasDrawing = Boolean(value.whiteboardContent && value.whiteboardContent.trim().length > 2);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('form.whiteboard.drawing')}</Label>
        <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-muted-foreground">
          <PenTool aria-hidden="true" className="size-6 opacity-40" />
          <span className="text-body">{hasDrawing ? t('framingKind.whiteboard') : t('preview.whiteboard.empty')}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wb-preview-image">{t('form.whiteboard.previewImage')}</Label>
        <div className="flex items-center gap-2">
          <input
            id="wb-preview-image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => onChange({ ...value, previewImageFile: e.target.files?.[0] })}
          />
          <Button asChild={true} variant="outline" size="sm">
            <label htmlFor="wb-preview-image" className="cursor-pointer">
              <Upload aria-hidden="true" className="size-4 mr-2" />
              {t('form.whiteboard.uploadPreviewImage')}
            </label>
          </Button>
          {value.previewImageFile && (
            <span className="text-caption text-muted-foreground truncate">{value.previewImageFile.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}

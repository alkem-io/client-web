/**
 * WhiteboardTemplateFormConnector — the integration-layer wrapper for the whiteboard-template form.
 * A pure `src/crd/` component can't host the live Excalidraw editor (it needs Apollo / the whiteboard
 * stack), so this connector renders the shared `WhiteboardConfigCard` ("Whiteboard · Edit drawing" — the
 * same row the callout whiteboard-framing editor uses) and opens `CrdSingleUserWhiteboardDialog` against
 * a synthetic in-memory whiteboard, writing the result back through `onChange` (`value.whiteboardContent` /
 * `value.previewSettings`). Same pattern `FramingEditorConnector` uses for whiteboard framing, and
 * `ResponseDefaultsConnector` uses for the default whiteboard.
 */
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '@/crd/components/common/Loading';
import type { WhiteboardTemplateValues } from '@/crd/components/templates/types';
import { WhiteboardConfigCard } from '@/crd/components/whiteboard/WhiteboardConfigCard';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import CrdSingleUserWhiteboardDialog, {
  type WhiteboardWithContent,
} from '@/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog';

const WHITEBOARD_TEMPLATE_DRAFT_ID = '__whiteboard_template_draft';

export type WhiteboardTemplateFormConnectorProps = {
  value: WhiteboardTemplateValues;
  onChange: (next: WhiteboardTemplateValues) => void;
  /**
   * Receives the preview screenshots the editor generates on save. The owner (`useTemplateForms`)
   * uploads these against the template's profile visuals after the create/update mutation — that
   * screenshot becomes the template's card image (there is no manual preview-image upload).
   */
  onPreviewImagesChange?: (images: WhiteboardPreviewImage[]) => void;
  disabled?: boolean;
};

export function WhiteboardTemplateFormConnector({
  value,
  onChange,
  onPreviewImagesChange,
  disabled,
}: WhiteboardTemplateFormConnectorProps) {
  const { t } = useTranslation('crd-templates');
  const [editorOpen, setEditorOpen] = useState(false);

  const content = value.whiteboardContent || EmptyWhiteboardString;
  const hasDrawing = Boolean(value.whiteboardContent && value.whiteboardContent.trim().length > 2);
  // The CRD layer types `previewSettings` opaquely (`Record<string, unknown>`); at runtime it is a real
  // `WhiteboardPreviewSettings` produced by the editor, so this cast is sound.
  const previewSettings =
    (value.previewSettings as WhiteboardPreviewSettings | undefined) ?? DefaultWhiteboardPreviewSettings;

  return (
    <div className="space-y-4">
      <WhiteboardConfigCard
        title={t('form.whiteboard.drawing')}
        status={hasDrawing ? undefined : t('preview.whiteboard.empty')}
        actionLabel={hasDrawing ? t('form.whiteboard.editDrawing') : t('form.whiteboard.startDrawing')}
        onAction={() => setEditorOpen(true)}
        disabled={disabled}
      />

      <Suspense fallback={<Loading />}>
        <CrdSingleUserWhiteboardDialog
          entities={{
            whiteboard: {
              id: WHITEBOARD_TEMPLATE_DRAFT_ID,
              nameID: WHITEBOARD_TEMPLATE_DRAFT_ID,
              profile: {
                id: `${WHITEBOARD_TEMPLATE_DRAFT_ID}_profile`,
                displayName: value.name || t('framingKind.whiteboard'),
                storageBucket: { id: '', allowedMimeTypes: [], maxFileSize: 0 },
              },
              content,
              previewSettings,
            } satisfies WhiteboardWithContent,
          }}
          actions={{
            onCancel: () => setEditorOpen(false),
            onUpdate: async (wb, previewImages) => {
              onChange({
                ...value,
                whiteboardContent: wb.content,
                // `WhiteboardTemplateValues.previewSettings` is the CRD layer's opaque `Record<string, unknown>`;
                // the editor returns the real domain shape — store it as-is.
                previewSettings: wb.previewSettings as unknown as WhiteboardTemplateValues['previewSettings'],
              });
              onPreviewImagesChange?.(previewImages ?? []);
              setEditorOpen(false);
            },
          }}
          options={{
            show: editorOpen,
            canEdit: true,
            canDelete: false,
            allowFilesAttached: true,
            dialogTitle: value.name || t('framingKind.whiteboard'),
          }}
        />
      </Suspense>
    </div>
  );
}

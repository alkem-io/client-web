import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineWhiteboardPreview } from '@/crd/components/callout/InlineWhiteboardPreview';
import { Loading } from '@/crd/components/common/Loading';
import { ResponseDefaultsDialog } from '@/crd/forms/callout/ResponseDefaultsDialog';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { ContributionDefaults, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import CrdSingleUserWhiteboardDialog, {
  type WhiteboardWithContent,
} from '@/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog';
import { useWhiteboardPreviewBlobUrl } from './useWhiteboardPreviewBlobUrl';

const WHITEBOARD_DEFAULT_TEMPLATE_ID = '__response_default_whiteboard';

type ResponseDefaultsConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ResponseType;
  values: ContributionDefaults;
  onSave: (next: ContributionDefaults) => void;
};

/**
 * Wraps `ResponseDefaultsDialog` and provides the whiteboard-default sub-flow:
 * an inline preview box (`InlineWhiteboardPreview`) that opens
 * `CrdSingleUserWhiteboardDialog` for in-place editing.
 *
 * MUI parity: the legacy `ContributionsSettings{Whiteboard,Post}` dialogs
 * expose only a default title (+ optional description for posts / inline
 * whiteboard preview for whiteboards) — there is no template picker on
 * either path, so we don't render one here either.
 */
export function ResponseDefaultsConnector({
  open,
  onOpenChange,
  type,
  values,
  onSave,
}: ResponseDefaultsConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [whiteboardEditorOpen, setWhiteboardEditorOpen] = useState(false);
  const [whiteboardPreviewSettings, setWhiteboardPreviewSettings] = useState<WhiteboardPreviewSettings>(
    DefaultWhiteboardPreviewSettings
  );
  // Captured each time the user saves the inline whiteboard editor so the
  // preview thumbnail reflects the current canvas (MUI parity). These blobs
  // are local to the defaults flow — the defaults whiteboard is a virtual
  // template, not a server entity, so we don't upload them anywhere.
  const [previewImages, setPreviewImages] = useState<WhiteboardPreviewImage[] | undefined>(undefined);
  const whiteboardPreviewUrl = useWhiteboardPreviewBlobUrl(previewImages);
  // Read whiteboard content straight from `values` so external updates land
  // immediately in the editor instead of being shadowed by local state.
  const whiteboardDraft = values.whiteboardContent || EmptyWhiteboardString;

  // The preview blobs and preview-settings state are session-local — they
  // live only as long as the dialog is open against a whiteboard response.
  // Reset them when the dialog closes or when the response type switches
  // away from whiteboard so a stale thumbnail doesn't bleed into a later
  // session that might be looking at a different default.
  useEffect(() => {
    if (!open || type !== 'whiteboard') {
      setPreviewImages(undefined);
      setWhiteboardPreviewSettings(DefaultWhiteboardPreviewSettings);
    }
  }, [open, type]);

  const whiteboardSlot =
    type === 'whiteboard' ? (
      <>
        <InlineWhiteboardPreview
          onEdit={() => setWhiteboardEditorOpen(true)}
          editLabel={t('framing.edit')}
          previewImageUrl={whiteboardPreviewUrl}
          imageAlt={values.defaultDisplayName || t('responseDefaults.defaultWhiteboard')}
        />
        <Suspense fallback={<Loading />}>
          <CrdSingleUserWhiteboardDialog
            entities={{
              whiteboard: {
                id: WHITEBOARD_DEFAULT_TEMPLATE_ID,
                nameID: WHITEBOARD_DEFAULT_TEMPLATE_ID,
                profile: {
                  id: `${WHITEBOARD_DEFAULT_TEMPLATE_ID}_profile`,
                  displayName: values.defaultDisplayName || t('responseDefaults.defaultWhiteboard'),
                  storageBucket: { id: '', allowedMimeTypes: [], maxFileSize: 0 },
                },
                content: whiteboardDraft,
                previewSettings: whiteboardPreviewSettings,
              } satisfies WhiteboardWithContent,
            }}
            actions={{
              onCancel: () => setWhiteboardEditorOpen(false),
              onUpdate: async (wb, nextPreviewImages) => {
                setWhiteboardPreviewSettings(wb.previewSettings);
                setPreviewImages(nextPreviewImages);
                onSave({ ...values, whiteboardContent: wb.content });
                setWhiteboardEditorOpen(false);
              },
            }}
            options={{
              show: whiteboardEditorOpen,
              canEdit: true,
              canDelete: false,
              allowFilesAttached: true,
              dialogTitle: values.defaultDisplayName || t('responseDefaults.defaultWhiteboard'),
            }}
          />
        </Suspense>
      </>
    ) : null;

  return (
    <ResponseDefaultsDialog
      open={open}
      onOpenChange={onOpenChange}
      type={type}
      values={values}
      onSave={onSave}
      whiteboardSlot={whiteboardSlot}
    />
  );
}

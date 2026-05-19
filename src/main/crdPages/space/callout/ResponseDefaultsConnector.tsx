import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { InlineWhiteboardPreview } from '@/crd/components/callout/InlineWhiteboardPreview';
import { Loading } from '@/crd/components/common/Loading';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import type { TemplateType } from '@/crd/components/templates/types';
import { ResponseDefaultsDialog } from '@/crd/forms/callout/ResponseDefaultsDialog';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { useSpace } from '@/domain/space/context/useSpace';
import type { ContributionDefaults, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';
import CrdSingleUserWhiteboardDialog, {
  type WhiteboardWithContent,
} from '@/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog';
import { useWhiteboardPreviewBlobUrl } from './useWhiteboardPreviewBlobUrl';

type ApplyDraft = (next: Partial<ContributionDefaults>) => void;
type PickerHandle = ReturnType<typeof useTemplatePicker>;

/**
 * D20, 2026-05-19 — small inner component rendered inside the dialog's render-prop `templateSlot`.
 * Owns the picker-apply effect: when `picker.selectedTemplateContent` resolves to a freshly-picked
 * template, it writes the matching fields into the dialog's draft via `applyDraft`. The `applyDraft`
 * reference is stored in a ref so the effect's deps stay minimal and don't re-fire on each parent
 * render. State (`appliedFor`) resets each time the dialog re-opens — fresh apply per session.
 */
function TemplateApplyButton({ applyDraft, picker }: { applyDraft: ApplyDraft; picker: PickerHandle }) {
  const { t } = useTranslation('crd-space');
  const applyDraftRef = useRef(applyDraft);
  applyDraftRef.current = applyDraft;
  const selectedContent = picker.selectedTemplateContent;
  const selectedId = picker.selectedTemplateId;
  const [appliedFor, setAppliedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedContent || !selectedId || appliedFor === selectedId) return;
    setAppliedFor(selectedId);
    if (selectedContent.type === 'post') {
      applyDraftRef.current({ postDescription: selectedContent.defaultDescription });
    } else if (selectedContent.type === 'whiteboard') {
      applyDraftRef.current({ whiteboardContent: selectedContent.whiteboardContent });
    }
  }, [selectedContent, selectedId, appliedFor]);

  return (
    <div className="space-y-1.5">
      <Label className="text-body text-foreground">{t('responseDefaults.template')}</Label>
      <Button variant="outline" size="sm" onClick={picker.openPicker}>
        {t('responseDefaults.templatePlaceholder')}
      </Button>
    </div>
  );
}

const WHITEBOARD_DEFAULT_TEMPLATE_ID = '__response_default_whiteboard';

type ResponseDefaultsConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ResponseType;
  /** Parent space id — drives the templates-set lookup so the picker can offer the Space source section. */
  spaceId?: string;
  values: ContributionDefaults;
  onSave: (next: ContributionDefaults) => void;
};

/**
 * Wraps `ResponseDefaultsDialog` and provides the two integration-only slots:
 *
 * 1. **Template picker** — the shared CRD `TemplatePicker` in `mode:'select'`.
 *    Offers a **Post** template for the post/memo default description and a
 *    **Whiteboard** template for the default whiteboard, sourced from the
 *    space's templates set + its account + the platform library. Selecting a
 *    template applies its content to the matching contribution default.
 *
 * 2. **Whiteboard-default sub-flow** — an inline preview box
 *    (`InlineWhiteboardPreview`) that opens `CrdSingleUserWhiteboardDialog`
 *    for in-place editing. The thumbnail reflects the last-saved canvas.
 */
export function ResponseDefaultsConnector({
  open,
  onOpenChange,
  type,
  spaceId,
  values,
  onSave,
}: ResponseDefaultsConnectorProps) {
  const { t } = useTranslation('crd-space');
  const {
    space: { accountId },
  } = useSpace();
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
  // immediately in the editor instead of being shadowed by stale local state —
  // both the template-picker apply path and the whiteboard sub-flow write
  // through the parent form's `values.whiteboardContent`.
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

  // Resolve the space's templates set so the picker can offer the Space source section.
  const { data: tmData } = useSpaceTemplatesManagerQuery({ variables: { spaceId: spaceId ?? '' }, skip: !spaceId });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;
  const pickerType: TemplateType = type === 'whiteboard' ? 'whiteboard' : 'post';
  const picker = useTemplatePicker({ allowedTypes: [pickerType], spaceTemplatesSetId, accountId });

  // D20, 2026-05-19 — the template-apply path now writes straight into the dialog's draft via the
  // render-prop slot's `applyDraft` helper (see `TemplateApplyButton` above). The previous
  // `onSave({...values, postDescription: ...})` route bypassed the dialog draft and (a) didn't
  // populate `defaultDescription` because no sync effect existed for that field, (b) was
  // overwritten by the dialog's stale draft on Save, and (c) leaked to the parent on Cancel.
  const supportsTemplate = type === 'post' || type === 'whiteboard';
  const templateSlot = supportsTemplate
    ? ({ applyDraft }: { applyDraft: ApplyDraft }) => <TemplateApplyButton applyDraft={applyDraft} picker={picker} />
    : undefined;

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
    <>
      <ResponseDefaultsDialog
        open={open}
        onOpenChange={onOpenChange}
        type={type}
        values={values}
        onSave={onSave}
        templateSlot={templateSlot}
        whiteboardSlot={whiteboardSlot}
      />
      <TemplatePicker {...picker.pickerProps} />
    </>
  );
}

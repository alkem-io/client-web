import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery, useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { useSpace } from '@/domain/space/context/useSpace';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { calloutTemplateContentToFormValues } from '@/main/crdPages/templates/calloutTemplateMapper';
import { fetchPreviewImageBlob } from '@/main/crdPages/templates/fetchPreviewImageBlob';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';

type TemplateImportConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Whether the parent form has user-entered content. When true, selecting a template triggers the
   * overwrite-confirm dialog before prefilling. When false, the template loads directly.
   */
  isFormDirty: boolean;
  /** Called with the mapped CRD form values after the user confirms. */
  onTemplateSelected: (values: Partial<CalloutFormValues>) => void;
};

/**
 * Wires the CRD `TemplatePicker` (mode='select', callout templates) to the CRD callout-creation form.
 * Sources: the owning level-zero space's templates set + the space's account + the platform library.
 * On selection the connector re-fetches the picked template's **full** callout content (the picker's
 * preview shape is lossy — no poll settings / tags / contribution actors) and maps it via the same
 * `calloutTemplateContentToFormValues` the Callout-template editor uses, so every framing kind
 * (incl. Collabora-document and poll) round-trips faithfully. The overwrite-confirm runs first when
 * the form is dirty.
 */
export function TemplateImportConnector({
  open,
  onOpenChange,
  isFormDirty,
  onTemplateSelected,
}: TemplateImportConnectorProps) {
  const { t } = useTranslation('crd-space');
  const {
    space: { accountId, levelZeroSpaceId },
  } = useSpace();
  const { data: tmData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId: levelZeroSpaceId ?? '' },
    skip: !levelZeroSpaceId,
  });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;
  const picker = useTemplatePicker({ allowedTypes: ['callout'], accountId, spaceTemplatesSetId, open, onOpenChange });
  const [getTemplateContent] = useTemplateContentLazyQuery();
  const [pendingValues, setPendingValues] = useState<Partial<CalloutFormValues> | null>(null);
  const [appliedFor, setAppliedFor] = useState<string | null>(null);

  // When the user picks a template, re-fetch its full callout content and apply (or stage the overwrite-confirm).
  // D18, 2026-05-18: when the template carries a server-rendered whiteboard preview, fetch the image as
  // a `Blob` and seed `whiteboardPreviewImages` so `CalloutFormConnector`'s post-create upload step carries
  // it through to the new callout's `WHITEBOARD_PREVIEW` Visual. Fetch failures are non-fatal (the form
  // still shows the server URL via the D16 fallback; the new callout just ends up with no preview image).
  const selectedId = picker.selectedTemplateId;
  useEffect(() => {
    if (!selectedId || appliedFor === selectedId) return;
    setAppliedFor(selectedId);
    // Guard against a stale resolution: if the user picks another template (or the dialog
    // closes) before the async fetch settles, the cleanup flips `cancelled` so the earlier
    // request's continuation no-ops instead of applying values for a no-longer-selected template.
    let cancelled = false;
    void getTemplateContent({ variables: { templateId: selectedId, includeCallout: true } }).then(async ({ data }) => {
      if (cancelled) return;
      const callout = data?.lookup.template?.callout;
      if (!callout) return;
      const values = calloutTemplateContentToFormValues(callout);
      if (values.whiteboardPreviewServerUrl) {
        const blob = await fetchPreviewImageBlob(values.whiteboardPreviewServerUrl);
        if (cancelled) return;
        if (blob) {
          values.whiteboardPreviewImages = [{ visualType: VisualType.WhiteboardPreview, imageData: blob }];
        }
      }
      if (cancelled) return;
      if (isFormDirty) {
        setPendingValues(values);
      } else {
        onTemplateSelected(values);
        onOpenChange(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, appliedFor, isFormDirty, onTemplateSelected, onOpenChange, getTemplateContent]);

  const confirmOverwrite = () => {
    if (pendingValues) {
      onTemplateSelected(pendingValues);
      onOpenChange(false);
    }
    setPendingValues(null);
  };

  return (
    <>
      <TemplatePicker {...picker.pickerProps} />
      <ConfirmationDialog
        open={pendingValues !== null}
        onOpenChange={o => !o && setPendingValues(null)}
        title={t('findTemplate.overwriteTitle')}
        description={t('findTemplate.overwriteDescription')}
        confirmLabel={t('findTemplate.overwriteConfirm')}
        cancelLabel={t('dialogs.cancel')}
        onConfirm={confirmOverwrite}
        onCancel={() => setPendingValues(null)}
      />
    </>
  );
}

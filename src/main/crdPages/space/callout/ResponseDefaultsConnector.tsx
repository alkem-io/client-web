import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
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
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { useSpace } from '@/domain/space/context/useSpace';
import type { ContributionDefaults, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';
import CrdSingleUserWhiteboardDialog, {
  type WhiteboardWithContent,
} from '@/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog';

const WHITEBOARD_DEFAULT_TEMPLATE_ID = '__response_default_whiteboard';

type ResponseDefaultsConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ResponseType;
  spaceId?: string;
  values: ContributionDefaults;
  onSave: (next: ContributionDefaults) => void;
};

/**
 * Wraps `ResponseDefaultsDialog` and provides the two integration-only slots:
 * the template picker (the shared CRD `TemplatePicker` in `mode:'select'` — a **Post** template for
 * the post/memo default description, a **Whiteboard** template for the default whiteboard — sourced
 * from the space's templates set + its account + the platform library), and the whiteboard-default
 * launcher that opens `CrdSingleUserWhiteboardDialog`.
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
  // Read whiteboard content straight from `values` so template-applied content
  // (which lands via `onSave` → parent `values.whiteboardContent`) is always
  // visible to the editor, instead of being shadowed by stale local state.
  const whiteboardDraft = values.whiteboardContent || EmptyWhiteboardString;

  // Resolve the space's templates set so the picker can offer the Space source section.
  const { data: tmData } = useSpaceTemplatesManagerQuery({ variables: { spaceId: spaceId ?? '' }, skip: !spaceId });
  const spaceTemplatesSetId = tmData?.lookup.space?.templatesManager?.templatesSet?.id;
  const pickerType: TemplateType = type === 'whiteboard' ? 'whiteboard' : 'post';
  const picker = useTemplatePicker({ allowedTypes: [pickerType], spaceTemplatesSetId, accountId });

  // Apply the picked template's content to the matching contribution default.
  const selectedContent = picker.selectedTemplateContent;
  const selectedId = picker.selectedTemplateId;
  const [appliedFor, setAppliedFor] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedContent || !selectedId || appliedFor === selectedId) return;
    setAppliedFor(selectedId);
    if (selectedContent.type === 'post') {
      onSave({ ...values, postDescription: selectedContent.defaultDescription });
    } else if (selectedContent.type === 'whiteboard') {
      onSave({ ...values, whiteboardContent: selectedContent.whiteboardContent });
    }
  }, [selectedContent, selectedId, appliedFor, values, onSave]);

  const supportsTemplate = type === 'post' || type === 'whiteboard';
  const templateSlot = supportsTemplate ? (
    <div className="space-y-1.5">
      <Label className="text-body text-foreground">{t('responseDefaults.template')}</Label>
      <Button variant="outline" size="sm" onClick={picker.openPicker}>
        {t('responseDefaults.templatePlaceholder')}
      </Button>
    </div>
  ) : null;

  const whiteboardSlot =
    type === 'whiteboard' ? (
      <>
        <Button variant="outline" size="sm" onClick={() => setWhiteboardEditorOpen(true)}>
          {values.whiteboardContent && values.whiteboardContent !== EmptyWhiteboardString
            ? t('responseDefaults.editWhiteboard')
            : t('responseDefaults.configureWhiteboard')}
        </Button>
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
              onUpdate: async (wb, _previewImages) => {
                setWhiteboardPreviewSettings(wb.previewSettings);
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

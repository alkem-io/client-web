import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpaceContentTemplatesOnSpaceQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Loading } from '@/crd/components/common/Loading';
import { ResponseDefaultsDialog } from '@/crd/forms/callout/ResponseDefaultsDialog';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { ContributionDefaults, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
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
 * the template picker (fetches `useSpaceContentTemplatesOnSpaceQuery` and uses
 * `useTemplateContentLazyQuery` to load the picked template's content), and
 * the whiteboard-default launcher that opens `CrdSingleUserWhiteboardDialog`.
 *
 * The template picker is a minimal select-style list for now — the popover +
 * search pattern from the prototype (spec T026) can be refined without
 * changing the prop contract.
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
  const [whiteboardEditorOpen, setWhiteboardEditorOpen] = useState(false);
  const [whiteboardDraft, setWhiteboardDraft] = useState<string>(values.whiteboardContent || EmptyWhiteboardString);
  const [whiteboardPreviewSettings, setWhiteboardPreviewSettings] = useState<WhiteboardPreviewSettings>(
    DefaultWhiteboardPreviewSettings
  );

  const needsTemplates = (type === 'post' || type === 'whiteboard') && Boolean(spaceId) && open;
  const { data: templatesData, loading: templatesLoading } = useSpaceContentTemplatesOnSpaceQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !needsTemplates,
  });

  const templates =
    templatesData?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates.map(tmpl => ({
      id: tmpl.id,
      name: tmpl.profile.displayName,
    })) ?? [];

  const [getTemplateContent] = useTemplateContentLazyQuery();

  const applyTemplate = async (templateId: string) => {
    if (!templateId) return;
    const { data } = await getTemplateContent({ variables: { templateId, includeCallout: true } });
    const callout = data?.lookup.template?.callout;
    if (!callout) return;
    // Pre-fill contribution defaults from the template's contributionDefaults.
    const defaults = callout.contributionDefaults;
    if (!defaults) return;
    onSave({
      defaultDisplayName: defaults.defaultDisplayName ?? values.defaultDisplayName,
      postDescription: defaults.postDescription ?? values.postDescription,
      whiteboardContent: defaults.whiteboardContent ?? values.whiteboardContent,
    });
  };

  const templateSlot =
    type === 'post' || type === 'whiteboard' ? (
      <div className="space-y-1.5">
        <Label htmlFor="response-defaults-template" className="text-body text-foreground">
          {t('responseDefaults.template')}
        </Label>
        <select
          id="response-defaults-template"
          className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          disabled={templatesLoading || templates.length === 0}
          onChange={e => void applyTemplate(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled={true}>
            {templatesLoading ? t('responseDefaults.templateLoading') : t('responseDefaults.templatePlaceholder')}
          </option>
          {templates.map(tmpl => (
            <option key={tmpl.id} value={tmpl.id}>
              {tmpl.name}
            </option>
          ))}
        </select>
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
                setWhiteboardDraft(wb.content);
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
    <ResponseDefaultsDialog
      open={open}
      onOpenChange={onOpenChange}
      type={type}
      values={values}
      onSave={onSave}
      templateSlot={templateSlot}
      whiteboardSlot={whiteboardSlot}
    />
  );
}

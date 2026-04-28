import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutContributionType,
  CalloutFramingType,
  type TemplateContentQuery,
  TemplateType,
} from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useSpace } from '@/domain/space/context/useSpace';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import type { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { allowedActorsFromServer } from './calloutFormMapper';

type TemplateCallout = NonNullable<NonNullable<TemplateContentQuery['lookup']['template']>['callout']>;

type TemplateImportConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Whether the parent form has user-entered content. When true, clicking a
   * template triggers the overwrite-confirm dialog before prefilling (plan D22
   * / US19). When false, the template loads directly.
   */
  isFormDirty: boolean;
  /** Called with the mapped CRD form values after the user confirms. */
  onTemplateSelected: (values: Partial<CalloutFormValues>) => void;
};

const FRAMING_TYPE_TO_CHIP: Record<CalloutFramingType, CalloutFormValues['framingChip']> = {
  [CalloutFramingType.None]: 'none',
  [CalloutFramingType.Whiteboard]: 'whiteboard',
  [CalloutFramingType.Memo]: 'memo',
  [CalloutFramingType.Link]: 'cta',
  [CalloutFramingType.MediaGallery]: 'image',
  [CalloutFramingType.Poll]: 'poll',
};

const CONTRIBUTION_TYPE_TO_RESPONSE: Record<CalloutContributionType, CalloutFormValues['responseType']> = {
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Memo]: 'memo',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
};

const findDefaultTagset = (tagsets: TemplateCallout['framing']['profile']['tagsets']): string => {
  if (!tagsets || tagsets.length === 0) return '';
  const defaultTagset = tagsets.find(ts => ts.name === 'default') ?? tagsets[0];
  return defaultTagset?.tags.join(', ') ?? '';
};

/**
 * Pure mapper: template-content `callout` payload → partial CRD form values.
 * Kept local to this connector because it only feeds Find Template (plan D22 /
 * T080). Poll framing is currently not included in `TemplateContentQuery`, so
 * poll-only fields fall back to their empty state in `prefill()`.
 */
const mapTemplateCalloutToFormValues = (tc: TemplateCallout): Partial<CalloutFormValues> => {
  const { framing, settings, contributionDefaults } = tc;
  const framingChip = FRAMING_TYPE_TO_CHIP[framing.type];
  const firstAllowedType = settings.contribution.allowedTypes[0];
  const responseType =
    settings.contribution.enabled && firstAllowedType
      ? (CONTRIBUTION_TYPE_TO_RESPONSE[firstAllowedType] ?? 'none')
      : 'none';

  return {
    title: framing.profile.displayName,
    description: framing.profile.description ?? '',
    tags: findDefaultTagset(framing.profile.tagsets),
    framingChip,
    framingCommentsEnabled: settings.framing.commentsEnabled,
    linkUrl: framing.link?.uri ?? '',
    linkDisplayName: framing.link?.profile.displayName ?? '',
    memoMarkdown: framing.memo?.markdown ?? '',
    whiteboardContent: framing.whiteboard?.content ?? '',
    whiteboardConfigured: framing.type === CalloutFramingType.Whiteboard,
    // MediaGallery visuals on templates are reference URIs; the media-gallery
    // field accepts `{ id, uri, altText }` entries.
    mediaGalleryVisuals:
      framing.mediaGallery?.visuals.map(v => ({
        id: v.id,
        uri: v.uri,
        altText: v.alternativeText,
        sortOrder: v.sortOrder,
      })) ?? [],
    responseType,
    allowedActors: allowedActorsFromServer(settings.contribution.canAddContributions),
    contributionCommentsEnabled: settings.contribution.commentsEnabled,
    contributionDefaults: {
      defaultDisplayName: contributionDefaults.defaultDisplayName ?? '',
      postDescription: contributionDefaults.postDescription ?? '',
      whiteboardContent: contributionDefaults.whiteboardContent ?? '',
    },
    referenceRows:
      framing.profile.references?.map(r => ({
        title: r.name,
        url: r.uri,
        description: r.description ?? '',
      })) ?? [],
  };
};

/**
 * Wires the MUI `ImportTemplatesDialog` (rendered as a sibling portal outside
 * `.crd-root`) to the CRD callout form. On template selection, fetches the
 * template's callout content via `useTemplateContentLazyQuery`, maps it to
 * CRD form values, and — when the form is dirty — shows an overwrite-confirm
 * dialog before handing the values to the parent (plan D22 / T080).
 */
export function TemplateImportConnector({
  open,
  onOpenChange,
  isFormDirty,
  onTemplateSelected,
}: TemplateImportConnectorProps) {
  const { t } = useTranslation('crd-space');
  const {
    space: { accountId },
  } = useSpace();
  const [fetchTemplateContent, { loading: fetching }] = useTemplateContentLazyQuery();
  const [pendingValues, setPendingValues] = useState<Partial<CalloutFormValues> | null>(null);

  const applyValues = (values: Partial<CalloutFormValues>) => {
    onTemplateSelected(values);
    onOpenChange(false);
  };

  const handleSelectTemplate = async (template: AnyTemplate) => {
    try {
      const { data } = await fetchTemplateContent({
        variables: { templateId: template.id, includeCallout: true },
      });
      const tc = data?.lookup.template?.callout;
      if (!tc) {
        logError(new Error(`Template ${template.id} has no callout content`));
        return;
      }
      const values = mapTemplateCalloutToFormValues(tc);
      if (isFormDirty) {
        setPendingValues(values);
      } else {
        applyValues(values);
      }
    } catch (err) {
      logError(new Error('Fetching template content failed', { cause: err as Error }));
    }
  };

  const handleConfirmOverwrite = () => {
    if (pendingValues) applyValues(pendingValues);
    setPendingValues(null);
  };

  return (
    <>
      <ImportTemplatesDialog
        open={open}
        onClose={() => onOpenChange(false)}
        templateType={TemplateType.Callout}
        accountId={accountId}
        enablePlatformTemplates={true}
        onSelectTemplate={handleSelectTemplate}
      />
      <ConfirmationDialog
        open={pendingValues !== null}
        onOpenChange={o => !o && setPendingValues(null)}
        title={t('findTemplate.overwriteTitle')}
        description={t('findTemplate.overwriteDescription')}
        confirmLabel={t('findTemplate.overwriteConfirm')}
        cancelLabel={t('dialogs.cancel')}
        onConfirm={handleConfirmOverwrite}
        onCancel={() => setPendingValues(null)}
        loading={fetching}
      />
    </>
  );
}

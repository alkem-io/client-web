import { useCallback, useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

import { LibraryIcon } from '../../LibraryIcon';
import ImportTemplatesDialog, {
  type ImportTemplatesOptions,
} from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import TemplatesGallery from '../TemplatesGallery/TemplatesGallery';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import EditTemplateDialog from '../Dialogs/CreateEditTemplateDialog/EditTemplateDialog';
import PreviewTemplateDialog from '../Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import CreateTemplateDialog from '../Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';

import {
  toCreateTemplateMutationVariables,
  toUpdateTemplateMutationVariables,
  toCreateTemplateFromCollaborationMutationVariables,
} from '../Forms/common/mappings';
import {
  useUpdateCalloutMutation,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
  useTemplateContentLazyQuery,
  useAllTemplatesInTemplatesSetQuery,
  useUpdateCommunityGuidelinesMutation,
  useCreateTemplateFromCollaborationMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { type AnyTemplate } from '../../models/TemplateBase';
import useBackToPath from '../../../../core/routing/useBackToPath';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { CollaborationTemplate } from '../../models/CollaborationTemplate';
import { type AnyTemplateFormSubmittedValues } from '../Forms/TemplateForm';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import { type WhiteboardTemplateFormSubmittedValues } from '../Forms/WhiteboardTemplateForm';
import { type CollaborationTemplateFormSubmittedValues } from '../Forms/CollaborationTemplateForm';
import { useUploadWhiteboardVisuals } from '../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

const defaultPermissionDenied: TemplatePermissionCallback = () => false;

const TemplatesAdmin = ({
  templateId,
  baseUrl = '',
  templatesSetId,
  alwaysEditTemplate = false,
  importTemplateOptions = {},
  canEditTemplates = defaultPermissionDenied,
  canImportTemplates = defaultPermissionDenied,
  canCreateTemplates = defaultPermissionDenied,
  canDeleteTemplates = defaultPermissionDenied,
}: TemplatesAdminProps) => {
  const { t } = useTranslation();
  const backToTemplates = useBackToPath();

  // Visuals management (for whiteboards)
  const { uploadVisuals } = useUploadWhiteboardVisuals();
  const handlePreviewTemplates = (
    values: AnyTemplateFormSubmittedValues,
    mutationResult?: { cardVisual?: { id: string }; previewVisual?: { id: string } }
  ) => {
    const whiteboardTemplate = values as WhiteboardTemplateFormSubmittedValues;
    const previewImages = whiteboardTemplate.whiteboardPreviewImages;
    if (mutationResult && previewImages) {
      uploadVisuals(previewImages, {
        cardVisualId: mutationResult.cardVisual?.id,
        previewVisualId: mutationResult.previewVisual?.id,
      });
    }
  };

  // Read Template
  const { data, loading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId },
    skip: !templatesSetId,
  });

  const {
    postTemplates,
    calloutTemplates,
    whiteboardTemplates,
    collaborationTemplates,
    innovationFlowTemplates,
    communityGuidelinesTemplates,
  } = data?.lookup.templatesSet ?? {};

  const selectedTemplate = useMemo<AnyTemplate | undefined>(() => {
    if (!templateId) return undefined;
    return [
      ...(postTemplates ?? []),
      ...(whiteboardTemplates ?? []),
      ...(innovationFlowTemplates ?? []),
      ...(communityGuidelinesTemplates ?? []),
      ...(calloutTemplates ?? []),
      ...(collaborationTemplates ?? []),
    ].find(template => template.id === templateId);
  }, [templateId, data?.lookup.templatesSet]);

  // Update Template
  const [editTemplateMode, setEditTemplateMode] = useState(alwaysEditTemplate);
  const [updateTemplate] = useUpdateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet', 'TemplateContent'],
  });
  const [updateCallout] = useUpdateCalloutMutation();
  const [updateCommunityGuidelines] = useUpdateCommunityGuidelinesMutation();

  const handleTemplateUpdate = async (values: AnyTemplateFormSubmittedValues) => {
    if (!selectedTemplate) {
      return;
    }

    const { updateTemplateVariables, updateCalloutVariables, updateCommunityGuidelinesVariables } =
      toUpdateTemplateMutationVariables(templateId!, selectedTemplate, values);

    const result = await updateTemplate({
      variables: updateTemplateVariables,
    });

    if (updateCalloutVariables) {
      await updateCallout({
        variables: updateCalloutVariables,
      });
    }

    if (updateCommunityGuidelinesVariables) {
      await updateCommunityGuidelines({
        variables: updateCommunityGuidelinesVariables,
      });
    }

    if (updateTemplateVariables.includeProfileVisuals) {
      // Handle the visual in a special way with the preview images
      handlePreviewTemplates(values, result.data?.updateTemplate.profile);
    }

    if (!alwaysEditTemplate) {
      setEditTemplateMode(false);
    }
  };

  // Create Template
  const [creatingTemplateType, setCreatingTemplateType] = useState<TemplateType>();
  const [createTemplate] = useCreateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [createCollaborationTemplate] = useCreateTemplateFromCollaborationMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });

  // Create a Collaboration template
  const handleCollaborationTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toCreateTemplateFromCollaborationMutationVariables(
      templatesSetId,
      values as CollaborationTemplateFormSubmittedValues
    );

    await createCollaborationTemplate({ variables });
    setCreatingTemplateType(undefined);
  };

  const handleTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    // Special case, handle Collaboration templates differently for now, until we have full support for editing them and sending all the data, and not just for cloning an existing collaboration
    if (creatingTemplateType === TemplateType.Collaboration) {
      return handleCollaborationTemplateCreate(values);
    }

    const variables = toCreateTemplateMutationVariables(templatesSetId, creatingTemplateType!, values);
    const result = await createTemplate({ variables });

    if (creatingTemplateType === TemplateType.Whiteboard) {
      // Handle the visual in a special way with the preview images
      handlePreviewTemplates(values, result.data?.createTemplate.profile);
    }
    setCreatingTemplateType(undefined);
  };

  // Delete Template
  const [deletingTemplate, setDeletingTemplate] = useState<AnyTemplate>();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [handleTemplateDeletion, isDeletingTemplate] = useLoadingState(async () => {
    if (!deletingTemplate) {
      throw new TypeError('Missing Template to delete ID.');
    }

    await deleteTemplate({
      variables: { templateId: deletingTemplate.id },
      refetchQueries: ['AllTemplatesInTemplatesSet'],
    });

    setDeletingTemplate(undefined);
    backToTemplates(baseUrl);
  });

  // Import Template
  const [importTemplateType, setImportTemplateType] = useState<TemplateType>();

  const [getTemplateContent] = useTemplateContentLazyQuery();

  const handleImportTemplate = async (importedTemplate: AnyTemplate) => {
    const { id, type: templateType } = importedTemplate;
    // TODO: Special case for collaboration, just for now, until we can import collaborations entirely
    if (templateType === TemplateType.Collaboration) {
      return handleImportCollaborationTemplate(importedTemplate as CollaborationTemplate);
    }

    const { data } = await getTemplateContent({
      variables: {
        templateId: id,
        includeCallout: templateType === TemplateType.Callout,
        includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
        includeInnovationFlow: templateType === TemplateType.InnovationFlow,
        includeCollaboration: false, // templateType === TemplateType.Collaboration,
        includePost: templateType === TemplateType.Post,
        includeWhiteboard: templateType === TemplateType.Whiteboard,
      },
    });

    const template = data?.lookup.template;
    if (template) {
      const variables = toCreateTemplateMutationVariables(templatesSetId, templateType, template);
      await createTemplate({ variables });
      setImportTemplateType(undefined);
    }
  };
  // Special case for Collaboration templates
  const handleImportCollaborationTemplate = async (importedTemplate: CollaborationTemplate) => {
    const { id } = importedTemplate;
    const { data } = await getTemplateContent({ variables: { templateId: id, includeCollaboration: true } });
    const template = data?.lookup.template;

    if (template) {
      const variables = toCreateTemplateFromCollaborationMutationVariables(templatesSetId, {
        ...template,
        collaborationId: template.collaboration?.id,
      });
      await createCollaborationTemplate({
        variables,
      });
      setImportTemplateType(undefined);
    }
  };

  // Actions (buttons for gallery)
  const GalleryActions = useCallback(
    ({ templateType }: { templateType: TemplateType }) => (
      <>
        {canImportTemplates(templateType) ? (
          <ImportTemplateButton onClick={() => setImportTemplateType(templateType)} />
        ) : null}
        {canCreateTemplates(templateType) &&
        /* TODO: InnovationFlow templates are going to be removed in the near future, so disallow creation for this type */
        templateType !== TemplateType.InnovationFlow ? (
          <CreateTemplateButton onClick={() => setCreatingTemplateType(templateType)} />
        ) : null}
      </>
    ),
    [canCreateTemplates, canImportTemplates, setCreatingTemplateType, setImportTemplateType]
  );

  const [, buildLink] = useBackToParentPage(baseUrl);
  const buildTemplateLink = (template: AnyTemplate) => {
    if (template.profile.url) {
      if (alwaysEditTemplate && baseUrl && !template.profile.url.startsWith(baseUrl)) {
        const templateId = template.profile.url.split('/').pop();
        return buildLink(`${baseUrl}/${templateId}`);
      } else {
        return buildLink(template.profile.url);
      }
    }
  };

  return (
    <>
      <PageContentBlockSeamless disablePadding>
        <TemplatesGallery
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.Callout}_plural`),
            count: calloutTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.Callout} />}
          templates={calloutTemplates}
          loading={loading}
          buildTemplateLink={buildTemplateLink}
        />
      </PageContentBlockSeamless>

      <PageContentBlockSeamless disablePadding>
        <TemplatesGallery
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.Collaboration}_plural`),
            count: collaborationTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.Collaboration} />}
          templates={collaborationTemplates}
          loading={loading}
          buildTemplateLink={buildTemplateLink}
        />
      </PageContentBlockSeamless>

      <PageContentBlockSeamless disablePadding>
        <TemplatesGallery
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.CommunityGuidelines}_plural`),
            count: communityGuidelinesTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.CommunityGuidelines} />}
          templates={communityGuidelinesTemplates}
          loading={loading}
          buildTemplateLink={buildTemplateLink}
        />
      </PageContentBlockSeamless>

      <PageContentBlockSeamless disablePadding>
        <TemplatesGallery
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.InnovationFlow}_plural`),
            count: innovationFlowTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.InnovationFlow} />}
          templates={innovationFlowTemplates}
          loading={loading}
          buildTemplateLink={buildTemplateLink}
        />
      </PageContentBlockSeamless>

      <PageContentBlockSeamless disablePadding>
        <TemplatesGallery
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.Post}_plural`),
            count: postTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.Post} />}
          templates={postTemplates}
          loading={loading}
          buildTemplateLink={buildTemplateLink}
        />
      </PageContentBlockSeamless>

      <PageContentBlockSeamless disablePadding>
        <TemplatesGallery
          loading={loading}
          templates={whiteboardTemplates}
          buildTemplateLink={buildTemplateLink}
          actions={<GalleryActions templateType={TemplateType.Whiteboard} />}
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.Whiteboard}_plural`),
            count: whiteboardTemplates?.length ?? 0,
          })}
        />
      </PageContentBlockSeamless>

      {creatingTemplateType && (
        <CreateTemplateDialog
          open
          temporaryLocation
          templateType={creatingTemplateType}
          onSubmit={handleTemplateCreate}
          onClose={() => setCreatingTemplateType(undefined)}
        />
      )}

      {selectedTemplate && editTemplateMode && (
        <EditTemplateDialog
          open
          template={selectedTemplate}
          templateType={selectedTemplate.type}
          onSubmit={handleTemplateUpdate}
          onClose={() => backToTemplates(baseUrl)}
          onDelete={canDeleteTemplates(selectedTemplate.type) ? () => setDeletingTemplate(selectedTemplate) : undefined}
        />
      )}

      {selectedTemplate && !editTemplateMode && (
        <PreviewTemplateDialog
          open
          template={selectedTemplate}
          actions={
            canEditTemplates(selectedTemplate.type) ? (
              <Button variant="contained" onClick={() => setEditTemplateMode(true)}>
                {t('buttons.edit')}
              </Button>
            ) : undefined
          }
          onClose={() => backToTemplates(baseUrl)}
        />
      )}

      {deletingTemplate && (
        <ConfirmationDialog
          state={{ isLoading: isDeletingTemplate }}
          options={{ show: Boolean(deletingTemplate) }}
          actions={{
            onConfirm: handleTemplateDeletion,
            onCancel: () => setDeletingTemplate(undefined),
          }}
          entities={{
            titleId: 'common.warning',
            content: t('pages.admin.generic.sections.templates.delete-confirmation', {
              template: deletingTemplate?.profile.displayName,
            }),
            confirmButtonTextId: 'buttons.delete',
          }}
        />
      )}

      {importTemplateType && (
        <ImportTemplatesDialog
          open
          onClose={() => setImportTemplateType(undefined)}
          templateType={importTemplateType}
          subtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
          onSelectTemplate={handleImportTemplate}
          {...importTemplateOptions}
          actionButton={
            <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
              {t('buttons.import')}
            </LoadingButton>
          }
        />
      )}
    </>
  );
};

export default TemplatesAdmin;

type TemplatePermissionCallback = (templateType: TemplateType) => boolean;

type TemplatesAdminProps = {
  templatesSetId: string;
  baseUrl: string | undefined;

  templateId?: string; // Template selected, if any
  alwaysEditTemplate?: boolean; // If true, the selected template is editable, if false preview dialog is shown
  canEditTemplates?: TemplatePermissionCallback;
  importTemplateOptions?: ImportTemplatesOptions;
  canCreateTemplates?: TemplatePermissionCallback;
  canDeleteTemplates?: TemplatePermissionCallback;
  canImportTemplates?: TemplatePermissionCallback;
};

function CreateTemplateButton(props: ButtonProps) {
  const { t } = useTranslation();

  return (
    <Button variant="outlined" {...props}>
      {t('common.create-new')}{' '}
    </Button>
  );
}

function ImportTemplateButton(props: ButtonProps) {
  const { t } = useTranslation();

  const defaults = {
    children: <>{t('common.library')}</>,
    startIcon: <LibraryIcon />,
  };

  return <Button {...defaults} {...props} />;
}

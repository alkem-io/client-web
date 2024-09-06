import React, { FC, useCallback, useMemo, useState } from 'react';
import TemplatesGalleryContainer from '../TemplatesGallery/TemplatesGalleryContainer';
import TemplatesGallery from '../TemplatesGallery/TemplatesGallery';
import {
  useAllTemplatesInTemplatesSetQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useImportTemplateDataLazyQuery,
  useUpdateTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import EditTemplateDialog from '../Dialogs/CreateEditTemplateDialog/EditTemplateDialog';
import { AnyTemplate } from '../../models/TemplateBase';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import { AnyTemplateFormSubmittedValues } from '../Forms/TemplateForm';
import useBackToPath from '../../../../../core/routing/useBackToPath';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { Button, ButtonProps } from '@mui/material';
import CreateTemplateDialog from '../Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { toCreateTemplateMutationVariables, toUpdateTemplateMutationVariables } from '../Forms/common/mappings';
import { WhiteboardTemplateFormSubmittedValues } from '../Forms/WhiteboardTemplateForm';
import { useUploadWhiteboardVisuals } from '../../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import PreviewTemplateDialog from '../Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import { LibraryIcon } from '../../../LibraryIcon';
import ImportTemplatesDialog, { ImportTemplatesOptions } from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LoadingButton } from '@mui/lab';

interface TemplatesAdminProps {
  templatesSetId: string;
  templateId?: string; // Template selected, if any
  alwaysEditTemplate?: boolean; // If true, the selected template is editable, if false preview dialog is shown
  baseUrl: string | undefined;
  canCreateTemplates?: boolean;
  canEditTemplates?: boolean;
  canDeleteTemplates?: boolean;
  canImportTemplates?: boolean;
  importTemplateOptions?: ImportTemplatesOptions;
}

const CreateTemplateButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button variant="outlined" {...props}>
      {t('common.create-new')}{' '}
    </Button>
  );
};

const ImportTemplateButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  const defaults = {
    children: <>{t('common.library')}</>,
    startIcon: <LibraryIcon />,
  };
  return <Button {...defaults} {...props} />;
};

const TemplatesAdmin: FC<TemplatesAdminProps> = ({
  templatesSetId,
  templateId,
  alwaysEditTemplate = false,
  baseUrl = '',
  canImportTemplates = false,
  importTemplateOptions = {},
  canCreateTemplates = false,
  canEditTemplates = false,
  canDeleteTemplates = false,
}) => {
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
    whiteboardTemplates,
    innovationFlowTemplates,
    calloutTemplates,
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
    ].find(template => template.id === templateId);
  }, [templateId, data?.lookup.templatesSet]);

  // Update Template
  const [editTemplateMode, setEditTemplateMode] = useState(alwaysEditTemplate);
  const [updateTemplate] = useUpdateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const handleTemplateUpdate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toUpdateTemplateMutationVariables(templateId!, values);
    const result = await updateTemplate({
      variables,
    });

    if (selectedTemplate?.type === TemplateType.Whiteboard) {
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
  const handleTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toCreateTemplateMutationVariables(templatesSetId, creatingTemplateType!, values);
    const result = await createTemplate({
      variables,
    });
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
      variables: {
        templateId: deletingTemplate.id,
      },
      refetchQueries: ['AllTemplatesInTemplatesSet'],
    });

    setDeletingTemplate(undefined);
  });

  // Import Template
  const [importTemplateType, setImportTemplateType] = useState<TemplateType>();
  const [getImportData] = useImportTemplateDataLazyQuery();
  const handleImportTemplate = async ({ id, type: templateType }: AnyTemplate) => {
    const { data } = await getImportData({
      variables: {
        templateId: id,
        includeCallout: templateType === TemplateType.Callout,
        includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
        includeInnovationFlow: templateType === TemplateType.InnovationFlow,
        includePost: templateType === TemplateType.Post,
        includeWhiteboard: templateType === TemplateType.Whiteboard,
      },
    });
    const template = data?.lookup.template;
    if (template) {
      const variables = toCreateTemplateMutationVariables(templatesSetId, templateType, template);
      await createTemplate({
        variables,
      });
      setImportTemplateType(undefined);
    }
  };

  // Actions (buttons for gallery)
  const GalleryActions = useCallback(
    ({ templateType }: { templateType: TemplateType }) => (
      <>
        {canImportTemplates ? <ImportTemplateButton onClick={() => setImportTemplateType(templateType)} /> : null}
        {canCreateTemplates ? <CreateTemplateButton onClick={() => setCreatingTemplateType(templateType)} /> : null}
      </>
    ),
    [canCreateTemplates, canImportTemplates, setCreatingTemplateType, setImportTemplateType]
  );
  console.log({ templateId, selectedTemplate, editTemplateMode });
  return (
    <>
      <PageContentBlockSeamless disablePadding>
        <TemplatesGalleryContainer
          templates={calloutTemplates}
          templatesSetId={templatesSetId}
          loading={loading}
          baseUrl={baseUrl}
        >
          {provided => (
            <TemplatesGallery
              headerText={t('common.entitiesWithCount', {
                entityType: t('common.enums.templateTypes.Callout_plural'),
                count: provided.templatesCount,
              })}
              actions={<GalleryActions templateType={TemplateType.Callout} />}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      <PageContentBlockSeamless disablePadding>
        <TemplatesGalleryContainer
          templates={communityGuidelinesTemplates}
          templatesSetId={templatesSetId}
          loading={loading}
          baseUrl={baseUrl}
        >
          {provided => (
            <TemplatesGallery
              headerText={t('common.entitiesWithCount', {
                entityType: t('common.enums.templateTypes.CommunityGuidelines_plural'),
                count: provided.templatesCount,
              })}
              actions={<GalleryActions templateType={TemplateType.CommunityGuidelines} />}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      <PageContentBlockSeamless disablePadding>
        <TemplatesGalleryContainer
          templates={innovationFlowTemplates}
          templatesSetId={templatesSetId}
          loading={loading}
          baseUrl={baseUrl}
        >
          {provided => (
            <TemplatesGallery
              headerText={t('common.entitiesWithCount', {
                entityType: t('common.enums.templateTypes.InnovationFlow_plural'),
                count: provided.templatesCount,
              })}
              actions={<GalleryActions templateType={TemplateType.InnovationFlow} />}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      <PageContentBlockSeamless disablePadding>
        <TemplatesGalleryContainer
          templates={postTemplates}
          templatesSetId={templatesSetId}
          loading={loading}
          baseUrl={baseUrl}
        >
          {provided => (
            <TemplatesGallery
              headerText={t('common.entitiesWithCount', {
                entityType: t('common.enums.templateTypes.Post_plural'),
                count: provided.templatesCount,
              })}
              actions={<GalleryActions templateType={TemplateType.Post} />}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      <PageContentBlockSeamless disablePadding>
        <TemplatesGalleryContainer
          templates={whiteboardTemplates}
          templatesSetId={templatesSetId}
          loading={loading}
          baseUrl={baseUrl}
        >
          {provided => (
            <TemplatesGallery
              headerText={t('common.entitiesWithCount', {
                entityType: t('common.enums.templateTypes.Whiteboard_plural'),
                count: provided.templatesCount,
              })}
              actions={<GalleryActions templateType={TemplateType.Whiteboard} />}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      {creatingTemplateType && (
        <CreateTemplateDialog
          open
          onClose={() => setCreatingTemplateType(undefined)}
          templateType={creatingTemplateType}
          onSubmit={handleTemplateCreate}
        />
      )}
      {selectedTemplate && editTemplateMode && (
        <EditTemplateDialog
          open
          onClose={() => backToTemplates(baseUrl)}
          template={selectedTemplate}
          templateType={selectedTemplate.type}
          onSubmit={handleTemplateUpdate}
          onDelete={canDeleteTemplates ? () => setDeletingTemplate(selectedTemplate) : undefined}
        />
      )}
      {selectedTemplate && !editTemplateMode && (
        <PreviewTemplateDialog
          open
          onClose={() => backToTemplates(baseUrl)}
          template={selectedTemplate}
          actions={
            canEditTemplates ? (
              <Button variant="contained" onClick={() => setEditTemplateMode(true)}>
                {t('buttons.edit')}
              </Button>
            ) : undefined
          }
        />
      )}
      {deletingTemplate && (
        <ConfirmationDialog
          actions={{
            onConfirm: handleTemplateDeletion,
            onCancel: () => setDeletingTemplate(undefined),
          }}
          options={{
            show: Boolean(deletingTemplate),
          }}
          entities={{
            titleId: 'common.warning',
            content: t('pages.admin.generic.sections.templates.delete-confirmation', {
              template: deletingTemplate?.profile.displayName,
            }),
            confirmButtonTextId: 'buttons.delete',
          }}
          state={{
            isLoading: isDeletingTemplate,
          }}
        />
      )}
      {importTemplateType && (
        <ImportTemplatesDialog
          open
          onClose={() => setImportTemplateType(undefined)}
          templateType={importTemplateType}
          headerText={t('pages.admin.generic.sections.templates.import.title', {
            templateType: t(`common.enums.templateType.${importTemplateType}` as const),
          })}
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

import React, { FC, useMemo, useState } from 'react';
import TemplatesGalleryContainer from '../TemplatesGallery/TemplatesGalleryContainer';
import TemplatesGallery from '../TemplatesGallery/TemplatesGallery';
import { useAllTemplatesInTemplatesSetQuery, useCreateTemplateMutation, useDeleteTemplateMutation, useUpdateTemplateMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import EditTemplateDialog from '../Dialogs/EditTemplateDialog/EditTemplateDialog';
import { AnyTemplate } from '../../models/TemplateBase';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import { AnyTemplateFormSubmittedValues } from '../Forms/TemplateForm';
import useBackToPath from '../../../../../core/routing/useBackToPath';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { Button, ButtonProps } from '@mui/material';
import CreateTemplateDialog from '../Dialogs/CreateTemplateDialog/CreateTemplateDialog';
import { toCreateTemplateMutationVariables, toUpdateTemplateMutationVariables } from '../Forms/common/common';

interface TemplatesAdminProps {
  templatesSetId: string;
  templateId?: string;  // Template selected, if any
  baseUrl: string | undefined;
  canImportTemplates?: boolean;
  canCreateTemplates?: boolean;
  canDeleteTemplates?: boolean;
}

const CreateTemplateButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return <Button variant="outlined" {...props}>{t('common.create-new')} </Button>
}

const TemplatesAdmin: FC<TemplatesAdminProps> = ({
  templatesSetId,
  templateId,
  baseUrl = '',
  canImportTemplates = false,
  canCreateTemplates = false,
  canDeleteTemplates = false,
}) => {
  const { t } = useTranslation();
  const backToTemplates = useBackToPath();

  // Read
  const { data, loading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId },
    skip: !templatesSetId,
  });

  const {
    postTemplates,
    whiteboardTemplates,
    innovationFlowTemplates,
    calloutTemplates,
    communityGuidelinesTemplates
  } = data?.lookup.templatesSet ?? {};

  const selectedTemplate = useMemo<AnyTemplate | undefined>(() => {
    if (!templateId) return undefined;
    return [
      ...postTemplates ?? [],
      ...whiteboardTemplates ?? [],
      ...innovationFlowTemplates ?? [],
      ...communityGuidelinesTemplates ?? [],
      ...calloutTemplates ?? [],
    ].find(template => template.id === templateId);
  }, [templateId, data?.lookup.templatesSet])

  // Update
  const [updateTemplate] = useUpdateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet']
  });
  const handleTemplateUpdate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toUpdateTemplateMutationVariables(templateId!, values);
    await updateTemplate({
      variables
    });
  };

  // Create
  const [creatingTemplateType, setCreatingTemplateType] = useState<TemplateType>();
  const [createTemplate] = useCreateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet']
  });
  const handleTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toCreateTemplateMutationVariables(templatesSetId, creatingTemplateType!, values);
    await createTemplate({
      variables,
    });
    setCreatingTemplateType(undefined);
  };
  // Delete
  const [deletingTemplate, setDeletingTemplate] = useState<AnyTemplate>();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [handleTemplateDeletion, isDeletingTemplate] = useLoadingState(async () => {
    if (!deletingTemplate) {
      throw new TypeError('Missing Template to delete ID.');
    }
    await deleteTemplate({
      variables: {
        templateId: deletingTemplate.id
      },
      refetchQueries: ['AllTemplatesInTemplatesSet']
    });

    setDeletingTemplate(undefined);
  });

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
              headerText={t('common.enums.templateTypes.Callout')}
              actions={canCreateTemplates ? <CreateTemplateButton onClick={() => setCreatingTemplateType(TemplateType.Callout)} /> : undefined}
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
              headerText={t('common.enums.templateTypes.CommunityGuidelines')}
              actions={canCreateTemplates ? <CreateTemplateButton onClick={() => setCreatingTemplateType(TemplateType.CommunityGuidelines)} /> : undefined}
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
              headerText={t('common.enums.templateTypes.InnovationFlow')}
              actions={canCreateTemplates ? <CreateTemplateButton onClick={() => setCreatingTemplateType(TemplateType.InnovationFlow)} /> : undefined}
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
              headerText={t('common.enums.templateTypes.Post')}
              actions={canCreateTemplates ? <CreateTemplateButton onClick={() => setCreatingTemplateType(TemplateType.Post)} /> : undefined}
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
              headerText={t('common.enums.templateTypes.Whiteboard')}
              actions={canCreateTemplates ? <CreateTemplateButton onClick={() => setCreatingTemplateType(TemplateType.Whiteboard)} /> : undefined}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      {creatingTemplateType && (
        <CreateTemplateDialog
          open
          onClose={() => backToTemplates(`${baseUrl}/settings`)}
          templateType={creatingTemplateType}
          onSubmit={handleTemplateCreate}
        />
      )}
      {selectedTemplate && (
        <EditTemplateDialog
          open
          onClose={() => backToTemplates(`${baseUrl}/settings`)}
          template={selectedTemplate}
          templateType={selectedTemplate.type}
          onSubmit={handleTemplateUpdate}
          onDelete={canDeleteTemplates ? () => setDeletingTemplate(selectedTemplate) : undefined}
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

    </>
  );
};

export default TemplatesAdmin;
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import TemplatesGallery from '../TemplatesGallery/TemplatesGallery';
import {
  useAllTemplatesInTemplatesSetQuery,
  useCreateTemplateFromSpaceMutation,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useTemplateContentLazyQuery,
  useUpdateCalloutTemplateMutation,
  useUpdateCommunityGuidelinesMutation,
  useUpdateTemplateFromSpaceMutation,
  useUpdateTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import EditTemplateDialog from '../Dialogs/CreateEditTemplateDialog/EditTemplateDialog';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { AnyTemplateFormSubmittedValues } from '../Forms/TemplateForm';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { Button, ButtonProps } from '@mui/material';
import CreateTemplateDialog from '../Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import {
  toCreateTemplateFromSpaceContentMutationVariables,
  toCreateTemplateMutationVariables,
  toUpdateTemplateMutationVariables,
} from '../Forms/common/mappings';
import useHandlePreviewImages from '../../utils/useHandlePreviewImages';
import PreviewTemplateDialog from '../Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import ImportTemplatesDialog, { ImportTemplatesOptions } from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { TemplateContentSpaceFormSubmittedValues } from '../Forms/TemplateContentSpaceForm';
import { SpaceContentTemplate } from '@/domain/templates/models/SpaceContentTemplate';
import { TemplateContentCalloutFormSubmittedValues } from '../Forms/TemplateContentCalloutForm';
import { WhiteboardTemplateFormSubmittedValues } from '../Forms/WhiteboardTemplateForm';

type TemplatePermissionCallback = (templateType: TemplateType) => boolean;
const defaultPermissionDenied: TemplatePermissionCallback = () => false;

type TemplatesAdminProps = {
  templatesSetId: string;
  templateId?: string; // Template selected, if any
  alwaysEditTemplate?: boolean; // If true, the selected template is editable, if false preview dialog is shown
  baseUrl: string | undefined;
  canCreateTemplates?: TemplatePermissionCallback;
  canEditTemplates?: TemplatePermissionCallback;
  canDeleteTemplates?: TemplatePermissionCallback;
  canImportTemplates?: TemplatePermissionCallback;
  importTemplateOptions?: ImportTemplatesOptions;
};

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

const TemplatesAdmin = ({
  templatesSetId,
  templateId,
  alwaysEditTemplate = false,
  baseUrl = '',
  canImportTemplates = defaultPermissionDenied,
  importTemplateOptions = {},
  canCreateTemplates = defaultPermissionDenied,
  canEditTemplates = defaultPermissionDenied,
  canDeleteTemplates = defaultPermissionDenied,
}: PropsWithChildren<TemplatesAdminProps>) => {
  const { t } = useTranslation();
  const backToTemplates = useBackWithDefaultUrl(baseUrl);
  const { handlePreviewTemplates } = useHandlePreviewImages();

  // Read Template
  const { data, loading } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId },
    skip: !templatesSetId,
  });

  const { calloutTemplates, spaceTemplates, communityGuidelinesTemplates, postTemplates, whiteboardTemplates } =
    data?.lookup.templatesSet ?? {};

  const selectedTemplate = useMemo<AnyTemplate | undefined>(() => {
    if (!templateId) return undefined;
    return [
      ...(postTemplates ?? []),
      ...(whiteboardTemplates ?? []),
      ...(communityGuidelinesTemplates ?? []),
      ...(calloutTemplates ?? []),
      ...(spaceTemplates ?? []),
    ].find(template => template.id === templateId);
  }, [templateId, data?.lookup.templatesSet]);

  // Update Template
  const [editTemplateMode, setEditTemplateMode] = useState(alwaysEditTemplate);

  const refetchQueries = ['AllTemplatesInTemplatesSet', 'TemplateContent'];
  const [updateTemplate] = useUpdateTemplateMutation({ refetchQueries });
  const [updateCallout] = useUpdateCalloutTemplateMutation({ refetchQueries });
  const [updateCommunityGuidelines] = useUpdateCommunityGuidelinesMutation({ refetchQueries });
  const [updateTemplateFromCollaboration] = useUpdateTemplateFromSpaceMutation({ refetchQueries });

  const handleTemplateUpdate = async (values: AnyTemplateFormSubmittedValues) => {
    if (!selectedTemplate) {
      return;
    }
    const {
      updateTemplateVariables,
      updateCalloutVariables,
      updateCommunityGuidelinesVariables,
      updateSpaceTemplateVariables: updateCollaborationTemplateVariables,
    } = toUpdateTemplateMutationVariables(templateId!, selectedTemplate, values);

    const result = await updateTemplate({
      variables: updateTemplateVariables,
    });
    if (updateCalloutVariables) {
      const result = await updateCallout({
        variables: updateCalloutVariables,
      });
      // update whiteboard (framing) visuals
      await handlePreviewTemplates(
        values as TemplateContentCalloutFormSubmittedValues,
        result.data?.updateCallout.framing.whiteboard
      );
    }
    if (updateCommunityGuidelinesVariables) {
      await updateCommunityGuidelines({
        variables: updateCommunityGuidelinesVariables,
      });
    }
    if (updateCollaborationTemplateVariables) {
      await updateTemplateFromCollaboration({
        variables: updateCollaborationTemplateVariables,
      });
    }
    // include preview for other template type other than callout
    if (updateTemplateVariables.includeProfileVisuals && !updateCalloutVariables) {
      // Handle the visual in a special way with the preview images
      await handlePreviewTemplates(values as WhiteboardTemplateFormSubmittedValues, result.data?.updateTemplate);
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
  const [createSpaceContentTemplate] = useCreateTemplateFromSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });

  // Create a Collaboration template
  const handleCollaborationTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toCreateTemplateFromSpaceContentMutationVariables(
      templatesSetId,
      values as TemplateContentSpaceFormSubmittedValues
    );
    await createSpaceContentTemplate({
      variables,
    });
    setCreatingTemplateType(undefined);
  };

  const handleTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    // Special case, handle Collaboration templates differently for now, until we have full support for editing them and sending all the data, and not just for cloning an existing collaboration
    if (creatingTemplateType === TemplateType.Space) {
      return handleCollaborationTemplateCreate(values);
    }

    const variables = toCreateTemplateMutationVariables(templatesSetId, creatingTemplateType!, values);
    const result = await createTemplate({
      variables,
    });
    if (creatingTemplateType === TemplateType.Whiteboard) {
      // Handle the visual in a special way with the preview images
      handlePreviewTemplates(values as WhiteboardTemplateFormSubmittedValues, result.data?.createTemplate);
    } else if (creatingTemplateType === TemplateType.Callout) {
      // update whiteboard (framing) visuals
      handlePreviewTemplates(
        values as TemplateContentCalloutFormSubmittedValues,
        result.data?.createTemplate.callout?.framing.whiteboard
      );
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
    backToTemplates();
  });

  // Import Template
  const [importTemplateType, setImportTemplateType] = useState<TemplateType>();
  const [getTemplateContent] = useTemplateContentLazyQuery();
  const handleImportTemplate = async (importedTemplate: AnyTemplate) => {
    const { id, type: templateType } = importedTemplate;
    // TODO: Special case for collaboration, just for now, until we can import collaborations entirely
    if (templateType === TemplateType.Space) {
      return handleImportCollaborationTemplate(importedTemplate as SpaceContentTemplate);
    }

    const { data } = await getTemplateContent({
      variables: {
        templateId: id,
        includeCallout: templateType === TemplateType.Callout,
        includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
        includeSpace: false, // templateType === TemplateType.Space,
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
  // Special case for Collaboration templates
  const handleImportCollaborationTemplate = async (importedTemplate: SpaceContentTemplate) => {
    const { id } = importedTemplate;
    const { data } = await getTemplateContent({
      variables: {
        templateId: id,
        includeSpace: true,
      },
    });
    const template = data?.lookup.template;
    if (template) {
      const variables = toCreateTemplateFromSpaceContentMutationVariables(templatesSetId, {
        ...template,
        spaceId: template.contentSpace?.id,
      });
      await createSpaceContentTemplate({
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
        {canCreateTemplates(templateType) ? (
          <CreateTemplateButton onClick={() => setCreatingTemplateType(templateType)} />
        ) : null}
      </>
    ),
    [canCreateTemplates, canImportTemplates, setCreatingTemplateType, setImportTemplateType]
  );
  const buildTemplateLink = (template: AnyTemplate) => {
    if (template.profile.url) {
      if (alwaysEditTemplate && baseUrl && !template.profile.url.startsWith(baseUrl)) {
        const templateId = template.profile.url.split('/').pop();
        return { to: `${baseUrl}/${templateId}` };
      } else {
        return { to: template.profile.url };
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
            entityType: t(`common.enums.templateType.${TemplateType.Space}_plural`),
            count: spaceTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.Space} />}
          templates={spaceTemplates}
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
          headerText={t('common.entitiesWithCount', {
            entityType: t(`common.enums.templateType.${TemplateType.Whiteboard}_plural`),
            count: whiteboardTemplates?.length ?? 0,
          })}
          actions={<GalleryActions templateType={TemplateType.Whiteboard} />}
          templates={whiteboardTemplates}
          loading={loading}
          buildTemplateLink={buildTemplateLink}
        />
      </PageContentBlockSeamless>
      {creatingTemplateType && (
        <CreateTemplateDialog
          open
          onClose={() => setCreatingTemplateType(undefined)}
          templateType={creatingTemplateType}
          onSubmit={handleTemplateCreate}
          temporaryLocation
        />
      )}
      {selectedTemplate && editTemplateMode && (
        <EditTemplateDialog
          open
          onClose={() => backToTemplates()}
          onCancel={alwaysEditTemplate ? undefined : () => setEditTemplateMode(false)}
          template={selectedTemplate}
          templateType={selectedTemplate.type}
          onSubmit={handleTemplateUpdate}
          onDelete={canDeleteTemplates(selectedTemplate.type) ? () => setDeletingTemplate(selectedTemplate) : undefined}
        />
      )}
      {selectedTemplate && !editTemplateMode && (
        <PreviewTemplateDialog
          open
          onClose={() => backToTemplates()}
          template={selectedTemplate}
          actions={
            canEditTemplates(selectedTemplate.type) ? (
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
          subtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
          onSelectTemplate={handleImportTemplate}
          {...importTemplateOptions}
          actionButton={
            <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
              {t('buttons.import')}
            </Button>
          }
        />
      )}
    </>
  );
};

export default TemplatesAdmin;

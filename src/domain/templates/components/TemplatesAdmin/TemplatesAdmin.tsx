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
  useCreateTemplateFromContentSpaceMutation,
  useUpdateWhiteboardMutation,
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
import TemplateActionButton from '../Buttons/TemplateActionButton';
import {
  toCreateTemplateFromSpaceMutationVariables,
  toCreateTemplateFromSpaceContentMutationVariables,
  toCreateTemplateMutationVariables,
  toUpdateTemplateMutationVariables,
} from '../Forms/common/mappings';
import useHandlePreviewImages from '../../utils/useHandlePreviewImages';
import PreviewTemplateDialog from '../Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import ImportTemplatesDialog, { ImportTemplatesOptions } from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateSpaceFormSubmittedValues } from '../Forms/TemplateSpaceForm';
import { TemplateCalloutFormSubmittedValues } from '../Forms/TemplateCalloutForm';
import { TemplateWhiteboardFormSubmittedValues } from '../Forms/TemplateWhiteboardForm';
import { SpaceTemplate } from '../../models/SpaceTemplate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useUploadMediaGalleryVisuals from '@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals';

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
  showCounts?: boolean;
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
  showCounts = true,
}: PropsWithChildren<TemplatesAdminProps>) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const backToTemplates = useBackWithDefaultUrl(baseUrl);
  const { handlePreviewTemplates } = useHandlePreviewImages();
  const { uploadMediaGalleryVisuals } = useUploadMediaGalleryVisuals();

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

  const refetchQueries = ['AllTemplatesInTemplatesSet', 'TemplateContent', 'SpaceTemplateContent'];
  const [updateTemplate] = useUpdateTemplateMutation({ refetchQueries });
  const [updateCallout] = useUpdateCalloutTemplateMutation({ refetchQueries });
  const [updateCommunityGuidelines] = useUpdateCommunityGuidelinesMutation({ refetchQueries });
  const [updateSpaceTemplateFromExistingSpace] = useUpdateTemplateFromSpaceMutation({ refetchQueries });
  const [updateWhiteboard] = useUpdateWhiteboardMutation({ refetchQueries });

  const handleTemplateUpdate = async (values: AnyTemplateFormSubmittedValues) => {
    if (!selectedTemplate) {
      return;
    }
    const {
      updateTemplateVariables,
      updateCalloutVariables,
      updateCommunityGuidelinesVariables,
      updateSpaceContentTemplateVariables,
      updateWhiteboardVariables,
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
        (values as TemplateCalloutFormSubmittedValues).callout?.framing.whiteboard?.previewImages,
        result.data?.updateCallout.framing.whiteboard
      );
      // update media gallery visuals
      await uploadMediaGalleryVisuals({
        mediaGalleryId: result.data?.updateCallout.framing.mediaGallery?.id,
        visuals: (values as TemplateCalloutFormSubmittedValues).callout?.framing.mediaGallery?.visuals,
        existingVisualIds: [], //!!
        reuploadVisuals: true,
      });
    }
    if (updateCommunityGuidelinesVariables) {
      await updateCommunityGuidelines({
        variables: updateCommunityGuidelinesVariables,
      });
    }
    if (updateSpaceContentTemplateVariables) {
      await updateSpaceTemplateFromExistingSpace({
        variables: updateSpaceContentTemplateVariables,
      });
    }
    if (updateWhiteboardVariables) {
      await updateWhiteboard({
        variables: updateWhiteboardVariables,
      });
    }
    // include preview for other template type other than callout
    if (updateTemplateVariables.includeProfileVisuals && !updateCalloutVariables) {
      // Handle the visual in a special way with the preview images
      await handlePreviewTemplates(
        (values as TemplateWhiteboardFormSubmittedValues).whiteboardPreviewImages,
        result.data?.updateTemplate
      );
    }
    if (!alwaysEditTemplate) {
      setEditTemplateMode(false);
    }
    notify(t('templateLibrary.notifications.templateSaved'), 'success');
  };

  // Create Template
  const [creatingTemplateType, setCreatingTemplateType] = useState<TemplateType>();
  const [createTemplate] = useCreateTemplateMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [createSpaceTemplate] = useCreateTemplateFromSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [createTemplateFromSpaceContent] = useCreateTemplateFromContentSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });

  // Create a Collaboration template
  const handleSpaceTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    const variables = toCreateTemplateFromSpaceMutationVariables(
      templatesSetId,
      values as TemplateSpaceFormSubmittedValues
    );
    await createSpaceTemplate({
      variables,
    });
    setCreatingTemplateType(undefined);
  };

  const handleTemplateCreate = async (values: AnyTemplateFormSubmittedValues) => {
    // Special case, handle Collaboration templates differently for now, until we have full support for editing them and sending all the data, and not just for cloning an existing collaboration
    if (creatingTemplateType === TemplateType.Space) {
      return handleSpaceTemplateCreate(values);
    }

    const variables = toCreateTemplateMutationVariables(templatesSetId, creatingTemplateType!, values);
    const result = await createTemplate({
      variables,
    });
    if (creatingTemplateType === TemplateType.Whiteboard) {
      // Handle the visual in a special way with the preview images
      await handlePreviewTemplates(
        (values as TemplateWhiteboardFormSubmittedValues).whiteboardPreviewImages,
        result.data?.createTemplate
      );
    } else if (creatingTemplateType === TemplateType.Callout) {
      // update whiteboard (framing) visuals
      await handlePreviewTemplates(
        (values as TemplateCalloutFormSubmittedValues).callout?.framing.whiteboard?.previewImages,
        result.data?.createTemplate.callout?.framing.whiteboard
      );
      await uploadMediaGalleryVisuals({
        mediaGalleryId: result.data?.createTemplate.callout?.framing.mediaGallery?.id,
        visuals: (values as TemplateCalloutFormSubmittedValues).callout?.framing.mediaGallery?.visuals,
        reuploadVisuals: true,
      });
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
      return handleImportSpaceTemplate(importedTemplate as SpaceTemplate);
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
  const handleImportSpaceTemplate = async (importedTemplate: SpaceTemplate) => {
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
        contentSpaceId: template.contentSpace?.id ?? '',
      });
      await createTemplateFromSpaceContent({
        variables,
      });
      setImportTemplateType(undefined);
    }
  };

  const shouldRenderTemplateSection = <T extends { length: number }>(
    templates: T | undefined,
    templateType: TemplateType
  ): boolean => {
    return (templates && templates.length > 0) || canCreateTemplates(templateType) || canImportTemplates(templateType);
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
      {shouldRenderTemplateSection(spaceTemplates, TemplateType.Space) && (
        <PageContentBlockSeamless disablePadding>
          <TemplatesGallery
            headerText={
              showCounts
                ? t('common.entitiesWithCount', {
                    entityType: t(`common.enums.templateType.${TemplateType.Space}_plural`),
                    count: spaceTemplates?.length ?? 0,
                  })
                : t('common.entities', {
                    entityType: t(`common.enums.templateType.${TemplateType.Space}_plural`),
                  })
            }
            headerId={TemplateType.Space.toLowerCase()}
            actions={<GalleryActions templateType={TemplateType.Space} />}
            templates={spaceTemplates}
            loading={loading}
            buildTemplateLink={buildTemplateLink}
          />
        </PageContentBlockSeamless>
      )}
      {shouldRenderTemplateSection(calloutTemplates, TemplateType.Callout) && (
        <PageContentBlockSeamless disablePadding>
          <TemplatesGallery
            headerText={
              showCounts
                ? t('common.entitiesWithCount', {
                    entityType: t(`common.enums.templateType.${TemplateType.Callout}_plural`),
                    count: calloutTemplates?.length ?? 0,
                  })
                : t('common.entities', {
                    entityType: t(`common.enums.templateType.${TemplateType.Callout}_plural`),
                  })
            }
            headerId={TemplateType.Callout.toLowerCase()}
            actions={<GalleryActions templateType={TemplateType.Callout} />}
            templates={calloutTemplates}
            loading={loading}
            buildTemplateLink={buildTemplateLink}
          />
        </PageContentBlockSeamless>
      )}
      {shouldRenderTemplateSection(whiteboardTemplates, TemplateType.Whiteboard) && (
        <PageContentBlockSeamless disablePadding>
          <TemplatesGallery
            headerText={
              showCounts
                ? t('common.entitiesWithCount', {
                    entityType: t(`common.enums.templateType.${TemplateType.Whiteboard}_plural`),
                    count: whiteboardTemplates?.length ?? 0,
                  })
                : t('common.entities', {
                    entityType: t(`common.enums.templateType.${TemplateType.Whiteboard}_plural`),
                  })
            }
            headerId={TemplateType.Whiteboard.toLowerCase()}
            actions={<GalleryActions templateType={TemplateType.Whiteboard} />}
            templates={whiteboardTemplates}
            loading={loading}
            buildTemplateLink={buildTemplateLink}
          />
        </PageContentBlockSeamless>
      )}
      {shouldRenderTemplateSection(postTemplates, TemplateType.Post) && (
        <PageContentBlockSeamless disablePadding>
          <TemplatesGallery
            headerText={
              showCounts
                ? t('common.entitiesWithCount', {
                    entityType: t(`common.enums.templateType.${TemplateType.Post}_plural`),
                    count: postTemplates?.length ?? 0,
                  })
                : t('common.entities', {
                    entityType: t(`common.enums.templateType.${TemplateType.Post}_plural`),
                  })
            }
            headerId={TemplateType.Post.toLowerCase()}
            actions={<GalleryActions templateType={TemplateType.Post} />}
            templates={postTemplates}
            loading={loading}
            buildTemplateLink={buildTemplateLink}
          />
        </PageContentBlockSeamless>
      )}
      {shouldRenderTemplateSection(communityGuidelinesTemplates, TemplateType.CommunityGuidelines) && (
        <PageContentBlockSeamless disablePadding>
          <TemplatesGallery
            headerText={
              showCounts
                ? t('common.entitiesWithCount', {
                    entityType: t(`common.enums.templateType.${TemplateType.CommunityGuidelines}_plural`),
                    count: communityGuidelinesTemplates?.length ?? 0,
                  })
                : t('common.entities', {
                    entityType: t(`common.enums.templateType.${TemplateType.CommunityGuidelines}_plural`),
                  })
            }
            headerId={TemplateType.CommunityGuidelines.toLowerCase()}
            actions={<GalleryActions templateType={TemplateType.CommunityGuidelines} />}
            templates={communityGuidelinesTemplates}
            loading={loading}
            buildTemplateLink={buildTemplateLink}
          />
        </PageContentBlockSeamless>
      )}
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
          onClose={() => {
            backToTemplates();
            window.setTimeout(() => {
              if (!alwaysEditTemplate) {
                setEditTemplateMode(false);
              }
            }, 100);
          }}
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
          actionButton={() => <TemplateActionButton textKey="buttons.import" />}
        />
      )}
    </>
  );
};

export default TemplatesAdmin;

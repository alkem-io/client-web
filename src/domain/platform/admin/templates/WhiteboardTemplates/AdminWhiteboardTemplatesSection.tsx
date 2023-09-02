import React, { useCallback } from 'react';
import {
  useCreateWhiteboardTemplateMutation,
  useDeleteWhiteboardTemplateMutation,
  useWhiteboardTemplateContentLazyQuery,
  useUpdateWhiteboardTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AdminWhiteboardTemplateFragment,
  UpdateWhiteboardTemplateMutation,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import EditWhiteboardTemplateDialog from './EditWhiteboardTemplateDialog';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import CreateWhiteboardTemplateDialog from './CreateWhiteboardTemplateDialog';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';
import { WhiteboardTemplateFormSubmittedValues } from './WhiteboardTemplateForm';
import { useTranslation } from 'react-i18next';
import { InnovationPack, TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import WhiteboardImportTemplateCard from './WhitebaordImportTemplateCard';
import {
  WhiteboardPreviewImage,
  useUploadWhiteboardVisuals,
} from '../../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { CreateWhiteboardTemplateMutation } from '../../../../../core/apollo/generated/graphql-schema';

interface AdminWhiteboardTemplatesSectionProps {
  whiteboardTemplatesLocation: 'space' | 'platform';
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminWhiteboardTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (post: AdminWhiteboardTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<AdminWhiteboardTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminWhiteboardTemplatesSection = ({
  whiteboardTemplatesLocation,
  ...props
}: AdminWhiteboardTemplatesSectionProps) => {
  const { t } = useTranslation();
  const { uploadVisuals } = useUploadWhiteboardVisuals();

  const [fetchWhiteboardTemplateContent, { data: whiteboardContent }] = useWhiteboardTemplateContentLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const getWhiteboardTemplateContent = useCallback(
    (template: AdminWhiteboardTemplateFragment) => {
      fetchWhiteboardTemplateContent({
        variables: { whiteboardTemplateId: template.id },
      });
    },
    [fetchWhiteboardTemplateContent]
  );

  // Importing only makes sense on space templates, not on platform templates:
  const [fetchImportedWhiteboardTemplateContent, { data: importedWhiteboardContent }] =
    useWhiteboardTemplateContentLazyQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  const getImportedWhiteboardTemplateContent = useCallback(
    (whiteboardTemplate: AdminWhiteboardTemplateFragment & TemplateInnovationPackMetaInfo) => {
      fetchImportedWhiteboardTemplateContent({
        variables: { whiteboardTemplateId: whiteboardTemplate.id },
      });
    },
    [fetchImportedWhiteboardTemplateContent]
  );

  const onMutationCalled = (
    mutationResult: { id: string; profile: { id: string; visual?: { id: string } } } | null | undefined,
    previewImages?: WhiteboardPreviewImage[]
  ) => {
    if (mutationResult?.profile.visual?.id && previewImages) {
      uploadVisuals(previewImages, { cardVisualId: mutationResult.profile.visual.id });
    }
  };

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.WhiteboardTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.whiteboards'),
      })}
      templateCardComponent={WhiteboardTemplateCard}
      templateImportCardComponent={WhiteboardImportTemplateCard}
      templatePreviewComponent={WhiteboardTemplatePreview}
      getWhiteboardTemplateContent={getWhiteboardTemplateContent}
      getImportedWhiteboardTemplateContent={getImportedWhiteboardTemplateContent}
      whiteboardTemplateContent={whiteboardContent?.lookup.whiteboardTemplate}
      importedTemplateContent={importedWhiteboardContent?.lookup.whiteboardTemplate}
      createTemplateDialogComponent={CreateWhiteboardTemplateDialog}
      editTemplateDialogComponent={EditWhiteboardTemplateDialog}
      // TODO:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useCreateTemplateMutation={useCreateWhiteboardTemplateMutation as any}
      useUpdateTemplateMutation={
        useUpdateWhiteboardTemplateMutation as MutationHook<
          Partial<WhiteboardTemplateFormSubmittedValues> & { templateId: string },
          UpdateWhiteboardTemplateMutation
        >
      }
      useDeleteTemplateMutation={useDeleteWhiteboardTemplateMutation}
      onTemplateCreated={(mutationResult: CreateWhiteboardTemplateMutation | undefined | null, previewImages) =>
        onMutationCalled(mutationResult?.['createWhiteboardTemplate'], previewImages)
      }
      onTemplateUpdated={(mutationResult, previewImages) =>
        onMutationCalled(mutationResult?.updateWhiteboardTemplate, previewImages)
      }
    />
  );
};

export default AdminWhiteboardTemplatesSection;

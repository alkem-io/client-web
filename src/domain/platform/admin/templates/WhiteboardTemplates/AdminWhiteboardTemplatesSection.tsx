import React, { useCallback } from 'react';
import {
  useCreateWhiteboardTemplateMutation,
  useDeleteWhiteboardTemplateMutation,
  useUpdateWhiteboardTemplateMutation,
  useWhiteboardTemplateContentLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AdminWhiteboardTemplateFragment,
  CreateWhiteboardTemplateMutation,
  UpdateWhiteboardTemplateMutation,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection from '../AdminTemplatesSection';
import EditWhiteboardTemplateDialog from './EditWhiteboardTemplateDialog';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import CreateWhiteboardTemplateDialog from './CreateWhiteboardTemplateDialog';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';
import { useTranslation } from 'react-i18next';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import WhiteboardImportTemplateCard from './WhitebaordImportTemplateCard';
import {
  useUploadWhiteboardVisuals,
  WhiteboardPreviewImage,
} from '../../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { Identifiable } from '../../../../../core/utils/Identifiable';

interface AdminWhiteboardTemplatesSectionProps {
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

const AdminWhiteboardTemplatesSection = (props: AdminWhiteboardTemplatesSectionProps) => {
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
    (whiteboardTemplate: Identifiable) => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useUpdateTemplateMutation={useUpdateWhiteboardTemplateMutation as any}
      useDeleteTemplateMutation={useDeleteWhiteboardTemplateMutation}
      onTemplateCreated={(mutationResult: CreateWhiteboardTemplateMutation | undefined | null, previewImages) =>
        onMutationCalled(mutationResult?.createWhiteboardTemplate, previewImages)
      }
      onTemplateUpdated={(mutationResult: UpdateWhiteboardTemplateMutation | undefined | null, previewImages) =>
        onMutationCalled(mutationResult?.updateWhiteboardTemplate, previewImages)
      }
    />
  );
};

export default AdminWhiteboardTemplatesSection;

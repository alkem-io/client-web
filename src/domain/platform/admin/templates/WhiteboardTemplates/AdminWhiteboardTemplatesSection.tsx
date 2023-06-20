import React, { useCallback } from 'react';
import {
  useCreateWhiteboardTemplateMutation,
  useDeleteWhiteboardTemplateMutation,
  useSpaceTemplatesAdminWhiteboardTemplateWithValueLazyQuery,
  useInnovationPackWhiteboardTemplateWithValueLazyQuery,
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
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
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
  const { spaceNameId, innovationPackNameId } = useUrlParams();
  const { uploadVisuals } = useUploadWhiteboardVisuals();

  const [fetchWhiteboardTemplateFromSpaceValue, { data: dataFromSpace }] =
    useSpaceTemplatesAdminWhiteboardTemplateWithValueLazyQuery({
      fetchPolicy: 'cache-and-network',
    });

  const [fetchWhiteboardTemplateFromPlatformValue, { data: dataFromPlatform }] =
    useInnovationPackWhiteboardTemplateWithValueLazyQuery({
      fetchPolicy: 'cache-and-network',
    });

  const getTemplateValue = useCallback(
    (template: AdminWhiteboardTemplateFragment) => {
      if (whiteboardTemplatesLocation === 'space' && spaceNameId) {
        fetchWhiteboardTemplateFromSpaceValue({
          variables: { spaceId: spaceNameId, whiteboardTemplateId: template.id },
        });
      } else if (whiteboardTemplatesLocation === 'platform' && innovationPackNameId) {
        fetchWhiteboardTemplateFromPlatformValue({
          variables: { innovationPackId: innovationPackNameId, whiteboardTemplateId: template.id },
        });
      }
    },
    [spaceNameId, innovationPackNameId, fetchWhiteboardTemplateFromSpaceValue, fetchWhiteboardTemplateFromPlatformValue]
  );

  const getWhiteboardValue = () => {
    switch (whiteboardTemplatesLocation) {
      case 'space':
        return dataFromSpace?.space.templates?.whiteboardTemplate;
      case 'platform':
        return dataFromPlatform?.platform.library.innovationPack?.templates?.whiteboardTemplate;
    }
  };

  // Importing only makes sense on space templates, not on platform templates:
  const [fetchInnovationPackWhiteboardValue, { data: importedWhiteboardValue }] =
    useInnovationPackWhiteboardTemplateWithValueLazyQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  const getImportedTemplateValue = useCallback(
    (template: AdminWhiteboardTemplateFragment & TemplateInnovationPackMetaInfo) => {
      fetchInnovationPackWhiteboardValue({
        variables: { innovationPackId: template.innovationPackId, whiteboardTemplateId: template.id },
      });
    },
    [fetchInnovationPackWhiteboardValue]
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
      getTemplateValue={getTemplateValue}
      getImportedTemplateValue={getImportedTemplateValue}
      templateValue={getWhiteboardValue()}
      importedTemplateValue={importedWhiteboardValue?.platform.library?.innovationPack?.templates?.whiteboardTemplate}
      createTemplateDialogComponent={CreateWhiteboardTemplateDialog}
      editTemplateDialogComponent={EditWhiteboardTemplateDialog}
      //getImportedTemplateValue={getImportedTemplateValue}
      //importedTemplateValue={importedWhiteboardValue?.platform.library?.innovationPack?.templates?.whiteboardTemplate}
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

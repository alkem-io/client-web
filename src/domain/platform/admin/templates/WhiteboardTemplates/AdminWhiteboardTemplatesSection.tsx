import React, { useCallback } from 'react';
import {
  useCreateWhiteboardTemplateMutation,
  useDeleteWhiteboardTemplateMutation,
  useHubTemplatesAdminWhiteboardTemplateWithValueLazyQuery,
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
import CanvasImportTemplateCard from './WhitebaordImportTemplateCard';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';

interface AdminWhiteboardTemplatesSectionProps {
  whiteboardTemplatesLocation: 'hub' | 'platform';
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminWhiteboardTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminWhiteboardTemplateFragment) => LinkWithState;
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
  const { hubNameId, innovationPackNameId } = useUrlParams();

  const [fetchWhiteboardTemplateFromHubValue, { data: dataFromHub }] =
    useHubTemplatesAdminWhiteboardTemplateWithValueLazyQuery({
      fetchPolicy: 'cache-and-network',
    });

  const [fetchWhiteboardTemplateFromPlatformValue, { data: dataFromPlatform }] =
    useInnovationPackWhiteboardTemplateWithValueLazyQuery({
      fetchPolicy: 'cache-and-network',
    });

  const getTemplateValue = useCallback(
    (template: AdminWhiteboardTemplateFragment) => {
      if (whiteboardTemplatesLocation === 'hub' && hubNameId) {
        fetchWhiteboardTemplateFromHubValue({ variables: { hubId: hubNameId, whiteboardTemplateId: template.id } });
      } else if (whiteboardTemplatesLocation === 'platform' && innovationPackNameId) {
        fetchWhiteboardTemplateFromPlatformValue({
          variables: { innovationPackId: innovationPackNameId, whiteboardTemplateId: template.id },
        });
      }
    },
    [hubNameId, innovationPackNameId, fetchWhiteboardTemplateFromHubValue, fetchWhiteboardTemplateFromPlatformValue]
  );

  const getCanvasValue = () => {
    switch (whiteboardTemplatesLocation) {
      case 'hub':
        return dataFromHub?.hub.templates?.whiteboardTemplate;
      case 'platform':
        return dataFromPlatform?.platform.library.innovationPack?.templates?.whiteboardTemplate;
    }
  };

  // Importing only makes sense on hub templates, not on platform templates:
  const [fetchInnovationPackCanvasValue, { data: importedCanvasValue }] =
    useInnovationPackWhiteboardTemplateWithValueLazyQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  const getImportedTemplateValue = useCallback(
    (template: AdminWhiteboardTemplateFragment & TemplateInnovationPackMetaInfo) => {
      fetchInnovationPackCanvasValue({
        variables: { innovationPackId: template.innovationPackId, whiteboardTemplateId: template.id },
      });
    },
    [fetchInnovationPackCanvasValue]
  );

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('pages.admin.generic.sections.templates.canvas-templates')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.canvases'),
      })}
      templateCardComponent={WhiteboardTemplateCard}
      templateImportCardComponent={CanvasImportTemplateCard}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      templatePreviewComponent={WhiteboardTemplatePreview}
      getTemplateValue={getTemplateValue}
      getImportedTemplateValue={getImportedTemplateValue}
      templateValue={getCanvasValue()}
      importedTemplateValue={importedCanvasValue?.platform.library?.innovationPack?.templates?.whiteboardTemplate}
      createTemplateDialogComponent={CreateWhiteboardTemplateDialog}
      editTemplateDialogComponent={EditWhiteboardTemplateDialog}
      //getImportedTemplateValue={getImportedTemplateValue}
      //importedTemplateValue={importedCanvasValue?.platform.library?.innovationPack?.templates?.whiteboardTemplate}
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
    />
  );
};

export default AdminWhiteboardTemplatesSection;

import React from 'react';
import {
  useCreateWhiteboardTemplateMutation,
  useDeleteWhiteboardTemplateMutation,
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
import { InnovationPack } from '../InnovationPacks/InnovationPack';
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
  const { hubNameId, innovationPackNameId, whiteboardNameId } = useUrlParams();

  return (
    <AdminTemplatesSection
      {...props}
      canvasLocation={{
        isContribution: false,
        isHubTemplate: whiteboardTemplatesLocation === 'hub',
        isPlatformTemplate: whiteboardTemplatesLocation === 'platform',
        innovationPackId: innovationPackNameId,
        hubNameId: hubNameId,
        canvasId: whiteboardNameId,
      }}
      headerText={t('pages.admin.generic.sections.templates.canvas-templates')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.canvases'),
      })}
      templateCardComponent={WhiteboardTemplateCard}
      templateImportCardComponent={CanvasImportTemplateCard}
      templatePreviewComponent={WhiteboardTemplatePreview}
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
    />
  );
};

export default AdminWhiteboardTemplatesSection;

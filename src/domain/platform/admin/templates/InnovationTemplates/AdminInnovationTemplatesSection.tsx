import InnovationTemplateCard from './InnovationTemplateCard';
import CreateInnovationTemplateDialog from './CreateInnovationTemplateDialog';
import EditInnovationTemplateDialog from './EditInnovationTemplateDialog';
import React from 'react';
import {
  useCreateInnovationFlowTemplateMutation,
  useDeleteInnovationFlowTemplateMutation,
  useUpdateInnovationFlowTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { InnovationTemplateFormSubmittedValues } from './InnovationTemplateForm';
import {
  AdminInnovationFlowTemplateFragment,
  UpdateInnovationFlowTemplateMutation,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import InnovationTemplateView from './InnovationTemplateView';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import InnovationImportTemplateCard from './InnovationImportTemplateCard';

interface AdminInnovationTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminInnovationFlowTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminInnovationFlowTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<AdminInnovationFlowTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminInnovationTemplatesSection = (props: AdminInnovationTemplatesSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.InnovationFlowTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.innovation-flows'),
      })}
      templateCardComponent={InnovationTemplateCard}
      templateImportCardComponent={InnovationImportTemplateCard}
      templatePreviewComponent={InnovationTemplateView}
      createTemplateDialogComponent={CreateInnovationTemplateDialog}
      editTemplateDialogComponent={EditInnovationTemplateDialog}
      useCreateTemplateMutation={useCreateInnovationFlowTemplateMutation}
      useUpdateTemplateMutation={
        useUpdateInnovationFlowTemplateMutation as MutationHook<
          Partial<InnovationTemplateFormSubmittedValues> & { templateId: string },
          UpdateInnovationFlowTemplateMutation
        >
      }
      useDeleteTemplateMutation={useDeleteInnovationFlowTemplateMutation}
    />
  );
};

export default AdminInnovationTemplatesSection;

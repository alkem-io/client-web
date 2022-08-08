import InnovationTemplateCard from './InnovationTemplateCard';
import CreateInnovationTemplateDialog from './CreateInnovationTemplateDialog';
import EditInnovationTemplateDialog from './EditInnovationTemplateDialog';
import React from 'react';
import {
  useCreateInnovationTemplateMutation,
  useDeleteInnovationTemplateMutation,
  useUpdateInnovationTemplateMutation,
} from '../../../../hooks/generated/graphql';
import { InnovationTemplateFormSubmittedValues } from './InnovationTemplateForm';
import { AdminLifecycleTemplateFragment, UpdateInnovationTemplateMutation } from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import InnovationTemplateView from './InnovationTemplateView';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';

interface AdminInnovationTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminLifecycleTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminLifecycleTemplateFragment) => LinkWithState;
  edit?: boolean;
}

const AdminInnovationTemplatesSection = (props: AdminInnovationTemplatesSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('pages.admin.generic.sections.templates.innovation-templates')}
      templateCardComponent={InnovationTemplateCard}
      templatePreviewComponent={InnovationTemplateView}
      createTemplateDialogComponent={CreateInnovationTemplateDialog}
      editTemplateDialogComponent={EditInnovationTemplateDialog}
      useCreateTemplateMutation={useCreateInnovationTemplateMutation}
      useUpdateTemplateMutation={
        useUpdateInnovationTemplateMutation as MutationHook<
          Partial<InnovationTemplateFormSubmittedValues> & { templateId: string },
          UpdateInnovationTemplateMutation
        >
      }
      useDeleteTemplateMutation={useDeleteInnovationTemplateMutation}
    />
  );
};

export default AdminInnovationTemplatesSection;

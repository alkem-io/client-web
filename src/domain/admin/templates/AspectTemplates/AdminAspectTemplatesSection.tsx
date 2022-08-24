import AspectTemplateCard from './AspectTemplateCard';
import CreateAspectTemplateDialog from './CreateAspectTemplateDialog';
import EditAspectTemplateDialog from './EditAspectTemplateDialog';
import React from 'react';
import {
  useCreateAspectTemplateMutation,
  useDeleteAspectTemplateMutation,
  useUpdateAspectTemplateMutation,
} from '../../../../hooks/generated/graphql';
import { AspectTemplateFormSubmittedValues } from './AspectTemplateForm';
import { AdminAspectTemplateFragment, UpdateAspectTemplateMutation } from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AspectTemplateView from './AspectTemplateView';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';

interface AdminAspectTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminAspectTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminAspectTemplateFragment) => LinkWithState;
  edit?: boolean;
}

const AdminAspectTemplatesSection = (props: AdminAspectTemplatesSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('pages.admin.generic.sections.templates.aspect-templates')}
      templateCardComponent={AspectTemplateCard}
      templatePreviewComponent={AspectTemplateView}
      createTemplateDialogComponent={CreateAspectTemplateDialog}
      editTemplateDialogComponent={EditAspectTemplateDialog}
      useCreateTemplateMutation={useCreateAspectTemplateMutation}
      useUpdateTemplateMutation={
        useUpdateAspectTemplateMutation as MutationHook<
          Partial<AspectTemplateFormSubmittedValues> & { templateId: string },
          UpdateAspectTemplateMutation
        >
      }
      useDeleteTemplateMutation={useDeleteAspectTemplateMutation}
    />
  );
};

export default AdminAspectTemplatesSection;

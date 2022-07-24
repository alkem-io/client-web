import React from 'react';
import {
  useCreateCanvasTemplateMutation,
  useDeleteCanvasTemplateMutation,
  useUpdateCanvasTemplateMutation,
} from '../../../../hooks/generated/graphql';
import { AdminCanvasTemplateFragment, UpdateCanvasTemplateMutation } from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import EditCanvasTemplateDialog from './EditCanvasTemplateDialog';
import CanvasTemplateCard from './CanvasTemplateCard';
import CreateCanvasTemplateDialog from './CreateCanvasTemplateDialog';
import CanvasTemplatePreview from './CanvasTemplatePreview';
import { CanvasTemplateFormSubmittedValues } from './CanvasTemplateForm';
import { useTranslation } from 'react-i18next';

interface AdminCanvasTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminCanvasTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminCanvasTemplateFragment) => LinkWithState;
  edit?: boolean;
}

const AdminCanvasTemplatesSection = (props: AdminCanvasTemplatesSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('pages.admin.generic.sections.templates.canvas-templates')}
      templateCardComponent={CanvasTemplateCard}
      templatePreviewComponent={CanvasTemplatePreview}
      createTemplateDialogComponent={CreateCanvasTemplateDialog}
      editTemplateDialogComponent={EditCanvasTemplateDialog}
      useCreateTemplateMutation={useCreateCanvasTemplateMutation}
      useUpdateTemplateMutation={
        useUpdateCanvasTemplateMutation as MutationHook<
          Partial<CanvasTemplateFormSubmittedValues> & { templateId: string },
          UpdateCanvasTemplateMutation
        >
      }
      useDeleteTemplateMutation={useDeleteCanvasTemplateMutation}
    />
  );
};

export default AdminCanvasTemplatesSection;

import React, { useEffect, useMemo } from 'react';
import {
  useCreateCanvasTemplateMutation,
  useDeleteCanvasTemplateMutation,
  useUpdateCanvasTemplateMutation,
} from '../../../../hooks/generated/graphql';
import {
  AdminCanvasTemplateFragment,
  CanvasDetailsFragment,
  UpdateCanvasTemplateMutation,
} from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import EditCanvasTemplateDialog, { EditCanvasTemplateDialogProps } from './EditCanvasTemplateDialog';
import CanvasTemplateCard from './CanvasTemplateCard';
import CreateCanvasTemplateDialog, { CreateCanvasTemplateDialogProps } from './CreateCanvasTemplateDialog';
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
  loadCanvases: () => void;
  canvases: CanvasDetailsFragment[] | undefined;
}

const AdminCanvasTemplatesSection = ({ loadCanvases, canvases, ...props }: AdminCanvasTemplatesSectionProps) => {
  const { t } = useTranslation();

  const CreateCanvasTemplateDialogWithCanvases = useMemo(
    () => (props: CreateCanvasTemplateDialogProps) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (props.open) {
          loadCanvases();
        }
      }, [props.open]);

      return <CreateCanvasTemplateDialog {...props} />;
    },
    [loadCanvases]
  );

  const EditCanvasTemplateDialogWithCanvases = useMemo(
    () => (props: EditCanvasTemplateDialogProps) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (props.open) {
          loadCanvases();
        }
      }, [props.open]);

      return <EditCanvasTemplateDialog {...props} />;
    },
    [loadCanvases]
  );

  return (
    <AdminTemplatesSection
      {...props}
      canvases={canvases}
      headerText={t('pages.admin.generic.sections.templates.canvas-templates')}
      templateCardComponent={CanvasTemplateCard}
      templatePreviewComponent={CanvasTemplatePreview}
      createTemplateDialogComponent={CreateCanvasTemplateDialogWithCanvases}
      editTemplateDialogComponent={EditCanvasTemplateDialogWithCanvases}
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

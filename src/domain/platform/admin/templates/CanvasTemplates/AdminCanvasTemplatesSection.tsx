import React, { useCallback, useEffect, useMemo } from 'react';
import {
  useCreateCanvasTemplateMutation,
  useDeleteCanvasTemplateMutation,
  useHubTemplatesAdminCanvasTemplateWithValueLazyQuery,
  useInnovationPackCanvasTemplateWithValueLazyQuery,
  useUpdateCanvasTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AdminCanvasTemplateFragment,
  CanvasDetailsFragment,
  UpdateCanvasTemplateMutation,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import EditCanvasTemplateDialog, { EditCanvasTemplateDialogProps } from './EditCanvasTemplateDialog';
import CanvasTemplateCard from './CanvasTemplateCard';
import CreateCanvasTemplateDialog, { CreateCanvasTemplateDialogProps } from './CreateCanvasTemplateDialog';
import CanvasTemplatePreview from './CanvasTemplatePreview';
import { CanvasTemplateFormSubmittedValues } from './CanvasTemplateForm';
import { useTranslation } from 'react-i18next';
import { InnovationPack, TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import CanvasImportTemplateCard from './CanvasImportTemplateCard';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';

interface AdminCanvasTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminCanvasTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminCanvasTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadCanvases: () => void;
  canvases: CanvasDetailsFragment[];
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
  loadInnovationPacks: () => void;
  innovationPacks: InnovationPack<AdminCanvasTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminCanvasTemplatesSection = ({ loadCanvases, canvases, ...props }: AdminCanvasTemplatesSectionProps) => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();

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

  const [fetchCanvasValue, { data: canvasValue }] = useHubTemplatesAdminCanvasTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const getTemplateValue = useCallback(
    (template: AdminCanvasTemplateFragment) => {
      fetchCanvasValue({ variables: { hubId: hubNameId, canvasTemplateId: template.id } });
    },
    [hubNameId, fetchCanvasValue]
  );

  const [fetchInnovationPackCanvasValue, { data: importedCanvasValue }] =
    useInnovationPackCanvasTemplateWithValueLazyQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  const getImportedTemplateValue = useCallback(
    (template: AdminCanvasTemplateFragment & TemplateInnovationPackMetaInfo) => {
      fetchInnovationPackCanvasValue({
        variables: { innovationPackId: template.innovationPackId, canvasTemplateId: template.id },
      });
    },
    [fetchInnovationPackCanvasValue]
  );

  return (
    <AdminTemplatesSection
      {...props}
      canvases={canvases}
      headerText={t('pages.admin.generic.sections.templates.canvas-templates')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.canvases'),
      })}
      templateCardComponent={CanvasTemplateCard}
      templateImportCardComponent={CanvasImportTemplateCard}
      templatePreviewComponent={CanvasTemplatePreview}
      getTemplateValue={getTemplateValue}
      getImportedTemplateValue={getImportedTemplateValue}
      templateValue={canvasValue?.hub.templates?.canvasTemplate}
      importedTemplateValue={importedCanvasValue?.library?.innovationPack?.templates?.canvasTemplate}
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

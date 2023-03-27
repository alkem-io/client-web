import React, { useCallback, useEffect, useMemo } from 'react';
import {
  useCreateWhiteboardTemplateMutation,
  useDeleteWhiteboardTemplateMutation,
  useHubTemplatesAdminWhiteboardTemplateWithValueLazyQuery,
  useInnovationPackWhiteboardTemplateWithValueLazyQuery,
  useUpdateWhiteboardTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AdminWhiteboardTemplateFragment,
  CanvasDetailsFragment,
  UpdateWhiteboardTemplateMutation,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection, { MutationHook } from '../AdminTemplatesSection';
import EditWhiteboardTemplateDialog, { EditWhiteboardTemplateDialogProps } from './EditWhiteboardTemplateDialog';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import CreateWhiteboardTemplateDialog, { CreateWhiteboardTemplateDialogProps } from './CreateWhiteboardTemplateDialog';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';
import { WhiteboardTemplateFormSubmittedValues } from './WhiteboardTemplateForm';
import { useTranslation } from 'react-i18next';
import { InnovationPack, TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import CanvasImportTemplateCard from './WhitebaordImportTemplateCard';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';

interface AdminWhiteboardTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminWhiteboardTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: AdminWhiteboardTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadCanvases: () => void;
  canvases: CanvasDetailsFragment[];
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<AdminWhiteboardTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminWhiteboardTemplatesSection = ({
  loadCanvases,
  canvases,
  ...props
}: AdminWhiteboardTemplatesSectionProps) => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();

  const CreateWhiteboardTemplateDialogWithCanvases = useMemo(
    () => (props: CreateWhiteboardTemplateDialogProps) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (props.open) {
          loadCanvases();
        }
      }, [props.open]);

      return <CreateWhiteboardTemplateDialog {...props} />;
    },
    [loadCanvases]
  );

  const EditWhiteboardTemplateDialogWithCanvases = useMemo(
    () => (props: EditWhiteboardTemplateDialogProps) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (props.open) {
          loadCanvases();
        }
      }, [props.open]);

      return <EditWhiteboardTemplateDialog {...props} />;
    },
    [loadCanvases]
  );

  const [fetchCanvasValue, { data: canvasValue }] = useHubTemplatesAdminWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const getTemplateValue = useCallback(
    (template: AdminWhiteboardTemplateFragment) => {
      fetchCanvasValue({ variables: { hubId: hubNameId, whiteboardTemplateId: template.id } });
    },
    [hubNameId, fetchCanvasValue]
  );

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
      canvases={canvases}
      headerText={t('pages.admin.generic.sections.templates.canvas-templates')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.canvases'),
      })}
      templateCardComponent={WhiteboardTemplateCard}
      templateImportCardComponent={CanvasImportTemplateCard}
      templatePreviewComponent={WhiteboardTemplatePreview}
      getTemplateValue={getTemplateValue}
      getImportedTemplateValue={getImportedTemplateValue}
      templateValue={canvasValue?.hub.templates?.whiteboardTemplate}
      importedTemplateValue={importedCanvasValue?.platform.library?.innovationPack?.templates?.whiteboardTemplate}
      createTemplateDialogComponent={CreateWhiteboardTemplateDialogWithCanvases}
      editTemplateDialogComponent={EditWhiteboardTemplateDialogWithCanvases}
      useCreateTemplateMutation={useCreateWhiteboardTemplateMutation}
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

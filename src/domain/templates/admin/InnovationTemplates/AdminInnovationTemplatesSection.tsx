import CreateInnovationTemplateDialog from './CreateInnovationTemplateDialog';
import EditInnovationTemplateDialog from './EditInnovationTemplateDialog';
import React from 'react';
import {
  useCreateInnovationFlowTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateInnovationFlowTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import InnovationImportTemplateCard from './InnovationImportTemplateCard';
import { TemplateType } from '../../../../InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import { InnovationFlowTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';

interface AdminInnovationTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: InnovationFlowTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (post: InnovationFlowTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<InnovationFlowTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminInnovationTemplatesSection = ({ refetchQueries, ...props }: AdminInnovationTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [createInnovationFlowTemplate] = useCreateInnovationFlowTemplateMutation();
  const [updateInnovationFlowTemplate] = useUpdateInnovationFlowTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.InnovationFlowTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.innovation-flows'),
      })}
      templateCardComponent={InnovationImportTemplateCard}
      templateImportCardComponent={InnovationImportTemplateCard}
      createTemplateDialogComponent={CreateInnovationTemplateDialog}
      editTemplateDialogComponent={EditInnovationTemplateDialog}
      onCreateTemplate={variables => createInnovationFlowTemplate({ variables, refetchQueries })}
      onUpdateTemplate={variables => updateInnovationFlowTemplate({ variables, refetchQueries })}
      onDeleteTemplate={variables => deleteTemplate({ variables, refetchQueries })}
      templateType={TemplateType.InnovationFlowTemplate}
    />
  );
};

export default AdminInnovationTemplatesSection;

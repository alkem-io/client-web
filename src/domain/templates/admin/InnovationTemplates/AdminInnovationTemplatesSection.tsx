import CreateInnovationTemplateDialog from './CreateInnovationTemplateDialog';
import EditInnovationTemplateDialog from './EditInnovationTemplateDialog';
import React from 'react';

import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import InnovationImportTemplateCard from './InnovationImportTemplateCard';
import { InnovationFlowTemplateFragment, TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InnovationPack } from '../../../platform/admin/InnovationPacks/InnovationPack';
import {
  useCreateInnovationFlowTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateInnovationFlowTemplateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AdminTemplatesSection from '../../../platform/admin/InnovationPacks/OldAdminTemplatesSection';
import { Box } from '@mui/material';

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
    <Box sx={{ border: '1px solid red' }}>
      <AdminTemplatesSection
        {...props}
        headerText={t('common.enums.templateTypes.InnovationFlow')}
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
        templateType={TemplateType.InnovationFlow}
      />
    </Box>
  );
};

export default AdminInnovationTemplatesSection;

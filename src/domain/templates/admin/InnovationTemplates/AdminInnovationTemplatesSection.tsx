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
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AdminTemplatesSection from '../../../platform/admin/InnovationPacks/OldAdminTemplatesSection';
import { Box } from '@mui/material';
import { CARLOS_BORDER_RED } from '../../_new/borders';

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

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return (
    <Box sx={{ border: CARLOS_BORDER_RED }}>
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
        onCreateTemplate={variables => createTemplate({ variables, refetchQueries })}
        onUpdateTemplate={variables => updateTemplate({ variables, refetchQueries })}
        onDeleteTemplate={variables => deleteTemplate({ variables, refetchQueries })}
        templateType={TemplateType.InnovationFlow}
      />
    </Box>
  );
};

export default AdminInnovationTemplatesSection;

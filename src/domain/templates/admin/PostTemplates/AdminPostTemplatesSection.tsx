import CreatePostTemplateDialog from './CreatePostTemplateDialog';
import EditPostTemplateDialog from './EditPostTemplateDialog';
import React from 'react';
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection from '../../../platform/admin/InnovationPacks/OldAdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import { InnovationPack } from '../../../platform/admin/InnovationPacks/InnovationPack';
import PostImportTemplateCard from './PostImportTemplateCard';
import { PostTemplateFragment, TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { Box } from '@mui/material';
import TemplatesGallery from '../../_new/components/TemplatesGallery/TemplatesGallery';
import { CARLOS_BORDER_GREEN, CARLOS_BORDER_RED } from '../../_new/borders';
import TemplatesGalleryContainer from '../../_new/components/TemplatesGallery/TemplatesGalleryContainer';

interface AdminPostTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: PostTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (post: PostTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<PostTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminPostTemplatesSection = ({ refetchQueries, ...props }: AdminPostTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return (
    <>
      <Box sx={{ border: CARLOS_BORDER_RED }}>
        <AdminTemplatesSection
          {...props}
          headerText={t('common.enums.templateTypes.Post')}
          importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
            templateType: t('common.cards'),
          })}
          templateCardComponent={PostImportTemplateCard}
          templateImportCardComponent={PostImportTemplateCard}
          createTemplateDialogComponent={CreatePostTemplateDialog}
          editTemplateDialogComponent={EditPostTemplateDialog}
          onCreateTemplate={variables => createTemplate({ variables, refetchQueries })}
          onUpdateTemplate={variables => updateTemplate({ variables, refetchQueries })}
          onDeleteTemplate={async variables => {
            await deleteTemplate({ variables, refetchQueries });
          }}
          templateType={TemplateType.Post}
        />
      </Box>
    </>
  );
};

export default AdminPostTemplatesSection;

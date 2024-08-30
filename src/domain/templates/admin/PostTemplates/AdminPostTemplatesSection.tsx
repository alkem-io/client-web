import CreatePostTemplateDialog from './CreatePostTemplateDialog';
import EditPostTemplateDialog from './EditPostTemplateDialog';
import React from 'react';
import {
  useCreatePostTemplateMutation,
  useDeleteTemplateMutation,
  useUpdatePostTemplateMutation,
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

  const [createPostTemplate] = useCreatePostTemplateMutation();
  const [updatePostTemplate] = useUpdatePostTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return (
    <>
      <Box sx={{ border: '1px solid green' }}>
        <TemplatesGallery
          headerText={t('common.enums.templateTypes.Post')}
          templates={props.templates}
          buildTemplateLink={props.buildTemplateLink}
        />
      </Box>
      <Box sx={{ border: '1px solid red' }}>
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
          onCreateTemplate={variables => createPostTemplate({ variables, refetchQueries })}
          onUpdateTemplate={variables => updatePostTemplate({ variables, refetchQueries })}
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

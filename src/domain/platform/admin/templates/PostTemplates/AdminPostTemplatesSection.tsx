import PostTemplateCard from './PostTemplateCard';
import CreatePostTemplateDialog from './CreatePostTemplateDialog';
import EditPostTemplateDialog from './EditPostTemplateDialog';
import React from 'react';
import {
  useCreatePostTemplateMutation,
  useDeletePostTemplateMutation,
  useUpdatePostTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AdminPostTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import PostImportTemplateCard from './PostImportTemplateCard';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';

interface AdminPostTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminPostTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (post: AdminPostTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<AdminPostTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminPostTemplatesSection = ({ refetchQueries, ...props }: AdminPostTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [createPostTemplate] = useCreatePostTemplateMutation();
  const [updatePostTemplate] = useUpdatePostTemplateMutation();
  const [deletePostTemplate] = useDeletePostTemplateMutation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.PostTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.cards'),
      })}
      templateCardComponent={PostTemplateCard}
      templateImportCardComponent={PostImportTemplateCard}
      createTemplateDialogComponent={CreatePostTemplateDialog}
      editTemplateDialogComponent={EditPostTemplateDialog}
      onCreateTemplate={variables => createPostTemplate({ variables, refetchQueries })}
      onUpdateTemplate={variables => updatePostTemplate({ variables, refetchQueries })}
      onDeleteTemplate={async variables => {
        await deletePostTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.PostTemplate}
    />
  );
};

export default AdminPostTemplatesSection;

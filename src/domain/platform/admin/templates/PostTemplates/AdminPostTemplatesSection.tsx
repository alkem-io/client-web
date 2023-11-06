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
import PostTemplateView from './PostTemplateView';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import PostImportTemplateCard from './PostImportTemplateCard';

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

const AdminPostTemplatesSection = (props: AdminPostTemplatesSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.PostTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.cards'),
      })}
      templateCardComponent={PostTemplateCard}
      templateImportCardComponent={PostImportTemplateCard}
      templatePreviewComponent={PostTemplateView}
      createTemplateDialogComponent={CreatePostTemplateDialog}
      editTemplateDialogComponent={EditPostTemplateDialog}
      // TODO: Remove these
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useCreateTemplateMutation={useCreatePostTemplateMutation as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useUpdateTemplateMutation={useUpdatePostTemplateMutation as any}
      useDeleteTemplateMutation={useDeletePostTemplateMutation}
    />
  );
};

export default AdminPostTemplatesSection;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import {
  useCreatePostTemplateMutation,
  useDeletePostTemplateMutation,
  useUpdatePostTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AdminPostTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import MemberGuidelinesTemplateCard from './MemberGuidelinesTemplateCard';
// import CreatePostTemplateDialog from './CreatePostTemplateDialog';
// import EditPostTemplateDialog from './EditPostTemplateDialog';
import MemberGuidelinesImportTemplateCard from './MemberGuidelinesImportTemplateCard';

interface AdminMemberGuidelinesTemplatesSectionProps {
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

// DELETE THIS FILE

const AdminMemberGuidelinesTemplatesSection = ({
  refetchQueries,
  ...props
}: AdminMemberGuidelinesTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [createPostTemplate] = useCreatePostTemplateMutation();
  const [updatePostTemplate] = useUpdatePostTemplateMutation();
  const [deletePostTemplate] = useDeletePostTemplateMutation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.MemberGuidelinesTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.memberGuidelines'),
      })}
      templateCardComponent={MemberGuidelinesTemplateCard}
      templateImportCardComponent={MemberGuidelinesImportTemplateCard}
      createTemplateDialogComponent={undefined}
      editTemplateDialogComponent={undefined}
      onCreateTemplate={variables => createPostTemplate({ variables, refetchQueries })}
      onUpdateTemplate={variables => updatePostTemplate({ variables, refetchQueries })}
      onDeleteTemplate={async variables => {
        await deletePostTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.MemberGuidelines}
    />
  );
};

export default AdminMemberGuidelinesTemplatesSection;

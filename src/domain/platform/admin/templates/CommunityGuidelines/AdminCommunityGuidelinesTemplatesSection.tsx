import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import { AdminCommunityGuidelinesTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import CommunityGuidelinesImportTemplateCard from './CommunityGuidelinesImportTemplateCard';

interface AdminCommunityGuidelinesTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminCommunityGuidelinesTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (callout: AdminCommunityGuidelinesTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<AdminCommunityGuidelinesTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminCommunityGuidelinesTemplatesSection = ({
  refetchQueries,
  ...props
}: AdminCommunityGuidelinesTemplatesSectionProps) => {
  const { t } = useTranslation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.CommunityGuidelinesTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('community.communityGuidelines.title'),
      })}
      templateCardComponent={CommunityGuidelinesImportTemplateCard}
      templateImportCardComponent={CommunityGuidelinesImportTemplateCard}
      createTemplateDialogComponent={undefined}
      editTemplateDialogComponent={undefined}
      onCreateTemplate={() => Promise.resolve({ data: null, errors: [] })}
      onUpdateTemplate={() => Promise.resolve({ data: null, errors: [] })}
      onDeleteTemplate={() => Promise.resolve({ data: null, errors: [] })}
      templateType={TemplateType.CalloutTemplate}
    />
  );
};

export default AdminCommunityGuidelinesTemplatesSection;

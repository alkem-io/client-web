import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import { useDeleteCalloutTemplateMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { AdminCalloutTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import CalloutImportTemplateCard from './CalloutImportTemplateCard';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';

interface AdminCalloutTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminCalloutTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (callout: AdminCalloutTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<AdminCalloutTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminCalloutTemplatesSection = ({ refetchQueries, ...props }: AdminCalloutTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [deleteCalloutTemplate] = useDeleteCalloutTemplateMutation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.CalloutTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('common.callouts'),
      })}
      templateCardComponent={CalloutImportTemplateCard}
      templateImportCardComponent={CalloutImportTemplateCard}
      createTemplateDialogComponent={undefined}
      editTemplateDialogComponent={undefined}
      onCreateTemplate={() => Promise.resolve({ data: null, errors: [] })}
      onUpdateTemplate={() => Promise.resolve({ data: null, errors: [] })}
      onDeleteTemplate={async variables => {
        await deleteCalloutTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.CalloutTemplate}
    />
  );
};

export default AdminCalloutTemplatesSection;

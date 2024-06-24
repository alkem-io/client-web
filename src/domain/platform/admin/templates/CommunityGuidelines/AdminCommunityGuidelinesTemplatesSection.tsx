import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import {
  AdminCommunityGuidelinesTemplateFragment,
  Reference,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  useCreateCommunityGuidelinesTemplateMutation,
  useDeleteCommunityGuidelinesTemplateMutation,
  useUpdateCommunityGuidelinesTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import CommunityGuidelinesImportTemplateCard from './CommunityGuidelinesImportTemplateCard';
import CreateCommunityGuidelinesTemplateDialog from './CreateCommunityGuidelinesTemplateDialog';
import EditCommunityGuidelinesTemplateDialog from './EditCommunityGuidelinesTemplateDialog';

interface AdminCommunityGuidelinesTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: AdminCommunityGuidelinesTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (guidelines: AdminCommunityGuidelinesTemplateFragment) => LinkWithState;
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

  const [createCommunityGuidelinesTemplate] = useCreateCommunityGuidelinesTemplateMutation();
  const [updateCommunityGuidelinesTemplate] = useUpdateCommunityGuidelinesTemplateMutation();
  const [deleteCommunityGuidelinesTemplate] = useDeleteCommunityGuidelinesTemplateMutation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.CommunityGuidelinesTemplate')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('community.communityGuidelines.title'),
      })}
      templateCardComponent={CommunityGuidelinesImportTemplateCard}
      templateImportCardComponent={CommunityGuidelinesImportTemplateCard}
      createTemplateDialogComponent={CreateCommunityGuidelinesTemplateDialog}
      // @ts-ignore
      editTemplateDialogComponent={EditCommunityGuidelinesTemplateDialog}
      onCreateTemplate={variables => {
        const { guidelines, ...rest } = variables;
        const { profile } = guidelines;
        const updatedProfile = {
          displayName: profile.displayName,
          description: profile.description,
          // TODO: References refactor referencesData should be just references
          referencesData: (profile as unknown as { referencesData?: Reference[] }).referencesData?.map(
            ({ id, ...reference }) => ({ ...reference })
          ),
        };
        const updatedGuidelines = { profile: updatedProfile };
        const updatedVariables = { guidelines: updatedGuidelines, ...rest };
        return createCommunityGuidelinesTemplate({ variables: updatedVariables, refetchQueries });
      }}
      onUpdateTemplate={variables => updateCommunityGuidelinesTemplate({ variables, refetchQueries })}
      onDeleteTemplate={async variables => {
        await deleteCommunityGuidelinesTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.CommunityGuidelinesTemplate}
      onTemplateImport={(template: AdminCommunityGuidelinesTemplateFragment) => {
        const { guidelines, innovationPack, ...templateRest } =
          template as unknown as AdminCommunityGuidelinesTemplateFragment & { innovationPack: unknown };
        const { profile, ...guidelinesRest } = guidelines;
        const { references, ...profileRest } = profile;
        // TODO: Refactor references
        // Map references to referencesData, as the backend expects it
        return Promise.resolve({
          guidelines: {
            profile: {
              ...profileRest,
              referencesData: references?.map(({ uri, name, description }) => ({ uri, name, description })),
            },
            ...guidelinesRest,
          },
          ...templateRest,
        });
      }}
    />
  );
};

export default AdminCommunityGuidelinesTemplatesSection;

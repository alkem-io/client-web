import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import {
  CommunityGuidelinesTemplateFragment,
  Reference,
  TemplateType,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  useCreateCommunityGuidelinesTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateCommunityGuidelinesTemplateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../../../platform/admin/InnovationPacks/AdminTemplatesSection';
import { InnovationPack } from '../../../platform/admin/InnovationPacks/InnovationPack';
import CommunityGuidelinesImportTemplateCard from './CommunityGuidelinesImportTemplateCard';
import CreateCommunityGuidelinesTemplateDialog from './CreateCommunityGuidelinesTemplateDialog';
import EditCommunityGuidelinesTemplateDialog from './EditCommunityGuidelinesTemplateDialog';

interface AdminCommunityGuidelinesTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: CommunityGuidelinesTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (guidelines: CommunityGuidelinesTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<CommunityGuidelinesTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminCommunityGuidelinesTemplatesSection = ({
  refetchQueries,
  ...props
}: AdminCommunityGuidelinesTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [createCommunityGuidelinesTemplate] = useCreateCommunityGuidelinesTemplateMutation();
  const [updateCommunityGuidelinesTemplate] = useUpdateCommunityGuidelinesTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return (
    <AdminTemplatesSection
      {...props}
      headerText={t('common.enums.templateTypes.CommunityGuidelines')}
      importDialogHeaderText={t('pages.admin.generic.sections.templates.import.title', {
        templateType: t('community.communityGuidelines.title'),
      })}
      templateCardComponent={CommunityGuidelinesImportTemplateCard}
      templateImportCardComponent={CommunityGuidelinesImportTemplateCard}
      createTemplateDialogComponent={CreateCommunityGuidelinesTemplateDialog}
      editTemplateDialogComponent={EditCommunityGuidelinesTemplateDialog}
      onCreateTemplate={variables => {
        const { communityGuidelines, ...rest } = variables;
        const profile = communityGuidelines?.profile;
        const updatedProfile = {
          displayName: profile?.displayName || '',
          description: profile?.description || '',
          // TODO: References refactor referencesData should be just references
          referencesData: (profile as unknown as { referencesData?: Reference[] }).referencesData?.map(
            ({ id, ...reference }) => ({ ...reference })
          ),
        };
        const updatedGuidelines = { profile: updatedProfile };
        const updatedVariables = { communityGuidelines: updatedGuidelines, ...rest };
        return createCommunityGuidelinesTemplate({ variables: updatedVariables, refetchQueries });
      }}
      onUpdateTemplate={variables => updateCommunityGuidelinesTemplate({ variables, refetchQueries })}
      onDeleteTemplate={async variables => {
        await deleteTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.CommunityGuidelines}
      onTemplateImport={(template: CommunityGuidelinesTemplateFragment) => {
        const { communityGuidelines, innovationPack, ...templateRest } =
          template as unknown as CommunityGuidelinesTemplateFragment & { innovationPack: unknown };
        const { profile, ...guidelinesRest } = communityGuidelines;
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

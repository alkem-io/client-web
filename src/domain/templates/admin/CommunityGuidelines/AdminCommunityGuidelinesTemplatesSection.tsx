import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import {
  CommunityGuidelinesTemplateFragment,
  Reference,
  TemplateType,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../../../platform/admin/InnovationPacks/OldAdminTemplatesSection';
import { InnovationPack } from '../../../platform/admin/InnovationPacks/InnovationPack';
import CommunityGuidelinesImportTemplateCard from './CommunityGuidelinesImportTemplateCard';
import CreateCommunityGuidelinesTemplateDialog from './CreateCommunityGuidelinesTemplateDialog';
import EditCommunityGuidelinesTemplateDialog from './EditCommunityGuidelinesTemplateDialog';
import { Box } from '@mui/material';
import { CARLOS_BORDER_RED } from '../../_new/borders';

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

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return (
    <Box sx={{ border: CARLOS_BORDER_RED }}>
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
          const updatedVariables = { communityGuidelines: updatedGuidelines, ...rest, type: TemplateType.CommunityGuidelines };
          return createTemplate({ variables: updatedVariables, refetchQueries });
        }}
        onUpdateTemplate={variables => updateTemplate({ variables, refetchQueries })}
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
    </Box>
  );
};

export default AdminCommunityGuidelinesTemplatesSection;

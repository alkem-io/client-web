import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import {
  useCreateCalloutTemplateMutation,
  useDeleteCalloutTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AdminCalloutTemplateFragment,
  CalloutState,
  CalloutType,
  CreateCalloutTemplateMutationVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import CalloutImportTemplateCard from './CalloutImportTemplateCard';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import CreateCalloutTemplateDialog from './CreateCalloutTemplateDialog';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import produce from 'immer';

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

  const [createCalloutTemplate] = useCreateCalloutTemplateMutation();
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
      createTemplateDialogComponent={CreateCalloutTemplateDialog}
      editTemplateDialogComponent={undefined}
      // @ts-ignore
      onCreateTemplate={(calloutTemplate: CalloutTemplateFormSubmittedValues & { templatesSetId: string }) => {
        const { framing, contributionDefaults } = produce(calloutTemplate, draft => {
          if (draft.type !== CalloutType.Whiteboard) {
            delete draft.framing.whiteboard;
          }
          if (draft.type !== CalloutType.PostCollection) {
            delete draft.contributionDefaults.postDescription;
          }
          if (draft.type !== CalloutType.WhiteboardCollection) {
            delete draft.contributionDefaults.whiteboardContent;
          }
        });

        const variables: CreateCalloutTemplateMutationVariables = {
          templatesSetId: calloutTemplate.templatesSetId,
          profile: calloutTemplate.profile,
          tags: calloutTemplate.tags,
          framing: {
            ...framing,
            whiteboard: {
              ...framing.whiteboard,
              profileData: {
                displayName: framing.profile.displayName,
              },
            },
          },
          type: calloutTemplate.type ?? CalloutType.Post,
          contributionPolicy: {
            state: CalloutState.Open,
          },
          contributionDefaults,
        };

        return createCalloutTemplate({ variables, refetchQueries });
      }}
      onUpdateTemplate={() => Promise.resolve({ data: null, errors: [] })}
      onDeleteTemplate={async variables => {
        await deleteCalloutTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.CalloutTemplate}
    />
  );
};

export default AdminCalloutTemplatesSection;

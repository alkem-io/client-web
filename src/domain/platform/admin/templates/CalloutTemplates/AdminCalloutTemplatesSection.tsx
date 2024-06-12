import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import {
  useCreateCalloutTemplateMutation,
  useDeleteCalloutTemplateMutation,
  useUpdateCalloutTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  AdminCalloutTemplateFragment,
  CalloutState,
  CalloutType,
  CreateCalloutTemplateMutationVariables,
  UpdateCalloutTemplateInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import AdminTemplatesSection from '../AdminTemplatesSection';
import { InnovationPack } from '../InnovationPacks/InnovationPack';
import CalloutImportTemplateCard from './CalloutImportTemplateCard';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import CreateCalloutTemplateDialog from './CreateCalloutTemplateDialog';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import produce from 'immer';
import EditCalloutTemplateDialog from './EditCalloutTemplateDialog';

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
  const [updateCalloutTemplate] = useUpdateCalloutTemplateMutation();
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
      // @ts-ignore
      editTemplateDialogComponent={EditCalloutTemplateDialog}
      // @ts-ignore
      onCreateTemplate={(calloutTemplate: CalloutTemplateFormSubmittedValues & { templatesSetId: string }) => {
        const { framing, contributionDefaults } = produce(calloutTemplate, draft => {
          if (draft.type !== CalloutType.Whiteboard) {
            delete draft.framing.whiteboard;
          } else {
            draft.framing.whiteboard = {
              ...draft.framing.whiteboard,
              profileData: {
                ...draft.framing.whiteboard?.profileData,
                displayName: calloutTemplate.framing.profile.displayName,
              },
            };
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
          framing,
          type: calloutTemplate.type ?? CalloutType.Post,
          contributionPolicy: {
            state: CalloutState.Open,
          },
          contributionDefaults,
        };

        return createCalloutTemplate({ variables, refetchQueries });
      }}
      // @ts-ignore
      onUpdateTemplate={async ({
        templateId,
        ...template
      }: UpdateCalloutTemplateInput & { templateId: string; type: CalloutType }) => {
        const { type, ...updatedValues } = produce(template, draft => {
          if (draft.type !== CalloutType.Whiteboard && draft.framing) {
            delete draft.framing.whiteboardContent;
          }
          if (draft.type !== CalloutType.PostCollection && draft.contributionDefaults) {
            delete draft.contributionDefaults.postDescription;
          }
          if (draft.type !== CalloutType.WhiteboardCollection && draft.contributionDefaults) {
            delete draft.contributionDefaults.whiteboardContent;
          }
        });

        await updateCalloutTemplate({ variables: { template: updatedValues }, refetchQueries });
      }}
      onDeleteTemplate={async variables => {
        await deleteCalloutTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.CalloutTemplate}
    />
  );
};

export default AdminCalloutTemplatesSection;

import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import {
  useCalloutTemplateContentLazyQuery,
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
import { Identifiable } from '../../../../../core/utils/Identifiable';

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
  const [fetchTemplateData] = useCalloutTemplateContentLazyQuery();

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
      onTemplateImport={async (template: Identifiable) => {
        const { data } = await fetchTemplateData({ variables: { calloutTemplateId: template.id } });
        const calloutTemplate = data?.lookup.calloutTemplate;
        if (!calloutTemplate) {
          throw new TypeError('Template not found!');
        }
        return {
          type: calloutTemplate.type,
          profile: {
            displayName: calloutTemplate.profile.displayName,
            description: calloutTemplate.profile.description,
            tagset: calloutTemplate.profile.tagset,
            visual: calloutTemplate.profile.visual,
          },
          framing: {
            profile: {
              displayName: calloutTemplate.framing.profile.displayName,
              description: calloutTemplate.framing.profile.description,
              tagsets:
                calloutTemplate.framing.profile.tagsets?.map(tagset => ({
                  name: tagset.name,
                  tags: tagset.tags,
                  type: tagset.type,
                })) ?? [],
              referencesData:
                calloutTemplate.framing.profile.references?.map(reference => ({
                  name: reference.name,
                  uri: reference.uri,
                  description: reference.description,
                })) ?? [],
            },
            whiteboard: calloutTemplate.framing.whiteboard
              ? { content: calloutTemplate.framing.whiteboard.content }
              : undefined,
          },
          contributionPolicy: {
            state: calloutTemplate.contributionPolicy.state,
          },
          contributionDefaults: {
            postDescription: calloutTemplate.contributionDefaults.postDescription,
            whiteboardContent: calloutTemplate.contributionDefaults.whiteboardContent,
          },
          // TODO: Remove this
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }}
    />
  );
};

export default AdminCalloutTemplatesSection;

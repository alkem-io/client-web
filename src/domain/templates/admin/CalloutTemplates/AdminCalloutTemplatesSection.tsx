import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import { useTranslation } from 'react-i18next';
import CalloutImportTemplateCard from './CalloutImportTemplateCard';
import CreateCalloutTemplateDialog from './CreateCalloutTemplateDialog';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import produce from 'immer';
import EditCalloutTemplateDialog from './EditCalloutTemplateDialog';
import {
  CalloutState,
  CalloutTemplateFragment,
  CalloutType,
  CreateCalloutTemplateMutationVariables,
  TemplateType,
  UpdateTemplateInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InnovationPack } from '../../../platform/admin/InnovationPacks/InnovationPack';
import {
  useCalloutTemplateContentLazyQuery,
  useCreateCalloutTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateCalloutTemplateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import AdminTemplatesSection from '../../../platform/admin/InnovationPacks/AdminTemplatesSection';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface AdminCalloutTemplatesSectionProps {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: CalloutTemplateFragment[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (callout: CalloutTemplateFragment) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  innovationPacks: InnovationPack<CalloutTemplateFragment>[];
  canImportTemplates: boolean;
}

const AdminCalloutTemplatesSection = ({ refetchQueries, ...props }: AdminCalloutTemplatesSectionProps) => {
  const { t } = useTranslation();

  const [createCalloutTemplate] = useCreateCalloutTemplateMutation();
  const [updateCalloutTemplate] = useUpdateCalloutTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
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
          callout: {
            framing,
            contributionPolicy: {
              state: CalloutState.Open,
            },
            contributionDefaults,
            type: calloutTemplate.type,
          },
        };

        return createCalloutTemplate({ variables, refetchQueries });
      }}
      // @ts-ignore
      onUpdateTemplate={async ({
        templateId,
        ...template
      }: UpdateTemplateInput & { templateId: string; type: CalloutType }) => {
        const { type, ...updatedValues } = produce(template, draft => {
          if (draft.type !== CalloutType.Whiteboard && draft.callout?.framing) {
            delete draft.callout?.framing?.whiteboard?.content;
          }
          if (draft.type !== CalloutType.PostCollection && draft.callout?.contributionDefaults) {
            delete draft.callout?.contributionDefaults.postDescription;
          }
          if (draft.type !== CalloutType.WhiteboardCollection && draft.callout?.contributionDefaults) {
            delete draft.callout?.contributionDefaults.whiteboardContent;
          }
        });

        await updateCalloutTemplate({ variables: { template: updatedValues }, refetchQueries });
      }}
      onDeleteTemplate={async variables => {
        await deleteTemplate({ variables, refetchQueries });
      }}
      templateType={TemplateType.Callout}
      onTemplateImport={async (template: Identifiable) => {
        const { data } = await fetchTemplateData({ variables: { calloutTemplateId: template.id } });
        const templateData = data?.lookup.template;
        const templateCallout = templateData?.callout;

        if (!templateData || !templateCallout) {
          throw new TypeError('Template not found!');
        }
        return {
          profile: {
            displayName: templateData.profile.displayName,
            description: templateData.profile.description,
            tagset: templateData.profile.tagset,
            visual: templateData.profile.visual,
          },
          framing: {
            profile: {
              displayName: templateCallout.framing.profile.displayName,
              description: templateCallout.framing.profile.description,
              tagsets:
                templateCallout.framing.profile.tagsets?.map(tagset => ({
                  name: tagset.name,
                  tags: tagset.tags,
                  type: tagset.type,
                })) ?? [],
              referencesData:
                templateCallout.framing.profile.references?.map(reference => ({
                  name: reference.name,
                  uri: reference.uri,
                  description: reference.description,
                })) ?? [],
            },
            whiteboard: templateCallout?.framing.whiteboard
              ? { content: templateCallout.framing.whiteboard.content }
              : undefined,
          },
          contributionPolicy: {
            state: templateCallout.contributionPolicy.state,
          },
          contributionDefaults: {
            postDescription: templateCallout.contributionDefaults.postDescription,
            whiteboardContent: templateCallout.contributionDefaults.whiteboardContent,
          },
          // TODO: Remove this
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }}
    />
  );
};

export default AdminCalloutTemplatesSection;

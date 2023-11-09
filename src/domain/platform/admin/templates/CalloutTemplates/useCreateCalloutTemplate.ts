import { useCallback } from 'react';
import {
  useCreateCalloutTemplateMutation,
  useSpaceTemplateSetIdLazyQuery,
  useWhiteboardRtWithContentLazyQuery,
  useWhiteboardWithContentLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutDisplayLocation,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  CreateCalloutTemplateMutation,
  CreateTagsetInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../../common/profile/Profile';
import { WhiteboardFieldSubmittedValues } from '../../../../collaboration/callout/creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import { WhiteboardRtFieldSubmittedValues } from '../../../../collaboration/callout/creationDialog/CalloutWhiteboardField/CalloutWhiteboardRtField';
import { CalloutLayoutProps } from '../../../../collaboration/CalloutBlock/CalloutLayout';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';

export interface CalloutCreationType {
  framing: {
    profile: {
      description: string;
      displayName: string;
      referencesData: Reference[];
      tagsets?: CreateTagsetInput[];
    };
    whiteboard?: WhiteboardFieldSubmittedValues;
    whiteboardRt?: WhiteboardRtFieldSubmittedValues;
    tags?: string[];
  };
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
  type: CalloutType;
  contributionPolicy: {
    state: CalloutState;
  };
  displayLocation?: CalloutDisplayLocation;
  visibility?: CalloutVisibility;
  sendNotification?: boolean;
}

export interface CalloutCreationUtils {
  handleCreateCalloutTemplate: (
    values: CalloutTemplateFormSubmittedValues,
    callout: CalloutLayoutProps['callout'],
    spaceNameId: string
  ) => Promise<CreateCalloutTemplateMutation['createCalloutTemplate'] | undefined>;
}

export const useCreateCalloutTemplate = (): CalloutCreationUtils => {
  const [createCalloutTemplate] = useCreateCalloutTemplateMutation();

  const [fetchTemplateSetId] = useSpaceTemplateSetIdLazyQuery();

  const [fetchWhiteboardWithContent] = useWhiteboardWithContentLazyQuery();

  const [fetchWhiteboardRtWithContent] = useWhiteboardRtWithContentLazyQuery();

  const handleCreateCalloutTemplate = useCallback(
    async (values: CalloutTemplateFormSubmittedValues, callout: CalloutLayoutProps['callout'], spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplateSetId({ variables: { spaceId: spaceNameId } });
      const templatesSetId = templatesData?.space.templates?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }
      const tagsets: CreateTagsetInput[] = [];
      if (callout.framing.profile.tagset)
        tagsets.push({
          name: callout.framing.profile.tagset.name,
          tags: callout.framing.profile.tagset.tags,
          type: callout.framing.profile.tagset.type,
        });

      let whiteboardContent = '';
      if (callout.type === CalloutType.Whiteboard && callout.framing.whiteboard) {
        const { data: whiteboardWithContent } = await fetchWhiteboardWithContent({
          variables: { whiteboardId: callout.framing.whiteboard.id },
        });
        whiteboardContent = whiteboardWithContent?.lookup.whiteboard?.content ?? '';
      }

      let whiteboardRtContent = '';
      if (callout.type === CalloutType.WhiteboardRt && callout.framing.whiteboardRt) {
        const { data: whiteboardRtWithContent } = await fetchWhiteboardRtWithContent({
          variables: { whiteboardId: callout.framing.whiteboardRt.id },
        });
        whiteboardRtContent = whiteboardRtWithContent?.lookup.whiteboardRt?.content ?? '';
      }

      const res = await createCalloutTemplate({
        variables: {
          templatesSetId,
          profile: values.profile,
          tags: values.tags,
          type: callout.type,
          framing: {
            profile: {
              displayName: callout.framing.profile.displayName,
              description: callout.framing.profile.description,
              referencesData: callout.framing.profile.references?.map(reference => ({
                name: reference.name,
                description: reference.description,
                uri: reference.uri,
              })),
              tagsets,
            },
            whiteboard: callout.framing.whiteboard && {
              content: whiteboardContent,
              profileData: {
                displayName: callout.framing.whiteboard.profile.displayName,
                description: callout.framing.whiteboard.profile.description,
              },
            },
            whiteboardRt: callout.framing.whiteboardRt && {
              content: whiteboardRtContent,
              profileData: {
                displayName: callout.framing.whiteboardRt.profile.displayName,
                description: callout.framing.whiteboardRt.profile.description,
              },
            },
          },
          contributionDefaults: {
            postDescription: callout.contributionDefaults.postDescription
              ? callout.contributionDefaults.postDescription
              : undefined,
            whiteboardContent: callout.contributionDefaults.whiteboardContent
              ? callout.contributionDefaults.whiteboardContent
              : undefined,
          },
          contributionPolicy: callout.contributionPolicy,
        },
      });

      return res.data?.createCalloutTemplate;
    },
    [createCalloutTemplate]
  );

  return {
    handleCreateCalloutTemplate,
  };
};

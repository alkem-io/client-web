import { useCallback } from 'react';
import {
  useCreateCalloutTemplateMutation,
  useSpaceTemplateSetIdLazyQuery,
  useWhiteboardWithContentLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutType,
  CreateCalloutTemplateMutation,
  CreateTagsetInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import { CalloutLayoutProps } from '../../../../collaboration/CalloutBlock/CalloutLayout';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import { evictFromCache } from '../../../../../core/apollo/utils/removeFromCache';

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

  const handleCreateCalloutTemplate = useCallback(
    async (values: CalloutTemplateFormSubmittedValues, callout: CalloutLayoutProps['callout'], spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplateSetId({ variables: { spaceId: spaceNameId } });
      const templatesSetId = templatesData?.space.account.library?.id;
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
        update: cache => {
          evictFromCache(cache, templatesSetId, 'TemplatesSet');
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

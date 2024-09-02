import { useCallback } from 'react';
import {
  useCreateTemplateMutation,
  useSpaceTemplatesSetIdLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CreateTemplateMutation, TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { CommunityGuidelinesTemplateFormSubmittedValues } from './CommunityGuidelinesTemplateForm';
import { evictFromCache } from '../../../../core/apollo/utils/removeFromCache';

interface CreateCommunityGuidelinesProps {
  handleCreateCommunityGuidelinesTemplate: (
    values: CommunityGuidelinesTemplateFormSubmittedValues,
    spaceNameId: string
  ) => Promise<CreateTemplateMutation['createTemplate'] | undefined>;
}

export const useCreateCommunityGuidelinesTemplate = (): CreateCommunityGuidelinesProps => {
  const [createCommunityGuidelinesTemplate] = useCreateTemplateMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesSetIdLazyQuery();

  const handleCreateCommunityGuidelinesTemplate = useCallback(
    async (values: CommunityGuidelinesTemplateFormSubmittedValues, spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceNameId } });
      const templatesSetId = templatesData?.space.library?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const result = await createCommunityGuidelinesTemplate({
        variables: {
          templatesSetId,
          profile: values.profile || { displayName: '' },
          tags: values.tags,
          type: TemplateType.CommunityGuidelines,
          communityGuidelines: values.guidelines,
        },
        update: cache => {
          evictFromCache(cache, templatesSetId, 'TemplatesSet');
        },
      });

      return result.data?.createTemplate;
    },
    [createCommunityGuidelinesTemplate]
  );

  return {
    handleCreateCommunityGuidelinesTemplate,
  };
};

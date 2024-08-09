import { useCallback } from 'react';
import {
  useCreateCommunityGuidelinesTemplateMutation,
  useSpaceTemplateSetIdLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { CreateCommunityGuidelinesTemplateMutation } from '../../../../../core/apollo/generated/graphql-schema';
import { CommunityGuidelinesTemplateFormSubmittedValues } from './CommunityGuidelinesTemplateForm';
import { evictFromCache } from '../../../../../core/apollo/utils/removeFromCache';

interface CreateCommunityGuidelinesProps {
  handleCreateCommunityGuidelinesTemplate: (
    values: CommunityGuidelinesTemplateFormSubmittedValues,
    spaceNameId: string
  ) => Promise<CreateCommunityGuidelinesTemplateMutation['createCommunityGuidelinesTemplate'] | undefined>;
}

export const useCreateCommunityGuidelinesTemplate = (): CreateCommunityGuidelinesProps => {
  const [createCommunityGuidelinesTemplate] = useCreateCommunityGuidelinesTemplateMutation();
  const [fetchTemplateSetId] = useSpaceTemplateSetIdLazyQuery();

  const handleCreateCommunityGuidelinesTemplate = useCallback(
    async (values: CommunityGuidelinesTemplateFormSubmittedValues, spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplateSetId({ variables: { spaceNameId } });
      const templatesSetId = templatesData?.space.library?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const result = await createCommunityGuidelinesTemplate({
        variables: {
          templatesSetId,
          profile: values.profile || { displayName: '' },
          tags: values.tags,
          // @ts-ignore
          guidelines: values.guidelines,
        },
        update: cache => {
          evictFromCache(cache, templatesSetId, 'TemplatesSet');
        },
      });

      return result.data?.createCommunityGuidelinesTemplate;
    },
    [createCommunityGuidelinesTemplate]
  );

  return {
    handleCreateCommunityGuidelinesTemplate,
  };
};

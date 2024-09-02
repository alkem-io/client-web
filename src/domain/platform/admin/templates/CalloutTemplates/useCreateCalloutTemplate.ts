import { useCallback } from 'react';
import {
  useCreateCalloutTemplateMutation,
  useSpaceTemplateSetIdLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutType,
  CreateCalloutTemplateMutation,
  CreateCalloutTemplateMutationVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { CalloutLayoutProps } from '../../../../collaboration/callout/calloutBlock/CalloutLayout';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import produce from 'immer';

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

  const handleCreateCalloutTemplate = useCallback(
    async (values: CalloutTemplateFormSubmittedValues, callout: CalloutLayoutProps['callout'], spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplateSetId({ variables: { spaceNameId } });
      const templatesSetId = templatesData?.space.library?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const submittedValues = produce(values, draft => {
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
        ...submittedValues,
        templatesSetId,
        contributionPolicy: callout.contributionPolicy,
      };

      const res = await createCalloutTemplate({ variables });

      return res.data?.createCalloutTemplate;
    },
    [createCalloutTemplate]
  );

  return {
    handleCreateCalloutTemplate,
  };
};

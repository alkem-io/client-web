import { useCallback } from 'react';
import { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import produce from 'immer';
import {
  CalloutType,
  CreateTemplateMutation,
  CreateTemplateMutationVariables,
  TemplateType,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutLayoutProps } from '../../../collaboration/callout/calloutBlock/CalloutLayout';
import {
  useCreateTemplateMutation,
  useSpaceTemplatesSetIdLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';

export interface CalloutCreationUtils {
  handleCreateCalloutTemplate: (
    values: CalloutTemplateFormSubmittedValues,
    callout: CalloutLayoutProps['callout'],
    spaceNameId: string
  ) => Promise<CreateTemplateMutation['createTemplate'] | undefined>;
}

export const useCreateCalloutTemplate = (): CalloutCreationUtils => {
  const [createCalloutTemplate] = useCreateTemplateMutation();

  const [fetchTemplatesSetId] = useSpaceTemplatesSetIdLazyQuery();

  const handleCreateCalloutTemplate = useCallback(
    async (values: CalloutTemplateFormSubmittedValues, callout: CalloutLayoutProps['callout'], spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceNameId } });
      const templatesSetId = templatesData?.space.library?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const submittedValues = produce(values, draft => {
        if (draft.callout.type !== CalloutType.Whiteboard) {
          delete draft.callout.framing.whiteboard;
        }
        if (draft.callout.type !== CalloutType.PostCollection && draft.callout.contributionDefaults) {
          delete draft.callout.contributionDefaults.postDescription;
        }
        if (draft.callout.type !== CalloutType.WhiteboardCollection && draft.callout.contributionDefaults) {
          delete draft.callout.contributionDefaults.whiteboardContent;
        }
      });
      const variables: CreateTemplateMutationVariables = {
        templatesSetId,
        type: TemplateType.Callout,
        ...submittedValues,
      };

      const res = await createCalloutTemplate({ variables });

      return res.data?.createTemplate;
    },
    [createCalloutTemplate]
  );

  return {
    handleCreateCalloutTemplate,
  };
};

import { useCallback } from 'react';
import {
  useDeleteCalloutMutation,
  useUpdateCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { Callout, CalloutVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import { CalloutEditType } from '../CalloutEditType';
import removeFromCache from '../../../../shared/utils/apollo-cache/removeFromCache';

type UseCalloutEditReturnType = {
  handleVisibilityChange: (calloutId: Callout['id'], visibility: CalloutVisibility) => Promise<void>;
  handleEdit: (callout: CalloutEditType) => Promise<void>;
  handleDelete: (callout: CalloutEditType) => Promise<void>;
};

export const useCalloutEdit = (): UseCalloutEditReturnType => {
  const handleError = useApolloErrorHandler();

  const [updateCallout] = useUpdateCalloutMutation({ onError: handleError });
  const [updateCalloutVisibility] = useUpdateCalloutVisibilityMutation({ onError: handleError });

  const handleVisibilityChange = useCallback(
    async (calloutId: string, visibility: CalloutVisibility) => {
      await updateCalloutVisibility({
        variables: { calloutData: { calloutID: calloutId, visibility: visibility } },
      });
    },
    [updateCalloutVisibility]
  );
  const handleEdit = useCallback(
    async (callout: CalloutEditType) => {
      await updateCallout({
        variables: {
          calloutData: {
            ID: callout.id,
            description: callout.description,
            displayName: callout.displayName,
            state: callout.state,
            cardTemplate: callout.cardTemplate
              ? {
                  type: callout.cardTemplate.type,
                  defaultDescription: callout.cardTemplate.defaultDescription,
                  info: callout.cardTemplate.info,
                }
              : undefined,
            canvasTemplate: callout.canvasTemplate
              ? { value: callout.canvasTemplate.value, info: callout.canvasTemplate.info }
              : undefined,
          },
        },
      });
    },
    [updateCallout]
  );
  const [deleteCallout] = useDeleteCalloutMutation({
    onError: handleError,
    update: removeFromCache,
  });
  const handleDelete = useCallback(
    async (callout: CalloutEditType) => {
      await deleteCallout({
        variables: { calloutId: callout.id },
      });
    },
    [deleteCallout]
  );

  return { handleVisibilityChange, handleEdit, handleDelete };
};

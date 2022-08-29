import { useCallback } from 'react';
import { useDeleteCalloutMutation, useUpdateCalloutMutation } from '../../../../hooks/generated/graphql';
import { Callout, CalloutVisibility } from '../../../../models/graphql-schema';
import { useApolloErrorHandler } from '../../../../hooks';
import { CalloutEditType } from '../CalloutEditType';
import removeFromCache from '../../../shared/utils/apollo-cache/removeFromCache';

type UseCalloutEditReturnType = {
  handleVisibilityChange: (calloutId: Callout['id'], visibility: CalloutVisibility) => Promise<void>;
  handleEdit: (callout: CalloutEditType) => Promise<void>;
  handleDelete: (callout: CalloutEditType) => Promise<void>;
};

export const useCalloutEdit = (): UseCalloutEditReturnType => {
  const handleError = useApolloErrorHandler();

  const [updateCallout] = useUpdateCalloutMutation({ onError: handleError });
  const handleVisibilityChange = useCallback(
    async (calloutId: string, visibility: CalloutVisibility) => {
      await updateCallout({
        variables: { calloutData: { ID: calloutId, visibility } },
      });
    },
    [updateCallout]
  );
  const handleEdit = useCallback(
    async (callout: CalloutEditType) => {
      await updateCallout({
        variables: {
          calloutData: {
            ID: callout.id,
            description: callout.description,
            displayName: callout.displayName,
          },
        },
      });
    },
    [updateCallout]
  );
  //
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

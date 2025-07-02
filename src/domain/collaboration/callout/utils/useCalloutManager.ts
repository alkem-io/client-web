import { useCallback } from 'react';
import {
  CalloutFragmentDoc,
  useDeleteCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { useApolloClient } from '@apollo/client';
import { Identifiable } from '@/core/utils/Identifiable';

type useCalloutEditProvided = {
  changeCalloutVisibility: (
    callout: Identifiable,
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void>;
  deleteCallout: (callout: Identifiable) => Promise<void>;
};

export const useCalloutManager = (): useCalloutEditProvided => {
  const [updateCalloutVisibility] = useUpdateCalloutVisibilityMutation();

  const apolloClient = useApolloClient();

  const handleVisibilityChange = useCallback(
    async (callout: Identifiable, visibility: CalloutVisibility, sendNotification: boolean) => {
      await updateCalloutVisibility({
        variables: {
          calloutData: { calloutID: callout.id, visibility, sendNotification },
        },
        optimisticResponse: () => {
          const calloutFragment = apolloClient.readFragment({
            id: `Callout:${callout}`,
            fragment: CalloutFragmentDoc,
            fragmentName: 'Callout',
          });

          return {
            updateCalloutVisibility: {
              ...calloutFragment,
              visibility,
            },
          };
        },
      });
    },
    [updateCalloutVisibility]
  );

  const [deleteCallout] = useDeleteCalloutMutation({
    refetchQueries: ['CalloutsOnCalloutsSetUsingClassification'],
  });

  const handleDeleteCallout = useCallback(
    async (callout: Identifiable) => {
      await deleteCallout({
        variables: { calloutId: callout.id },
      });
    },
    [deleteCallout]
  );

  return {
    changeCalloutVisibility: handleVisibilityChange,
    deleteCallout: handleDeleteCallout,
  };
};

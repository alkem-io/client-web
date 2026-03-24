import { useApolloClient } from '@apollo/client';
import {
  CalloutFragmentDoc,
  useDeleteCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';

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

  const handleVisibilityChange = async (
    callout: Identifiable,
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => {
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
  };

  const [deleteCallout] = useDeleteCalloutMutation({
    refetchQueries: ['CalloutsOnCalloutsSetUsingClassification'],
  });

  const handleDeleteCallout = async (callout: Identifiable) => {
    await deleteCallout({
      variables: { calloutId: callout.id },
    });
  };

  return {
    changeCalloutVisibility: handleVisibilityChange,
    deleteCallout: handleDeleteCallout,
  };
};

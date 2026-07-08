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
          id: `Callout:${callout.id}`,
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

  // There is no deletion subscription — the client must propagate the delete
  // itself. Evicting the Callout drops its dangling reference from every cached
  // list on read (feed `CalloutsListForFeed`, post index, classification,
  // dashboards) without a network round-trip; a refetch of one named query
  // would only fix the surfaces that happen to watch it.
  const [deleteCallout] = useDeleteCalloutMutation({
    update(cache, { data }) {
      const deletedId = data?.deleteCallout?.id;
      if (!deletedId) return;
      cache.evict({ id: cache.identify({ __typename: 'Callout', id: deletedId }) });
      cache.gc();
    },
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

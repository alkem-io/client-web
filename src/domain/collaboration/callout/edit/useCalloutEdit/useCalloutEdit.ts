import { useCallback } from 'react';
import {
  CalloutFragmentDoc,
  useDeleteCalloutMutation,
  useUpdateCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { Callout, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { useApolloClient } from '@apollo/client';
import { mapProfileModelToUpdateProfileInput } from '@/domain/common/profile/ProfileModelUtils';
import { Identifiable } from '@/core/utils/Identifiable';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/new-callout/CreateCallout/CalloutForm';

type UseCalloutEditReturnType = {
  handleVisibilityChange: (
    calloutId: Callout['id'],
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void>;
  handleEdit: (callout: Identifiable & CalloutFormSubmittedValues) => Promise<void>;
  handleDelete: (callout: Identifiable) => Promise<void>;
};

export const useCalloutEdit = (): UseCalloutEditReturnType => {
  const [updateCallout] = useUpdateCalloutMutation();
  const [updateCalloutVisibility] = useUpdateCalloutVisibilityMutation();

  const apolloClient = useApolloClient();

  const handleVisibilityChange = useCallback(
    async (calloutId: string, visibility: CalloutVisibility, sendNotification: boolean) => {
      await updateCalloutVisibility({
        variables: {
          calloutData: { calloutID: calloutId, visibility, sendNotification },
        },
        optimisticResponse: () => {
          const callout = apolloClient.readFragment({
            id: `Callout:${calloutId}`,
            fragment: CalloutFragmentDoc,
            fragmentName: 'Callout',
          });

          return {
            updateCalloutVisibility: {
              ...callout,
              visibility,
            },
          };
        },
      });
    },
    [updateCalloutVisibility]
  );

  const handleEdit = useCallback(
    async (callout: Identifiable & CalloutFormSubmittedValues) => {
      await updateCallout({
        variables: {
          calloutData: {
            ID: callout.id,
            framing: {
              profile: mapProfileModelToUpdateProfileInput(callout.framing.profile),
              type: callout.framing.type,
              // Whiteboard and whiteboard content are not edited here, whiteboard is edited directly
            },
            settings: callout.settings,
            contributionDefaults: {
              postDescription: callout.contributionDefaults?.postDescription,
              whiteboardContent: callout.contributionDefaults?.whiteboardContent,
            },
          },
        },
      });
    },
    [updateCallout]
  );

  const [deleteCallout] = useDeleteCalloutMutation({
    refetchQueries: ['CalloutsOnCalloutsSetUsingClassification'],
  });

  const handleDelete = useCallback(
    async (callout: Identifiable) => {
      await deleteCallout({
        variables: { calloutId: callout.id },
      });
    },
    [deleteCallout]
  );

  return { handleVisibilityChange, handleEdit, handleDelete };
};

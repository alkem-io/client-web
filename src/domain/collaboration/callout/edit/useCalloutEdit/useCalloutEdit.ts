import { useCallback } from 'react';
import {
  CalloutFragmentDoc,
  useDeleteCalloutMutation,
  useUpdateCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { Callout, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { CalloutDeleteType, CalloutEditType } from '../CalloutEditType';
import { useApolloClient } from '@apollo/client';
import { mapProfileModelToUpdateProfileInput } from '@/domain/common/profile/ProfileModelUtils';

type UseCalloutEditReturnType = {
  handleVisibilityChange: (
    calloutId: Callout['id'],
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void>;
  handleEdit: (callout: CalloutEditType) => Promise<void>;
  handleDelete: (callout: CalloutDeleteType) => Promise<void>;
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
    async (callout: CalloutEditType) => {
      await updateCallout({
        variables: {
          calloutData: {
            ID: callout.id,
            framing: {
              profile: mapProfileModelToUpdateProfileInput({
                id: '',
                displayName: callout.profile.displayName || '',
                ...callout.profile,
              }),
            },
            contributionPolicy: {
              state: callout.state,
            },
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
    async (callout: CalloutDeleteType) => {
      await deleteCallout({
        variables: { calloutId: callout.id },
      });
    },
    [deleteCallout]
  );

  return { handleVisibilityChange, handleEdit, handleDelete };
};

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
              profile: {
                description: callout.profile.description,
                displayName: callout.profile.displayName,
                references: callout.profile.references?.map(reference => ({
                  ID: reference.id,
                  name: reference.name,
                  description: reference.description,
                  uri: reference.uri,
                })),
                tagsets: callout.profile.tagsets?.map(tagset => ({
                  ID: tagset.id || '',
                  name: tagset.name,
                  tags: tagset.tags ?? [],
                })),
              },
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
    refetchQueries: ['Callouts'],
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

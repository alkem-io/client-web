import { useCallback } from 'react';
import {
  useDeleteCalloutMutation,
  useUpdateCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { Callout, CalloutVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import { CalloutDeleteType, CalloutEditType } from '../CalloutEditType';
import removeFromCache from '../../../../shared/utils/apollo-cache/removeFromCache';

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

  const handleVisibilityChange = useCallback(
    async (calloutId: string, visibility: CalloutVisibility, sendNotification: boolean) => {
      await updateCalloutVisibility({
        variables: {
          calloutData: { calloutID: calloutId, visibility: visibility, sendNotification: sendNotification },
        },
        optimisticResponse: {
          updateCalloutVisibility: {
            __typename: 'Callout',
            id: calloutId,
            visibility,
          },
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
            profileData: {
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
            state: callout.state,
            displayLocation: callout.displayLocation,
            postTemplate: callout.postTemplate
              ? {
                  type: callout.postTemplate.type,
                  defaultDescription: callout.postTemplate.defaultDescription,
                  profileData: callout.postTemplate.profile,
                }
              : undefined,
            whiteboardTemplate: callout.whiteboardTemplate
              ? { value: callout.whiteboardTemplate.value, profileData: callout.whiteboardTemplate.profile }
              : undefined,
          },
        },
      });
    },
    [updateCallout]
  );
  const [deleteCallout] = useDeleteCalloutMutation({
    update: removeFromCache,
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

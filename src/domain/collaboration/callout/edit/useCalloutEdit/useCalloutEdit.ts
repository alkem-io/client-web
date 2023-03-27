import { useCallback } from 'react';
import {
  useDeleteCalloutMutation,
  useUpdateCalloutMutation,
  useUpdateCalloutVisibilityMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { Callout, CalloutVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import { CalloutEditType } from '../CalloutEditType';
import removeFromCache from '../../../../shared/utils/apollo-cache/removeFromCache';

type UseCalloutEditReturnType = {
  handleVisibilityChange: (
    calloutId: Callout['id'],
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void>;
  handleEdit: (callout: CalloutEditType) => Promise<void>;
  handleDelete: (callout: CalloutEditType) => Promise<void>;
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
            },
            state: callout.state,
            cardTemplate: callout.cardTemplate
              ? {
                  type: callout.cardTemplate.type,
                  defaultDescription: callout.cardTemplate.defaultDescription,
                  profileData: callout.cardTemplate.profile,
                }
              : undefined,
            canvasTemplate: callout.canvasTemplate
              ? { value: callout.canvasTemplate.value, profileData: callout.canvasTemplate.profile }
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
    async (callout: CalloutEditType) => {
      await deleteCallout({
        variables: { calloutId: callout.id },
      });
    },
    [deleteCallout]
  );

  return { handleVisibilityChange, handleEdit, handleDelete };
};

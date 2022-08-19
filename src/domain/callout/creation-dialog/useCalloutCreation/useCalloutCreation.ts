import { useCallback, useState } from 'react';
import { useCreateCalloutMutation, useHubCollaborationIdQuery } from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler, useHub } from '../../../../hooks';
import { CalloutType, CalloutVisibility } from '../../../../models/graphql-schema';

export type CalloutCreationType = {
  description: string;
  displayName: string;
  templateId: string;
  type: CalloutType;
};

interface CalloutCreationUtils {
  isCalloutCreationDialogOpen: boolean;
  handleCreateCalloutOpened: () => void;
  handleCreateCalloutClosed: () => void;
  handleCalloutPublished: (callout: CalloutCreationType) => Promise<void>;
  handleCalloutDrafted: (callout: CalloutCreationType) => Promise<void>;
  isPublishing: boolean;
}

export const useCalloutCreation = (initialOpened = false): CalloutCreationUtils => {
  const { hubId } = useHub();
  const handleError = useApolloErrorHandler();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(initialOpened);
  const [isPublishing, setIsPublishing] = useState(false);

  const { data } = useHubCollaborationIdQuery({ variables: { hubId }, skip: !hubId });
  const collaborationID = data?.hub?.collaboration?.id;

  const [createCallout] = useCreateCalloutMutation({
    onError: handleError,
  });

  const handleCreateCalloutOpened = useCallback(() => {
    setIsCalloutCreationDialogOpen(true);
  }, []);
  const handleCreateCalloutClosed = useCallback(() => setIsCalloutCreationDialogOpen(false), []);
  const handleCalloutPublished = useCallback(
    async (callout: CalloutCreationType) => {
      if (!collaborationID) {
        return;
      }

      setIsPublishing(true);

      await createCallout({
        variables: {
          calloutData: {
            collaborationID,
            description: callout.description,
            displayName: callout.displayName,
            type: callout.type,
            visibility: CalloutVisibility.Published,
          },
        },
      });

      setIsPublishing(false);
      setIsCalloutCreationDialogOpen(false);

      return;
    },
    [collaborationID]
  );
  const handleCalloutDrafted = useCallback(
    async (callout: CalloutCreationType) => {
      if (!collaborationID) {
        return;
      }

      setIsPublishing(true);

      await createCallout({
        variables: {
          calloutData: {
            collaborationID,
            description: callout.description,
            displayName: callout.displayName,
            type: callout.type,
            visibility: CalloutVisibility.Draft,
          },
        },
      });

      setIsPublishing(false);
      setIsCalloutCreationDialogOpen(false);

      return;
    },
    [collaborationID]
  );

  return {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutPublished,
    handleCalloutDrafted,
    isPublishing,
  };
};

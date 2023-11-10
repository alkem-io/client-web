import { useCallback, useState } from 'react';
import { CalloutFragmentDoc, useCreateCalloutMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutDisplayLocation,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  CreateCalloutMutation,
  CreateReferenceInput,
  CreateTagsetInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import { WhiteboardFieldSubmittedValues } from '../CalloutWhiteboardField/CalloutWhiteboardField';
import { WhiteboardRtFieldSubmittedValues } from '../CalloutWhiteboardField/CalloutWhiteboardRtField';
import { useCollaborationAuthorization } from '../../../authorization/useCollaborationAuthorization';

export interface CalloutCreationType {
  framing: {
    profile: {
      description: string;
      displayName: string;
      referencesData: CreateReferenceInput[];
      tagsets?: CreateTagsetInput[];
    };
    whiteboard?: WhiteboardFieldSubmittedValues;
    whiteboardRt?: WhiteboardRtFieldSubmittedValues;
    tags?: string[];
  };
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
  type: CalloutType;
  contributionPolicy: {
    state: CalloutState;
  };
  displayLocation?: CalloutDisplayLocation;
  visibility?: CalloutVisibility;
  sendNotification?: boolean;
}

export interface CalloutCreationUtils {
  isCalloutCreationDialogOpen: boolean;
  handleCreateCalloutOpened: () => void;
  handleCreateCalloutClosed: () => void;
  handleCreateCallout: (
    callout: CalloutCreationType
  ) => Promise<CreateCalloutMutation['createCalloutOnCollaboration'] | undefined>;
  loading: boolean;
}

export const useCalloutCreation = (initialOpened = false): CalloutCreationUtils => {
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(initialOpened);
  const [isCreating, setIsCreating] = useState(false);
  const { collaborationId, loading } = useCollaborationAuthorization();

  const [createCallout] = useCreateCalloutMutation({
    update: (cache, { data }) => {
      if (!data || !collaborationId) {
        return;
      }

      const { createCalloutOnCollaboration } = data;

      const collabRefId = cache.identify({
        __typename: 'Collaboration',
        id: collaborationId,
      });

      if (!collabRefId) {
        return;
      }

      cache.modify({
        id: collabRefId,
        fields: {
          callouts(existing = []) {
            const newCalloutRef = cache.writeFragment({
              data: createCalloutOnCollaboration,
              fragment: CalloutFragmentDoc,
              fragmentName: 'Callout',
            });
            return [...existing, newCalloutRef];
          },
        },
      });
    },
  });

  const handleCreateCalloutOpened = useCallback(() => {
    setIsCalloutCreationDialogOpen(true);
  }, []);
  const handleCreateCalloutClosed = useCallback(() => setIsCalloutCreationDialogOpen(false), []);

  const handleCreateCallout = useCallback(
    async (callout: CalloutCreationType) => {
      if (!collaborationId) {
        return;
      }

      setIsCreating(true);

      try {
        const result = await createCallout({
          variables: {
            calloutData: {
              collaborationID: collaborationId,
              ...callout,
            },
          },
        });

        setIsCalloutCreationDialogOpen(false);

        return result.data?.createCalloutOnCollaboration;
      } finally {
        setIsCreating(false);
      }
    },
    [collaborationId, createCallout]
  );

  return {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    loading: loading || isCreating,
  };
};

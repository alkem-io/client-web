import { useCallback, useState } from 'react';
import { CalloutFragmentDoc, useCreateCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutGroupName,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  CreateCalloutMutation,
  CreateReferenceInput,
  CreateTagsetInput,
} from '@/core/apollo/generated/graphql-schema';
import { WhiteboardFieldSubmittedValues } from '../CalloutWhiteboardField/CalloutWhiteboardField';
import { useCollaborationAuthorizationEntitlements } from '@/domain/collaboration/authorization/useCollaborationAuthorization';

export interface CalloutCreationType {
  framing: {
    profile: {
      description: string;
      displayName: string;
      referencesData: CreateReferenceInput[];
      tagsets?: CreateTagsetInput[];
    };
    whiteboard?: WhiteboardFieldSubmittedValues;
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
  groupName?: CalloutGroupName;
  visibility?: CalloutVisibility;
  sendNotification?: boolean;
}

export interface CalloutCreationParams {
  collaborationId?: string;
  calloutsSetId?: string;
  initialOpened?: boolean;
}

export interface CalloutCreationUtils {
  isCalloutCreationDialogOpen: boolean;
  handleCreateCalloutOpened: () => void;
  handleCreateCalloutClosed: () => void;
  handleCreateCallout: (
    callout: CalloutCreationType
  ) => Promise<CreateCalloutMutation['createCalloutOnCalloutsSet'] | undefined>;
  loading: boolean;
  canCreateCallout: boolean;
}

// Only Posts have comments for now.
const CALLOUTS_WITH_COMMENTS = [CalloutType.Post];

export const useCalloutCreation = ({
  collaborationId,
  calloutsSetId,
  initialOpened = false,
}: CalloutCreationParams): CalloutCreationUtils => {
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(initialOpened);
  const [isCreating, setIsCreating] = useState(false);
  const { canCreateCallout, loading } = useCollaborationAuthorizationEntitlements({ collaborationId });

  const [createCallout] = useCreateCalloutMutation({
    update: (cache, { data }) => {
      if (!data || !collaborationId) {
        return;
      }
      const { createCalloutOnCalloutsSet } = data;

      const calloutsSetRefId = cache.identify({
        __typename: 'CalloutsSet',
        id: calloutsSetId,
      });

      if (!calloutsSetRefId) {
        return;
      }

      cache.modify({
        id: calloutsSetRefId,
        fields: {
          callouts(existing = []) {
            const newCalloutRef = cache.writeFragment({
              data: createCalloutOnCalloutsSet,
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
      if (!calloutsSetId) {
        return;
      }

      setIsCreating(true);

      try {
        const result = await createCallout({
          variables: {
            calloutData: {
              calloutsSetID: calloutsSetId,
              enableComments: CALLOUTS_WITH_COMMENTS.includes(callout.type),
              ...callout,
            },
          },
        });

        setIsCalloutCreationDialogOpen(false);

        return result.data?.createCalloutOnCalloutsSet;
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
    canCreateCallout: canCreateCallout && !loading,
  };
};

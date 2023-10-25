import { useCallback, useState } from 'react';
import {
  CalloutFragmentDoc,
  useChallengeCollaborationIdQuery,
  useCreateCalloutMutation,
  useSpaceCollaborationIdQuery,
  useOpportunityCollaborationIdQuery,
  useCollaborationAuthorizationQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import {
  AuthorizationPrivilege,
  CalloutDisplayLocation,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  CreateCalloutMutation,
  CreateTagsetInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../../common/profile/Profile';
import { WhiteboardFieldSubmittedValues } from '../CalloutWhiteboardField/CalloutWhiteboardField';
import { WhiteboardRtFieldSubmittedValues } from '../CalloutWhiteboardField/CalloutWhiteboardRtField';
import { getJourneyTypeName } from '../../../../journey/JourneyTypeName';

export interface CalloutCreationType {
  framing: {
    profile: {
      description: string;
      displayName: string;
      referencesData: Reference[];
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
  isCreating: boolean;
}

export const useCalloutCreation = (initialOpened = false): CalloutCreationUtils => {
  const urlParams = useUrlParams();
  const { spaceNameId, challengeNameId, opportunityNameId } = urlParams;
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(initialOpened);
  const [isCreating, setIsCreating] = useState(false);
  const journeyTypeName = getJourneyTypeName(urlParams);

  const { data: authorizationData } = useCollaborationAuthorizationQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId: challengeNameId,
      opportunityNameId: opportunityNameId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: !spaceNameId,
  });
  const authorization = (
    authorizationData?.space.opportunity ??
    authorizationData?.space.challenge ??
    authorizationData?.space
  )?.authorization;
  const canReadCollaboration = (authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const { data: spaceData } = useSpaceCollaborationIdQuery({
    variables: { spaceId: spaceNameId! },
    skip: !canReadCollaboration || !spaceNameId || !!challengeNameId || !!opportunityNameId,
  });
  const { data: challengeData } = useChallengeCollaborationIdQuery({
    variables: {
      spaceId: spaceNameId!,
      challengeId: challengeNameId!,
    },
    skip: !canReadCollaboration || !spaceNameId || !challengeNameId || !!opportunityNameId,
  });
  const { data: opportunityData } = useOpportunityCollaborationIdQuery({
    variables: {
      spaceId: spaceNameId!,
      opportunityId: opportunityNameId!,
    },
    skip: !canReadCollaboration || !spaceNameId || !opportunityNameId,
  });

  const collaborationID: string | undefined = (
    spaceData?.space ??
    challengeData?.space?.challenge ??
    opportunityData?.space?.opportunity
  )?.collaboration?.id;

  const [createCallout] = useCreateCalloutMutation({
    update: (cache, { data }) => {
      if (!data || !collaborationID) {
        return;
      }

      const { createCalloutOnCollaboration } = data;

      const collabRefId = cache.identify({
        __typename: 'Collaboration',
        id: collaborationID,
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
      if (!collaborationID) {
        return;
      }

      setIsCreating(true);

      try {
        const result = await createCallout({
          variables: {
            calloutData: {
              collaborationID,
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
    [collaborationID, createCallout]
  );

  return {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    isCreating,
  };
};

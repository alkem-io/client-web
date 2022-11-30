import { useCallback, useState } from 'react';
import {
  CalloutFragmentDoc,
  useChallengeCollaborationIdQuery,
  useCreateCalloutMutation,
  useHubCollaborationIdQuery,
  useOpportunityCollaborationIdQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import { CalloutState, CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import { AspectTemplateFormSubmittedValues } from '../../../../platform/admin/templates/AspectTemplates/AspectTemplateForm';

export type CalloutCreationType = {
  description: string;
  displayName: string;
  templateId: string;
  type: CalloutType;
  state: CalloutState;
  cardTemplate?: AspectTemplateFormSubmittedValues;
};

interface CalloutCreationUtils {
  isCalloutCreationDialogOpen: boolean;
  handleCreateCalloutOpened: () => void;
  handleCreateCalloutClosed: () => void;
  handleCalloutDrafted: (callout: CalloutCreationType) => Promise<void>;
  isCreating: boolean;
}

export const useCalloutCreation = (initialOpened = false): CalloutCreationUtils => {
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();
  const handleError = useApolloErrorHandler();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(initialOpened);
  const [isCreating, setIsCreating] = useState(false);

  const { data: hubData } = useHubCollaborationIdQuery({
    variables: { hubId: hubNameId! },
    skip: !hubNameId || !!challengeNameId || !!opportunityNameId,
  });
  const { data: challengeData } = useChallengeCollaborationIdQuery({
    variables: {
      hubId: hubNameId!,
      challengeId: challengeNameId!,
    },
    skip: !hubNameId || !challengeNameId || !!opportunityNameId,
  });
  const { data: opportunityData } = useOpportunityCollaborationIdQuery({
    variables: {
      hubId: hubNameId!,
      opportunityId: opportunityNameId!,
    },
    skip: !hubNameId || !opportunityNameId,
  });

  const collaborationID: string | undefined = (
    hubData?.hub ??
    challengeData?.hub?.challenge ??
    opportunityData?.hub?.opportunity
  )?.collaboration?.id;

  const [createCallout] = useCreateCalloutMutation({
    onError: handleError,
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
  const handleCalloutDrafted = useCallback(
    async (callout: CalloutCreationType) => {
      if (!collaborationID) {
        return;
      }

      setIsCreating(true);

      await createCallout({
        variables: {
          calloutData: {
            collaborationID,
            description: callout.description,
            displayName: callout.displayName,
            type: callout.type,
            state: callout.state,
            cardTemplate: callout.cardTemplate,
          },
        },
      });

      setIsCreating(false);
      setIsCalloutCreationDialogOpen(false);

      return;
    },
    [collaborationID, createCallout]
  );

  return {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutDrafted,
    isCreating,
  };
};

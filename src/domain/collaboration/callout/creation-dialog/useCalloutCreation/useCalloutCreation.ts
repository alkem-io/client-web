import { useCallback, useState } from 'react';
import {
  CalloutFragmentDoc,
  useChallengeCollaborationIdQuery,
  useCreateCalloutMutation,
  useHubCollaborationIdQuery,
  useOpportunityCollaborationIdQuery,
  useUploadVisualMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { CalloutState, CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import { PostTemplateFormSubmittedValues } from '../../../../platform/admin/templates/PostTemplates/PostTemplateForm';
import { WhiteboardTemplateFormSubmittedValues } from '../../../../platform/admin/templates/WhiteboardTemplates/WhiteboardTemplateForm';
import { Reference } from '../../../../common/profile/Profile';
import { Identifiable } from '../../../../shared/types/Identifiable';
import { WhiteboardFieldSubmittedValuesWithPreviewImage } from '../CalloutWhiteboardField/CalloutWhiteboardField';

export type CalloutCreationType = {
  profile: {
    description: string;
    displayName: string;
    referencesData: Reference[];
  };
  tags?: string[];
  type: CalloutType;
  state: CalloutState;
  postTemplate?: PostTemplateFormSubmittedValues;
  whiteboardTemplate?: WhiteboardTemplateFormSubmittedValues;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImage;
  group?: string;
};

export interface CalloutCreationUtils {
  isCalloutCreationDialogOpen: boolean;
  handleCreateCalloutOpened: () => void;
  handleCreateCalloutClosed: () => void;
  handleCreateCallout: (callout: CalloutCreationType) => Promise<Identifiable | undefined>;
  isCreating: boolean;
}

export const useCalloutCreation = (initialOpened = false): CalloutCreationUtils => {
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(initialOpened);
  const [isCreating, setIsCreating] = useState(false);

  const [uploadVisual] = useUploadVisualMutation({});
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

      // Remove the previewImage from the form data if it's present, to handle it separatelly
      const { callout: cleanCallout, previewImage } = handlePreviewImage(callout);

      const result = await createCallout({
        variables: {
          calloutData: {
            collaborationID,
            ...cleanCallout,
          },
        },
      });

      if (previewImage && result.data?.createCalloutOnCollaboration.canvases?.[0]?.profile.preview?.id) {
        if (
          result.data?.createCalloutOnCollaboration.canvases &&
          result.data?.createCalloutOnCollaboration.canvases.length > 0
        ) {
          const visualId = result.data.createCalloutOnCollaboration.canvases[0].profile.preview.id;
          if (visualId) {
            await uploadVisual({
              variables: {
                file: new File([previewImage], `/SingleWhiteboardCallout-${callout.profile.displayName}-preview.png`, {
                  type: 'image/png',
                }),
                uploadData: {
                  visualID: visualId,
                },
              },
            });
          }
        }
      }

      setIsCreating(false);
      setIsCalloutCreationDialogOpen(false);

      return result.data?.createCalloutOnCollaboration;
    },
    [collaborationID, createCallout]
  );

  const handlePreviewImage = (callout: CalloutCreationType) => {
    if (callout.whiteboard) {
      const {
        whiteboard: { previewImage, ...restWhiteboard },
        ...rest
      } = callout;
      return { callout: { whiteboard: restWhiteboard, ...rest }, previewImage };
    }
    return { callout };
  };

  return {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    isCreating,
  };
};

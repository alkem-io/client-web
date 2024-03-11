import { JourneyLocation } from '../../../../main/routing/urlBuilders';
import { getJourneyTypeName } from '../../JourneyTypeName';
import { useCollaborationIdentityQuery } from '../../../../core/apollo/generated/apollo-hooks';

export interface CollaborationIdentity {
  collaborationId: string | undefined;
  loading: boolean;
}

const useCollaborationIdentity = (journeyLocation: JourneyLocation): CollaborationIdentity => {
  const journeyTypeName = getJourneyTypeName(journeyLocation)!;

  const { data: CollaborationIdentityData, loading } = useCollaborationIdentityQuery({
    variables: {
      ...journeyLocation,
      isChallenge: journeyTypeName === 'challenge',
      isOpportunity: journeyTypeName === 'opportunity',
    },
  });

  const collaborationId =
    CollaborationIdentityData?.space.opportunity?.collaboration?.id ??
    CollaborationIdentityData?.space.challenge?.collaboration?.id ??
    CollaborationIdentityData?.space.collaboration?.id;

  return {
    collaborationId,
    loading
  };
};

export default useCollaborationIdentity;

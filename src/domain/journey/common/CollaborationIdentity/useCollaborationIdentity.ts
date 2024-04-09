import { JourneyTypeName } from '../../JourneyTypeName';
import { useCollaborationIdentityQuery } from '../../../../core/apollo/generated/apollo-hooks';

export interface CollaborationIdentity {
  collaborationId: string | undefined;
  loading: boolean;
}

interface CollaborationIdentityParams {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const useCollaborationIdentity = ({
  journeyId,
  journeyTypeName,
}: CollaborationIdentityParams): CollaborationIdentity => {
  const { data: CollaborationIdentityData, loading } = useCollaborationIdentityQuery({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      isSpace: journeyTypeName === 'space',
      isChallenge: journeyTypeName === 'challenge',
      isOpportunity: journeyTypeName === 'opportunity',
    },
  });

  const collaborationId =
    CollaborationIdentityData?.lookup.opportunity?.collaboration?.id ??
    CollaborationIdentityData?.lookup.subspace?.collaboration?.id ??
    CollaborationIdentityData?.space?.collaboration?.id;

  return {
    collaborationId,
    loading,
  };
};

export default useCollaborationIdentity;

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

const useCollaborationIdentity = ({ journeyId }: CollaborationIdentityParams): CollaborationIdentity => {
  const { data: collaborationIdentityData, loading } = useCollaborationIdentityQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  const collaborationId = collaborationIdentityData?.space?.collaboration?.id;

  return {
    collaborationId,
    loading,
  };
};

export default useCollaborationIdentity;

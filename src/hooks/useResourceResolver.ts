import { useMemo } from 'react';
import { useAllCommunitiesQuery } from '../generated/graphql';
import { AuthorizationCredential } from '../types/graphql-schema';

const mapper = (
  c?
): {
  id: string;
  type: string;
  name: string;
} => ({
  id: c?.community?.id || '',
  type: c?.community?.type || '',
  name: c?.community?.name || '',
});

export const useResourceResolver = () => {
  const { data: communityData } = useAllCommunitiesQuery();

  const communities = useMemo(() => {
    const challenges = communityData?.ecoverse.challenges?.map(mapper) || [];
    const opportunities = communityData?.ecoverse.opportunities?.map(mapper) || [];
    const ecoverseCommunity = mapper(communityData?.ecoverse.community) || '';
    return [...challenges, ...opportunities, ecoverseCommunity];
  }, [communityData]);

  const resolveResource = (type: AuthorizationCredential, resourceId: string) => {
    const defaultValue = {
      id: resourceId,
      type: 'Resource not found',
      name: 'Resource not found',
    };
    if (type === AuthorizationCredential.CommunityMember) {
      return communities.find(c => c.id === resourceId) || defaultValue;
    }
    return defaultValue;
  };

  return resolveResource;
};

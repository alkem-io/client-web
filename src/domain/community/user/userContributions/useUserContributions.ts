import { useUserContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { useMemo } from 'react';

const useUserContributions = (userId: string | undefined) => {
  const { data } = useUserContributionsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    const contributions: SpaceHostedItem[] = [];

    data.rolesUser.spaces.forEach(e => {
      contributions.push({
        spaceID: e.id,
        id: e.id,
        spaceLevel: SpaceLevel.Space,
        contributorId: userId!,
        contributorType: CommunityContributorType.User,
        roles: e.roles,
      });

      e.subspaces.forEach(ss => {
        contributions.push({
          id: ss.id,
          spaceID: ss.id,
          spaceLevel: ss.level,
          contributorId: userId!,
          contributorType: CommunityContributorType.User,
          roles: ss.roles,
        });
      });
    });

    return contributions;
  }, [data]);
};

export default useUserContributions;

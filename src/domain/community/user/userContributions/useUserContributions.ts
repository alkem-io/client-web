import { useUserContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
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
        spaceLevel: SpaceLevel.L0,
        contributorId: userId!,
        contributorType: RoleSetContributorType.User,
        roles: e.roles,
      });

      e.subspaces.forEach(ss => {
        contributions.push({
          id: ss.id,
          spaceID: ss.id,
          spaceLevel: ss.level,
          contributorId: userId!,
          contributorType: RoleSetContributorType.User,
          roles: ss.roles,
          parentSpaceId: e.id, // Track parent space for subspaces
        });
      });
    });

    return contributions;
  }, [data]);
};

export default useUserContributions;

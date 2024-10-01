import { useUserContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { CommunityContributorType } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyLevel } from '../../../../main/routing/resolvers/RouteResolver';
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
        spaceLevel: 0,
        contributorId: userId!,
        contributorType: CommunityContributorType.User,
        roles: e.roles,
      });

      e.subspaces.forEach(ss => {
        contributions.push({
          id: ss.id,
          spaceID: ss.id,
          spaceLevel: ss.level as JourneyLevel,
          contributorId: userId!,
          contributorType: CommunityContributorType.User,
          roles: e.roles,
        });
      });
    });

    return contributions;
  }, [data]);
};

export default useUserContributions;

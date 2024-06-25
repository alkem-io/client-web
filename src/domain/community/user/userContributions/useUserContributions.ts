import { useUserContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { CommunityContributorType, SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { useMemo } from 'react';

const useUserContributions = (userId: string | undefined) => {
  //!!
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
      });

      e.subspaces.forEach(ss => {
        if (ss.type === SpaceType.Challenge) {
          contributions.push({
            id: ss.id,
            spaceID: ss.id,
            spaceLevel: 1,
            contributorId: userId!,
            contributorType: CommunityContributorType.User,
          });
        }

        if (ss.type === SpaceType.Opportunity) {
          contributions.push({
            id: ss.id,
            spaceID: ss.id,
            spaceLevel: 2,
            contributorId: userId!,
            contributorType: CommunityContributorType.User,
          });
        }
      });
    });

    return contributions;
  }, [data]);
};

export default useUserContributions;

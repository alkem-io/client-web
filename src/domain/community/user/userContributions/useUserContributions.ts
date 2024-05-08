import { useUserContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import { ContributionItem } from '../contribution';
import { useMemo } from 'react';

const useUserContributions = (userNameId: string) => {
  const skip = !userNameId;

  const { data } = useUserContributionsQuery({
    variables: {
      userId: userNameId,
    },
    skip,
  });

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    const contributions: ContributionItem[] = [];

    data.rolesUser.spaces.forEach(e => {
      contributions.push({
        spaceId: e.id,
        id: e.id,
      });

      e.subspaces.forEach(ss => {
        if (ss.type === SpaceType.Challenge) {
          contributions.push({
            spaceId: e.id,
            challengeId: ss.id,
            id: ss.id,
          });
        }

        if (ss.type === SpaceType.Opportunity) {
          contributions.push({
            spaceId: ss.id,
            opportunityId: ss.id,
            id: ss.id,
          });
        }
      });
    });

    return contributions;
  }, [data]);
};

export default useUserContributions;

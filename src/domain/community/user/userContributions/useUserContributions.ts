import { useUserContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
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

    const contributions: SpaceHostedItem[] = [];

    data.rolesUser.spaces.forEach(e => {
      contributions.push({
        spaceID: e.id,
        id: e.id,
        spaceLevel: 0,
      });

      e.subspaces.forEach(ss => {
        if (ss.type === SpaceType.Challenge) {
          contributions.push({
            id: ss.id,
            spaceID: ss.id,
            spaceLevel: 1,
          });
        }

        if (ss.type === SpaceType.Opportunity) {
          contributions.push({
            id: ss.id,
            spaceID: ss.id,
            spaceLevel: 2,
          });
        }
      });
    });

    return contributions;
  }, [data]);
};

export default useUserContributions;

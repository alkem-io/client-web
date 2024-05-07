import { useUserContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
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

    const spaces = data?.rolesUser.spaces.map<ContributionItem>(e => ({
      spaceId: e.id,
      id: e.id,
    }));

    const subspaces = data?.rolesUser.spaces.flatMap<ContributionItem>(e =>
      e.subspaces
        .filter(c => c.type === 'CHALLENGE')
        .map(c => ({
          spaceId: e.id,
          challengeId: c.id,
          id: c.id,
        }))
    );

    const subsubspaces = data?.rolesUser.spaces.flatMap<ContributionItem>(e =>
      e.subspaces
        .filter(c => c.type === 'OPPORTUNITY')
        .map(o => ({
          spaceId: e.id,
          opportunityId: o.id,
          id: o.id,
        }))
    );

    return [...spaces, ...subspaces, ...subsubspaces];
  }, [data]);
};

export default useUserContributions;

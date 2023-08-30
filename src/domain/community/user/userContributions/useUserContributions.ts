import { useUserContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../hooks/useUserContext';
import { ContributionItem } from '../contribution';
import { useMemo } from 'react';

const useUserContributions = () => {
  const { user } = useUserContext();

  const { data } = useUserContributionsQuery({
    variables: {
      userId: user?.user.id!,
    },
    skip: !user?.user.id,
  });

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    const spaces = data?.rolesUser.spaces.map<ContributionItem>(e => ({
      spaceId: e.nameID,
      id: e.id,
    }));

    const challenges = data?.rolesUser.spaces.flatMap<ContributionItem>(e =>
      e.challenges.map(c => ({
        spaceId: e.nameID,
        challengeId: c.nameID,
        id: c.id,
      }))
    );

    const opportunities = data?.rolesUser.spaces.flatMap<ContributionItem>(e =>
      e.opportunities.map(o => ({
        spaceId: e.nameID,
        opportunityId: o.nameID,
        id: o.id,
      }))
    );

    return [...spaces, ...challenges, ...opportunities];
  }, [data]);
};

export default useUserContributions;

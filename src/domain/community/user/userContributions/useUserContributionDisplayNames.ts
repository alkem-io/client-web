import { useUserContext } from '../hooks/useUserContext';
import { useUserContributionDisplayNamesQuery } from '@core/apollo/generated/apollo-hooks';

const getDisplayName = ({ displayName }: { displayName: string }) => displayName;

const useUserContributionDisplayNames = () => {
  const { user } = useUserContext();

  const { data } = useUserContributionDisplayNamesQuery({
    variables: {
      userId: user?.user.id!,
    },
    skip: !user?.user.id,
  });

  const challengeMemberships = data?.rolesUser.spaces.flatMap(e => e.subspaces);
  const opportunityMemberships = data?.rolesUser.spaces.flatMap(e => e.subspaces);

  const spaceDisplayNames = data?.rolesUser.spaces.map(getDisplayName);
  const challengeDisplayNames = challengeMemberships?.map(getDisplayName);
  const opportunityDisplayNames = opportunityMemberships?.map(getDisplayName);
  const organizationDisplayNames = data?.rolesUser.organizations.map(getDisplayName);

  return {
    spaces: spaceDisplayNames,
    challenges: challengeDisplayNames,
    opportunities: opportunityDisplayNames,
    organizations: organizationDisplayNames,
  };
};

export default useUserContributionDisplayNames;

import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { useUserContributionDisplayNamesQuery } from '@/core/apollo/generated/apollo-hooks';

const getDisplayName = ({ displayName }: { displayName: string }) => displayName;

const useUserContributionDisplayNames = () => {
  const { userModel } = useCurrentUserContext();

  const { data } = useUserContributionDisplayNamesQuery({
    variables: {
      userId: userModel?.id!,
    },
    skip: !userModel?.id,
  });

  const spaceMembershipsL1 = data?.rolesUser.spaces.flatMap(e => e.subspaces);
  // TODO: this looks like a bug?
  const spaceMembershipsL2 = data?.rolesUser.spaces.flatMap(e => e.subspaces);

  const spaceDisplayNamesL0 = data?.rolesUser.spaces.map(getDisplayName);
  const spaceDisplayNamesL1 = spaceMembershipsL1?.map(getDisplayName);
  const spaceDisplayNamesL2 = spaceMembershipsL2?.map(getDisplayName);
  const organizationDisplayNames = data?.rolesUser.organizations.map(getDisplayName);

  return {
    spaceDisplayNamesL0,
    spaceDisplayNamesL1,
    spaceDisplayNamesL2,
    organizations: organizationDisplayNames,
  };
};

export default useUserContributionDisplayNames;

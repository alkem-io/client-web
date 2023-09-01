import { useUserOrganizationIdsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';

const useUserOrganizationIds = (userNameId: string) => {
  const skip = !userNameId;

  const { data } = useUserOrganizationIdsQuery({
    variables: {
      userId: userNameId,
    },
    skip,
  });

  return useMemo(() => {
    return data?.rolesUser.organizations.map(org => org.id);
  }, [data]);
};

export default useUserOrganizationIds;

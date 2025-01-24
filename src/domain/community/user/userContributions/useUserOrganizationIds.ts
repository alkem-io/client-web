import { useUserOrganizationIdsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';

const useUserOrganizationIds = (userId: string | undefined) => {
  const { data } = useUserOrganizationIdsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  return useMemo(() => {
    return data?.rolesUser.organizations.map(org => org.id);
  }, [data]);
};

export default useUserOrganizationIds;

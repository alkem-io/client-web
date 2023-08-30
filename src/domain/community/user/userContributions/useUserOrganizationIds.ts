import { useUserContext } from '../hooks/useUserContext';
import { useUserOrganizationIdsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';

const useUserOrganizationIds = () => {
  const { user } = useUserContext();

  const { data } = useUserOrganizationIdsQuery({
    variables: {
      userId: user?.user.id!,
    },
    skip: !user?.user.id,
  });

  return useMemo(() => {
    return data?.rolesUser.organizations.map(org => org.id);
  }, [data]);
};

export default useUserOrganizationIds;

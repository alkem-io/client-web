import { useUserOrganizationIdsQuery } from '@/core/apollo/generated/apollo-hooks';

const useUserOrganizationIds = (userId: string | undefined) => {
  const { data } = useUserOrganizationIdsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  return (() => {
    return data?.rolesUser.organizations.map(org => org.id);
  })();
};

export default useUserOrganizationIds;

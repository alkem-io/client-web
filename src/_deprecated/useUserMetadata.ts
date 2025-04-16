import { useUserProfileWithRolesQuery } from '@/core/apollo/generated/apollo-hooks';
import { toUserMetadata } from '@/domain/community/user';
/**
 * @deprecated Try to avoid this one, refactor to remove it
 */
export const useUserMetadata = (userId: string | undefined) => {
  const { data, loading } = useUserProfileWithRolesQuery({
    variables: { userId: userId! },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    onError: () => {
      // because reset store can crash - error needs to be consumed
    },
  });

  return {
    user: toUserMetadata(data?.lookup.user, data?.platform.authorization?.myPrivileges, data?.platform.roleSet.myRoles),
    loading,
  };
};

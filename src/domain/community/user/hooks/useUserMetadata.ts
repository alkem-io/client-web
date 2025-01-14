import { useUserProfileQuery } from '@/core/apollo/generated/apollo-hooks';
import { toUserMetadata } from './useUserMetadataWrapper';
/**
 * @deprecated Try to avoid this one, refactor to remove it
 */
export const useUserMetadata = (userId: string | undefined) => {
  const { data, loading } = useUserProfileQuery({
    variables: { input: userId! },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    onError: () => {
      // because reset store can crash - error needs to be consumed
    },
  });

  return {
    user: toUserMetadata(data?.lookup.user, data?.platform.authorization, data?.platform.roleSet.myRoles),
    loading,
  };
};

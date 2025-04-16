import { useUserProfileWithRolesQuery } from '@/core/apollo/generated/apollo-hooks';
import { UserModel } from '@/domain/community/user/models/UserModel';
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

  const userModel: UserModel | undefined = data?.lookup?.user;

  return {
    user: userModel,
    loading,
  };
};

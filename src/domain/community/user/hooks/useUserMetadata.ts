import { useUserProfileQuery } from '@/core/apollo/generated/apollo-hooks';
import { User } from '@/core/apollo/generated/graphql-schema';
import { toUserMetadata } from './useUserMetadataWrapper';

export const useUserMetadata = (id: string) => {
  const { data, loading } = useUserProfileQuery({
    variables: { input: id },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    onError: () => {
      // because reset store can crash - error needs to be consumed
    },
  });

  return {
    user: toUserMetadata(data?.user as User, data?.platform.authorization, data?.platform.roleSet.myRoles),
    loading,
  };
};

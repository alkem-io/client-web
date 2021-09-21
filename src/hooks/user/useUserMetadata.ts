import { User } from '../../models/graphql-schema';
import { useUserProfileQuery } from '../generated/graphql';
import { useUserMetadataWrapper } from './useUserMetadataWrapper';

export const useUserMetadata = (id: string) => {
  const wrapper = useUserMetadataWrapper();

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
    user: wrapper(data?.user as User, data?.membershipUser),
    loading,
  };
};

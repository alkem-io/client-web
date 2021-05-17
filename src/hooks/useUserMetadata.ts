import { useMembershipQuery, useUserQuery } from '../generated/graphql';
import { User } from '../types/graphql-schema';
import { useUserMetadataWrapper } from './useUserMetadataWrapper';

export const useUserMetadata = (id: string) => {
  const wrapper = useUserMetadataWrapper();

  const { data, loading: loadingData } = useUserQuery({ variables: { id } });

  const { data: membershipData, loading: loadingMembership } = useMembershipQuery({
    variables: { input: { userID: id } },
    errorPolicy: 'ignore',
  });
  const loading = loadingData || loadingMembership;
  return {
    user: wrapper(data?.user as User, membershipData?.membership),
    loading,
  };
};

import { useMembershipUserQuery, useUserCardQuery } from '../../components/generated/graphql';
import { User } from '../../models/graphql-schema';
import { useUserMetadataWrapper } from './useUserMetadataWrapper';

export const useUserCardMetadata = (id: string) => {
  const wrapper = useUserMetadataWrapper();

  const { data, loading: loadingData } = useUserCardQuery({ variables: { id } });

  const { data: membershipData, loading: loadingMembership } = useMembershipUserQuery({
    variables: { input: { userID: id } },
    errorPolicy: 'all',
    onError: () => {
      // because reset store can crash - error needs to be consumed
    },
  });
  const loading = loadingData || loadingMembership;
  return {
    user: wrapper(data?.user as User, membershipData?.membershipUser),
    loading,
  };
};

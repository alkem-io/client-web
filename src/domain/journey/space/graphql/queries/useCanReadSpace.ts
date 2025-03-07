import mainQuery from '@/core/apollo/utils/mainQuery';
import { useSpaceAndCommunityPrivilegesQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { ApolloError } from '@apollo/client';
import { useMemo } from 'react';

const fetchPrivileges = mainQuery(useSpaceAndCommunityPrivilegesQuery);

interface UseCanReadSpaceParams {
  spaceId: string | undefined;
}

export interface SpaceReadAccess {
  canReadSpace: boolean | undefined;
  canReadCommunity: boolean | undefined;
  loading: boolean;
  error?: ApolloError;
}

const useCanReadSpace = ({ spaceId }: UseCanReadSpaceParams): SpaceReadAccess => {
  const {
    data: spacePrivilegesQueryData,
    loading: privilegesLoading,
    error: privilegesError,
  } = fetchPrivileges({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const canReadSpace = spacePrivilegesQueryData?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const canReadCommunity = spacePrivilegesQueryData?.lookup.space?.community.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  return useMemo<SpaceReadAccess>(
    () => ({
      canReadSpace,
      canReadCommunity,
      loading: privilegesLoading,
      error: privilegesError,
    }),
    [canReadSpace, canReadCommunity, privilegesLoading, privilegesError]
  );
};

export default useCanReadSpace;

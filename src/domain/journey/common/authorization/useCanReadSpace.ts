import mainQuery from '../../../../core/apollo/utils/mainQuery';
import { useJourneyPrivilegesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { ApolloError } from '@apollo/client';
import { useMemo } from 'react';

const fetchPrivileges = mainQuery(useJourneyPrivilegesQuery);

interface UseCanReadSpaceParams {
  spaceId: string | undefined;
}

export interface SpaceReadAccess {
  canReadSpace: boolean | undefined;
  loading: boolean;
  error?: ApolloError;
}

const useCanReadSpace = ({ spaceId }: UseCanReadSpaceParams): SpaceReadAccess => {
  const {
    data: journeyPrivilegesQueryData,
    loading: privilegesLoading,
    error: privilegesError,
  } = fetchPrivileges({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const isAuthorized = journeyPrivilegesQueryData?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  return useMemo<SpaceReadAccess>(
    () => ({
      canReadSpace: isAuthorized,
      loading: privilegesLoading,
      error: privilegesError,
    }),
    [isAuthorized, privilegesLoading, privilegesError]
  );
};

export default useCanReadSpace;

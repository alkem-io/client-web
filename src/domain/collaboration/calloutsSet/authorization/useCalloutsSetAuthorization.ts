import { useCalloutsSetAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

type CalloutsSetAuthorizationParams = {
  calloutsSetId: string | undefined;
  skip?: boolean;
};

type CalloutsSetAuthorizationType = {
  calloutsSetPrivileges: AuthorizationPrivilege[];
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  canMoveCallouts: boolean;
  loading: boolean;
};

// TODO: Additional Auth Check
export const useCalloutsSetAuthorization = ({
  calloutsSetId,
  skip,
}: CalloutsSetAuthorizationParams): CalloutsSetAuthorizationType => {
  const { data: calloutsSetData, loading: loadingCalloutsSet } = useCalloutsSetAuthorizationQuery({
    variables: {
      calloutsSetId: calloutsSetId!,
    },
    skip: skip || !calloutsSetId,
  });

  const calloutsSetPrivileges = calloutsSetData?.lookup.calloutsSet?.authorization?.myPrivileges ?? [];
  const canReadCalloutsSet = calloutsSetPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateCallout = calloutsSetPrivileges.includes(AuthorizationPrivilege.CreateCallout);
  const canMoveCallouts = calloutsSetPrivileges.includes(AuthorizationPrivilege.Update);

  return {
    calloutsSetPrivileges,
    canCreateCallout,
    canReadCalloutsSet,
    canMoveCallouts,
    loading: loadingCalloutsSet,
  };
};

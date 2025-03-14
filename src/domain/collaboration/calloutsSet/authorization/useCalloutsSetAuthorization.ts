import { useCalloutsSetAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

type CalloutsSetAuthorizationParams = {
  calloutsSetId: string | undefined;
};

type CalloutsSetAuthorizationType = {
  calloutsSetPrivileges: AuthorizationPrivilege[];
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
};

// TODO: Additional Auth Check
export const useCalloutsSetAuthorization = ({
  calloutsSetId,
}: CalloutsSetAuthorizationParams): CalloutsSetAuthorizationType => {
  const { data: calloutsSetData, loading: loadingCalloutsSet } = useCalloutsSetAuthorizationQuery({
    variables: {
      calloutsSetId: calloutsSetId!,
    },
    skip: !calloutsSetId,
  });

  const calloutsSetPrivileges = calloutsSetData?.lookup.calloutsSet?.authorization?.myPrivileges ?? [];
  const canReadCalloutsSet = calloutsSetPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateCallout = calloutsSetPrivileges.includes(AuthorizationPrivilege.CreateCallout);

  return {
    calloutsSetPrivileges,
    canCreateCallout,
    canReadCalloutsSet,
    loading: loadingCalloutsSet,
  };
};

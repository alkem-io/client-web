import { useCalloutsSetAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

type CalloutsSetAuthorizationuseCalloutsSetAuthorizationQueryParams = {
  calloutsSetId: string | undefined;
};

type CalloutsSetAuthorization = {
  calloutsSetPrivileges: AuthorizationPrivilege[];
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
};

export const useCalloutsSetAuthorization = ({
  calloutsSetId,
}: CalloutsSetAuthorizationuseCalloutsSetAuthorizationQueryParams): CalloutsSetAuthorization => {
  const { data: calloutsSetData, loading: loadingCalloutsSet } = useCalloutsSetAuthorizationQuery({
    variables: {
      calloutsSetId: calloutsSetId!,
    },
    skip: !calloutsSetId,
  });

  const calloutsSetPrivileges = calloutsSetData?.lookup.calloutsSet?.authorization?.myPrivileges ?? [];
  const canReadCalloutsSet = calloutsSetPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateCallout = calloutsSetPrivileges.includes(AuthorizationPrivilege.Create);

  return {
    calloutsSetPrivileges,
    canCreateCallout,
    canReadCalloutsSet,
    loading: loadingCalloutsSet,
  };
};

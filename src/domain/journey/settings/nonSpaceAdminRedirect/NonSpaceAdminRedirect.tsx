import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../../../../core/ui/loading/Loading';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { useSpacePrivilegesQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface NonSpaceAdminRedirectProps {
  spaceId: string | undefined;
}

const NonSpaceAdminRedirect = ({ spaceId, children }: PropsWithChildren<NonSpaceAdminRedirectProps>) => {
  const { pathname } = useLocation();

  const { data, loading: isLoadingPrivileges } = useSpacePrivilegesQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  if (isLoadingPrivileges || !spaceId) {
    return <Loading text="Loading user configuration" />;
  }

  const isAdmin = data?.lookup.space?.authorization?.myPrivileges?.some(
    privilege => privilege === AuthorizationPrivilege.Admin || privilege === AuthorizationPrivilege.PlatformAdmin
  );

  if (isAdmin) {
    return <>{children}</>;
  }

  return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
};

export default NonSpaceAdminRedirect;

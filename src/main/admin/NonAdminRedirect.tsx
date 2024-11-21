import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

interface NonAdminRedirectProps {
  privileges: AuthorizationPrivilege[] | undefined;
  loading?: boolean;
  adminPrivilege: AuthorizationPrivilege;
}

const NonAdminRedirect = ({
  privileges,
  adminPrivilege,
  loading = false,
  children,
}: PropsWithChildren<NonAdminRedirectProps>) => {
  const { pathname } = useLocation();

  if (loading) {
    return <Loading text="Loading user privileges" />;
  }

  const isAdmin = privileges?.some(
    privilege => privilege === adminPrivilege || privilege === AuthorizationPrivilege.PlatformAdmin
  );

  if (isAdmin) {
    return <>{children}</>;
  }

  return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
};

export default NonAdminRedirect;

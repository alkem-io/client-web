import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { type ClosestAncestor, NotAuthorizedError } from '@/core/40XErrorHandler/40XErrors';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';

interface NonAdminRedirectProps {
  privileges: AuthorizationPrivilege[] | undefined;
  loading?: boolean;
  adminPrivilege: AuthorizationPrivilege;
  ancestorFallback?: ClosestAncestor;
}

const NonAdminRedirect = ({
  privileges,
  adminPrivilege,
  loading = false,
  ancestorFallback,
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

  if (ancestorFallback) {
    throw new NotAuthorizedError({ closestAncestor: ancestorFallback });
  }

  return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
};

export default NonAdminRedirect;

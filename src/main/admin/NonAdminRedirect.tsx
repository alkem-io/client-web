import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { type ClosestAncestor, NotAuthorizedError } from '@/core/40XErrorHandler/40XErrors';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';

interface NonAdminRedirectProps {
  privileges: AuthorizationPrivilege[] | undefined;
  loading?: boolean;
  /**
   * The privilege(s) that admit an operator to this admin area. A single value
   * keeps the original one-privilege behaviour; an array admits any one of them
   * (027-platform-role-redesign: the decomposed platform roles each carry their
   * own privilege, so "admin" is no longer a single credential).
   */
  adminPrivilege: AuthorizationPrivilege | AuthorizationPrivilege[];
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

  const admitting = Array.isArray(adminPrivilege) ? adminPrivilege : [adminPrivilege];

  const isAdmin = privileges?.some(
    privilege => admitting.includes(privilege) || privilege === AuthorizationPrivilege.PlatformAdmin
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

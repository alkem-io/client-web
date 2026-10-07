import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { type ClosestAncestor, NotAuthorizedError } from '@/core/40XErrorHandler/40XErrors';
import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
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
  /**
   * An admission the caller established by other means, OR'd with the privilege
   * check. Needed because not every admin capability is visible as a privilege on
   * the policy being read: 027's Platform Resource Admin holds its privileges on
   * *account* and *space* policies, so the platform-level answer for it is an
   * honest, permanent "no privileges" — see `PLATFORM_ADMIN_AREA_ROLES`.
   */
  admitted?: boolean;
  ancestorFallback?: ClosestAncestor;
}

const NonAdminRedirect = ({
  privileges,
  adminPrivilege,
  admitted = false,
  loading = false,
  ancestorFallback,
  children,
}: PropsWithChildren<NonAdminRedirectProps>) => {
  const { pathname } = useLocation();

  if (loading) {
    return <Loading text="Loading user privileges" />;
  }

  const admitting = Array.isArray(adminPrivilege) ? adminPrivilege : [adminPrivilege];

  // 027-platform-role-redesign (T013, Slice B): the `|| privilege === PlatformAdmin`
  // escape hatch is GONE with the privilege. It was the client-side twin of the
  // server's catch-all — one privilege that admitted its holder to EVERY admin
  // area regardless of which one `adminPrivilege` named — so leaving it in place
  // would have kept a decomposed model on the server and a single god privilege
  // in the console. Each area is now admitted by its own family's privilege, which
  // is what the `adminPrivilege` array was widened to express.
  const isAdmin = admitted || privileges?.some(privilege => admitting.includes(privilege));

  if (isAdmin) {
    return <>{children}</>;
  }

  if (ancestorFallback) {
    throw new NotAuthorizedError({ closestAncestor: ancestorFallback });
  }

  return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
};

export default NonAdminRedirect;

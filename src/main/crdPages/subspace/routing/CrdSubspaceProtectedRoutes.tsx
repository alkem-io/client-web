import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { toRoutePath } from '@/crd/lib/toRoutePath';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

/**
 * Permission guard for CRD subspace (L1/L2) routes.
 *
 * Mirrors `CrdSpaceProtectedRoutes` at the subspace level: when the viewer
 * lacks `canRead` on the current subspace, redirect to the sibling About
 * route (which always renders so the blocking `SpaceAboutDialog` can show).
 *
 * The redirect target is built from the subspace's canonical URL rather than
 * a `../about` relative path — the inner nested `<Routes>` sits inside an
 * outer wildcard match, and relative `..` walks out of the wildcard entirely,
 * landing on the parent space's About page instead of the subspace's.
 *
 * `subspace.about.profile.url` is normalised through `toRoutePath` first: the
 * server returns a fully-qualified URL (e.g. `https://host/parent/challenges/sub`)
 * on `profile.url`, and react-router treats any value that isn't `/`-prefixed
 * as relative — it would append the whole `https://…` string to the current
 * path, producing a mangled route that resolves to the error page. This is the
 * regression that broke opening a private L1 of a public L0 from /spaces.
 */
const CrdSubspaceProtectedRoutes = () => {
  const { loading: resolvingUrl } = useUrlResolver();
  const { subspace, permissions, loading: loadingSubspace } = useSubSpace();
  const parentContext = useOutletContext();

  if (resolvingUrl || loadingSubspace) {
    return <LoadingSpinner />;
  }

  if (!permissions.canRead) {
    return <Navigate to={`${toRoutePath(subspace.about.profile.url)}/${EntityPageSection.About}`} replace={true} />;
  }

  return <Outlet context={parentContext} />;
};

export default CrdSubspaceProtectedRoutes;

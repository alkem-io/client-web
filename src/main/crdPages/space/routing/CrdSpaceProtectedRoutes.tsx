import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpace } from '@/domain/space/context/useSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

/**
 * Permission guard for CRD space routes.
 *
 * Routes wrapped by this component require `canRead` permission.
 * When the user lacks read access, they are redirected to the About page
 * which remains accessible outside this guard.
 *
 * The parent outlet context (e.g. `activeTabIndex`, `totalTabs`) is forwarded
 * so that nested pages can consume it via `useOutletContext()`.
 *
 * Mirrors the MUI `SpaceProtectedRoutes` in `src/domain/space/routing/SpaceRoutes.tsx`.
 */
const CrdSpaceProtectedRoutes = () => {
  const { loading: resolvingUrl } = useUrlResolver();
  const { permissions, loading: loadingSpace } = useSpace();
  const parentContext = useOutletContext();

  if (resolvingUrl || loadingSpace) {
    return <LoadingSpinner />;
  }

  if (!permissions.canRead) {
    return <Navigate to={`../${EntityPageSection.About}`} replace={true} />;
  }

  return <Outlet context={parentContext} />;
};

export default CrdSpaceProtectedRoutes;

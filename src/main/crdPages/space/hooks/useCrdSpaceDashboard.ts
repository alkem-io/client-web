import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

type UseCrdSpaceDashboardParams = {
  /** Reads nothing — the sidebar connector passes this when the `subspaceLinks` widget is not configured on the
   *  active tab (FR-019). */
  skip?: boolean;
};

/** The sidebar's subspace navigation (its only consumer); the tab feed is the page's own D2 need. */
export function useCrdSpaceDashboard({ skip }: UseCrdSpaceDashboardParams = {}) {
  const { spaceId } = useUrlResolver();
  const { dashboardNavigation, loading, unavailable } = useSpaceDashboardNavigation({ spaceId, skip });
  return { dashboardNavigation, navigationLoading: loading, navigationUnavailable: unavailable };
}

import { DashboardNavigationItem } from './useSpaceDashboardNavigation';

const findCurrentPath = (
  dashboardNavigation: DashboardNavigationItem[] | undefined,
  currentItemId: string | undefined,
  path: string[] = []
) => {
  if (!currentItemId || !dashboardNavigation) {
    return [];
  }
  if (dashboardNavigation.some(item => item.id === currentItemId)) {
    return [...path, currentItemId];
  } else {
    for (const item of dashboardNavigation) {
      if (!item.children) {
        continue;
      }
      const found = findCurrentPath(item.children, currentItemId, [...path, item.id]);
      if (found.length) {
        return found;
      }
    }
    return [];
  }
};

export default findCurrentPath;

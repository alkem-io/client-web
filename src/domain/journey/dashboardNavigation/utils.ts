import { DashboardNavigationItem } from '../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { gutters } from '../../../core/ui/grid/utils';

export const findCurrentPath = (
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

export const getIndentStyle = (level: number, compact: boolean = false) => {
  return {
    paddingLeft: gutters(compact ? 0.5 : 1 + level * 2),
  };
};

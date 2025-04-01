import { DashboardNavigationItem } from '../useSpaceDashboardNavigation';
import { gutters } from '@/core/ui/grid/utils';

export const findCurrentPath = (
  dashboardNavigation: DashboardNavigationItem | undefined,
  currentItemId: string | undefined,
  path: string[] = []
) => {
  if (!dashboardNavigation) {
    return [];
  }
  if (dashboardNavigation.id === currentItemId) {
    return [...path, currentItemId];
  }
  for (const item of dashboardNavigation.children ?? []) {
    const found = findCurrentPath(item, currentItemId, [...path, dashboardNavigation.id]);
    if (found.length) {
      return found;
    }
  }
  return [];
};

export const getIndentStyle = (level: number, compact: boolean = false) => {
  return {
    paddingLeft: gutters(compact ? 0.5 : 1 + (level - 1) * 2),
  };
};

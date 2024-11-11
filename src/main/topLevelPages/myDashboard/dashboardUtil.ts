const DASHBOARD_VIEW_KEY = 'dashboardView';

export const setViewToCache = (view: string) => {
  localStorage.setItem(DASHBOARD_VIEW_KEY, view);
};

export const getCachedView = () => {
  return localStorage.getItem(DASHBOARD_VIEW_KEY);
};

export const removeCachedView = () => {
  localStorage.removeItem(DASHBOARD_VIEW_KEY);
};

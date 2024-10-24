import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getCachedView, setViewToCache } from './dashboardUtil';

const dashboardViews = {
  ACTIVITY: 'ACTIVITY',
  SPACES: 'SPACES',
} as const;

interface DashboardContextProps {
  activityEnabled: boolean;
  setActivityEnabled: (item: boolean) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const cachedView = getCachedView();
  const isActivityEnabled = cachedView === dashboardViews.ACTIVITY;
  const [activityEnabled, setEnabled] = useState<boolean>(isActivityEnabled);

  const setActivityEnabled = (val: boolean) => {
    setViewToCache(val ? dashboardViews.ACTIVITY : dashboardViews.SPACES);
    setEnabled(val);
  };

  return (
    <DashboardContext.Provider value={{ activityEnabled, setActivityEnabled }}>{children}</DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }

  return context;
};

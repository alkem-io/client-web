import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getCachedView, setViewToCache } from './dashboardUtil';

const dashBoardViews = {
  ACTIVITY: 'ACTIVITY',
  SPACES: 'SPACES',
} as const;

interface DashboardContextProps {
  activityEnebled: boolean;
  setActivityEnebled: (item: boolean) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const cachedView = getCachedView();
  const isActivityEnebled = cachedView === dashBoardViews.ACTIVITY;
  const [activityEnebled, setEnebled] = useState<boolean>(isActivityEnebled);

  const setActivityEnebled = (val: boolean) => {
    setViewToCache(val ? dashBoardViews.ACTIVITY : dashBoardViews.SPACES);
    setEnebled(val);
  };

  return (
    <DashboardContext.Provider value={{ activityEnebled, setActivityEnebled }}>{children}</DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }

  return context;
};

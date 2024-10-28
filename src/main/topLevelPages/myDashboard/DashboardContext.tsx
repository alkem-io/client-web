import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getCachedView, setViewToCache } from './dashboardUtil';
import { DashboardDialog } from './DashboardDialogs/DashboardDialogsProps';

const enum DashboardViews {
  ACTIVITY = 'ACTIVITY',
  SPACES = 'SPACES',
}

interface DashboardContextProps {
  activityEnabled: boolean;
  setActivityEnabled: (item: boolean) => void;
  openedDialog: DashboardDialog | undefined;
  setOpenedDialog: (item: DashboardDialog | undefined) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const cachedView = getCachedView();
  const isActivityEnabled = cachedView === DashboardViews.ACTIVITY;
  const [activityEnabled, setEnabled] = useState<boolean>(isActivityEnabled);
  const [openedDialog, setOpenedDialog] = useState<DashboardDialog | undefined>(undefined);

  const setActivityEnabled = (val: boolean) => {
    setViewToCache(val ? DashboardViews.ACTIVITY : DashboardViews.SPACES);
    setEnabled(val);
  };

  return (
    <DashboardContext.Provider value={{ activityEnabled, setActivityEnabled, openedDialog, setOpenedDialog }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }

  return context;
};

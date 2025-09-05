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
  isOpen: DashboardDialog | undefined;
  setIsOpen: (item: DashboardDialog | undefined) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const cachedView = getCachedView();
  const isActivityEnabled = cachedView === DashboardViews.ACTIVITY;
  const [activityEnabled, setEnabled] = useState<boolean>(isActivityEnabled);
  const [isOpen, setIsOpen] = useState<DashboardDialog>();

  const setActivityEnabled = (val: boolean) => {
    setViewToCache(val ? DashboardViews.ACTIVITY : DashboardViews.SPACES);
    setEnabled(val);
  };

  return (
    <DashboardContext value={{ activityEnabled, setActivityEnabled, isOpen, setIsOpen }}>{children}</DashboardContext>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }

  return context;
};

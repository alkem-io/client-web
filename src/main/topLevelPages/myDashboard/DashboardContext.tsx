import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DashboardContextProps {
  activityEnebled: boolean;
  setActivityEnebled: (item: boolean) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activityEnebled, setActivityEnebled] = useState<boolean>(false);

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

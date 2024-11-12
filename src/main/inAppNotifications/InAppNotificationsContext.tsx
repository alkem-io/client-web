import { createContext, useState, useContext, ReactNode } from 'react';

interface InAppNotificationsContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const InAppNotifications = createContext<InAppNotificationsContextProps | undefined>(undefined);

export const InAppNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return <InAppNotifications.Provider value={{ isOpen, setIsOpen }}>{children}</InAppNotifications.Provider>;
};

export const useInAppNotificationsContext = () => {
  const context = useContext(InAppNotifications);

  if (!context) {
    throw new Error('useInAppNotificationsContext must be used within a InAppNotificationsProvider');
  }

  return context;
};

import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user';
import { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface InAppNotificationsContextProps {
  isEnabled: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const InAppNotifications = createContext<InAppNotificationsContextProps | undefined>(undefined);

export const InAppNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user, platformRoles } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);

  const isEnabled = useMemo(() => {
    return Boolean(user?.user.id && platformRoles?.includes(RoleName.PlatformBetaTester));
  }, [user, platformRoles]);

  return <InAppNotifications.Provider value={{ isEnabled, isOpen, setIsOpen }}>{children}</InAppNotifications.Provider>;
};

export const useInAppNotificationsContext = () => {
  const context = useContext(InAppNotifications);

  if (!context) {
    throw new Error('useInAppNotificationsContext must be used within a InAppNotificationsProvider');
  }

  return context;
};

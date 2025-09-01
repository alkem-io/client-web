import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface InAppNotificationsContextProps {
  isEnabled: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const defaultState: InAppNotificationsContextProps = {
  isEnabled: false,
  isOpen: false,
  setIsOpen: () => {},
};

const InAppNotifications = createContext<InAppNotificationsContextProps>(defaultState);

export const InAppNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { userModel, platformRoles } = useCurrentUserContext();
  const [isOpen, setIsOpen] = useState(false);

  const isEnabled = useMemo(() => {
    return Boolean(userModel?.id && platformRoles?.includes(RoleName.PlatformBetaTester));
  }, [userModel, platformRoles]);

  return <InAppNotifications value={{ isEnabled, isOpen, setIsOpen }}>{children}</InAppNotifications>;
};

export const useInAppNotificationsContext = () => {
  const context = useContext(InAppNotifications);

  if (!context) {
    throw new Error('useInAppNotificationsContext must be used within a InAppNotificationsProvider');
  }

  return context;
};

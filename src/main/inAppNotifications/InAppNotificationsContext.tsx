import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { NotificationFilterType } from './notificationFilters';

const NOTIFICATION_FILTER_STORAGE_KEY = 'alkemio.notifications.filter';

interface InAppNotificationsContextProps {
  isEnabled: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedFilter: NotificationFilterType;
  setSelectedFilter: (filter: NotificationFilterType) => void;
}

const defaultState: InAppNotificationsContextProps = {
  isEnabled: false,
  isOpen: false,
  setIsOpen: () => {},
  selectedFilter: NotificationFilterType.All,
  setSelectedFilter: () => {},
};

const InAppNotifications = createContext<InAppNotificationsContextProps>(defaultState);

export const InAppNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { userModel, platformRoles } = useCurrentUserContext();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize filter from localStorage or default to All
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilterType>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_FILTER_STORAGE_KEY);
      if (stored && Object.values(NotificationFilterType).includes(stored as NotificationFilterType)) {
        return stored as NotificationFilterType;
      }
    } catch (error) {
      console.error('Failed to read notification filter from localStorage:', error);
    }
    return NotificationFilterType.All;
  });

  // Persist filter changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATION_FILTER_STORAGE_KEY, selectedFilter);
    } catch (error) {
      console.error('Failed to save notification filter to localStorage:', error);
    }
  }, [selectedFilter]);

  // let's keep that logic in case we want to enable/disable the feature in the future
  const isEnabled = useMemo(() => {
    return Boolean(userModel?.id);
  }, [userModel, platformRoles]);

  return (
    <InAppNotifications value={{ isEnabled, isOpen, setIsOpen, selectedFilter, setSelectedFilter }}>
      {children}
    </InAppNotifications>
  );
};

export const useInAppNotificationsContext = () => {
  const context = useContext(InAppNotifications);

  if (!context) {
    throw new Error('useInAppNotificationsContext must be used within a InAppNotificationsProvider');
  }

  return context;
};

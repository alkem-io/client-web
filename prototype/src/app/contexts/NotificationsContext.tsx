import React, { createContext, useContext, useState, useCallback } from "react";

interface NotificationsContextValue {
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  isOpen: false,
  openNotifications: () => {},
  closeNotifications: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openNotifications = useCallback(() => setIsOpen(true), []);
  const closeNotifications = useCallback(() => setIsOpen(false), []);

  return (
    <NotificationsContext.Provider value={{ isOpen, openNotifications, closeNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}

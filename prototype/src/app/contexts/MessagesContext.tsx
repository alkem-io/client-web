import React, { createContext, useContext, useState, useCallback } from "react";

interface MessagesContextValue {
  isOpen: boolean;
  openMessages: () => void;
  closeMessages: () => void;
}

const MessagesContext = createContext<MessagesContextValue>({
  isOpen: false,
  openMessages: () => {},
  closeMessages: () => {},
});

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMessages = useCallback(() => setIsOpen(true), []);
  const closeMessages = useCallback(() => setIsOpen(false), []);

  return (
    <MessagesContext.Provider value={{ isOpen, openMessages, closeMessages }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessagesContext);
}

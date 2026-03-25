import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface MessagingHubContextType {
  isHubOpen: boolean;
  /** The conversation ID to open when the hub opens (if any) */
  initialConversationId: string | null;
  openHub: (conversationId?: string) => void;
  closeHub: () => void;
  toggleHub: () => void;
  /** Clears the initial conversation ID after the hub has consumed it */
  clearInitialConversation: () => void;
}

const MessagingHubContext = createContext<MessagingHubContextType | undefined>(undefined);

export function MessagingHubProvider({ children }: { children: React.ReactNode }) {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [initialConversationId, setInitialConversationId] = useState<string | null>(null);

  const openHub = useCallback((conversationId?: string) => {
    if (conversationId) {
      setInitialConversationId(conversationId);
    }
    setIsHubOpen(true);
  }, []);

  const closeHub = useCallback(() => {
    setIsHubOpen(false);
    setInitialConversationId(null);
  }, []);

  const toggleHub = useCallback(() => {
    setIsHubOpen((prev) => {
      if (prev) setInitialConversationId(null);
      return !prev;
    });
  }, []);

  const clearInitialConversation = useCallback(() => {
    setInitialConversationId(null);
  }, []);

  const value = useMemo(
    () => ({
      isHubOpen,
      initialConversationId,
      openHub,
      closeHub,
      toggleHub,
      clearInitialConversation,
    }),
    [isHubOpen, initialConversationId, openHub, closeHub, toggleHub, clearInitialConversation]
  );

  return (
    <MessagingHubContext.Provider value={value}>
      {children}
    </MessagingHubContext.Provider>
  );
}

export function useMessagingHub() {
  const context = useContext(MessagingHubContext);
  if (!context) {
    throw new Error("useMessagingHub must be used within a MessagingHubProvider");
  }
  return context;
}

import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { createContext, useState, useContext, ReactNode } from 'react';

interface UserMessagingContextProps {
  isEnabled: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
  newlyCreatedConversationId: string | null;
  setNewlyCreatedConversationId: (id: string | null) => void;
}

const defaultState: UserMessagingContextProps = {
  isEnabled: false,
  isOpen: false,
  setIsOpen: () => {},
  selectedConversationId: null,
  setSelectedConversationId: () => {},
  selectedRoomId: null,
  setSelectedRoomId: () => {},
  totalUnreadCount: 0,
  setTotalUnreadCount: () => {},
  newlyCreatedConversationId: null,
  setNewlyCreatedConversationId: () => {},
};

const UserMessagingContext = createContext<UserMessagingContextProps>(defaultState);

export const UserMessagingProvider = ({ children }: { children: ReactNode }) => {
  const { userModel } = useCurrentUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [newlyCreatedConversationId, setNewlyCreatedConversationId] = useState<string | null>(null);

  // Feature is enabled for all registered users
  const isEnabled = !!userModel?.id;

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedConversationId(null);
      setSelectedRoomId(null);
      setNewlyCreatedConversationId(null);
    }
  };

  return (
    <UserMessagingContext
      value={{
        isEnabled,
        isOpen,
        setIsOpen: handleSetIsOpen,
        selectedConversationId,
        setSelectedConversationId,
        selectedRoomId,
        setSelectedRoomId,
        totalUnreadCount,
        setTotalUnreadCount,
        newlyCreatedConversationId,
        setNewlyCreatedConversationId,
      }}
    >
      {children}
    </UserMessagingContext>
  );
};

export const useUserMessagingContext = () => {
  const context = useContext(UserMessagingContext);

  if (!context) {
    throw new Error('useUserMessagingContext must be used within a UserMessagingProvider');
  }

  return context;
};

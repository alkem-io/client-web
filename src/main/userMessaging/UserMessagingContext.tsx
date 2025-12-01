import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

interface UserMessagingContextProps {
  isEnabled: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
}

const defaultState: UserMessagingContextProps = {
  isEnabled: false,
  isOpen: false,
  setIsOpen: () => {},
  selectedConversationId: null,
  setSelectedConversationId: () => {},
};

const UserMessagingContext = createContext<UserMessagingContextProps>(defaultState);

export const UserMessagingProvider = ({ children }: { children: ReactNode }) => {
  const { userModel, platformRoles } = useCurrentUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Feature is enabled only for BETA_TESTER role
  const isEnabled = useMemo(() => {
    if (!userModel?.id) {
      return false;
    }
    return platformRoles.includes(RoleName.PlatformBetaTester);
  }, [userModel, platformRoles]);

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedConversationId(null);
    }
  };

  return (
    <UserMessagingContext
      value={{ isEnabled, isOpen, setIsOpen: handleSetIsOpen, selectedConversationId, setSelectedConversationId }}
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

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ChatBehaviorState {
  showChat: boolean;
  disabledInput: boolean;
  messageLoader: boolean;
}

interface ChatBehaviorContextProps {
  state: ChatBehaviorState;
  toggleChat: () => void;
  toggleInputDisabled: () => void;
  toggleMessageLoader: () => void;
  setShowChat: (show: boolean) => void;
  setDisabledInput: (disabled: boolean) => void;
  setMessageLoader: (loading: boolean) => void;
}

const initialState: ChatBehaviorState = {
  showChat: false,
  disabledInput: false,
  messageLoader: false,
};

const ChatBehaviorContext = createContext<ChatBehaviorContextProps | undefined>(undefined);

export const ChatBehaviorProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ChatBehaviorState>(initialState);

  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, showChat: !prev.showChat }));
  }, []);

  const toggleInputDisabled = useCallback(() => {
    setState(prev => ({ ...prev, disabledInput: !prev.disabledInput }));
  }, []);

  const toggleMessageLoader = useCallback(() => {
    setState(prev => ({ ...prev, messageLoader: !prev.messageLoader }));
  }, []);

  const setShowChat = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showChat: show }));
  }, []);

  const setDisabledInput = useCallback((disabled: boolean) => {
    setState(prev => ({ ...prev, disabledInput: disabled }));
  }, []);

  const setMessageLoader = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, messageLoader: loading }));
  }, []);

  return (
    <ChatBehaviorContext.Provider
      value={{
        state,
        toggleChat,
        toggleInputDisabled,
        toggleMessageLoader,
        setShowChat,
        setDisabledInput,
        setMessageLoader,
      }}
    >
      {children}
    </ChatBehaviorContext.Provider>
  );
};

export const useChatBehavior = () => {
  const context = useContext(ChatBehaviorContext);
  if (!context) {
    throw new Error('useChatBehavior must be used within a ChatBehaviorProvider');
  }
  return context;
};

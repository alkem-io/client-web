import { createContext, useContext, useState, ReactNode, ElementType } from 'react';
import { MessageTypes, Link, CustomCompMessage } from './types';

export interface MessagesState {
  messages: (MessageTypes | Link | CustomCompMessage)[];
  badgeCount: number;
}

interface MessagesContextProps {
  state: MessagesState;
  addUserMessage: (text: string, id?: string) => void;
  addResponseMessage: (text: string, id?: string) => void;
  addLinkSnippet: (link: { link: string; title: string; target?: string }, id?: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addComponentMessage: (component: ElementType, props: any, showAvatar: boolean, id?: string) => void;
  dropMessages: () => void;
  hideAvatar: (index: number) => void;
  deleteMessages: (count: number, id?: string) => void;
  markAllMessagesRead: () => void;
  setBadgeCount: (count: number) => void;
}

const initialState: MessagesState = {
  messages: [],
  badgeCount: 0,
};

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined);

const createNewMessage = (text: string, sender: 'client' | 'response', id?: string): MessageTypes => ({
  type: 'text',
  component: () => null,
  sender,
  showAvatar: sender !== 'client',
  timestamp: new Date(),
  unread: sender !== 'client',
  text,
  customId: id,
});

const createLinkSnippet = (link: { link: string; title: string; target?: string }, id?: string): Link => ({
  type: 'link',
  component: () => null,
  sender: 'response',
  showAvatar: true,
  timestamp: new Date(),
  unread: true,
  title: link.title,
  link: link.link,
  target: link.target || '_blank',
  customId: id,
});

const createComponentMessage = (
  component: ElementType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  showAvatar: boolean,
  id?: string
): CustomCompMessage => ({
  type: 'component',
  component,
  sender: 'response',
  showAvatar,
  timestamp: new Date(),
  unread: true,
  props,
  customId: id,
});

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MessagesState>(initialState);

  const addUserMessage = (text: string, id?: string) => {
    const newMessage = createNewMessage(text, 'client', id);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const addResponseMessage = (text: string, id?: string) => {
    const newMessage = createNewMessage(text, 'response', id);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      badgeCount: prev.badgeCount + 1,
    }));
  };

  const addLinkSnippet = (link: { link: string; title: string; target?: string }, id?: string) => {
    const newMessage = createLinkSnippet(link, id);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addComponentMessage = (component: ElementType, props: any, showAvatar: boolean, id?: string) => {
    const newMessage = createComponentMessage(component, props, showAvatar, id);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const dropMessages = () => {
    setState(prev => ({ ...prev, messages: [] }));
  };

  const hideAvatar = (index: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => (i === index ? { ...msg, showAvatar: false } : msg)),
    }));
  };

  const deleteMessages = (count: number, id?: string) => {
    setState(prev => {
      if (id) {
        const targetIndex = prev.messages.findIndex(msg => msg.customId === id);
        const newMessages = prev.messages.filter((_, index) => index < targetIndex - count + 1 || index > targetIndex);
        return { ...prev, messages: newMessages };
      } else {
        return {
          ...prev,
          messages: prev.messages.slice(0, prev.messages.length - count),
        };
      }
    });
  };

  const markAllMessagesRead = () => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => ({ ...msg, unread: false })),
      badgeCount: 0,
    }));
  };

  const setBadgeCount = (count: number) => {
    setState(prev => ({ ...prev, badgeCount: count }));
  };

  return (
    <MessagesContext
      value={{
        state,
        addUserMessage,
        addResponseMessage,
        addLinkSnippet,
        addComponentMessage,
        dropMessages,
        hideAvatar,
        deleteMessages,
        markAllMessagesRead,
        setBadgeCount,
      }}
    >
      {children}
    </MessagesContext>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

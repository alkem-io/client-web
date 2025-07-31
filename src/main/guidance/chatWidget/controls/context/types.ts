import { ElementType } from 'react';

export type Nullable<T> = T | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

// Base message interface
export interface BaseMessage {
  type: string;
  component: ElementType;
  sender: 'client' | 'response';
  showAvatar: boolean;
  timestamp: Date;
  unread: boolean;
  customId?: string;
}

// Text message type
export interface MessageTypes extends BaseMessage {
  text: string;
}

// Link message type
export interface Link extends BaseMessage {
  title: string;
  link: string;
  target?: string;
}

// Custom component message type
export interface CustomCompMessage extends BaseMessage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
}

// Union type for all message types
export type Message = MessageTypes | Link | CustomCompMessage;

// Message sender constants
export const MESSAGE_SENDER = {
  CLIENT: 'client',
  RESPONSE: 'response',
} as const;

export type MessageSender = (typeof MESSAGE_SENDER)[keyof typeof MESSAGE_SENDER];

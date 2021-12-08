import { assign, createMachine } from 'xstate';
import { Message } from '../../../models/graphql-schema';

export const ADD_MESSAGE = 'ADD_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

export type CommunicationMessageContext = {
  messagesByRoom: Record<string, Message[]>;
};
export type CommunicationMessageEvent =
  | { type: typeof ADD_MESSAGE; payload: { message: Message; roomId: string } }
  | { type: typeof REMOVE_MESSAGE; payload: { roomId: string; messageId: Message['id'] } };
export type CommunicationMessageState =
  | { value: 'visible'; context: { messagesByRoom: {} } }
  | { value: 'hidden'; context: { messagesByRoom: {} } };

export const communicationMessageMachine = createMachine<CommunicationMessageContext, CommunicationMessageEvent>({
  id: 'communicationMessage',
  initial: 'active',
  context: {
    messagesByRoom: {},
  },
  states: {
    active: {
      on: {
        ADD_MESSAGE: {
          actions: assign({
            messagesByRoom: (context, { payload }) => ({
              ...context.messagesByRoom,
              [payload.roomId]: [payload.message, ...(context.messagesByRoom[payload.roomId] || [])],
            }),
          }),
        },
        REMOVE_MESSAGE: {
          actions: assign({
            messagesByRoom: (context, { payload }) => ({
              ...context.messagesByRoom,
              [payload.roomId]: (context.messagesByRoom[payload.roomId] || []).filter(m => m.id !== payload.messageId),
            }),
          }),
        },
      },
    },
  },
});

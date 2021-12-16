import { assign, createMachine } from 'xstate';
import { Message } from '../../../models/graphql-schema';

export const ADD_MESSAGE = 'ADD_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

// todo: change context to array of messages
export type CommunicationMessageContext = {
  messagesByUpdate: Record<string, Message[]>;
};
export type CommunicationMessageEvent =
  | { type: typeof ADD_MESSAGE; payload: { message: Message; updatesID: string } }
  | { type: typeof REMOVE_MESSAGE; payload: { updatesID: string; messageId: Message['id'] } };
export type CommunicationMessageState =
  | { value: 'visible'; context: { messagesByUpdate: {} } }
  | { value: 'hidden'; context: { messagesByUpdate: {} } };

export const communicationMessageMachine = createMachine<CommunicationMessageContext, CommunicationMessageEvent>({
  id: 'communicationMessage',
  initial: 'active',
  context: {
    messagesByUpdate: {},
  },
  states: {
    active: {
      on: {
        ADD_MESSAGE: {
          actions: assign({
            messagesByUpdate: (context, { payload }) => ({
              ...context.messagesByUpdate,
              [payload.updatesID]: [payload.message, ...(context.messagesByUpdate[payload.updatesID] || [])],
            }),
          }),
        },
        REMOVE_MESSAGE: {
          actions: assign({
            messagesByUpdate: (context, { payload }) => ({
              ...context.messagesByUpdate,
              [payload.updatesID]: (context.messagesByUpdate[payload.updatesID] || []).filter(
                m => m.id !== payload.messageId
              ),
            }),
          }),
        },
      },
    },
  },
});

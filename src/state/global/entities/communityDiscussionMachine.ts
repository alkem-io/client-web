import { assign, createMachine } from 'xstate';
import { Message } from '../../../models/graphql-schema';

export const ADD_COMMENT = 'ADD_COMMENT';
export const REMOVE_COMMENT = 'REMOVE_COMMENT';
export const ADD_DISCUSSION = 'ADD_DISCUSSION';
export const REMOVE_DISCUSSION = 'REMOVE_DISCUSSION';

export type CommunicationDiscussionContext = {
  commentsByDiscussion: Record<string, Message[]>;
};
export type CommunicationDiscussionEvent =
  | { type: typeof ADD_COMMENT; payload: { message: Message; discussionID: string } }
  | { type: typeof REMOVE_COMMENT; payload: { discussionID: string; messageId: Message['id'] } }
  | { type: typeof ADD_DISCUSSION; payload: { discussionID: string /* todo maybe the object */ } }
  | { type: typeof REMOVE_DISCUSSION; payload: { discussionID: string } };

export type CommunicationDiscussionState =
  | { value: 'visible'; context: { commentsByDiscussion: {} } }
  | { value: 'hidden'; context: { commentsByDiscussion: {} } };

export const communicationDiscussionMachine = createMachine<
  CommunicationDiscussionContext,
  CommunicationDiscussionEvent
>({
  id: 'communicationDiscussion',
  initial: 'active',
  context: {
    commentsByDiscussion: {},
  },
  states: {
    active: {
      on: {
        ADD_COMMENT: {
          actions: assign({
            commentsByDiscussion: (context, { payload }) => ({
              ...context.commentsByDiscussion,
              [payload.discussionID]: [payload.message, ...(context.commentsByDiscussion[payload.discussionID] || [])],
            }),
          }),
        },
        REMOVE_COMMENT: {
          actions: assign({
            commentsByDiscussion: (context, { payload }) => ({
              ...context.commentsByDiscussion,
              [payload.discussionID]: (context.commentsByDiscussion[payload.discussionID] || []).filter(
                m => m.id !== payload.messageId
              ),
            }),
          }),
        },
        ADD_DISCUSSION: {
          actions: assign({
            commentsByDiscussion: (context, { payload }) => ({
              ...context.commentsByDiscussion,
              [payload.discussionID]: [],
            }),
          }),
        },
        REMOVE_DISCUSSION: {
          actions: assign({
            commentsByDiscussion: (context, { payload }) => {
              delete context.commentsByDiscussion[payload.discussionID];
              return {
                ...context.commentsByDiscussion,
              };
            },
          }),
        },
      },
    },
  },
});

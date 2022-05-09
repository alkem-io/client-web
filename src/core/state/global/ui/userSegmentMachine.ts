import { createMachine } from 'xstate';

export const HIDE_USER_SEGMENT = 'HIDE_USER_SEGMENT';
export const SHOW_USER_SEGMENT = 'SHOW_USER_SEGMENT';

export type UserSegmentEvent = { type: typeof SHOW_USER_SEGMENT } | { type: typeof HIDE_USER_SEGMENT };
export interface UserSegmentContext {}
export type UserSegmentState = { value: 'visible'; context: {} } | { value: 'hidden'; context: {} };

export const userSegmentMachine = createMachine<UserSegmentContext, UserSegmentEvent, UserSegmentState>({
  key: 'userSegment',
  initial: 'visible',
  states: {
    visible: {
      on: {
        HIDE_USER_SEGMENT: {
          target: 'hidden',
        },
      },
    },
    hidden: {
      on: {
        SHOW_USER_SEGMENT: {
          target: 'visible',
        },
      },
    },
  },
});

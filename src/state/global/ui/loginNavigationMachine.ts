import { createMachine } from 'xstate';

export const HIDE_LOGIN_NAVIGATION = 'SHOW';
export const SHOW_LOGIN_NAVIGATION = 'HIDE';

export type LoginNavigationEvent = { type: typeof SHOW_LOGIN_NAVIGATION } | { type: typeof HIDE_LOGIN_NAVIGATION };
export interface LoginNavigationContext {}
export type LoginNavigationState = { value: 'visible'; context: {} } | { value: 'hidden'; context: {} };

export const loginNavigationMachine = createMachine<LoginNavigationContext, LoginNavigationEvent, LoginNavigationState>(
  {
    key: 'loginNavigation',
    initial: 'visible',
    states: {
      visible: {
        on: {
          HIDE: {
            target: 'hidden',
          },
        },
      },
      hidden: {
        on: {
          SHOW: {
            target: 'visible',
          },
        },
      },
    },
  }
);

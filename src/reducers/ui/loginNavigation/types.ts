export const HIDE_LOGIN_NAVIGATION = 'HIDE_LOGIN_NAVIGATION';
export const SHOW_LOGIN_NAVIGATION = 'SHOW_LOGIN_NAVIGATION';

export interface ShowLoginNavigationAction {
  type: typeof SHOW_LOGIN_NAVIGATION;
}
export interface HideLoginNavigationAction {
  type: typeof HIDE_LOGIN_NAVIGATION;
}

export interface LoginNavigationState {
  visible: boolean;
}

export type LoginNavigationActionTypes = ShowLoginNavigationAction | HideLoginNavigationAction;

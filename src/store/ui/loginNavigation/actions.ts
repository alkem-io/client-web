import { HIDE_LOGIN_NAVIGATION, LoginNavigationActionTypes, SHOW_LOGIN_NAVIGATION } from './types';

export function showLoginNavigation(): LoginNavigationActionTypes {
  return {
    type: SHOW_LOGIN_NAVIGATION,
  };
}

export function hideLoginNavigation(): LoginNavigationActionTypes {
  return {
    type: HIDE_LOGIN_NAVIGATION,
  };
}

import {
  HIDE_LOGIN_NAVIGATION,
  LoginNavigationActionTypes,
  LoginNavigationState,
  SHOW_LOGIN_NAVIGATION,
} from './types';

const initialState: LoginNavigationState = {
  visible: true,
};

export default function loginNavigationReducer(
  state = initialState,
  action: LoginNavigationActionTypes
): LoginNavigationState {
  switch (action.type) {
    case HIDE_LOGIN_NAVIGATION:
      return {
        ...state,
        visible: false,
      };

    case SHOW_LOGIN_NAVIGATION:
      return {
        ...state,
        visible: true,
      };

    default:
      return state;
  }
}

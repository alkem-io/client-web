import { AuthActionTypes, AuthState, UPDATE_ACCOUNT, UPDATE_ERROR, UPDATE_TOKEN } from './types';

const initialState: AuthState = {
  account: null,
  error: null,
  idToken: null,
  accessToken: null,
  isAuthenticated: false,
};

export default function authReducer(state = initialState, action: AuthActionTypes): AuthState {
  switch (action.type) {
    case UPDATE_ACCOUNT:
      return {
        ...state,
        account: action.payload,
        isAuthenticated: true,
      };
    case UPDATE_TOKEN:
      return {
        ...state,
        idToken: action.payload.idTokenClaims as Record<string, never>,
        accessToken: action.payload.accessToken,
      };
    case UPDATE_ERROR:
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

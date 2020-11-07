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
        isAuthenticated: action.payload !== null,
      };
    case UPDATE_TOKEN:
      // TODO [ATS]: For refactoring - Token storage and propagation
      console.debug('Token: ', action.payload ? action.payload.accessToken : null);
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload.accessToken);
        console.debug('Token ExpirationTime: ', new Date(action.payload.idTokenClaims['exp'] * 1000).toString());
        return {
          ...state,
          idToken: action.payload.idTokenClaims as Record<string, never>,
          accessToken: action.payload.accessToken,
        };
      } else {
        localStorage.removeItem('accessToken');
        return {
          ...state,
          idToken: null,
          accessToken: '',
        };
      }
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

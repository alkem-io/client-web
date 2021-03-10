import { AUTHENTICATED_KEY, STATUS_KEY, TOKEN_KEY } from '../../models/Constants';
import { AuthActionTypes, AuthState, UPDATE_ACCOUNT, UPDATE_ERROR, UPDATE_STATUS, UPDATE_TOKEN } from './types';

const initialState: AuthState = {
  account: null,
  error: null,
  idToken: null,
  accessToken: null,
  isAuthenticated: false,
  status: 'unauthenticated',
};

export default function authReducer(state = initialState, action: AuthActionTypes): AuthState {
  switch (action.type) {
    case UPDATE_ACCOUNT:
      localStorage.setItem(AUTHENTICATED_KEY, action.payload !== null ? 'true' : 'false');
      return {
        ...state,
        account: action.payload,
        isAuthenticated: action.payload !== null,
      };
    case UPDATE_TOKEN:
      if (action.payload) {
        console.debug('Token: ', action.payload);
        localStorage.setItem(TOKEN_KEY, action.payload);
        localStorage.setItem(AUTHENTICATED_KEY, 'true');
        return {
          ...state,
          accessToken: action.payload,
          isAuthenticated: true,
        };
      } else {
        localStorage.setItem(AUTHENTICATED_KEY, 'false');
        localStorage.removeItem(TOKEN_KEY);
        return {
          ...state,
          idToken: null,
          accessToken: '',
          isAuthenticated: false,
        };
      }
    case UPDATE_ERROR:
      localStorage.setItem(AUTHENTICATED_KEY, 'false');
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
      };
    case UPDATE_STATUS:
      localStorage.setItem(STATUS_KEY, action.payload);
      return {
        ...state,
        status: action.payload,
      };

    default:
      return state;
  }
}

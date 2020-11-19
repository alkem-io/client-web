import { TOKEN_STORAGE_KEY } from '../../hooks';
import { AuthActionTypes, AuthState, UPDATE_ACCOUNT, UPDATE_ERROR, UPDATE_STATUS, UPDATE_TOKEN } from './types';

const initialState: AuthState = {
  account: null,
  error: null,
  idToken: null,
  accessToken: null,
  isAuthenticated: false,
  status: undefined,
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
      if (action.payload) {
        console.debug('Token: ', action.payload.accessToken);
        console.debug('Token ExpirationTime: ', new Date(action.payload.idTokenClaims['exp'] * 1000).toString());
        localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.accessToken);
        return {
          ...state,
          idToken: action.payload.idTokenClaims as Record<string, never>,
          accessToken: action.payload.accessToken,
          isAuthenticated: true,
        };
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return {
          ...state,
          idToken: null,
          accessToken: '',
          isAuthenticated: false,
        };
      }
    case UPDATE_ERROR:
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
      };
    case UPDATE_STATUS:
      return {
        ...state,
        status: action.payload,
      };

    default:
      return state;
  }
}

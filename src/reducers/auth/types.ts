import { AccountInfo, AuthenticationResult, AuthError } from '@azure/msal-browser';

export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const UPDATE_ERROR = 'UPDATE_ERROR';
export const UPDATE_TOKEN = 'UPDATE_TOKEN';
export const UPDATE_STATUS = 'UPDATE_STATUS';

export type ErrorPayload = AuthError | Error | null;
export type AuthStatus =
  | 'unauthenticated'
  | 'authenticating'
  | 'refreshing'
  | 'done'
  | 'signingout'
  | 'refreshRequested';
export interface UpdateAccountAction {
  type: typeof UPDATE_ACCOUNT;
  payload: AccountInfo | null;
}

export interface UpdateErrorAction {
  type: typeof UPDATE_ERROR;
  payload: ErrorPayload;
}

export interface UpdateToken {
  type: typeof UPDATE_TOKEN;
  payload: AuthenticationResult | null | undefined;
}
export interface UpdateStatus {
  type: typeof UPDATE_STATUS;
  payload: AuthStatus;
}

export interface AuthState {
  account: AccountInfo | null;
  error: ErrorPayload;
  idToken: Record<string, never> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
}

export type AuthActionTypes = UpdateAccountAction | UpdateErrorAction | UpdateToken | UpdateStatus;

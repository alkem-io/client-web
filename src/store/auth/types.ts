export const UPDATE_STATUS = 'UPDATE_STATUS';

export type AuthStatus =
  | 'unauthenticated'
  | 'authenticating'
  | 'refreshing'
  | 'done'
  | 'signingout'
  | 'refreshRequested'
  | 'userRegistration';
export interface UpdateStatus {
  type: typeof UPDATE_STATUS;
  payload: AuthStatus;
}

export interface AuthState {
  status: AuthStatus;
}

export type AuthActionTypes = UpdateStatus;

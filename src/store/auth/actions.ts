import { AuthActionTypes, AuthStatus, UPDATE_STATUS } from './types';

export function updateStatus(status: AuthStatus): AuthActionTypes {
  return {
    type: UPDATE_STATUS,
    payload: status,
  };
}

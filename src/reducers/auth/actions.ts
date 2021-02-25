import { AccountInfo } from '@azure/msal-browser';
import {
  AuthActionTypes,
  AuthStatus,
  ErrorPayload,
  UPDATE_ACCOUNT,
  UPDATE_ERROR,
  UPDATE_STATUS,
  UPDATE_TOKEN,
} from './types';

export function updateAccount(account: AccountInfo | null): AuthActionTypes {
  return {
    type: UPDATE_ACCOUNT,
    payload: account,
  };
}

export function updateError(error: ErrorPayload): AuthActionTypes {
  return {
    type: UPDATE_ERROR,
    payload: error,
  };
}

export function updateToken(accessToken?: string): AuthActionTypes {
  return {
    type: UPDATE_TOKEN,
    payload: accessToken,
  };
}

export function updateStatus(status: AuthStatus): AuthActionTypes {
  return {
    type: UPDATE_STATUS,
    payload: status,
  };
}

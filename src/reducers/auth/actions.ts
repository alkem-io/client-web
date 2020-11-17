import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { AuthActionTypes, ErrorPayload, UPDATE_ACCOUNT, UPDATE_ERROR, UPDATE_TOKEN } from './types';

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

export function updateToken(authenticationResult: AuthenticationResult | undefined | null): AuthActionTypes {
  return {
    type: UPDATE_TOKEN,
    payload: authenticationResult,
  };
}

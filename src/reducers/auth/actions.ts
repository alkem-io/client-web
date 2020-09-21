import { AccountInfo, AuthenticationResult, AuthError } from '@azure/msal-browser';
import { AuthActionTypes, UPDATE_ACCOUNT, UPDATE_ERROR, UPDATE_TOKEN } from './types';

export function updateAccount(account: AccountInfo | null): AuthActionTypes {
  return {
    type: UPDATE_ACCOUNT,
    payload: account,
  };
}

export function updateError(error: AuthError): AuthActionTypes {
  return {
    type: UPDATE_ERROR,
    payload: error,
  };
}

export function updateToken(authenticationResult: AuthenticationResult): AuthActionTypes {
  return {
    type: UPDATE_TOKEN,
    payload: authenticationResult,
  };
}

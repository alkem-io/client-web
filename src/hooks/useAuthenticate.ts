import { AuthenticationResult } from '@azure/msal-browser';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../context/AuthenticationProvider';
import { pushError } from '../reducers/error/actions';
import { useAuthenticationContext } from './useAuthenticationContext';

export const TOKEN_STORAGE_KEY = 'accessToken';

const authenticate = async (context: AuthContext) => {
  return await new Promise<AuthenticationResult | undefined>((resolve, reject) =>
    context.signIn().then(resolve).catch(reject)
  ).then(result => {
    return refresh(context, result?.account.username);
  });
};

const refresh = async (context: AuthContext, userName?: string) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount && !userName) {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  const token = await context.acquireToken(userName || targetAccount.username);
  if (token) {
    console.debug(token.accessToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, token.accessToken);
  }

  return await context.resetCache();
};

const unauthenticate = async (context: AuthContext) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount) {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  await context.signOut(targetAccount.username);

  await refresh(context);
};

export const useAuthenticate = () => {
  const dispatch = useDispatch();
  const { context } = useAuthenticationContext();

  const authenticateWired = useCallback(() => {
    return authenticate(context);
  }, [context]);

  const refreshWired = useCallback(() => {
    return refresh(context);
  }, [context]);

  const unauthenticateWired = useCallback(() => {
    return unauthenticate(context);
  }, [context]);

  const safeAuthenticate = useCallback(() => {
    try {
      return authenticateWired();
    } catch (ex) {
      dispatch(pushError(new Error(ex)));
    }
  }, [authenticateWired, dispatch]);

  const safeRefresh = useCallback(() => {
    try {
      return refreshWired();
    } catch (ex) {
      dispatch(pushError(new Error(ex)));
    }
  }, [refreshWired, dispatch]);

  const safeUnauthenticate = useCallback(() => {
    try {
      return unauthenticateWired();
    } catch (ex) {
      dispatch(pushError(new Error(ex)));
    }
  }, [unauthenticateWired, dispatch]);

  return {
    authenticate: authenticateWired,
    safeAuthenticate,
    refresh: refreshWired,
    safeRefresh,
    unauthenticateWired,
    safeUnauthenticate,
  };
};

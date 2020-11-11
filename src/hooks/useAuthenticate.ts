import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../context/AuthenticationProvider';
import { pushError } from '../reducers/error/actions';
import { useAuthenticationContext } from './useAuthenticationContext';

export const TOKEN_STORAGE_KEY = 'accessToken';

const authenticate = async (context: AuthContext) => {
  await context.signIn();

  await refresh(context);
};

const refresh = async (context: AuthContext) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount) {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  const token = await context.acquireToken(targetAccount.username);
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token.accessToken);
  }

  await context.resetCache();
};

const unauthenticate = async (context: AuthContext) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount) {
    return;
  }

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

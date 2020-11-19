import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthContext } from '../context/AuthenticationProvider';
import { updateToken } from '../reducers/auth/actions';
import { AuthActionTypes } from '../reducers/auth/types';
import { pushError } from '../reducers/error/actions';
import { error as logError } from '../sentry/log';
import { useAuthenticationContext } from './useAuthenticationContext';

export const TOKEN_STORAGE_KEY = 'accessToken';

const authenticate = async (context: AuthContext, dispatch: Dispatch<AuthActionTypes>) => {
  let result = await context.signIn();

  if (result) {
    result = await refresh(context, dispatch);
  }

  return result;
};

const refresh = async (context: AuthContext, dispatch: Dispatch<AuthActionTypes>, userName?: string) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount && !userName) {
    dispatch(updateToken(null));
    return;
  }

  const token = await context.acquireToken(userName || targetAccount.username);
  if (token) {
    dispatch(updateToken(token));
  }

  await context.resetCache();

  return token;
};

const unauthenticate = async (context: AuthContext, dispatch: Dispatch<AuthActionTypes>) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount) {
    return;
  }

  dispatch(updateToken(null));
  await context.signOut(targetAccount.username);

  await context.resetCache();
};

export const useAuthenticate = () => {
  const dispatch = useDispatch();
  const { context } = useAuthenticationContext();

  const authenticateWired = useCallback(() => {
    return authenticate(context, dispatch);
  }, [context]);

  const refreshWired = useCallback(() => {
    return refresh(context, dispatch);
  }, [context]);

  const unauthenticateWired = useCallback(() => {
    return unauthenticate(context, dispatch);
  }, [context]);

  const safeAuthenticate = useCallback(() => {
    try {
      return authenticateWired();
    } catch (ex) {
      const error = new Error(ex);
      logError(error, scope => scope.setTag('authentication', 'signin'));
      dispatch(pushError(new Error(ex)));
    }
  }, [authenticateWired, dispatch]);

  const safeRefresh = useCallback(() => {
    return refreshWired().catch(err => {
      const error = new Error(err);
      logError(error, scope => scope.setTag('authentication', 'refresh-token'));
      dispatch(pushError(error));
    });
  }, [refreshWired, dispatch]);

  const safeUnauthenticate = useCallback(() => {
    try {
      return unauthenticateWired();
    } catch (ex) {
      const error = new Error(ex);
      logError(error, scope => scope.setTag('authentication', 'signout'));
      dispatch(pushError(error));
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

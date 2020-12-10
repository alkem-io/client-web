import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthContext } from '../context/AuthenticationProvider';
import { updateStatus, updateToken } from '../reducers/auth/actions';
import { AuthActionTypes } from '../reducers/auth/types';
import { pushError } from '../reducers/error/actions';
import { error as logError } from '../sentry/log';
import { useAuthenticationContext } from './useAuthenticationContext';

export const TOKEN_STORAGE_KEY = 'accessToken';

const authenticate = async (context: AuthContext, dispatch: Dispatch<AuthActionTypes>) => {
  localStorage.clear(); // remove info of prev user (users) in order to prevent confusion of MS service of which user to log in
  dispatch(updateStatus('authenticating'));

  const result = await context.signIn();

  if (result) {
    const username = result?.account.username;
    const tokenResult = await context.acquireToken(username);
    if (tokenResult) {
      dispatch(updateToken(tokenResult));
      // await context.graphqlClient?.resetStore();
      dispatch(updateStatus('done'));
    }
  } else {
    dispatch(updateToken(null));
    // await context.graphqlClient?.resetStore();
    dispatch(updateStatus('done'));
  }

  return result;
};

const refresh = async (
  context: AuthContext,
  dispatch: Dispatch<AuthActionTypes>,
  userName?: string,
  keepStorage?: boolean
) => {
  dispatch(updateStatus('refreshing'));
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!userName && !targetAccount) {
    dispatch(updateStatus('unauthenticated'));
    !keepStorage && (await context.graphqlClient?.resetStore());
    dispatch(updateToken(null));
    return;
  }

  const result = await context.acquireToken(userName || targetAccount.username);

  if (result) {
    dispatch(updateToken(result));
    !keepStorage && (await context.graphqlClient?.resetStore());
    dispatch(updateStatus('done'));
  }

  return result;
};

const unauthenticate = async (context: AuthContext, dispatch: Dispatch<AuthActionTypes>) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount) {
    return;
  }

  dispatch(updateStatus('signingout'));
  dispatch(updateToken(null));
  await context.signOut(targetAccount.username);

  await context.graphqlClient?.resetStore();
};

export const useAuthenticate = () => {
  const dispatch = useDispatch();
  const { context, status, isAuthenticated } = useAuthenticationContext();

  const authenticateWired = useCallback(() => {
    return authenticate(context, dispatch);
  }, [context]);

  const refreshWired = useCallback(
    (keepStorage: boolean = false) => {
      return refresh(context, dispatch, undefined, keepStorage);
    },
    [context]
  );

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

  const safeRefresh = useCallback(
    (keepStorage: boolean = false) => {
      return refreshWired(keepStorage)
        .then(data => {
          if (!data) {
            dispatch(updateStatus('unauthenticated'));
            return;
          }
          dispatch(updateToken(data));
          return data;
        })
        .catch(err => {
          const error = new Error(err);
          logError(error, scope => scope.setTag('authentication', 'refresh-token'));
          dispatch(pushError(error));
        });
    },
    [refreshWired, dispatch]
  );

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
    status,
    isAuthenticated,
  };
};

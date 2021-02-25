import { ApolloClient, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthContext } from '../context/AuthenticationProvider';
import { updateStatus, updateToken } from '../reducers/auth/actions';
import { AuthActionTypes } from '../reducers/auth/types';
import { pushError } from '../reducers/error/actions';
import { error as logError } from '../sentry/log';
import { useAuthenticationContext } from './useAuthenticationContext';

const resetStore = (client: ApolloClient<object>) => {
  return client.resetStore(); //;.catch(ex => {    throw ex;  });
};

const authenticate = async (
  context: AuthContext,
  dispatch: Dispatch<AuthActionTypes>,
  client: ApolloClient<object>
) => {
  dispatch(updateStatus('authenticating'));

  const result = await context.signIn();

  if (result && result.account) {
    const username = result.account.username;
    const tokenResult = await context.acquireToken(username);
    if (tokenResult) {
      dispatch(updateToken(tokenResult.accessToken));
      await resetStore(client);
      dispatch(updateStatus('done'));
    }
  } else {
    dispatch(updateToken());
    await resetStore(client);
    dispatch(updateStatus('done'));
  }

  return result;
};

const refresh = async (
  context: AuthContext,
  dispatch: Dispatch<AuthActionTypes>,
  client: ApolloClient<object>,
  userName?: string,
  keepStorage?: boolean
) => {
  dispatch(updateStatus('refreshing'));
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!userName && !targetAccount) {
    dispatch(updateStatus('unauthenticated'));
    !keepStorage && (await resetStore(client));
    dispatch(updateToken());
    return;
  }

  const result = await context.acquireToken(userName || targetAccount.username);

  if (result) {
    dispatch(updateToken(result.accessToken));
    !keepStorage && (await resetStore(client));
    dispatch(updateStatus('done'));
  }

  return result;
};

const unauthenticate = async (
  context: AuthContext,
  dispatch: Dispatch<AuthActionTypes>,
  client: ApolloClient<object>
) => {
  const accounts = context.getAccounts();
  const targetAccount = accounts[0];

  if (!targetAccount) {
    return;
  }

  dispatch(updateStatus('signingout'));
  dispatch(updateToken());
  await context.signOut(targetAccount.username);

  await resetStore(client);
};

export const useAuthenticate = () => {
  const client = useApolloClient();
  const dispatch = useDispatch();
  const { context, status, isAuthenticated } = useAuthenticationContext();

  const authenticateWired = useCallback(() => {
    return authenticate(context, dispatch, client);
  }, [context, client]);

  const refreshWired = useCallback(
    (keepStorage: boolean = false) => {
      return refresh(context, dispatch, client, undefined, keepStorage);
    },
    [context, client]
  );

  const unauthenticateWired = useCallback(() => {
    return unauthenticate(context, dispatch, client);
  }, [context, client]);

  const safeAuthenticate = useCallback(() => {
    return authenticateWired().catch(ex => {
      const error = new Error(ex);
      logError(error, scope => scope.setTag('authentication', 'signin'));
      dispatch(pushError(new Error(ex)));
    });
  }, [authenticateWired, dispatch]);

  const safeRefresh = useCallback(
    (keepStorage: boolean = false) => {
      return refreshWired(keepStorage)
        .then(data => {
          if (!data) {
            dispatch(updateStatus('unauthenticated'));
            return;
          }
          dispatch(updateToken(data.accessToken));
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

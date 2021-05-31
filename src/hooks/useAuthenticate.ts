import { ApolloClient, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { useAuthenticationContext } from './useAuthenticationContext';

const resetStore = (client: ApolloClient<object>) => {
  return client.resetStore(); //;.catch(ex => {    throw ex;  });
};

// const authenticate = async (
//   context: AuthContext,
//   dispatch: Dispatch<AuthActionTypes>,
//   client: ApolloClient<object>
// ) => {
//   dispatch(updateStatus('authenticating'));

//   localStorage.setItem(AUTH_PROVIDER_KEY, 'msal');
//   try {
//     const result = await context.signIn();

//     if (result && result.account) {
//       const username = result.account.username;
//       try {
//         const tokenResult = await context.acquireToken(username);

//         if (tokenResult) {
//           dispatch(updateToken(tokenResult.accessToken));
//           await resetStore(client);
//           dispatch(updateStatus('done'));
//         }
//       } catch (err) {
//         dispatch(updateToken());
//         dispatch(updateStatus('unauthenticated'));
//         if (err && err.errorCode && err.errorCode !== 'user_cancelled') {
//           throw err;
//         }
//       }
//     } else {
//       dispatch(updateToken());
//       await resetStore(client);
//       dispatch(updateStatus('done'));
//     }

//     return result;
//   } catch (err) {
//     dispatch(updateToken());
//     dispatch(updateStatus('unauthenticated'));
//     if (err && err.errorCode && err.errorCode !== 'user_cancelled') {
//       throw err;
//     }
//   }
// };

// const refresh = async (
//   context: AuthContext,
//   dispatch: Dispatch<AuthActionTypes>,
//   client: ApolloClient<object>,
//   userName?: string,
//   keepStorage?: boolean
// ) => {
//   if (localStorage.getItem(AUTH_PROVIDER_KEY) === PROVIDER_DEMO) {
//     dispatch(updateStatus('unauthenticated'));
//     !keepStorage && (await resetStore(client));
//     dispatch(updateToken());
//     return;
//   }
//   dispatch(updateStatus('refreshing'));
//   const accounts = context.getAccounts();
//   const targetAccount = accounts[0];

//   if (!userName && !targetAccount) {
//     dispatch(updateStatus('unauthenticated'));
//     !keepStorage && (await resetStore(client));
//     dispatch(updateToken());
//     return;
//   }

//   const result = await context.acquireToken(userName || targetAccount.username);

//   if (result) {
//     dispatch(updateToken(result.accessToken));
//     !keepStorage && (await resetStore(client));
//     dispatch(updateStatus('done'));
//   }

//   return result;
// };

// const unauthenticate = async (
//   context: AuthContext,
//   dispatch: Dispatch<AuthActionTypes>,
//   client: ApolloClient<object>
// ) => {
//   const provider = localStorage.getItem(AUTH_PROVIDER_KEY);

//   dispatch(updateStatus('signingout'));
//   dispatch(updateToken());

//   if (provider === PROVIDER_MSAL) {
//     const accounts = context.getAccounts();
//     const targetAccount = accounts[0];

//     if (!targetAccount) {
//       return;
//     }

//     await context.signOut(targetAccount.username);
//   }
//   dispatch(updateStatus('unauthenticated'));

//   await resetStore(client);
// };

export const useAuthenticate = () => {
  const client = useApolloClient();
  // const dispatch = useDispatch();
  const { status } = useAuthenticationContext();

  // const authenticateWired = useCallback(() => {
  //   return authenticate(context, dispatch, client);
  // }, [context, client]);

  // const refreshWired = useCallback(
  //   (keepStorage: boolean = false) => {
  //     return refresh(context, dispatch, client, undefined, keepStorage);
  //   },
  //   [context, client]
  // );

  // const unauthenticateWired = useCallback(() => {
  //   return unauthenticate(context, dispatch, client);
  // }, [context, client]);

  // const safeAuthenticate = useCallback(() => {
  //   return authenticateWired().catch(ex => {
  //     const error = new Error(ex);
  //     logError(error, scope => scope.setTag('authentication', 'signin'));
  //     dispatch(updateStatus('unauthenticated'));
  //     dispatch(pushError(new Error(ex)));
  //   });
  // }, [authenticateWired, dispatch]);

  // const safeRefresh = useCallback(
  //   (keepStorage: boolean = false) => {
  //     return refreshWired(keepStorage)
  //       .then(data => {
  //         if (!data) {
  //           dispatch(updateStatus('unauthenticated'));
  //           return;
  //         }
  //         dispatch(updateToken(data.accessToken));
  //         return data;
  //       })
  //       .catch(err => {
  //         const error = new Error(err);
  //         logError(error, scope => scope.setTag('authentication', 'refresh-token'));
  //         dispatch(pushError(error));
  //       });
  //   },
  //   [refreshWired, dispatch]
  // );

  // const safeUnauthenticate = useCallback(() => {
  //   return unauthenticateWired().catch(ex => {
  //     const error = new Error(ex);
  //     logError(error, scope => scope.setTag('authentication', 'signout'));
  //     dispatch(pushError(error));
  //   });
  // }, [unauthenticateWired, dispatch]);

  const resetStoreWired = useCallback(() => {
    return resetStore(client);
  }, [client]);

  return {
    // authenticate: authenticateWired,
    // safeAuthenticate,
    // refresh: refreshWired,
    // safeRefresh,
    // unauthenticateWired,
    // safeUnauthenticate,
    status,
    resetStore: resetStoreWired,
    // isAuthenticated,
  };
};

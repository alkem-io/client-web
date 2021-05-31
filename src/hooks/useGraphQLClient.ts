import { ApolloLink, from, InMemoryCache, NormalizedCacheObject, Operation } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { env } from '../env';
import { typePolicies } from '../graphql/typePolicies';
import { ErrorStatus } from '../models/Errors';
import { updateStatus } from '../reducers/auth/actions';

const enableQueryDebug = !!(env && env?.REACT_APP_DEBUG_QUERY === 'true');

export const useGraphQLClient = (graphQLEndpoint: string): ApolloClient<NormalizedCacheObject> => {
  const history = useHistory();
  const dispatch = useDispatch();
  // const { context } = useAuthenticationContext();

  // const pendingRequests = useRef<((token?: string) => void)[]>([]);
  // const isRefreshing = useRef(false);

  // const resolvePendingRequests = (token?: string) => {
  //   pendingRequests.current.map(resolve => resolve(token));
  //   pendingRequests.current = [];
  // };

  // const refresh = async () => {
  //   dispatch(updateStatus('refreshing'));
  //   return context
  //     .refreshToken()
  //     .then(result => {
  //       if (result) {
  //         dispatch(updateStatus('done'));
  //       } else {
  //         dispatch(updateStatus('unauthenticated'));
  //       }
  //       dispatch(updateToken(result?.accessToken));
  //       return result?.accessToken;
  //     })
  //     .catch(e => {
  //       console.error(e);
  //       dispatch(updateToken());
  //       dispatch(updateStatus('unauthenticated'));
  //       return undefined;
  //     });
  // };

  // const refreshToken = async () => {
  //   let forwardPromise: Promise<string | undefined>;
  //   if (isRefreshing.current) {
  //     forwardPromise = new Promise(resolve => {
  //       pendingRequests.current.push(token => resolve(token));
  //     });
  //   } else {
  //     isRefreshing.current = true;
  //     forwardPromise = refresh()
  //       .then(result => {
  //         resolvePendingRequests(result);
  //         return result;
  //       })
  //       .catch(() => {
  //         pendingRequests.current = [];
  //         return undefined;
  //       })
  //       .finally(() => {
  //         isRefreshing.current = false;
  //       });
  //   }

  //   return forwardPromise;
  // };

  const errorLink = onError(({ graphQLErrors, networkError, forward: _forward, operation: _operation }) => {
    let errors: Error[] = [];
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        switch (err?.extensions?.code) {
          case ErrorStatus.TOKEN_EXPIRED:
            // should not happen
            break;
          case ErrorStatus.USER_NOT_REGISTERED:
            dispatch(updateStatus('userRegistration'));
            history.push('/profile/create');
            break;
          default:
            const newMessage = `${err.message}`;
            errors.push(new Error(newMessage));
        }
      }
    }

    if (networkError) {
      // TODO [ATS] handle network errors better;
      const newMessage = `[Network error]: ${networkError}`;
      console.error(newMessage);
      errors.push(new Error(newMessage));
    }

    // errors.forEach(e => dispatch(pushNotification(e.message, Severity.Error)));
    errors.forEach(e => console.error(e));
  });

  // const authLink = setContext(async (_, { headers }) => {
  //   let internalToken = localStorage.getItem(TOKEN_KEY) || '';

  //   if (!internalToken) {
  //     return headers;
  //   }

  //   return {
  //     headers: {
  //       ...headers,
  //       authorization: internalToken ? `Bearer ${internalToken}` : '',
  //     },
  //   };
  // });

  const consoleLink = new ApolloLink((operation, forward) => {
    if (enableQueryDebug) {
      console.log(`starting request for ${operation.operationName}`);
    }
    return forward(operation).map(data => {
      if (enableQueryDebug) {
        console.log(`ending request for ${operation.operationName}`);
        if (enableQueryDebug && operation.operationName === 'userProfile') {
          console.log(data);
        }
      }
      return data;
    });
  });

  const httpLink = createUploadLink({
    uri: graphQLEndpoint,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const retryIf = (error: any, _operation: Operation) => {
    const doNotRetryCodes = [500, 400];
    return !!error && !doNotRetryCodes.includes(error.statusCode);
  };

  const retryLink = new RetryLink({
    delay: {
      initial: 1000,
      max: 5000,
      jitter: true,
    },
    attempts: {
      max: 25,
      retryIf,
    },
  });

  const omitTypename = (key: string, value: unknown) => {
    return key === '__typename' || key === '_id' || /^\$/.test(key) ? undefined : value;
  };

  /*
    Apollo automatically sends _typename in the query.  This causes
    a failure on the server-side because _typename is not specified
    in the schema. This middleware removes it.
  */
  const omitTypenameLink = new ApolloLink((operation, forward) => {
    // Do not clear __typename when there is a file fo upload,
    // Otherwise the JSON parse/stringify will remove the File variable
    if (operation.variables && !operation.variables.file) {
      operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename);
    }
    return forward ? forward(operation) : null;
  });

  return useMemo(() => {
    console.log('Create apollo client!');
    return new ApolloClient({
      // link: from([authLink, errorLink, retryLink, omitTypenameLink, consoleLink, httpLink]),
      link: from([errorLink, retryLink, omitTypenameLink, consoleLink, httpLink]),
      cache: new InMemoryCache({ addTypename: true, typePolicies: typePolicies }),
    });
  }, [dispatch]);
};

export default useGraphQLClient;

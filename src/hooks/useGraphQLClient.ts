import {
  ApolloLink,
  createHttpLink,
  from,
  fromPromise,
  InMemoryCache,
  NormalizedCacheObject,
  Operation,
} from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { env } from '../env';
import { typePolicies } from '../graphql/cache/typePolicies';
import { updateStatus, updateToken } from '../reducers/auth/actions';
import { pushError } from '../reducers/error/actions';
import { useAuthenticationContext } from './useAuthenticationContext';
import { useTypedSelector } from './useTypedSelector';

const enableQueryDebug = !!(env && env?.REACT_APP_DEBUG_QUERY === 'true');

export const useGraphQLClient = (graphQLEndpoint: string): ApolloClient<NormalizedCacheObject> => {
  const dispatch = useDispatch();
  const { context, status } = useAuthenticationContext();
  const reduxToken = useTypedSelector(x => x.auth.accessToken);
  const accessToken = useRef<string>();

  const pendingRequests = useRef<((token?: string) => void)[]>([]);
  const isRefreshing = useRef(false);
  const counter = useRef(0);
  const refreshCounter = useRef(0);

  const resolvePendingRequests = (token?: string) => {
    pendingRequests.current.map(resolve => resolve(token));
    pendingRequests.current = [];
  };

  const refresh = async () => {
    refreshCounter.current++;
    console.log('Refreshing');
    dispatch(updateStatus('refreshing'));
    return context
      .refreshToken()
      .then(result => {
        dispatch(updateToken(result));
        dispatch(updateStatus('done'));
        return result?.accessToken;
      })
      .catch(e => {
        console.error(e);
        dispatch(updateToken(null));
        dispatch(updateStatus('unauthenticated'));
        return undefined;
      });
  };

  const refreshToken = async () => {
    let forwardPromise: Promise<string | undefined>;
    if (isRefreshing.current) {
      console.log('Scheduling requests!');
      forwardPromise = new Promise(resolve => {
        pendingRequests.current.push(token => resolve(token));
      });
    } else {
      isRefreshing.current = true;
      forwardPromise = refresh()
        .then(result => {
          resolvePendingRequests(result);
          return result;
        })
        .catch(() => {
          debugger;
          pendingRequests.current = [];
          return undefined;
        })
        .finally(() => {
          isRefreshing.current = false;
        });
    }

    return forwardPromise;
  };

  const errorLink = onError(({ graphQLErrors, networkError, forward, operation }) => {
    let errors: Error[] = [];

    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        switch (err?.extensions?.code) {
          case 'UNAUTHENTICATED':
            if (status === 'done') {
              return fromPromise(refreshToken())
                .filter(value => Boolean(value))
                .flatMap(accessToken => {
                  if (accessToken)
                    operation.setContext((_, { headers }) => {
                      return {
                        headers: {
                          ...headers,
                          authorization: `Bearer ${accessToken}`,
                        },
                      };
                    });
                  return forward(operation);
                });
            }
            break;
          default:
            const newMessage = `${err.message}`;
            errors.push(new Error(newMessage));
        }
      }
    }

    if (errors.length > 0) {
      console.error(errors);
    }

    if (networkError) {
      // TODO [ATS] handle network errors better;
      const newMessage = `[Network error]: ${networkError}`;
      console.error(newMessage);
      errors.push(new Error(newMessage));
    }

    errors.forEach(e => dispatch(pushError(e)));
  });

  const authLink = setContext(async (_, { headers }) => {
    counter.current = counter.current + 1;
    let token = reduxToken;
    console.log(token);

    if (!accessToken.current) {
      if (status === 'unauthenticated') {
        const result = await refreshToken();
        if (result) {
          accessToken.current = result;
        }
      }
    }

    console.log('Request count:', counter.current);
    console.log('Refresh count:', refreshCounter.current);
    if (!accessToken.current) return headers;

    return {
      headers: {
        ...headers,
        authorization: accessToken.current ? `Bearer ${accessToken.current}` : '',
      },
    };
  });

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

  const httpLink = createHttpLink({
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
      max: 60000,
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
    if (operation.variables) {
      operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename);
    }
    return forward ? forward(operation) : null;
  });

  return useMemo(() => {
    console.log('Create apolloClient');
    return new ApolloClient({
      link: from([authLink, errorLink, retryLink, omitTypenameLink, consoleLink, httpLink]),
      cache: new InMemoryCache({ addTypename: true, typePolicies: typePolicies }),
    });
  }, []);
};

export default useGraphQLClient;

import { useMemo, useRef } from 'react';
import { from, InMemoryCache, NormalizedCacheObject, ApolloClient } from '@apollo/client';
import { once } from 'lodash';
import { env } from '@/main/env';
import {
  omitTypenameLink,
  consoleLink,
  guestHeaderLink,
  retryLink,
  redirectLink,
  httpLink,
  useErrorHandlerLink,
  useErrorLoggerLink,
} from '../graphqlLinks';
import { typePolicies } from '../config/typePolicies';

const enableQueryDebug = !!(env && env?.VITE_APP_DEBUG_QUERY === 'true');
const enableErrorLogging = !!(env && env?.VITE_APP_LOG_ERRORS === 'true');

export const useGraphQLClient = (
  graphQLEndpoint: string,
  enableWebSockets: boolean
): ApolloClient<NormalizedCacheObject> => {
  // useMemo() is a performance optimization and is not really guaranteed to be run ONLY when deps change.
  // It's guaranteed to be re-run WHEN the deps change, but it can re-run at random time as well.
  // See https://reactjs.org/docs/hooks-reference.html#usememo
  // If that happens, we don't want to lose the cache.
  const cache = useRef(
    once(
      () =>
        new InMemoryCache({
          typePolicies,
          possibleTypes: {
            Contributor: ['User', 'Organization', 'VirtualContributor'],
          },
        })
    )
  ).current();

  const errorHandlerLink = useErrorHandlerLink();
  const errorLoggerLink = useErrorLoggerLink(enableErrorLogging);

  return useMemo(() => {
    return new ApolloClient({
      link: from([
        omitTypenameLink,
        consoleLink(enableQueryDebug),
        guestHeaderLink,
        errorLoggerLink,
        errorHandlerLink,
        retryLink,
        redirectLink,
        httpLink(graphQLEndpoint, enableWebSockets),
      ]),
      cache,
    });
  }, [enableWebSockets, graphQLEndpoint, errorHandlerLink, cache]);
};

import { useMemo, useRef } from 'react';
import { from, InMemoryCache, NormalizedCacheObject, ApolloClient } from '@apollo/client';
import { typePolicies } from '../../config/graphql/typePolicies';
import { env } from '../../types/env';
import { consoleLink, errorLink, httpLink, omitTypenameLink, retryLink, redirectLink } from '../../utils/graphql-links';
import { once } from 'lodash';

const enableQueryDebug = !!(env && env?.REACT_APP_DEBUG_QUERY === 'true');
const enableErrorLogging = !!(env && env?.REACT_APP_LOG_ERRORS === 'true');

export const useGraphQLClient = (
  graphQLEndpoint: string,
  enableWebSockets: boolean
): ApolloClient<NormalizedCacheObject> => {
  // useMemo() is a performance optimization and is not really guaranteed to be run ONLY when deps change.
  // It's guaranteed to be re-run WHEN the deps change, but it can re-run at random time as well.
  // See https://reactjs.org/docs/hooks-reference.html#usememo
  // If that happens, we don't want to lose the cache.
  const cache = useRef(once(() => new InMemoryCache({ addTypename: true, typePolicies }))).current();

  return useMemo(() => {
    return new ApolloClient({
      link: from([
        omitTypenameLink,
        consoleLink(enableQueryDebug),
        errorLink(enableErrorLogging),
        retryLink,
        redirectLink,
        httpLink(graphQLEndpoint, enableWebSockets),
      ]),
      cache,
    });
  }, [enableWebSockets, graphQLEndpoint]);
};

import { useMemo } from 'react';
import { from, InMemoryCache, NormalizedCacheObject, ApolloClient } from '@apollo/client';
import { typePolicies } from '../../config/graphql/typePolicies';
import { env } from '../../types/env';
import { consoleLink, errorLink, httpLink, omitTypenameLink, retryLink } from '../../utils/graphql-links';

const enableQueryDebug = !!(env && env?.REACT_APP_DEBUG_QUERY === 'true');
const enableErrorLogging = !!(env && env?.REACT_APP_LOG_ERRORS === 'true');

export const useGraphQLClient = (
  graphQLEndpoint: string,
  enableWebSockets: boolean
): ApolloClient<NormalizedCacheObject> => {
  return useMemo(() => {
    return new ApolloClient({
      link: from([
        omitTypenameLink,
        consoleLink(enableQueryDebug),
        errorLink(enableErrorLogging),
        retryLink,
        httpLink(graphQLEndpoint, enableWebSockets),
      ]),
      cache: new InMemoryCache({ addTypename: true, typePolicies }),
    });
  }, [enableWebSockets, graphQLEndpoint]);
};

import { ApolloLink, from, InMemoryCache, NormalizedCacheObject, Operation, split } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { useMemo } from 'react';
import { typePolicies } from '../../config/graphql/typePolicies';
import { ErrorStatus } from '../../models/constants/erros.constants';
import { logger } from '../../services/logging/winston/logger';
import { env } from '../../types/env';
import { getMainDefinition } from '@apollo/client/utilities';

const enableQueryDebug = !!(env && env?.REACT_APP_DEBUG_QUERY === 'true');
const enableErrorLogging = !!(env && env?.REACT_APP_LOG_ERRORS === 'true');

export const useGraphQLClient = (
  graphQLEndpoint: string,
  enableWebSockets: boolean
): ApolloClient<NormalizedCacheObject> => {
  const errorLink = onError(({ graphQLErrors, networkError, forward: _forward, operation: _operation }) => {
    let errors: Error[] = [];
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        switch (err?.extensions?.code) {
          case ErrorStatus.TOKEN_EXPIRED:
            // should not happen
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
      errors.push(new Error(newMessage));
    }

    errors.forEach(e => enableErrorLogging && logger.error(e));
  });

  const consoleLink = new ApolloLink((operation, forward) => {
    if (enableQueryDebug) {
      logger.info(`starting request for ${operation.operationName}`);
    }
    return forward(operation).map(data => {
      if (enableQueryDebug) {
        logger.info(`ending request for ${operation.operationName}`);
      }
      return data;
    });
  });

  const terminationLink = (enableWebSockets: boolean) => {
    const httpLink = createUploadLink({
      uri: graphQLEndpoint,
      credentials: 'include',
    });
    if (enableWebSockets) {
      // if creating the web socket link fails fall back to http only
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // building the url plainly instead of using URL
        // URL forces the default protocol on the uri
        const wsUrl = `${wsProtocol}//${window.location.hostname}:${window.location.port}/graphql`;
        const wsLink = new WebSocketLink({
          uri: wsUrl,
          options: {
            reconnect: true,
            // we shouldn't switch to lazy in order to capture the error early on
            lazy: false,
            connectionCallback: errors => {
              if (errors) {
                logger.error('Unable to connect over WS', errors);
              }
            },
          },
        });
        return split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
          },
          wsLink,
          httpLink
        );
      } catch (error) {
        logger.error(error);
      }
    }
    return httpLink;
  };

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
    return new ApolloClient({
      link: from([consoleLink, omitTypenameLink, errorLink, retryLink, terminationLink(enableWebSockets)]),
      cache: new InMemoryCache({ addTypename: true, typePolicies }),
    });
  }, [enableWebSockets]);
};

export default useGraphQLClient;

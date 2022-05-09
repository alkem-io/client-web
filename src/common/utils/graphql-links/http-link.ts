import { createUploadLink } from 'apollo-upload-client';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

import { logger } from '../../../services/logging/winston/logger';

const WS_RETRY_ATTEMPTS = 10;

export const httpLink = (graphQLEndpoint: string, enableWebSockets: boolean) => {
  const uploadLink = createUploadLink({
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
      // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/client.ClientOptions.md
      const wsLink = new GraphQLWsLink(
        createClient({
          url: wsUrl,
          lazy: false,
          retryAttempts: WS_RETRY_ATTEMPTS,
          // https://www.apollographql.com/docs/react/data/subscriptions/#5-authenticate-over-websocket-optional
          // connectionParams: {},
          onNonLazyError: errorOrCloseEvent => {
            if (!errorOrCloseEvent) {
              return;
            }

            const message = isError(errorOrCloseEvent)
              ? 'Fatal ws lazy error'
              : 'ws lazy error: retry attempts have been exceeded or the specific close event is labeled as fatal';

            logger.error(message, errorOrCloseEvent);
          },
        })
      );
      return split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        uploadLink
      );
    } catch (error) {
      logger.error(error);
    }
  }
  return uploadLink;
};

const isError = (obj: unknown): obj is Error => !!(obj as Error)?.message;

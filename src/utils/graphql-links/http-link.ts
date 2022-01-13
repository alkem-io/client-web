import { createUploadLink } from 'apollo-upload-client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { logger } from '../../services/logging/winston/logger';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

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
        uploadLink
      );
    } catch (error) {
      logger.error(error);
    }
  }
  return uploadLink;
};

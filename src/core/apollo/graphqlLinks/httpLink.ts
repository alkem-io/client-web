import { split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { createClient } from 'graphql-ws';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { env } from '@/main/env';

const WS_RETRY_ATTEMPTS = 5;
const DOMAIN = env?.VITE_APP_ALKEMIO_DOMAIN ?? window.location.origin;

export const httpLink = (graphQLEndpoint: string, enableWebSockets: boolean) => {
  const uploadLink = createUploadLink({
    uri: graphQLEndpoint,
    credentials: 'include',
    headers: { 'apollo-require-preflight': 'true' },
  });
  if (enableWebSockets) {
    try {
      const wsUrl = DOMAIN.replace('http', 'ws').concat('/graphql');
      const wsLink = new GraphQLWsLink(
        createClient({
          url: wsUrl,
          lazy: true,
          retryAttempts: WS_RETRY_ATTEMPTS,
          on: {
            error: errorOrCloseEvent => {
              const message = isError(errorOrCloseEvent)
                ? 'Fatal ws error'
                : 'ws error: retry attempts have been exceeded or the specific close event is labeled as fatal';

              logWarn(message, {
                category: TagCategoryValues.WS,
                label: isError(errorOrCloseEvent) ? errorOrCloseEvent?.message : undefined,
              });
            },
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
      logWarn(error as Error, { category: TagCategoryValues.WS, label: 'Failed to create ws link' });
    }
  }
  return uploadLink;
};

const isError = (obj: unknown): obj is Error => !!(obj as Error)?.message;

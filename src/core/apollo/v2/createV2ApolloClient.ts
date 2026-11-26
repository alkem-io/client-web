import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client';
import fragmentMatcher from '@/core/apollo/generated-v2/possible-types';
import { retryLink } from '@/core/apollo/graphqlLinks/retryLink';
import { createRequestContextLink } from './requestContextLink';
import { v2TypePolicies } from './v2TypePolicies';

export const createV2Cache = () =>
  new InMemoryCache({ possibleTypes: fragmentMatcher.possibleTypes, typePolicies: v2TypePolicies });

// server-go has no Subscription type and no Upload scalar: a plain HttpLink, no ws or multipart link.
export const createV2ApolloClient = (uri: string, contextLink: ApolloLink) =>
  new ApolloClient({
    link: ApolloLink.from([contextLink, retryLink, new HttpLink({ uri, credentials: 'include' })]),
    cache: createV2Cache(),
  });

export const createV2ApolloLifetime = (uri: string) => {
  const listeners = new Set<() => void>();
  let owners = 0;
  const make = (revision: number, error?: Error) => {
    const scope = createRequestContextLink(error => replace(error));
    const client = createV2ApolloClient(
      uri,
      error ? new ApolloLink(() => new Observable(o => o.error(error))) : scope.link
    );
    return { client, scope, revision };
  };
  let snapshot = make(0);
  const retire = (previous: typeof snapshot) => {
    previous.scope.stop();
    previous.client.stop();
    return previous.client.clearStore().then(() => undefined);
  };
  const replace = (error?: Error): Promise<void> => {
    const previous = snapshot;
    snapshot = make(previous.revision + 1, error);
    listeners.forEach(notify => {
      notify();
    });
    return retire(previous);
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (notify: () => void) => {
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
      };
    },
    invalidate: () => replace(),
    retireForNavigation: () => retire(snapshot),
    retain: () => {
      owners++;
      return () => {
        owners--;
        queueMicrotask(() => {
          if (owners === 0) void retire(snapshot);
        });
      };
    },
  };
};

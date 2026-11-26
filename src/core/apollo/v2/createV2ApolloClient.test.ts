import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExplorerRootSpacesDocument, V2SavePersonalSettingsDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2ApolloLifetime } from './createV2ApolloClient';

const createV2ApolloClient = (uri: string) => createV2ApolloLifetime(uri).getSnapshot().client;

import { isSessionStoreUnavailable } from './isSessionStoreUnavailable';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('served explorer HttpLink transport', () => {
  it('retries a transient query failure through the existing bounded retry policy', async () => {
    vi.useFakeTimers();
    const spaces = {
      __typename: 'SpaceConnection',
      edges: [],
      pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
    };
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Connection interrupted'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { spaces },
            extensions: {
              requestContext: {
                requester: '00000000-0000-0000-0000-000000000008',
                effective: '00000000-0000-0000-0000-000000000008',
                anonymous: true,
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    vi.stubGlobal('fetch', fetch);
    const client = createV2ApolloClient('/api/private/graphql');
    const result = client.query({ query: ExplorerRootSpacesDocument, variables: { first: 100 } }).then(
      result => ({ result, error: undefined }),
      error => ({ result: undefined, error })
    );
    await vi.runAllTimersAsync();
    const outcome = await result;
    expect(outcome.error).toBeUndefined();
    expect(outcome.result?.data.spaces.edges).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
    const revisit = await client.query({ query: ExplorerRootSpacesDocument, variables: { first: 100 } });
    expect(revisit.data.spaces.edges).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
    client.stop();
  });

  it.each(['network', '503'])('stops after five physical query attempts and preserves the %s failure', async kind => {
    vi.useFakeTimers();
    const fetch = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => {
      if (kind === 'network') throw new Error('Network unavailable');
      return new Response(
        JSON.stringify({ errors: [{ message: 'Unavailable', extensions: { code: 'SESSION_STORE_UNAVAILABLE' } }] }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
    vi.stubGlobal('fetch', fetch);
    const client = createV2ApolloClient('/api/private/graphql');
    const result = client
      .query({ query: ExplorerRootSpacesDocument, variables: { first: 10 }, fetchPolicy: 'no-cache' })
      .then(
        () => ({ error: undefined }),
        error => ({ error })
      );
    await vi.runAllTimersAsync();
    const outcome = await result;
    expect(outcome.error).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(5);
    const options = fetch.mock.calls[0][1];
    expect(options?.credentials).toBe('include');
    const body = JSON.parse(String(options?.body));
    expect(body.operationName).toBe('ExplorerRootSpaces');
    expect(body.query).toMatch(/\babout\s*\{\s*displayName\s*tagline/);
    expect(body.query).not.toMatch(/\b(?:profile|description|location|avatar|sections)\b/);
    if (kind === '503') {
      expect(outcome.error.networkError.statusCode).toBe(503);
      expect(isSessionStoreUnavailable(outcome.error)).toBe(true);
    } else expect(outcome.error.message).toContain('Network unavailable');
    client.stop();
  });

  it.each([400, 401, 403, 500])('does not replay a terminal HTTP %s query response', async status => {
    vi.useFakeTimers();
    const fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ errors: [{ message: 'Rejected' }] }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    vi.stubGlobal('fetch', fetch);
    const client = createV2ApolloClient('/api/private/graphql');
    const result = client.query({ query: ExplorerRootSpacesDocument, variables: { first: 100 } }).catch(error => error);
    await vi.runAllTimersAsync();
    expect((await result).networkError.statusCode).toBe(status);
    expect(fetch).toHaveBeenCalledTimes(1);
    client.stop();
  });

  it('never replays a mutation after an unknown transport outcome', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () => {
      throw new Error('Response lost after commit');
    });
    vi.stubGlobal('fetch', fetch);
    const client = createV2ApolloClient('/api/private/graphql');
    const result = client
      .mutate({
        mutation: V2SavePersonalSettingsDocument,
        variables: { id: '00000000-0000-0000-0000-000000000001', value: { language: 'nl' } },
      })
      .catch(error => error);
    await vi.runAllTimersAsync();
    expect((await result).message).toContain('Response lost after commit');
    expect(fetch).toHaveBeenCalledTimes(1);
    client.stop();
  });

  it('cancels a pending retry when its query consumer leaves', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () => {
      throw new Error('Offline');
    });
    vi.stubGlobal('fetch', fetch);
    const client = createV2ApolloClient('/api/private/graphql');
    const subscription = client
      .watchQuery({
        query: ExplorerRootSpacesDocument,
        variables: { first: 100 },
      })
      .subscribe({ error: () => undefined });
    await vi.advanceTimersByTimeAsync(0);
    subscription.unsubscribe();
    await vi.runAllTimersAsync();
    expect(fetch).toHaveBeenCalledTimes(1);
    client.stop();
  });
});

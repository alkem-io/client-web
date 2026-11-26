import { gql } from '@apollo/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createV2ApolloLifetime } from './createV2ApolloClient';

const anonymous = {
  requester: '00000000-0000-0000-0000-000000000008',
  effective: '00000000-0000-0000-0000-000000000008',
  anonymous: true,
};
const guest = {
  requester: '10000000-0000-0000-0000-000000000001',
  effective: '10000000-0000-0000-0000-000000000001',
  anonymous: false,
};
const member = {
  requester: '20000000-0000-0000-0000-000000000001',
  effective: '20000000-0000-0000-0000-000000000001',
  anonymous: false,
};
const acting = { ...member, effective: '30000000-0000-0000-0000-000000000001' };
const face = gql`query Face { node(id: "actor") { id about { displayName } } }`;
const settings = gql`query Preferences { node(id: "actor") { id settings } }`;
const update = gql`mutation Update { updateActor(id: "actor") { id settings } }`;

const response = (
  context = member,
  data: object = { node: { __typename: 'User', id: 'actor', settings: { language: 'nl' } } }
) =>
  new Response(JSON.stringify({ data, extensions: { requestContext: context } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const harness = () => {
  const lifetime = createV2ApolloLifetime('/graphql');
  return { lifetime, ...lifetime.getSnapshot() };
};

afterEach(() => vi.unstubAllGlobals());

describe('admitted response context and Apollo lifetime', () => {
  it('reuses the real cache within one admitted context', async () => {
    const fetch = vi.fn(async () => response());
    vi.stubGlobal('fetch', fetch);
    const { client } = harness();
    await client.query({ query: settings });
    expect((await client.query({ query: settings })).data.node.settings.language).toBe('nl');
    expect(fetch).toHaveBeenCalledTimes(1);
    client.stop();
  });

  it.each([
    ['anonymous to guest', anonymous, guest],
    ['guest to member', guest, member],
    ['member to acting subject', member, acting],
    ['acting subject to member', acting, member],
    ['member to anonymous', member, anonymous],
  ])('retires all old fields for %s before the fresh client accepts a document', async (_name, previous, next) => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(previous))
      .mockImplementation(async () =>
        response(next, {
          node: { __typename: 'User', id: 'actor', about: { __typename: 'About', displayName: 'Visible face' } },
        })
      );
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings });
    const changed = await client.query({ query: face }).catch(error => error);
    expect(changed).toBeInstanceOf(Error);
    const fresh = lifetime.getSnapshot().client;
    expect(fresh).not.toBe(client);
    expect(fresh.cache.extract()).toEqual({});
    expect(client.cache.extract()).toEqual({});
    await fresh.query({ query: face });
    expect(fresh.cache.readQuery({ query: settings })).toBeNull();
    expect(JSON.stringify(fresh.cache.extract())).toContain('Visible face');
    fresh.stop();
  });

  it.each([
    'query',
    'mutation',
  ])('discards a late old %s and its callbacks after another identity is observed', async kind => {
    let finishOld!: (value: Response) => void;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response())
      .mockImplementationOnce(
        () =>
          new Promise<Response>(resolve => {
            finishOld = resolve;
          })
      )
      .mockResolvedValueOnce(response(guest));
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings });
    const callback = vi.fn();
    const old = (
      kind === 'query'
        ? client.query({ query: settings, fetchPolicy: 'network-only' })
        : client.mutate({ mutation: update })
    )
      .then(callback)
      .catch(error => error);
    await vi.waitFor(() => expect(finishOld).toBeDefined());
    await client.query({ query: face }).catch(() => undefined);
    finishOld(
      response(
        member,
        kind === 'query'
          ? {
              node: { __typename: 'User', id: 'actor', settings: { secret: 'old member' } },
            }
          : { updateActor: { __typename: 'User', id: 'actor', settings: { secret: 'old member' } } }
      )
    );
    expect(await old).toBeInstanceOf(Error);
    expect(callback).not.toHaveBeenCalled();
    expect(JSON.stringify(lifetime.getSnapshot().client.cache.extract())).not.toContain('old member');
    expect(client.cache.extract()).toEqual({});
    lifetime.getSnapshot().client.stop();
  });

  it('discards an obsolete 401 without invalidating the fresh lifetime', async () => {
    let finishOld!: (value: Response) => void;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response())
      .mockImplementationOnce(
        () =>
          new Promise<Response>(resolve => {
            finishOld = resolve;
          })
      )
      .mockResolvedValueOnce(response(guest));
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings });
    const old = client.query({ query: face }).catch(error => error);
    await vi.waitFor(() => expect(finishOld).toBeDefined());
    await client.query({ query: settings, fetchPolicy: 'network-only' }).catch(() => undefined);
    const fresh = lifetime.getSnapshot();
    finishOld(new Response(JSON.stringify({ errors: [{ message: 'Unauthenticated' }] }), { status: 401 }));
    await old;
    expect(lifetime.getSnapshot()).toBe(fresh);
    fresh.client.stop();
  });

  it('retires private data on 401 without retrying it as anonymous', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response())
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: 'Unauthenticated' }] }), { status: 401 })
      );
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings });
    await client.query({ query: face }).catch(() => undefined);
    const fresh = lifetime.getSnapshot().client;
    expect(fresh.cache.extract()).toEqual({});
    const error = await fresh.query({ query: face }).catch(error => error);
    expect(error.networkError.statusCode).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(2);
    fresh.stop();
  });

  it('preserves unavailable errors and the current identity rather than changing to anonymous', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response())
      .mockImplementation(async () => new Response('{}', { status: 503 }));
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings });
    const failed = client.query({ query: face }).catch(error => error);
    await vi.runAllTimersAsync();
    expect((await failed).networkError.statusCode).toBe(503);
    expect(lifetime.getSnapshot().client).toBe(client);
    expect(client.cache.readQuery({ query: settings })).not.toBeNull();
    client.stop();
    vi.useRealTimers();
  });

  it('refuses data without admitted context and retains that failure without a retry loop', async () => {
    const fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { node: { id: 'actor', settings: { secret: 'unbound' } } } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings }).catch(() => undefined);
    const fresh = lifetime.getSnapshot().client;
    const failed = await fresh.query({ query: settings }).catch(error => error);
    expect(failed.message).toContain('admitted authorization context');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fresh.cache.extract()).toEqual({});
    fresh.stop();
  });

  it('retires the lifetime on a same-identity local scope transition', async () => {
    const fetch = vi.fn(async () => response());
    vi.stubGlobal('fetch', fetch);
    const { client, lifetime } = harness();
    await client.query({ query: settings });
    await lifetime.invalidate();
    expect(client.cache.extract()).toEqual({});
    const fresh = lifetime.getSnapshot().client;
    await fresh.query({ query: settings });
    expect(fetch).toHaveBeenCalledTimes(2);
    fresh.stop();
  });
});

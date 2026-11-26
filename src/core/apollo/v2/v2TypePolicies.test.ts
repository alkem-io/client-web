import { ApolloClient, ApolloLink, gql, Observable } from '@apollo/client';
import { describe, expect, test } from 'vitest';
import { createV2Cache } from './createV2ApolloClient';

describe('v2TypePolicies', () => {
  test('keeps fields from separate Room capability selections', () => {
    const cache = createV2Cache();
    const room = { __typename: 'Room', id: 'comments-room', entityType: 'room' };
    cache.writeQuery({
      query: gql`query A { node(id: "comments-room") { id ... on Room { can { createMessage } } } }`,
      data: { node: { ...room, can: { __typename: 'RoomCan', createMessage: true } } },
    });
    cache.writeQuery({
      query: gql`query B { node(id: "comments-room") { id ... on Room { can { react } } } }`,
      data: { node: { ...room, can: { __typename: 'RoomCan', react: false } } },
    });
    expect(cache.extract()['Room:comments-room']?.can).toEqual({
      __typename: 'RoomCan',
      createMessage: true,
      react: false,
    });
  });

  test('keeps URL-specific route state separate while sharing the normalized Space', async () => {
    const query = gql`
      query CachedRoute($url: String!) {
        resolve(url: $url) {
          state matchedPrefix remainder
          node { id entityType ... on Space { about { displayName } } }
        }
      }
    `;
    const requests: string[] = [];
    const cache = createV2Cache();
    const client = new ApolloClient({
      cache,
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            requests.push(operation.variables.url);
            observer.next({
              data: {
                resolve: {
                  __typename: 'ResolveResult',
                  state: 'OK',
                  matchedPrefix: '/root',
                  remainder: operation.variables.url === '/root' ? [] : ['about'],
                  node: {
                    __typename: 'Space',
                    id: 'root',
                    entityType: 'space',
                    about: { __typename: 'About', displayName: 'Actual root' },
                  },
                },
              },
            });
            observer.complete();
          })
      ),
    });
    await client.query({ query, variables: { url: '/root' } });
    await client.query({ query, variables: { url: '/root/about' } });
    const original = await client.query({ query, variables: { url: '/root' } });
    expect(original.data.resolve.remainder).toEqual([]);
    expect(requests).toEqual(['/root', '/root/about']);
    expect(Object.keys(cache.extract()).filter(key => key.startsWith('Space:'))).toEqual(['Space:root']);
    client.stop();
  });

  test('two queries selecting different fields of one Space about keep both', () => {
    const cache = createV2Cache();
    const space = { __typename: 'Space', id: 'space-1' };
    cache.writeQuery({
      query: gql`query A { node(id: "space-1") { id ... on Space { about { displayName } } } }`,
      data: { node: { ...space, about: { __typename: 'About', displayName: 'Space One' } } },
    });
    cache.writeQuery({
      query: gql`query B { node(id: "space-1") { id ... on Space { about { tagline } } } }`,
      data: { node: { ...space, about: { __typename: 'About', tagline: 'Tagline' } } },
    });

    expect(cache.extract()['Space:space-1']?.about).toEqual({
      __typename: 'About',
      displayName: 'Space One',
      tagline: 'Tagline',
    });
  });

  test('spaces pages are kept per filter and page size, and appended per cursor', () => {
    const cache = createV2Cache();
    const query = gql`
      query Spaces($filter: SpaceFilter, $first: Int, $after: String) {
        spaces(filter: $filter, first: $first, after: $after) {
          edges { cursor node { id } }
          pageInfo { hasNextPage endCursor }
          totalCount
        }
      }
    `;
    const page = (ids: string[], hasNextPage: boolean) => ({
      spaces: {
        __typename: 'SpaceConnection',
        edges: ids.map(id => ({ __typename: 'SpaceEdge', cursor: `c-${id}`, node: { __typename: 'Space', id } })),
        pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: `c-${ids[ids.length - 1]}` },
        totalCount: null,
      },
    });
    const mine = { membership: true };
    cache.writeQuery({ query, variables: { filter: mine, first: 1 }, data: page(['a'], true) });
    cache.writeQuery({ query, variables: { filter: mine, first: 1, after: 'c-a' }, data: page(['b'], false) });
    cache.writeQuery({ query, variables: { filter: mine, first: 2 }, data: page(['x', 'y'], true) });
    cache.writeQuery({ query, variables: { filter: { kind: 'PACK' }, first: 1 }, data: page(['p'], false) });

    const read = (filter: object, first: number) =>
      cache.readQuery<ReturnType<typeof page>>({ query, variables: { filter, first } })?.spaces;
    expect(read(mine, 1)?.edges.map(edge => edge.node.id)).toEqual(['a', 'b']);
    expect(read(mine, 1)?.totalCount).toBeNull();
    expect(read(mine, 2)?.edges.map(edge => edge.node.id)).toEqual(['x', 'y']);
    expect(read({ kind: 'PACK' }, 1)?.edges.map(edge => edge.node.id)).toEqual(['p']);
  });

  test('space posts are kept per stage, order and page size, and appended per cursor (021 FR-018)', () => {
    const cache = createV2Cache();
    const query = gql`
      query Posts($space: UUID!, $stage: UUID, $order: PostOrder, $first: Int, $after: String) {
        spacePosts(space: $space, stage: $stage, order: $order, first: $first, after: $after) {
          edges { cursor node { id } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const page = (ids: string[], hasNextPage: boolean) => ({
      spacePosts: {
        __typename: 'PostConnection',
        edges: ids.map(id => ({ __typename: 'PostEdge', cursor: `c-${id}`, node: { __typename: 'Post', id } })),
        pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: `c-${ids[ids.length - 1]}` },
      },
    });
    const at = (stage: string, order = 'MANUAL', first = 1) => ({ space: 's', stage, order, first });
    cache.writeQuery({ query, variables: at('one'), data: page(['a'], true) });
    cache.writeQuery({ query, variables: { ...at('one'), after: 'c-a' }, data: page(['b'], false) });
    cache.writeQuery({ query, variables: at('two'), data: page(['x'], false) });
    cache.writeQuery({ query, variables: at('one', 'NEWEST'), data: page(['n'], false) });
    cache.writeQuery({ query, variables: at('one', 'MANUAL', 2), data: page(['p', 'q'], false) });

    const read = (variables: object) =>
      cache.readQuery<ReturnType<typeof page>>({ query, variables })?.spacePosts.edges.map(edge => edge.node.id);
    expect(read(at('one'))).toEqual(['a', 'b']);
    expect(read(at('two'))).toEqual(['x']);
    expect(read(at('one', 'NEWEST'))).toEqual(['n']);
    expect(read(at('one', 'MANUAL', 2))).toEqual(['p', 'q']);
  });
});

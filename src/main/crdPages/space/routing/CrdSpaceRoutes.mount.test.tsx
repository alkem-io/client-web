import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';

// root.tsx mounts the foundation observation above TopLevelRoutes; a signed-in member stands in here.
vi.mock('@/core/foundation/NativeFoundationProvider', async () => {
  const { memberFoundationTestData } = await import('@/core/foundation/foundationTestData');
  return {
    useNativeFoundation: () => ({
      data: memberFoundationTestData(),
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    }),
  };
});

import { TopLevelRoutes } from '@/main/routing/TopLevelRoutes';

const root = {
  __typename: 'Space',
  entityType: 'space',
  id: 'root',
  depth: 0,
  kind: 'SPACE',
  url: '/root',
  settings: {},
  stages: [],
};
const can = Object.fromEntries(
  [
    'read',
    'update',
    'delete',
    'archive',
    'createPost',
    'createSubspace',
    'createDocument',
    'invite',
    'manageMembers',
    'manageTemplates',
    'upload',
    'readActivity',
    'saveAsTemplate',
    'join',
    'apply',
  ].map(flag => [flag, flag !== 'join' && flag !== 'apply'])
);

test("a top-level space's settings mount in the space layout with the shell providers it needs", async () => {
  const requests: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push(operation.operationName);
          if (operation.operationName === 'NativeRouteResolution') {
            observer.next({
              data: {
                resolve: {
                  __typename: 'ResolveResult',
                  state: 'OK',
                  matchedPrefix: '/root',
                  remainder: ['settings', 'community'],
                  node: root,
                  ancestors: [],
                  closestReadable: null,
                  homepage: null,
                  space: root,
                },
              },
            });
          } else if (operation.operationName === 'SpacePage') {
            observer.next({
              data: {
                node: {
                  ...root,
                  handle: 'root',
                  status: 'ACTIVE',
                  createdAt: '2026-01-01T00:00:00Z',
                  isContentPublic: true,
                  tags: [],
                  videoCallUrl: null,
                  memberCount: 1,
                  about: {
                    __typename: 'About',
                    displayName: 'Root',
                    tagline: null,
                    description: null,
                    location: null,
                    facets: [],
                    avatar: null,
                    banner: null,
                    card: null,
                  },
                  links: [],
                  classifications: [],
                  guidelines: null,
                  applicationForm: null,
                  host: null,
                  leads: [],
                  membership: { __typename: 'Membership', roles: ['admin'], status: 'MEMBER', request: null },
                  parent: null,
                  entitlements: [],
                  can: { __typename: 'SpaceCan', ...can },
                },
              },
            });
          } else {
            observer.error(new Error(`not answered in this test: ${operation.operationName}`));
            return;
          }
          observer.complete();
        })
    ),
  });
  render(
    <CookiesProvider>
      <ApolloProvider client={client}>
        <GlobalStateProvider>
          <MemoryRouter initialEntries={['/root/settings/community']}>
            <TopLevelRoutes />
          </MemoryRouter>
        </GlobalStateProvider>
      </ApolloProvider>
    </CookiesProvider>
  );

  // Without the Breadcrumbs/BannerOverlay/LayoutWidth providers the layout threw before any space read (Pi, 2026-11-25).
  expect(await screen.findByRole('tablist', {}, { timeout: 8000 })).toBeInTheDocument();
  await waitFor(() => expect(requests).toContain('SpacePage'));
  expect(requests.slice(0, 2)).toEqual(['NativeRouteResolution', 'SpacePage']);
  expect(screen.getByRole('link', { name: 'Root' })).toHaveAttribute('href', '/root');
}, 20000);

// QA E1: the page's first request went out before the layout saw the URL's post (its D1 read was a cache watcher one
// render behind the provider), and was then cancelled and re-sent as SpacePageWithPost. A post URL's cold load sends the
// route resolution and one SpacePageWithPost, and no request is cancelled while in flight (the page's reads stay
// pending here, so a switch of the page's request would cancel the first one).
test.each([
  ['/root/collaboration/p', 'root'],
  ['/root/challenges/l1/collaboration/p', 'l1'],
])(
  'a cold post URL %s sends one SpacePageWithPost and cancels nothing',
  async (path, space) => {
    const sent: string[] = [];
    const cancelled: string[] = [];
    const l1 = { ...root, id: 'l1', depth: 1, url: '/root/challenges/l1' };
    const post = { __typename: 'Post', entityType: 'post', id: 'p', url: path, contentKind: 'TEXT', parentPost: null };
    const rootFace = {
      ...root,
      about: { __typename: 'About', displayName: 'Root', tagline: null, avatar: null, card: null, banner: null },
    };
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            sent.push(operation.operationName);
            if (operation.operationName !== 'NativeRouteResolution') {
              return () => cancelled.push(operation.operationName);
            }
            const timer = setTimeout(() => {
              observer.next({
                data: {
                  resolve: {
                    __typename: 'ResolveResult',
                    state: 'OK',
                    matchedPrefix: path,
                    remainder: [],
                    node: post,
                    ancestors: space === 'l1' ? [rootFace] : [],
                    closestReadable: null,
                    homepage: null,
                    space: space === 'l1' ? l1 : root,
                  },
                },
              });
              observer.complete();
            }, 50);
            return () => clearTimeout(timer);
          })
      ),
    });
    render(
      <CookiesProvider>
        <ApolloProvider client={client}>
          <GlobalStateProvider>
            <MemoryRouter initialEntries={[path]}>
              <TopLevelRoutes />
            </MemoryRouter>
          </GlobalStateProvider>
        </ApolloProvider>
      </CookiesProvider>
    );

    await waitFor(() => expect(sent).toContain('SpacePageWithPost'), { timeout: 8000 });
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(sent).toEqual(['NativeRouteResolution', 'SpacePageWithPost']);
    expect(cancelled).toEqual([]);
  },
  20000
);

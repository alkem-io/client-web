import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Component, type PropsWithChildren, type ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Link, MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { AuthenticationContext } from '@/core/auth/authentication/context/AuthenticationProvider';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { TopLevelRoutes } from '../../TopLevelRoutes';
import { UrlResolverProvider } from '../UrlResolverProvider';
import useUrlResolver from '../useUrlResolver';

// root.tsx mounts the foundation observation above TopLevelRoutes; these routing tests stand in an anonymous one.
vi.mock('@/core/foundation/NativeFoundationProvider', async () => {
  const { foundationTestData } = await import('@/core/foundation/foundationTestData');
  return {
    useNativeFoundation: () => ({ data: foundationTestData(), loading: false, error: undefined, refetch: vi.fn() }),
  };
});

vi.mock('@/core/auth/authentication/context/AuthenticationProvider', async () => {
  const { createContext } = await import('react');
  return { AuthenticationContext: createContext({ isAuthenticated: false }) };
});
vi.mock('@/core/auth/authentication/routing/IdentityRoute', () => ({ IdentityRoute: () => null }));
vi.mock('@/main/ui/layout/CrdLayoutWrapper', () => ({
  CrdLayoutWrapper: ({ children }: PropsWithChildren) => children,
}));
vi.mock('@/main/crdPages/spaces/SpaceExplorerPage', () => ({ default: () => <main>Explorer</main> }));

class Boundary extends Component<PropsWithChildren, { error?: Error & { redirectUrl?: string } }> {
  state: { error?: Error & { redirectUrl?: string } } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <div role="alert">
        {this.state.error.message}
        {this.state.error.redirectUrl}
      </div>
    ) : (
      this.props.children
    );
  }
}
// root.tsx mounts these above TopLevelRoutes.
const AppProviders = ({ children }: { children: ReactNode }) => (
  <CookiesProvider>
    <GlobalStateProvider>{children}</GlobalStateProvider>
  </CookiesProvider>
);
function Probe() {
  return <output>{JSON.stringify(useUrlResolver())}</output>;
}
const resolved = (id: string, path: string) => ({
  __typename: 'ResolveResult',
  state: 'OK',
  matchedPrefix: path,
  remainder: [],
  node: { __typename: 'Space', entityType: 'space', id, depth: 4, kind: 'SPACE' },
  ancestors: Array.from({ length: 4 }, (_, depth) => ({
    __typename: 'Space',
    entityType: 'space',
    id: `ancestor-${depth}`,
    depth,
    kind: 'SPACE',
  })),
  closestReadable: null,
  homepage: null,
  space: { __typename: 'Space', entityType: 'space', id, depth: 4, kind: 'SPACE' },
});

const topLevel = {
  __typename: 'Space',
  entityType: 'space',
  id: 'root',
  depth: 0,
  kind: 'SPACE',
  url: '/root',
  settings: {},
  stages: [],
};

describe('native canonical routes', () => {
  test('uses router navigation, sends the actual path and clears old identities while resolving', async () => {
    const requests: string[] = [];
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            requests.push(operation.variables.url);
            const path = new URL(operation.variables.url).pathname;
            const timer = setTimeout(() => {
              observer.next({ data: { resolve: resolved(path, path) } });
              observer.complete();
            }, 30);
            return () => clearTimeout(timer);
          })
      ),
    });
    render(
      <ApolloProvider client={client}>
        <MemoryRouter initialEntries={['/root']}>
          <Link to="/root/settings/about">next</Link>
          <UrlResolverProvider>
            <Probe />
          </UrlResolverProvider>
        </MemoryRouter>
      </ApolloProvider>
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('"spaceId":"/root"'));
    fireEvent.click(screen.getByText('next'));
    expect(screen.getByRole('status')).not.toHaveTextContent('"spaceId":"/root"');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('"spaceId":"/root/settings/about"'));
    expect(requests.map(url => new URL(url).pathname)).toEqual(['/root', '/root/settings/about']);
  });

  test.each([
    '',
    '/about',
  ])('a cold top-level space%s sends the route resolution and one page request', async suffix => {
    const requests: string[] = [];
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            requests.push(operation.operationName);
            if (operation.operationName === 'NativeRouteResolution') {
              const space = {
                __typename: 'Space',
                entityType: 'space',
                id: 'root',
                depth: 0,
                kind: 'SPACE',
                url: '/root',
                settings: {},
                stages: [],
              };
              observer.next({
                data: {
                  resolve: {
                    ...resolved('root', '/root'),
                    remainder: suffix ? ['about'] : [],
                    node: space,
                    ancestors: [],
                    space,
                  },
                },
              });
              observer.complete();
            }
          })
      ),
    });
    render(
      <AppProviders>
        <ApolloProvider client={client}>
          <MemoryRouter initialEntries={[`/root${suffix}`]}>
            <TopLevelRoutes />
          </MemoryRouter>
        </ApolloProvider>
      </AppProviders>
    );
    await waitFor(() => expect(requests).toContain('SpacePage'));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(requests).toEqual(['NativeRouteResolution', 'SpacePage']);
  });

  test('propagates backend unavailability of the page request without rendering an empty page', async () => {
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            if (operation.operationName === 'NativeRouteResolution') {
              observer.next({
                data: { resolve: { ...resolved('root', '/root'), node: topLevel, ancestors: [], space: topLevel } },
              });
              observer.complete();
            } else observer.error(new Error('UNAVAILABLE native reader'));
          })
      ),
    });
    render(
      <AppProviders>
        <ApolloProvider client={client}>
          <MemoryRouter initialEntries={['/root']}>
            <Boundary>
              <TopLevelRoutes />
            </Boundary>
          </MemoryRouter>
        </ApolloProvider>
      </AppProviders>
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('UNAVAILABLE native reader');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('unknown suffix stays not found and anonymous sign-in retains the complete return address', async () => {
    const requests: string[] = [];
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            requests.push(operation.operationName);
            observer.next({
              data: { resolve: { ...resolved('root', '/root'), state: 'NOT_FOUND', node: null, space: null } },
            });
            observer.complete();
          })
      ),
    });
    render(
      <AppProviders>
        <ApolloProvider client={client}>
          <MemoryRouter initialEntries={['/missing/about?from=link#section']}>
            <Boundary>
              <TopLevelRoutes />
            </Boundary>
          </MemoryRouter>
        </ApolloProvider>
      </AppProviders>
    );
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Not Found');
    expect(decodeURIComponent(alert.textContent ?? '')).toContain('/missing/about?from=link#section');
    expect(requests).toEqual(['NativeRouteResolution']);
  });

  const forbiddenSpace = (authenticated: boolean) => {
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        () =>
          new Observable(observer => {
            observer.next({ data: { resolve: { ...resolved('root', '/root'), state: 'FORBIDDEN' } } });
            observer.complete();
          })
      ),
    });
    render(
      <ApolloProvider client={client}>
        <AuthenticationContext value={{ isAuthenticated: authenticated } as never}>
          <MemoryRouter initialEntries={['/root']}>
            <Boundary>
              <UrlResolverProvider>
                <Probe />
              </UrlResolverProvider>
            </Boundary>
          </MemoryRouter>
        </AuthenticationContext>
      </ApolloProvider>
    );
  };

  test('a signed-in viewer of a space they may see but not read gets the space resolved, as legacy (its About)', async () => {
    forbiddenSpace(true);
    await waitFor(() => expect(screen.getByRole('status', { hidden: true }).textContent).toContain('"spaceId":"root"'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('an anonymous visitor of a space they may not read is still sent to sign in', async () => {
    forbiddenSpace(false);
    expect(await screen.findByRole('alert')).toHaveTextContent('/required');
  });
});

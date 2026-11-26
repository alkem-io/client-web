import { ApolloClient, ApolloError, gql, useApolloClient } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, useLayoutEffect } from 'react';
import { Cookies, CookiesProvider } from 'react-cookie';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { V2ApolloProvider } from '@/core/apollo/v2/V2ApolloProvider';
import {
  OIDC_RECOVERY_ATTEMPTED_KEY,
  STORAGE_KEY_RETURN_URL,
  STORAGE_KEY_SIGNUP_RETURN_ARMED,
} from '@/core/auth/authentication/constants/authentication.constants';
import { DEVICE_PUSH_TOKEN_KEY, PUSH_SUBSCRIPTION_ID_KEY } from '@/main/pushNotifications/constants';
import { MESSAGING_DRAFTS_STORAGE_KEY } from '@/main/userMessaging/messagingDrafts';
import LogoutPage from './LogoutPage';

const { getFlow, foundation } = vi.hoisted(() => ({
  getFlow: vi.fn(),
  foundation: {
    data: { viewer: { session: { authenticated: false } } } as
      | { viewer: { session: { authenticated: boolean } } }
      | undefined,
    loading: false,
    error: undefined as ApolloError | undefined,
    refetch: vi.fn(),
  },
}));
vi.mock('@/core/foundation/NativeFoundationProvider', () => ({ useNativeFoundation: () => foundation }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/main/crdPages/auth/AuthShellWrapper', () => ({
  AuthShellWrapper: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/core/auth/authentication/hooks/useKratosLogout', () => ({
  useKratosLogout: () => ({ getKratosLogoutUrl: getFlow }),
}));

const fetchLogout = vi.fn<typeof fetch>();
const replace = vi.fn();
const originalLocation = window.location;
const cacheQuery = gql`query PrivateCacheFixture { privateText }`;
const publicQuery = gql`query AvailableAfterLogout { config { platformId } }`;
const publicConfig = { config: { __typename: 'Config', platformId: '11111111-1111-1111-1111-111111111111' } };
const publicResponse = () =>
  new Response(
    JSON.stringify({
      data: publicConfig,
      extensions: {
        requestContext: {
          requester: '10000000-0000-0000-0000-000000000001',
          effective: '10000000-0000-0000-0000-000000000001',
          anonymous: true,
        },
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
let clients: ApolloClient<object>[];
let client: ApolloClient<object>;
const logoutPath = `/api/auth/oidc/logout?${new URLSearchParams({ post_logout_redirect_uri: `${window.location.origin}/logout` })}`;

beforeEach(() => {
  clients = [];
  fetchLogout.mockReset().mockImplementation(async input => {
    if (String(input) === '/unserved-graphql') return publicResponse();
    throw new Error(`Unexpected request: ${String(input)}`);
  });
  window.history.replaceState({}, '', '/logout');
  replace.mockReset();
  getFlow.mockReset().mockResolvedValue({ kind: 'no-session' });
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', fetchLogout);
  vi.stubGlobal('location', {
    get origin() {
      return originalLocation.origin;
    },
    get pathname() {
      return originalLocation.pathname;
    },
    get search() {
      return originalLocation.search;
    },
    get hash() {
      return originalLocation.hash;
    },
    replace,
  });
  foundation.data = { viewer: { session: { authenticated: false } } };
  foundation.loading = false;
  foundation.error = undefined;
  foundation.refetch.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  client.stop();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function CacheFixture({ children }: { children: ReactNode }) {
  const currentClient = useApolloClient();
  useLayoutEffect(() => {
    client = currentClient;
    clients.push(currentClient);
    if (clients.length === 1)
      currentClient.writeQuery({ query: cacheQuery, data: { privateText: 'Stored private content' } });
  }, [currentClient]);
  return children;
}

const renderLogout = () =>
  render(
    <V2ApolloProvider uri="/unserved-graphql">
      <CacheFixture>
        <BrowserRouter>
          <CookiesProvider>
            <Routes>
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/home" element={<output>Usable home</output>} />
            </Routes>
          </CookiesProvider>
        </BrowserRouter>
      </CacheFixture>
    </V2ApolloProvider>
  );

describe('current logout consumer and retained notification cleanup obligation', () => {
  it('clears the real Apollo cache before starting the registered RP/Hydra return', async () => {
    const cookies = new Cookies();
    cookies.set(STORAGE_KEY_RETURN_URL, '/private', { path: '/' });
    cookies.set(STORAGE_KEY_SIGNUP_RETURN_ARMED, '1', { path: '/' });
    sessionStorage.setItem(STORAGE_KEY_RETURN_URL, '/private');
    sessionStorage.setItem(OIDC_RECOVERY_ATTEMPTED_KEY, '1');
    localStorage.setItem(
      MESSAGING_DRAFTS_STORAGE_KEY,
      JSON.stringify({ 'prior-user': { conversation: 'Private draft' } })
    );
    foundation.data = { viewer: { session: { authenticated: true } } };
    renderLogout();
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith(logoutPath));
    expect(client.cache.extract()).toEqual({});
    expect(fetchLogout).not.toHaveBeenCalled();
    expect(getFlow).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain(`${STORAGE_KEY_RETURN_URL}=`);
    expect(document.cookie).not.toContain(`${STORAGE_KEY_SIGNUP_RETURN_ARMED}=`);
    expect(sessionStorage.getItem(STORAGE_KEY_RETURN_URL)).toBeNull();
    expect(sessionStorage.getItem(OIDC_RECOVERY_ATTEMPTED_KEY)).toBeNull();
    expect(localStorage.getItem(MESSAGING_DRAFTS_STORAGE_KEY)).toBeNull();
  });

  it('shows a BFF failure and retries only after the explicit user action', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 503 }));
    renderLogout();
    const current = client;
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.unavailable');
    expect(replace).not.toHaveBeenCalled();
    expect(clients).toHaveLength(1);
    expect((await current.query({ query: publicQuery })).data).toEqual(publicConfig);
    expect(client).toBe(current);
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    fireEvent.click(screen.getByRole('button', { name: 'apollo.errors.network.retry' }));
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/home'));
    expect(fetchLogout).toHaveBeenCalledTimes(3);
    expect(clients).toHaveLength(1);
    expect(getFlow).toHaveBeenCalledTimes(1);
  });

  it('keeps the original full-document Home completion and retires only for that confirmed navigation', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderLogout();
    const previous = client;
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/home'));
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(clients).toHaveLength(1);
    expect(client).toBe(previous);
    expect(previous.cache.extract()).toEqual({});
    expect(client.cache.extract()).toEqual({});
    expect(client.cache.readQuery({ query: cacheQuery })).toBeNull();
    const oldResult = await previous.query({ query: publicQuery }).catch(error => error);
    expect(oldResult.message).toContain('context changed');
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('navigates the live provider-issued logout URL instead of replacing its configured return', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    getFlow.mockResolvedValue({ kind: 'redirect', url: 'https://identity.test/actual-logout-flow' });
    renderLogout();
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('https://identity.test/actual-logout-flow'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(client.cache.extract()).toEqual({});
    expect(clients).toHaveLength(1);
    const retired = await client.query({ query: publicQuery }).catch(error => error);
    expect(retired.message).toContain('context changed');
    expect(fetchLogout).toHaveBeenCalledTimes(1);
  });

  it('keeps the same usable lifetime and local error state when Kratos logout is unavailable', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    getFlow.mockResolvedValue({ kind: 'failed' });
    renderLogout();
    const current = client;
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.unavailable');
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/logout');
    expect(clients).toHaveLength(1);
    expect((await current.query({ query: publicQuery })).data).toEqual(publicConfig);
    expect(client).toBe(current);
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(fetchLogout).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'apollo.errors.network.retry' })).toBeVisible();
  });

  it('ends the provider sessions but preserves and exposes an unsupported saved native binding', async () => {
    localStorage.setItem(DEVICE_PUSH_TOKEN_KEY, 'saved-native-token');
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderLogout();
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.pushCleanupUnavailable');
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(DEVICE_PUSH_TOKEN_KEY)).toBe('saved-native-token');
    expect(document.body).not.toHaveTextContent('saved-native-token');
    expect(client.cache.extract()).toEqual({});
    expect(replace).not.toHaveBeenCalled();
  });

  it('waits for local browser unsubscribe before starting the provider navigation', async () => {
    localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, 'saved-browser-subscription');
    let finish: (value: boolean) => void = () => {};
    const unsubscribe = vi.fn(
      () =>
        new Promise<boolean>(resolve => {
          finish = resolve;
        })
    );
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration: vi
          .fn()
          .mockResolvedValue({ pushManager: { getSubscription: vi.fn().mockResolvedValue({ unsubscribe }) } }),
      },
    });
    foundation.data = { viewer: { session: { authenticated: true } } };
    renderLogout();
    await waitFor(() => expect(unsubscribe).toHaveBeenCalledTimes(1));
    expect(fetchLogout).not.toHaveBeenCalled();
    finish(true);
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith(logoutPath));
    expect(localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)).toBeNull();
  });

  it('retains an unsuccessful browser unsubscribe and still attempts both session terminations', async () => {
    localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, 'saved-browser-subscription');
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue({ unsubscribe: vi.fn().mockResolvedValue(false) }),
          },
        }),
      },
    });
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderLogout();
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.pushCleanupUnavailable');
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)).toBe('saved-browser-subscription');
    expect(replace).not.toHaveBeenCalled();
  });

  it('waits for the shared observation without probing another session endpoint', async () => {
    foundation.data = undefined;
    foundation.loading = true;
    const view = renderLogout();
    expect(fetchLogout).not.toHaveBeenCalled();
    expect(getFlow).not.toHaveBeenCalled();
    expect(client.cache.readQuery({ query: cacheQuery })).toEqual({ privateText: 'Stored private content' });
    foundation.data = { viewer: { session: { authenticated: false } } };
    foundation.loading = false;
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    view.rerender(
      <V2ApolloProvider uri="/unserved-graphql">
        <CacheFixture>
          <BrowserRouter>
            <CookiesProvider>
              <Routes>
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/home" element={<output>Usable home</output>} />
              </Routes>
            </CookiesProvider>
          </BrowserRouter>
        </CacheFixture>
      </V2ApolloProvider>
    );
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/home'));
    expect(fetchLogout).toHaveBeenCalledExactlyOnceWith(logoutPath, { credentials: 'include', redirect: 'manual' });
    expect(client.cache.extract()).toEqual({});
  });

  it('retries the single unavailable foundation before attempting either provider', async () => {
    foundation.error = new ApolloError({ networkError: new Error('Dependency unavailable') });
    const view = renderLogout();
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.unavailable');
    expect(fetchLogout).not.toHaveBeenCalled();
    expect(getFlow).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'apollo.errors.network.retry' }));
    expect(foundation.refetch).toHaveBeenCalledTimes(1);
    foundation.error = undefined;
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    view.rerender(
      <V2ApolloProvider uri="/unserved-graphql">
        <CacheFixture>
          <BrowserRouter>
            <CookiesProvider>
              <Routes>
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/home" element={<output>Usable home</output>} />
              </Routes>
            </CookiesProvider>
          </BrowserRouter>
        </CacheFixture>
      </V2ApolloProvider>
    );
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/home'));
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    expect(getFlow).toHaveBeenCalledTimes(1);
  });

  it('does not claim local cleanup succeeded when the real cache cannot be cleared', async () => {
    const clear = vi.spyOn(ApolloClient.prototype, 'clearStore').mockRejectedValue(new Error('Cache unavailable'));
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderLogout();
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.cleanupUnavailable');
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    clear.mockRestore();
  });

  it('allows positive admission401 management204, then one fresh document observation without an action loop', async () => {
    foundation.data = undefined;
    foundation.error = new ApolloError({
      networkError: Object.assign(new Error('Admission refused'), { statusCode: 401 }),
    });
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const firstDocument = renderLogout();
    const previous = client;
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/logout'));
    expect(fetchLogout).toHaveBeenCalledExactlyOnceWith(logoutPath, { credentials: 'include', redirect: 'manual' });
    expect(getFlow).not.toHaveBeenCalled();
    expect(foundation.refetch).not.toHaveBeenCalled();
    expect(previous.cache.extract()).toEqual({});
    expect((await previous.query({ query: publicQuery }).catch(error => error)).message).toContain('context changed');

    firstDocument.unmount();
    foundation.error = undefined;
    foundation.data = { viewer: { session: { authenticated: false } } };
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderLogout();
    await waitFor(() => expect(replace.mock.calls).toEqual([['/logout'], ['/home']]));
    expect(fetchLogout).toHaveBeenCalledTimes(2);
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(foundation.refetch).not.toHaveBeenCalled();
    expect(clients).toHaveLength(2);
    expect(client).not.toBe(previous);
    expect(client.cache.readQuery({ query: cacheQuery })).toBeNull();
  });

  it('keeps a consumed opaque redirect unknown without navigation, foundation retry or management replay', async () => {
    foundation.data = undefined;
    foundation.error = new ApolloError({
      networkError: Object.assign(new Error('Admission refused'), { statusCode: 401 }),
    });
    const redirect = new Response(null, { status: 302 });
    Object.defineProperty(redirect, 'type', { value: 'opaqueredirect' });
    Object.defineProperty(redirect, 'status', { value: 0 });
    fetchLogout.mockResolvedValueOnce(redirect).mockResolvedValue(new Response(null, { status: 204 }));
    const page = renderLogout();
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.unknown');
    expect(replace).not.toHaveBeenCalled();
    expect(getFlow).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'apollo.errors.network.retry' })).not.toBeInTheDocument();
    page.rerender(
      <V2ApolloProvider uri="/unserved-graphql">
        <CacheFixture>
          <BrowserRouter>
            <CookiesProvider>
              <Routes>
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/home" element={<output>Usable home</output>} />
              </Routes>
            </CookiesProvider>
          </BrowserRouter>
        </CacheFixture>
      </V2ApolloProvider>
    );
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    expect(foundation.refetch).not.toHaveBeenCalled();
  });

  it('keeps management dependency failures unavailable and retries the action rather than private foundation', async () => {
    foundation.data = undefined;
    foundation.error = new ApolloError({
      networkError: Object.assign(new Error('Admission refused'), { statusCode: 401 }),
    });
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 503 }));
    renderLogout();
    const current = client;
    expect(await screen.findByRole('alert')).toHaveTextContent('pages.logout.unavailable');
    expect(replace).not.toHaveBeenCalled();
    expect(client).toBe(current);
    expect((await current.query({ query: publicQuery })).data).toEqual(publicConfig);
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    fireEvent.click(screen.getByRole('button', { name: 'apollo.errors.network.retry' }));
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/logout'));
    expect(getFlow).not.toHaveBeenCalled();
    expect(foundation.refetch).not.toHaveBeenCalled();
  });
});

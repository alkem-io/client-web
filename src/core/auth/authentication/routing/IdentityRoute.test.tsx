import { createServer, type Server } from 'node:http';
import { type ApolloClient, ApolloError, useApolloClient } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, useLayoutEffect } from 'react';
import { Cookies, CookiesProvider } from 'react-cookie';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { V2ApolloProvider } from '@/core/apollo/v2/V2ApolloProvider';
import { KratosPublicUrlContext } from '@/core/auth/authentication/hooks/KratosPublicUrlContext';
import { GlobalErrorProvider } from '@/core/lazyLoading/GlobalErrorContext';
import { PlatformOriginContext } from '@/domain/platform/routes/PlatformOriginContext';

let server: Server;
let origin: string;
let identityRoutes: () => ReactNode;
const requests: string[] = [];
const { foundation } = vi.hoisted(() => ({
  foundation: {
    data: { viewer: { session: { authenticated: true } } } as
      | { viewer: { session: { authenticated: boolean } } }
      | undefined,
    loading: false,
    error: undefined as Error | undefined,
    refetch: vi.fn(),
  },
}));
vi.mock('@/core/foundation/NativeFoundationProvider', () => ({ useNativeFoundation: () => foundation }));
let kratosLogoutStatus = 200;
const transport = globalThis.fetch;
const replace = vi.fn();
const originalLocation = window.location;
let client: ApolloClient<object>;

const flow = (kind: string, id: string) => ({
  id,
  type: 'browser',
  state: 'choose_method',
  issued_at: '2026-10-31T00:00:00Z',
  expires_at: '2026-11-01T00:00:00Z',
  request_url: `${origin}/${kind}?flow=${id}`,
  ui: {
    action: `${origin}/ory/kratos/public/self-service/${kind}?flow=${id}&return_to=${encodeURIComponent(`${origin}/api/oidc/login?login_challenge=provider-challenge`)}`,
    method: 'POST',
    nodes: [
      {
        type: 'input',
        group: 'default',
        messages: [],
        meta: {},
        attributes: { node_type: 'input', type: 'hidden', name: 'csrf_token', value: 'provider-csrf', disabled: false },
      },
      {
        type: 'input',
        group: 'password',
        messages: [],
        meta: { label: { id: 1, text: 'Email', type: 'info' } },
        attributes: {
          node_type: 'input',
          type: 'email',
          name: kind === 'registration' ? 'traits.email' : 'identifier',
          required: true,
          disabled: false,
        },
      },
      {
        type: 'input',
        group: 'password',
        messages: [],
        meta: { label: { id: 2, text: 'Password', type: 'info' } },
        attributes: { node_type: 'input', type: 'password', name: 'password', required: true, disabled: false },
      },
      {
        type: 'input',
        group: 'password',
        messages: [],
        meta: { label: { id: 3, text: 'Continue', type: 'info' } },
        attributes: { node_type: 'input', type: 'submit', name: 'method', value: 'password', disabled: false },
      },
      ...(kind === 'registration'
        ? [
            {
              type: 'input',
              group: 'default',
              messages: [],
              meta: {},
              attributes: {
                node_type: 'input',
                type: 'checkbox',
                name: 'traits.accepted_terms',
                value: false,
                required: true,
                disabled: false,
              },
            },
          ]
        : []),
    ],
  },
});

beforeAll(async () => {
  server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', origin);
    requests.push(`${request.method} ${url.pathname}${url.search}`);
    response.setHeader('Access-Control-Allow-Origin', window.location.origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/auth/oidc/logout') {
      response.writeHead(204).end();
      return;
    }
    if (url.pathname === '/ory/kratos/public/self-service/logout/browser') {
      response
        .writeHead(kratosLogoutStatus)
        .end(JSON.stringify({ logout_url: `${origin}/ory/kratos/public/self-service/logout?token=provider-logout` }));
      return;
    }
    if (url.pathname === '/ory/kratos/public/self-service/logout') {
      response.writeHead(204).end();
      return;
    }
    if (url.searchParams.get('id') === 'duplicate') {
      const duplicate = flow('registration', 'duplicate');
      response.writeHead(400).end(
        JSON.stringify({
          ...duplicate,
          ui: { ...duplicate.ui, messages: [{ id: 4000007, type: 'error', text: 'Account already exists' }] },
        })
      );
      return;
    }
    if (url.searchParams.get('id') === 'expired') {
      response.writeHead(403).end(JSON.stringify({ error: { id: 'security_csrf_violation' } }));
      return;
    }
    const kind = ['login', 'registration', 'recovery', 'verification', 'settings'].find(
      value => url.pathname.endsWith(`/${value}/flows`) || url.pathname.endsWith(`/${value}/browser`)
    );
    if (kind) {
      response.end(JSON.stringify(flow(kind, url.searchParams.get('id') ?? 'provider-flow')));
      return;
    }
    if (url.pathname.endsWith('/self-service/errors')) {
      response.end(JSON.stringify({ error: { code: 400, message: 'Provider flow error' } }));
      return;
    }
    response.writeHead(404).end('{}');
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('HTTP fixture has no TCP address');
  origin = `http://127.0.0.1:${address.port}`;
  window._env_ = { VITE_APP_ALKEMIO_DOMAIN: 'https://unadmitted-build-origin.invalid' };
  await import('@/core/i18n/config');
  identityRoutes = (await import('./IdentityRoute')).IdentityRoute;
  // Load the login module in fixture setup so the test timeout covers the issued flow.
  await import('@/main/crdPages/auth/LoginCrdRoute');
  // These first imports transform the route modules; in the full suite they exceed the 10 s default.
}, 60_000);

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => (error ? reject(error) : resolve())));
});

beforeEach(() => {
  requests.splice(0);
  const cookies = new Cookies();
  cookies.remove('returnUrl', { path: '/' });
  cookies.remove('signupReturnArmed', { path: '/' });
  replace.mockReset();
  foundation.data = { viewer: { session: { authenticated: true } } };
  foundation.loading = false;
  foundation.error = undefined;
  kratosLogoutStatus = 200;
  localStorage.clear();
});
afterEach(() => {
  client.stop();
  vi.unstubAllGlobals();
});

function CaptureClient({ children }: { children: ReactNode }) {
  const currentClient = useApolloClient();
  useLayoutEffect(() => {
    client = currentClient;
  }, [currentClient]);
  return children;
}

const renderRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <V2ApolloProvider uri="/unserved-graphql">
        <CaptureClient>
          <PlatformOriginContext value={origin}>
            <KratosPublicUrlContext value={`${origin}/ory/kratos/public`}>
              <CookiesProvider>
                <GlobalErrorProvider>
                  <Routes>
                    {identityRoutes()}
                    <Route path="/home" element={<output data-testid="completed-home" />} />
                    <Route path="*" element={<output data-testid="unserved" />} />
                  </Routes>
                </GlobalErrorProvider>
              </CookiesProvider>
            </KratosPublicUrlContext>
          </PlatformOriginContext>
        </CaptureClient>
      </V2ApolloProvider>
    </MemoryRouter>
  );

describe('issued Kratos UI route closure with actual SDK HTTP transport', () => {
  it.each([
    ['/login', 'login'],
    ['/sign_up', 'registration'],
    ['/registration', 'registration'],
    ['/recovery', 'recovery'],
    ['/verify', 'verification'],
    ['/settings', 'settings'],
  ])('%s reads only its provider flow and preserves form action/method/CSRF', async (path, kind) => {
    if (path === '/sign_up') foundation.data = { viewer: { session: { authenticated: false } } };
    const { container } = renderRoute(`${path}?flow=provider-flow`);
    await waitFor(() => expect(container.querySelector('form')).not.toBeNull(), { timeout: 5000 });
    const form = container.querySelector('form');
    expect(form?.getAttribute('action')).toBe(flow(kind, 'provider-flow').ui.action);
    expect(form?.getAttribute('method')?.toLowerCase()).toBe('post');
    expect(container.querySelector<HTMLInputElement>('input[name="csrf_token"]')?.value).toBe('provider-csrf');
    expect(requests).toEqual([`GET /ory/kratos/public/self-service/${kind}/flows?id=provider-flow`]);
  });

  it('a signed-in visitor of /sign_up goes home, as legacy NotAuthenticatedRoute', async () => {
    renderRoute('/sign_up');
    expect(await screen.findByTestId('completed-home')).toBeInTheDocument();
    expect(requests).toEqual([]);
  });

  it('an unreadable login flow offers the real BFF restart without creating a new Kratos login', async () => {
    const { container } = renderRoute('/login?flow=expired');
    await waitFor(() =>
      expect(container.querySelector(`a[href="${origin}/api/auth/oidc/login?returnTo=%2F"]`)).not.toBeNull()
    );
    expect(container.querySelector('form')).toBeNull();
    expect(requests).toEqual(['GET /ory/kratos/public/self-service/login/flows?id=expired']);
  });

  it('the provider error route reads only the actual flow-error API', async () => {
    renderRoute('/error?id=provider-error');
    await waitFor(() => expect(screen.getByText('Provider flow error')).toBeInTheDocument());
    expect(requests).toEqual(['GET /ory/kratos/public/self-service/errors?id=provider-error']);
  });

  it.each([
    ['/sign_up', 'registration'],
    ['/registration', 'registration'],
    ['/recovery', 'recovery'],
    ['/verify', 'verification'],
  ])('%s creates its existing browser self-service flow when no flow is supplied', async (path, kind) => {
    if (path === '/sign_up') foundation.data = { viewer: { session: { authenticated: false } } };
    const { container } = renderRoute(path);
    await waitFor(() => expect(container.querySelector('form')).not.toBeNull(), { timeout: 5000 });
    expect(container.querySelector('form')?.getAttribute('action')).toBe(flow(kind, 'provider-flow').ui.action);
    expect(requests).toEqual([`GET /ory/kratos/public/self-service/${kind}/browser`]);
  });

  it('the registration form keeps the provider terms trait and native submit gate', async () => {
    const { container } = renderRoute('/registration?flow=provider-flow');
    await waitFor(() => expect(container.querySelector('form')).not.toBeNull());
    const submit = container.querySelector<HTMLButtonElement>('button[name="method"]');
    expect(submit).toBeDisabled();
    const checkbox = container.querySelector<HTMLInputElement>('input[name="traits.accepted_terms"]');
    expect(checkbox?.value).toBe('true');
    const terms = screen.getByRole('checkbox');
    fireEvent.click(terms);
    expect(terms).toHaveAttribute('aria-checked', 'true');
    expect(requests).toEqual(['GET /ory/kratos/public/self-service/registration/flows?id=provider-flow']);
  });

  it('a duplicate registration reaches the existing login notice before a new BFF round trip', async () => {
    renderRoute('/registration?flow=duplicate');
    const notice = await screen.findByRole('alert');
    const { default: i18n } = await import('@/core/i18n/config');
    expect(notice).toHaveTextContent(i18n.t('kratos.messages.login-flow-account-exists'));
    expect(screen.getByRole('link', { name: /^sign in$/i }).getAttribute('href')).toContain(
      '/api/auth/oidc/login?returnTo='
    );
    expect(requests).toEqual(['GET /ory/kratos/public/self-service/registration/flows?id=duplicate']);
  });

  it('the registration-success reminder stays local without a session or GraphQL probe', async () => {
    renderRoute('/registration/success');
    await waitFor(() => expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument());
    expect(requests).toEqual([]);
  });

  it('the verification reminder stays local without a session or GraphQL probe', async () => {
    renderRoute('/verify/reminder');
    await waitFor(() => expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument());
    expect(requests).toEqual([]);
  });

  it('mounts the existing logout route and navigates the BFF action without a second status probe', async () => {
    vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit) =>
      transport(new URL(String(input), origin), options)
    );
    vi.stubGlobal('location', { ...originalLocation, replace });
    renderRoute('/logout');
    await waitFor(() =>
      expect(replace).toHaveBeenCalledExactlyOnceWith(
        `/api/auth/oidc/logout?${new URLSearchParams({ post_logout_redirect_uri: `${originalLocation.origin}/logout` })}`
      )
    );
    expect(requests).toEqual([]);
    expect(screen.queryByTestId('unserved')).not.toBeInTheDocument();
  });

  it('keeps an unavailable shared foundation visible without starting either provider leg', async () => {
    foundation.error = new Error('Shared foundation unavailable');
    vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit) =>
      transport(new URL(String(input), origin), options)
    );
    vi.stubGlobal('location', { ...originalLocation, replace });
    renderRoute('/logout');
    expect(await screen.findByRole('alert')).toHaveTextContent('Sign out could not be completed');
    expect(replace).not.toHaveBeenCalled();
    expect(requests).toEqual([]);
  });

  it('reaches the existing BFF management204 after admission401 without reading Kratos or private foundation', async () => {
    foundation.data = undefined;
    foundation.error = new ApolloError({
      networkError: Object.assign(new Error('Admission refused'), { statusCode: 401 }),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit) =>
      transport(new URL(String(input), origin), options)
    );
    vi.stubGlobal('location', { ...originalLocation, replace });
    renderRoute('/logout');
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/logout'));
    expect(requests).toEqual([
      `GET /api/auth/oidc/logout?${new URLSearchParams({ post_logout_redirect_uri: `${originalLocation.origin}/logout` })}`,
    ]);
    expect(foundation.refetch).not.toHaveBeenCalled();
  });

  it('on the RP return, navigates the actual Kratos SDK logout URL so its provider controls the destination', async () => {
    foundation.data = { viewer: { session: { authenticated: false } } };
    vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit) =>
      transport(new URL(String(input), origin), options)
    );
    vi.stubGlobal('location', { ...originalLocation, replace });
    renderRoute('/logout');
    await waitFor(() =>
      expect(replace).toHaveBeenCalledExactlyOnceWith(
        `${origin}/ory/kratos/public/self-service/logout?token=provider-logout`
      )
    );
    expect(requests).toEqual([
      `GET /api/auth/oidc/logout?${new URLSearchParams({ post_logout_redirect_uri: `${originalLocation.origin}/logout` })}`,
      'GET /ory/kratos/public/self-service/logout/browser',
    ]);
  });

  it.each([401, 503])('distinguishes actual Kratos no-session401 from unavailable503 (received %i)', async status => {
    foundation.data = { viewer: { session: { authenticated: false } } };
    kratosLogoutStatus = status;
    vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit) =>
      transport(new URL(String(input), origin), options)
    );
    vi.stubGlobal('location', { ...originalLocation, replace });
    renderRoute('/logout');
    if (status === 401) {
      await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith('/home'));
    } else {
      expect(await screen.findByRole('alert')).toHaveTextContent('Sign out could not be completed');
      expect(replace).not.toHaveBeenCalled();
    }
    expect(requests).toEqual([
      `GET /api/auth/oidc/logout?${new URLSearchParams({ post_logout_redirect_uri: `${originalLocation.origin}/logout` })}`,
      'GET /ory/kratos/public/self-service/logout/browser',
    ]);
  });

  it.each(['/login/success', '/settings'])('%s stays unserved without probing auth or GraphQL', path => {
    renderRoute(path);
    expect(screen.getByTestId('unserved')).toBeInTheDocument();
    expect(requests).toEqual([]);
  });
});

import { ApolloProvider } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type PropsWithChildren, useContext } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Error40XBoundary } from '@/core/40XErrorHandler/ErrorBoundary';
import { createV2ApolloLifetime } from '@/core/apollo/v2/createV2ApolloClient';
import { V2ApolloProvider } from '@/core/apollo/v2/V2ApolloProvider';
import { KratosPublicUrlContext } from '@/core/auth/authentication/hooks/KratosPublicUrlContext';
import '@/core/i18n/config';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { useConfig } from '../useConfig';
import { NativeConfigProvider } from './NativeConfigProvider';

function Probe() {
  const { locations, language, isFeatureEnabled, serverMetadata } = useConfig();
  const origin = usePlatformOrigin();
  const kratos = useContext(KratosPublicUrlContext);
  return (
    <pre data-testid="config">
      {JSON.stringify({
        domain: locations?.domain,
        landing: locations?.landing,
        language,
        origin,
        kratos,
        enabled: isFeatureEnabled('landing-page'),
        services: serverMetadata.services,
      })}
    </pre>
  );
}
const config = {
  __typename: 'Config',
  platformId: '00000000-0000-0000-0000-000000000001',
  matrix: { __typename: 'ConfigMatrix', sessionBaseUrl: '/api/matrix' },
  languages: ['en', 'nl'],
  defaultLanguage: 'en',
  authProviders: ['ory'],
  features: { 'landing-page': true },
  authentication: {
    __typename: 'ConfigAuthentication',
    kratosPublicUrl: 'https://platform.example.test/ory/kratos/public',
  },
  links: [
    { __typename: 'ConfigLink', key: 'domain', url: 'https://platform.example.test' },
    { __typename: 'ConfigLink', key: 'landing', url: 'https://public.example.test/start/' },
  ],
  iframeAllowlist: [],
  telemetry: null,
  geo: null,
  versions: { __typename: 'ConfigVersions', server: 'pinned-version' },
};
const admitted = {
  requester: '00000000-0000-0000-0000-000000000008',
  effective: '00000000-0000-0000-0000-000000000008',
  anonymous: true,
};
const viewer = {
  __typename: 'Viewer',
  id: '00000000-0000-0000-0000-000000000000',
  actor: null,
  session: { __typename: 'SessionInfo', authenticated: false, issuedAt: null, fresh: false, authMethods: [] },
  settings: null,
  language: null,
  homeSpace: null,
};
const spaces = { __typename: 'SpaceConnection', edges: [], pageInfo: { __typename: 'PageInfo', hasNextPage: false } };
const reply = () =>
  new Response(
    JSON.stringify({
      data: { config, viewer, spaces, resolve: { __typename: 'ResolveResult', homepage: null } },
      extensions: { requestContext: admitted },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
const clients: Array<ReturnType<ReturnType<typeof createV2ApolloLifetime>['getSnapshot']>['client']> = [];
function setup() {
  const client = createV2ApolloLifetime('/api/private/graphql').getSnapshot().client;
  clients.push(client);
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <MemoryRouter>
        <Error40XBoundary errorComponent={({ error }) => <p role="alert">{error?.message}</p>}>
          <NativeConfigProvider>{children}</NativeConfigProvider>
        </Error40XBoundary>
      </MemoryRouter>
    </ApolloProvider>
  );
  return Wrapper;
}

afterEach(() => {
  for (const client of clients) client.stop();
  clients.length = 0;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('foundation configuration through the existing context', () => {
  test.each([
    ['/logout', 401, true],
    ['/home', 401, false],
    ['/logout/extra', 401, false],
    ['/logout', 403, false],
  ])('keeps management reachability precise at %s with HTTP %s', async (path, status, permitted) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ errors: [{ message: 'Admission refused' }] }), {
            status,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );
    render(
      <MemoryRouter initialEntries={[path]}>
        <V2ApolloProvider uri="/api/private/graphql">
          <Error40XBoundary errorComponent={({ error }) => <p role="alert">{error?.message}</p>}>
            <NativeConfigProvider>
              <p>Existing management consumer</p>
            </NativeConfigProvider>
          </Error40XBoundary>
        </V2ApolloProvider>
      </MemoryRouter>
    );
    if (permitted) expect(await screen.findByText('Existing management consumer')).toBeVisible();
    else {
      await screen.findByRole('alert');
      expect(screen.queryByText('Existing management consumer')).not.toBeInTheDocument();
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('uses one narrow credentialed request and reuses actual cached configuration on revisit', async () => {
    let respond!: (response: Response) => void;
    const fetch = vi.fn(
      (_url: RequestInfo | URL, _options?: RequestInit) =>
        new Promise<Response>(resolve => {
          respond = resolve;
        })
    );
    vi.stubGlobal('fetch', fetch);
    const Wrapper = setup();
    const first = render(<Probe />, { wrapper: Wrapper });
    expect(screen.getByText('Loading configuration ...')).toBeVisible();
    expect(screen.queryByTestId('config')).not.toBeInTheDocument();
    await act(async () => respond(reply()));
    await screen.findByTestId('config');
    expect(JSON.parse(screen.getByTestId('config').textContent ?? '{}')).toEqual({
      domain: 'platform.example.test',
      landing: 'https://public.example.test/start/',
      origin: 'https://platform.example.test',
      kratos: 'https://platform.example.test/ory/kratos/public',
      language: { eligible: ['en', 'nl'], default: 'en' },
      enabled: true,
      services: [{ version: 'pinned-version' }],
    });
    const options = fetch.mock.calls[0][1];
    const body = JSON.parse(String(options?.body));
    expect(options?.credentials).toBe('include');
    expect(body.operationName).toBe('NativeConfiguration');
    expect(body.query).toMatch(/\bmatrix\s*\{\s*sessionBaseUrl\b/);
    expect(body.query).not.toMatch(/\b(?:storage|vapidPublicKey|assistantCapabilities|notificationKinds)\b/);
    first.unmount();
    render(<Probe />, { wrapper: Wrapper });
    await screen.findByTestId('config');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('a failed configuration does not render children with disabled flags or an anonymous default', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              errors: [{ message: 'Public configuration unavailable', extensions: { code: 'UNAVAILABLE' } }],
              extensions: { requestContext: admitted },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          )
      )
    );
    render(<Probe />, { wrapper: setup() });
    expect(await screen.findByRole('alert')).toHaveTextContent('Public configuration unavailable');
    expect(screen.queryByTestId('config')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('a session-store outage remains unavailable until an actual successful retry', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            errors: [{ message: 'Session store unavailable', extensions: { code: 'SESSION_STORE_UNAVAILABLE' } }],
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
    );
    vi.stubGlobal('fetch', fetch);
    render(<Probe />, { wrapper: setup() });
    await act(() => vi.runAllTimersAsync());
    expect(fetch).toHaveBeenCalledTimes(5);
    expect(screen.queryByTestId('config')).not.toBeInTheDocument();
    expect(screen.getByText('Loading configuration ...')).toBeVisible();
    fetch.mockImplementation(async () => reply());
    fireEvent.click(screen.getByRole('button'));
    await act(() => vi.runAllTimersAsync());
    vi.useRealTimers();
    await waitFor(() => expect(screen.getByTestId('config')).toHaveTextContent('platform.example.test'));
    expect(fetch).toHaveBeenCalledTimes(6);
  });
});

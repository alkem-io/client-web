import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  anonymousContext,
  foundationTestData,
  memberContext,
  memberFoundationTestData,
} from '@/core/foundation/foundationTestData';

vi.mock('@/core/i18n/config', () => ({ supportedLngs: ['en', 'nl'] }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

const requests: { operationName: string; variables: unknown; credentials: RequestCredentials | undefined }[] = [];
const payload = {
  data: {
    subtree: {
      __typename: 'NodeConnection',
      edges: [
        {
          __typename: 'NodeEdge',
          node: {
            __typename: 'Space',
            id: '019a0000-0000-7000-8000-000000000001',
            depth: 0,
            parent: null,
            status: 'ACTIVE',
            url: '/spaces/example',
            isContentPublic: false,
            pinned: false,
            tags: [],
            about: { __typename: 'About', displayName: 'Example root', tagline: 'Text card', avatar: null, card: null },
            membership: null,
            can: { __typename: 'SpaceCan', read: false },
            leads: null,
          },
        },
      ],
      pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
    },
  },
};
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  requests.length = 0;
});

import Root from './root';

describe('foundation root composition', () => {
  it('renders the admitted own Viewer in the real layout and links its profile without a second identity lookup', async () => {
    window.history.replaceState({}, '', '/spaces');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
        const body = JSON.parse(String(options?.body));
        requests.push({
          operationName: body.operationName,
          variables: body.variables,
          credentials: options?.credentials,
        });
        const foundation = memberFoundationTestData();
        const data =
          body.operationName === 'NativeConfiguration'
            ? { config: foundation.config }
            : body.operationName === 'V2Foundation'
              ? foundation
              : body.operationName === 'ExplorerSpaceTree'
                ? payload.data
                : undefined;
        if (!data) throw new Error(`Unserved operation: ${body.operationName}`);
        return new Response(JSON.stringify({ data, extensions: { requestContext: memberContext } }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    render(<Root />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'CM' }));
    expect(await screen.findByText('Current member')).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'header.profile' })).toHaveAttribute('href', '/member');
    expect(screen.getByRole('menuitem', { name: 'header.logout' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'header.login' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(requests.map(request => request.operationName).sort()).toEqual([
      'ExplorerSpaceTree',
      'NativeConfiguration',
      'V2Foundation',
    ]);
    expect(requests.every(request => request.credentials === 'include')).toBe(true);
  });

  it('loads independent configuration and foundation with the actual layout and cached explorer', async () => {
    window.history.replaceState({}, '', '/spaces');
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const isGrid = this.tagName === 'OUTPUT' || this.tagName === 'UL';
      const width = isGrid ? 1200 : 280;
      const height = isGrid ? 2000 : 300;
      return { width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON() {} };
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
        const body = JSON.parse(String(options?.body));
        requests.push({
          operationName: body.operationName,
          variables: body.variables,
          credentials: options?.credentials,
        });
        if (!['NativeConfiguration', 'V2Foundation', 'ExplorerSpaceTree'].includes(body.operationName))
          throw new Error(`Unserved operation: ${body.operationName}`);
        const data =
          body.operationName === 'NativeConfiguration'
            ? { config: foundationTestData().config }
            : body.operationName === 'V2Foundation'
              ? foundationTestData()
              : payload.data;
        return new Response(JSON.stringify({ data, extensions: { requestContext: anonymousContext } }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    render(<Root />);
    await screen.findByRole('link', { name: /Example root/ });
    expect(requests).toHaveLength(3);
    expect(requests.find(request => request.operationName === 'V2Foundation')?.variables).toEqual({
      origin: new URL('/', window.location.origin).href,
      resolveHomepage: false,
    });
    expect(requests.find(request => request.operationName === 'ExplorerSpaceTree')).toEqual({
      operationName: 'ExplorerSpaceTree',
      variables: { platform: foundationTestData().config.platformId },
      credentials: 'include',
    });
    expect(screen.getByRole('banner')).toBeVisible();
    expect(screen.getByRole('contentinfo')).toBeVisible();
    expect(screen.getByRole('link', { name: 'header.login' })).toHaveAttribute(
      'href',
      '/api/auth/oidc/login?returnTo=%2Fspaces'
    );
    for (const name of [
      'header.notifications',
      'header.messages',
      'header.profile',
      'header.myAccount',
      'header.logout',
    ]) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'header.search' })).toBeDisabled();
    expect(screen.queryByText('spaces.locked')).not.toBeInTheDocument();
    expect(screen.queryByText('crd-common:public')).not.toBeInTheDocument();
    expect(screen.getByText('crd-common:private')).toBeVisible();
    await waitFor(() => expect(requests).toHaveLength(3));
  });

  it('renders signed-in spaces while the requested Viewer failure stays visible', async () => {
    window.history.replaceState({}, '', '/spaces');
    const memberContext = {
      requester: '00000000-0000-0000-0000-000000000051',
      effective: '00000000-0000-0000-0000-000000000051',
      anonymous: false,
    };
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
        const body = JSON.parse(String(options?.body));
        requests.push({
          operationName: body.operationName,
          variables: body.variables,
          credentials: options?.credentials,
        });
        if (body.operationName === 'V2Foundation') {
          expect(body.query).toMatch(/viewer\s*\{/);
          expect(body.query).toMatch(/\bsettings\b/);
          expect(body.query).not.toMatch(/\bconfig\s*\{/);
          return new Response(
            JSON.stringify({
              data: null,
              errors: [{ message: 'Viewer is unavailable', path: ['viewer'], extensions: { code: 'UNAVAILABLE' } }],
              extensions: { requestContext: memberContext },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
        const data =
          body.operationName === 'NativeConfiguration'
            ? { config: foundationTestData().config }
            : body.operationName === 'ExplorerSpaceTree'
              ? payload.data
              : undefined;
        if (!data) throw new Error(`Unserved operation: ${body.operationName}`);
        return new Response(JSON.stringify({ data, extensions: { requestContext: memberContext } }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    render(<Root />);
    await waitFor(() =>
      expect(requests.filter(request => request.operationName === 'ExplorerSpaceTree')).toHaveLength(1)
    );
    expect(requests.find(request => request.operationName === 'ExplorerSpaceTree')).toEqual({
      operationName: 'ExplorerSpaceTree',
      variables: { platform: foundationTestData().config.platformId },
      credentials: 'include',
    });
    expect(await screen.findByRole('link', { name: /Example root/ })).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Viewer is unavailable');
    expect(requests.filter(request => request.operationName === 'V2Foundation')).toHaveLength(1);
    expect(requests.filter(request => request.operationName === 'NativeConfiguration')).toHaveLength(1);
  });

  it.each(['/', '/home'])('keeps %s explicit when deployed homepage resolution is unsupported', async path => {
    window.history.replaceState({}, '', path + '?returnTo=work#cards');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetch = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body));
      if (body.operationName === 'NativeConfiguration')
        return new Response(
          JSON.stringify({
            data: { config: foundationTestData().config },
            extensions: { requestContext: anonymousContext },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      expect(body.operationName).toBe('V2Foundation');
      expect(body.variables.resolveHomepage).toBe(true);
      return new Response(
        JSON.stringify({
          errors: [{ message: 'Homepage resolution is not implemented', extensions: { code: 'UNAVAILABLE' } }],
          extensions: { requestContext: anonymousContext },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    });
    vi.stubGlobal('fetch', fetch);
    render(<Root />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Homepage resolution is not implemented');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      path + '?returnTo=work#cards'
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('link', { name: /Example root/ })).not.toBeInTheDocument();
  });

  it('refuses an unimplemented route without mounting its old data connector', async () => {
    window.history.replaceState({}, '', '/admin');
    const fetch = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body));
      expect(['NativeConfiguration', 'V2Foundation']).toContain(body.operationName);
      return new Response(
        JSON.stringify({ data: foundationTestData(), extensions: { requestContext: anonymousContext } }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    });
    vi.stubGlobal('fetch', fetch);
    render(<Root />);
    expect(await screen.findByText('notFound.title')).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

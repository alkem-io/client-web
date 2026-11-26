import { ApolloProvider } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getOperationAST, parse } from 'graphql';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createV2ApolloLifetime } from '@/core/apollo/v2/createV2ApolloClient';
import { NativeConfigProvider } from '@/domain/platform/config/native/NativeConfigProvider';
import { useConfig } from '@/domain/platform/config/useConfig';
import { anonymousContext, foundationTestData, memberContext, memberFoundationTestData } from './foundationTestData';
import { NativeFoundationProvider, useNativeFoundation } from './NativeFoundationProvider';

afterEach(() => vi.unstubAllGlobals());

function Consumer() {
  const { data, error, loading } = useNativeFoundation();
  const config = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <span>{location.pathname}</span>
      <span>{loading ? 'pending' : error ? error.message : data?.viewer.id}</span>
      <span>{config.language?.default}</span>
      <span>{data?.resolve ? (data.resolve.homepage?.id ?? 'supported no homepage') : 'not requested'}</span>
      <button type="button" onClick={() => navigate('/home?language=nl#cards')}>
        Home
      </button>
      <button type="button" onClick={() => navigate('/spaces')}>
        Spaces
      </button>
    </>
  );
}

describe('one foundation observation', () => {
  it('loads the own identity and designed Actor settings with the Viewer session, language and home', async () => {
    const data = memberFoundationTestData();
    const fetch = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body));
      expect(body.operationName).toBe('V2Foundation');
      expect(body.query).toMatch(/actor\s*\{[\s\S]*actorType/);
      expect(body.query).toMatch(/session\s*\{[\s\S]*authMethods/);
      const operation = getOperationAST(parse(body.query));
      const viewer = operation?.selectionSet.selections.find(
        selection => selection.kind === 'Field' && selection.name.value === 'viewer'
      );
      if (viewer?.kind !== 'Field') throw new Error('Viewer selection is missing');
      const fields = viewer.selectionSet?.selections.filter(selection => selection.kind === 'Field');
      expect(fields?.map(field => field.name.value)).not.toContain('settings');
      const matrix = fields?.find(field => field.name.value === 'matrix');
      expect(
        matrix?.selectionSet?.selections.flatMap(selection =>
          selection.kind === 'Field' ? [selection.name.value] : []
        )
      ).toEqual(['userId', 'sessionBaseUrl', 'expiresAt', '__typename']);
      const actor = fields?.find(field => field.name.value === 'actor');
      const actorFields = actor?.selectionSet?.selections
        .filter(selection => selection.kind === 'Field')
        .map(field => field.name.value);
      expect(actorFields).toEqual(expect.arrayContaining(['settings', 'notificationPrefs']));
      expect(body.query).toMatch(/\blanguage\b/);
      expect(body.query).toMatch(/homeSpace\s*\{[\s\S]*url/);
      expect(options?.credentials).toBe('include');
      return new Response(JSON.stringify({ data, extensions: { requestContext: memberContext } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetch);
    function OwnViewer() {
      const foundation = useNativeFoundation();
      return <output>{JSON.stringify(foundation.data?.viewer)}</output>;
    }
    const { client } = createV2ApolloLifetime('/graphql').getSnapshot();
    const view = render(
      <ApolloProvider client={client}>
        <MemoryRouter initialEntries={['/spaces']}>
          <NativeFoundationProvider>
            <OwnViewer />
          </NativeFoundationProvider>
        </MemoryRouter>
      </ApolloProvider>
    );
    await waitFor(() => expect(JSON.parse(String(screen.getByRole('status').textContent))).toEqual(data.viewer));
    expect(fetch).toHaveBeenCalledTimes(1);
    view.unmount();
    client.stop();
  });

  it('keeps configuration independent while isolating conditional homepage variables and cached revisit', async () => {
    const requests: Array<{
      operationName: string;
      variables: { origin: string; resolveHomepage: boolean };
      query: string;
    }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
        const body = JSON.parse(String(options?.body));
        requests.push(body);
        const data = foundationTestData();
        if (!body.variables.resolveHomepage) delete data.resolve;
        return new Response(JSON.stringify({ data, extensions: { requestContext: anonymousContext } }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    const { client } = createV2ApolloLifetime('/graphql').getSnapshot();
    const view = render(
      <ApolloProvider client={client}>
        <MemoryRouter initialEntries={['/spaces']}>
          <NativeFoundationProvider>
            <NativeConfigProvider>
              <Consumer />
            </NativeConfigProvider>
          </NativeFoundationProvider>
        </MemoryRouter>
      </ApolloProvider>
    );
    await screen.findByText('not requested');
    expect(requests).toHaveLength(2);
    const initial = requests.find(request => request.operationName === 'V2Foundation');
    expect(initial?.variables).toEqual({
      origin: new URL('/', window.location.origin).href,
      resolveHomepage: false,
    });
    expect(initial?.query).not.toMatch(/\bspaces\b/);
    expect(initial?.query).not.toMatch(/\b(?:config|me|lookup|storage|notificationKinds)\b/);
    fireEvent.click(screen.getByText('Home'));
    await screen.findByText('supported no homepage');
    expect(requests).toHaveLength(3);
    expect(requests.filter(request => request.operationName === 'V2Foundation')[1].variables.resolveHomepage).toBe(
      true
    );
    fireEvent.click(screen.getByText('Spaces'));
    await screen.findByText('not requested');
    fireEvent.click(screen.getByText('Home'));
    await screen.findByText('supported no homepage');
    await waitFor(() => expect(requests).toHaveLength(3));
    view.unmount();
    client.stop();
  });

  it('keeps unsupported homepage authorization as an error rather than a null homepage', async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            errors: [{ message: 'Homepage authorization is not implemented', extensions: { code: 'UNAVAILABLE' } }],
            extensions: { requestContext: anonymousContext },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
    );
    vi.stubGlobal('fetch', fetch);
    const { client } = createV2ApolloLifetime('/graphql').getSnapshot();
    const view = render(
      <ApolloProvider client={client}>
        <MemoryRouter initialEntries={['/home']}>
          <NativeFoundationProvider>
            <Consumer />
          </NativeFoundationProvider>
        </MemoryRouter>
      </ApolloProvider>
    );
    await screen.findByText('Homepage authorization is not implemented');
    expect(screen.queryByText('supported no homepage')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    view.unmount();
    client.stop();
  });
});

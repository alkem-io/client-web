import { gql, useApolloClient, useQuery } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useInvalidateV2Scope, useRetireV2ForNavigation, V2ApolloProvider } from './V2ApolloProvider';

const preferences = gql`query Preferences { node(id: "actor") { id settings } }`;
const probe = gql`query Face { node(id: "actor") { id about { displayName } } }`;
const member = {
  requester: '20000000-0000-0000-0000-000000000001',
  effective: '20000000-0000-0000-0000-000000000001',
  anonymous: false,
};
const guest = {
  requester: '10000000-0000-0000-0000-000000000001',
  effective: '10000000-0000-0000-0000-000000000001',
  anonymous: false,
};
const response = (context: typeof member, language: string | null) =>
  new Response(
    JSON.stringify({
      data: { node: { __typename: 'User', id: 'actor', settings: language ? { language } : null } },
      extensions: { requestContext: context },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );

afterEach(() => vi.unstubAllGlobals());

describe('mounted Apollo consumer lifetime', () => {
  it('unmounts old observers and private local state before the new identity renders', async () => {
    const retired = vi.fn();
    let mounted = 0;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(member, 'private-member-preference'))
      .mockResolvedValueOnce(response(guest, null))
      .mockResolvedValueOnce(response(guest, null));
    vi.stubGlobal('fetch', fetch);
    function Consumer() {
      const client = useApolloClient();
      const query = useQuery(preferences);
      const [copied, setCopied] = useState('');
      useEffect(() => {
        mounted++;
        return retired;
      }, []);
      if (query.data?.node.settings?.language && !copied) setCopied(query.data.node.settings.language);
      return (
        <>
          <span>{query.data?.node.settings?.language ?? 'no private preference'}</span>
          <span>local:{copied}</span>
          <button
            type="button"
            onClick={() => {
              void client.query({ query: probe }).catch(() => undefined);
            }}
          >
            Observe
          </button>
        </>
      );
    }
    const view = render(
      <V2ApolloProvider uri="/graphql">
        <Consumer />
      </V2ApolloProvider>
    );
    await screen.findByText('private-member-preference');
    expect(screen.getByText('local:private-member-preference')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Observe'));
    await waitFor(() => expect(mounted).toBe(2));
    expect(retired).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('private-member-preference')).not.toBeInTheDocument();
    expect(screen.queryByText('local:private-member-preference')).not.toBeInTheDocument();
    expect(screen.getByText('local:')).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    view.unmount();
  });

  it('refreshes actual consumers for a same-identity local scope change, including StrictMode cleanup', async () => {
    let permitted = true;
    const fetch = vi.fn(async () => response(member, permitted ? 'old-scope' : null));
    vi.stubGlobal('fetch', fetch);
    function Consumer() {
      const query = useQuery(preferences);
      const invalidate = useInvalidateV2Scope();
      return (
        <>
          <span>{query.data?.node.settings?.language ?? 'no preference'}</span>
          <button
            type="button"
            onClick={() => {
              void invalidate();
            }}
          >
            Scope changed
          </button>
        </>
      );
    }
    const view = render(
      <StrictMode>
        <V2ApolloProvider uri="/graphql">
          <Consumer />
        </V2ApolloProvider>
      </StrictMode>
    );
    await screen.findByText('old-scope');
    permitted = false;
    await act(async () => {
      fireEvent.click(screen.getByText('Scope changed'));
    });
    await screen.findByText('no preference');
    expect(screen.queryByText('old-scope')).not.toBeInTheDocument();
    await waitFor(() => expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2));
    view.unmount();
  });

  it('retires before full navigation without restarting the logout consumer or losing its retry state', async () => {
    const fetch = vi.fn(async () => response(member, 'private'));
    vi.stubGlobal('fetch', fetch);
    let client!: ReturnType<typeof useApolloClient>;
    const starts = vi.fn();
    function LogoutConsumer() {
      const currentClient = useApolloClient();
      const retire = useRetireV2ForNavigation();
      const [outcome, setOutcome] = useState('provider unavailable');
      useEffect(() => {
        client = currentClient;
        starts();
      }, [currentClient]);
      return (
        <>
          <span>{outcome}</span>
          <button
            type="button"
            onClick={() => {
              void retire().then(() => setOutcome('retry retained'));
            }}
          >
            Retire
          </button>
        </>
      );
    }
    const view = render(
      <V2ApolloProvider uri="/graphql">
        <LogoutConsumer />
      </V2ApolloProvider>
    );
    await act(async () => {
      await client.query({ query: preferences });
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Retire'));
    });
    await screen.findByText('retry retained');
    expect(starts).toHaveBeenCalledTimes(1);
    expect(client.cache.extract()).toEqual({});
    const failed = await client.query({ query: preferences }).catch(error => error);
    expect(failed.message).toContain('context changed');
    expect(fetch).toHaveBeenCalledTimes(1);
    view.unmount();
  });
});

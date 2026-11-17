/**
 * @vitest-environment jsdom
 */
import { ApolloClient, ApolloLink, ApolloProvider, gql, InMemoryCache, Observable, useQuery } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import useInvitationActions from './useInvitationActions';

// An on-screen query the old hand-picked accept refetch list did not cover.
const ProbeDocument = gql`
  query ActiveProbe {
    platform {
      id
    }
  }
`;

const setup = ({ failProbeRefetch = false } = {}) => {
  const operations: string[] = [];
  const link = new ApolloLink(
    operation =>
      new Observable(observer => {
        const { operationName } = operation;
        const probeCalls = operations.filter(name => name === 'ActiveProbe').length;
        operations.push(operationName);
        if (operationName === 'ActiveProbe' && failProbeRefetch && probeCalls > 0) {
          observer.error(new Error('refetch failed'));
          return;
        }
        const data =
          operationName === 'InvitationStateEvent'
            ? {
                eventOnInvitation: {
                  __typename: 'Invitation',
                  id: operation.variables.invitationId,
                  nextEvents: [],
                  state: 'accepted',
                  extraRolesWithheld: false,
                },
              }
            : operationName === 'ActiveProbe'
              ? { platform: { __typename: 'Platform', id: 'platform-1' } }
              : { me: null };
        observer.next({ data });
        observer.complete();
      })
  );
  const client = new ApolloClient({ link, cache: new InMemoryCache() });
  const wrapper = ({ children }: { children: ReactNode }) => createElement(ApolloProvider, { client, children });
  const onAccept = vi.fn();
  const { result } = renderHook(
    () => {
      const probe = useQuery(ProbeDocument);
      return { probe, actions: useInvitationActions({ onAccept }) };
    },
    { wrapper }
  );
  const probeFetches = () => operations.filter(name => name === 'ActiveProbe').length;
  return { client, result, operations, onAccept, probeFetches };
};

describe('useInvitationActions', () => {
  it('refetches every active query after a successful accept', async () => {
    const { result, onAccept, probeFetches } = setup();
    await waitFor(() => expect(result.current.probe.data).toBeDefined());
    expect(probeFetches()).toBe(1);

    await act(() => result.current.actions.acceptInvitation('invitation-1', '/space-1'));

    expect(onAccept).toHaveBeenCalledWith('/space-1');
    await waitFor(() => expect(probeFetches()).toBe(2));
  });

  it('stops serving queries cached before the accept that are not on screen', async () => {
    const OffScreenDocument = gql`
      query OffScreenProbe {
        me {
          id
        }
      }
    `;
    const { client, result, operations } = setup();
    await client.query({ query: OffScreenDocument });
    const offScreenFetches = () => operations.filter(name => name === 'OffScreenProbe').length;
    expect(offScreenFetches()).toBe(1);

    await act(() => result.current.actions.acceptInvitation('invitation-1', '/space-1'));
    await client.query({ query: OffScreenDocument });

    expect(offScreenFetches()).toBe(2);
  });

  it('does not refetch unrelated active queries after a reject', async () => {
    const { result, operations, probeFetches } = setup();
    await waitFor(() => expect(result.current.probe.data).toBeDefined());

    await act(() => result.current.actions.rejectInvitation('invitation-1'));

    await waitFor(() => expect(operations).toContain('PendingInvitationsCount'));
    expect(probeFetches()).toBe(1);
  });

  it('keeps a successful accept successful when the refetch fails', async () => {
    const { result, onAccept, probeFetches } = setup({ failProbeRefetch: true });
    await waitFor(() => expect(result.current.probe.data).toBeDefined());

    await act(() => result.current.actions.acceptInvitation('invitation-1', '/space-1'));

    expect(onAccept).toHaveBeenCalledWith('/space-1');
    await waitFor(() => expect(probeFetches()).toBe(2));
  });
});

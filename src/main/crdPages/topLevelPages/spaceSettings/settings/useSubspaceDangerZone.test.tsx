import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { useSubspaceDangerZone } from './useSubspaceDangerZone';

type Request = { operationName: string; variables: Record<string, unknown>; query: string };

function setup(canDelete: boolean, enabled = true) {
  const requests: Request[] = [];
  const replies: Record<string, Record<string, unknown>> = {
    SpaceSettingsDeleteGate: {
      node: {
        __typename: 'Space',
        id: 'sub-1',
        entityType: 'space',
        can: { __typename: 'SpaceCan', delete: canDelete },
      },
    },
    SpaceSettingsDeleteSpace: { deleteSpace: { __typename: 'DeleteResult', deletedId: 'sub-1' } },
  };
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const timer = setTimeout(() => {
            observer.next({ data: replies[operation.operationName] });
            observer.complete();
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>{children}</GlobalStateProvider>
    </ApolloProvider>
  );
  const hook = renderHook(() => useSubspaceDangerZone({ spaceId: 'sub-1', parentUrl: '/parent', enabled }), {
    wrapper,
  });
  return { ...hook, requests };
}

afterEach(() => vi.unstubAllGlobals());

describe('useSubspaceDangerZone — native delete verdict and deleteSpace', () => {
  it('offers the delete on the SpaceCan.delete verdict', async () => {
    const allowed = setup(true);
    await waitFor(() => expect(allowed.result.current.canDelete).toBe(true));
    expect(allowed.requests[0].variables).toEqual({ id: 'sub-1' });
    const denied = setup(false);
    await waitFor(() => expect(denied.requests).toHaveLength(1));
    expect(denied.result.current.canDelete).toBe(false);
  });

  it('reads nothing while the Settings tab of a subspace is not open', () => {
    const fixture = setup(true, false);
    expect(fixture.requests).toHaveLength(0);
    expect(fixture.result.current.canDelete).toBe(false);
  });

  it('deletes after confirmation and replaces the location with the parent space', async () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { ...window.location, replace });
    const fixture = setup(true);
    await waitFor(() => expect(fixture.result.current.canDelete).toBe(true));
    act(() => fixture.result.current.onDelete());
    expect(fixture.result.current.pendingDelete).toBe(true);
    act(() => fixture.result.current.confirmDelete());
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/parent'));
    expect(fixture.requests.find(r => r.operationName === 'SpaceSettingsDeleteSpace')?.variables).toEqual({
      id: 'sub-1',
    });
  });
});

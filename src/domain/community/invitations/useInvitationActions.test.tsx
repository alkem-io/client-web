import { ApolloProvider } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCapturingClient, type NativeReplies } from '@/main/crdPages/dashboard/nativeTestClient';
import useInvitationActions from './useInvitationActions';

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { exists: () => false } }),
}));

const respondReply = (variables: Record<string, unknown>) => ({
  respondToRequest: {
    __typename: 'MembershipResult',
    request: {
      __typename: 'MembershipRequest',
      id: variables.id,
      state: variables.event === 'ACCEPT' ? 'ACCEPTING' : 'REJECTED',
      availableEvents: [],
      withheldRoles: [],
    },
  },
});

const refetchReplies: NativeReplies = {
  V2PendingMemberships: () => ({
    viewer: { __typename: 'Viewer', id: 'user-1', pendingInvitations: [], pendingApplications: [] },
  }),
  V2DashboardMembershipProbe: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
  V2DashboardFeedSpaces: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
};

const setup = (replies: NativeReplies, params: Parameters<typeof useInvitationActions>[0] = {}) => {
  const native = createCapturingClient({ ...refetchReplies, ...replies });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={native.client}>{children}</ApolloProvider>
  );
  const hook = renderHook(() => useInvitationActions(params), { wrapper });
  return { ...hook, ...native };
};

afterEach(() => vi.clearAllMocks());

describe('useInvitationActions → Mutation.respondToRequest (screens-dispositions.tsv:10977)', () => {
  it('accepts with the ACCEPT lifecycle event and refetches the pending requests and the memberships', async () => {
    const onAccept = vi.fn();
    const { result, requests } = setup({ V2RespondToRequest: respondReply }, { onAccept });

    await act(async () => {
      await result.current.acceptInvitation('request-1', '/space-1');
    });

    expect(requests[0].operationName).toBe('V2RespondToRequest');
    expect(requests[0].variables).toEqual({ id: 'request-1', event: 'ACCEPT' });
    expect(requests[0].query).toContain('respondToRequest(id: $id, event: $event)');
    expect(
      requests
        .slice(1)
        .map(r => r.operationName)
        .sort()
    ).toEqual(['V2DashboardFeedSpaces', 'V2DashboardMembershipProbe', 'V2PendingMemberships']);
    expect(onAccept).toHaveBeenCalledWith('/space-1', expect.objectContaining({ id: 'request-1', state: 'ACCEPTING' }));
  });

  it('declines with the REJECT lifecycle event and refetches only the pending requests', async () => {
    const onReject = vi.fn();
    const { result, requests } = setup({ V2RespondToRequest: respondReply }, { onReject });

    await act(async () => {
      await result.current.rejectInvitation('request-2');
    });

    expect(requests[0].variables).toEqual({ id: 'request-2', event: 'REJECT' });
    expect(requests.slice(1).map(r => r.operationName)).toEqual(['V2PendingMemberships']);
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('a refused answer is shown through the Apollo error handler and rejects, never reported as done', async () => {
    const onAccept = vi.fn();
    const { result } = setup(
      {
        V2RespondToRequest: () => {
          throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        },
      },
      { onAccept }
    );

    await act(async () => {
      await expect(result.current.acceptInvitation('request-3', '/space-3')).rejects.toBeTruthy();
    });

    expect(notifyMock).toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
  });
});

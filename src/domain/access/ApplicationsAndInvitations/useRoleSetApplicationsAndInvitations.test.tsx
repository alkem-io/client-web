import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { MembershipRequestRowFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';

const handleError = vi.fn();
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({ useApolloErrorHandler: () => handleError }));

import useRoleSetApplicationsAndInvitations from './useRoleSetApplicationsAndInvitations';

type Sent = { operationName: string; variables: Record<string, unknown>; query: string };
type Reply = (variables: Record<string, unknown>) => { data?: unknown; errors?: unknown[] };

const row = (overrides: Partial<MembershipRequestRowFragment>): MembershipRequestRowFragment => ({
  __typename: 'MembershipRequest',
  id: 'r',
  direction: 'INBOUND',
  state: 'NEW',
  roles: ['member'],
  email: null,
  message: null,
  answers: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  decidedAt: null,
  availableEvents: [],
  actor: null,
  ...overrides,
});

const user = (id: string) => ({
  __typename: 'User' as const,
  id,
  actorType: 'user',
  url: `/user/${id}`,
  about: { __typename: 'About' as const, displayName: `User ${id}`, location: null, avatar: null },
});

const page = (rows: MembershipRequestRowFragment[], endCursor: string | null = null) => ({
  requests: {
    __typename: 'MembershipRequestConnection',
    edges: rows.map(node => ({ __typename: 'MembershipRequestEdge', node })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});

function setup(replies: Record<string, Reply[]>, roleSetId = 'space-1') {
  const sent: Sent[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const reply = replies[operation.operationName]?.shift();
          setTimeout(() => {
            if (!reply) observer.error(new Error(`Unexpected ${operation.operationName}`));
            else {
              observer.next(reply(operation.variables) as never);
              observer.complete();
            }
          }, 0);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const hook = renderHook(() => useRoleSetApplicationsAndInvitations({ roleSetId }), { wrapper });
  return { ...hook, sent };
}

describe('useRoleSetApplicationsAndInvitations (native requests)', () => {
  it('reads Query.requests of the resource to its end and splits applications, invitations and email invitations', async () => {
    const fixture = setup({
      MembershipRequests: [
        () => ({
          data: page(
            [
              row({
                id: 'app-1',
                actor: user('u1'),
                availableEvents: ['APPROVE', 'REJECT'],
                answers: [
                  { question: 'Why?', value: 'Because', sort_order: 2 },
                  { question: 'Who?', value: 'Me', sort_order: 1 },
                ],
              }),
              row({ id: 'app-archived', state: 'ARCHIVED', actor: user('u2') }),
            ],
            'cursor-1'
          ),
        }),
        () => ({
          data: page([
            row({
              id: 'inv-1',
              direction: 'OUTBOUND',
              state: 'INVITED',
              roles: ['member', 'lead'],
              actor: user('u3'),
              decidedAt: null,
            }),
            row({ id: 'pi-1', direction: 'OUTBOUND', state: 'INVITED', email: 'new@example.org' }),
            row({ id: 'pi-cancelled', direction: 'OUTBOUND', state: null, email: 'gone@example.org' }),
          ]),
        }),
      ],
    });

    await waitFor(() => expect(fixture.result.current.loading).toBe(false));
    const reads = fixture.sent.filter(s => s.operationName === 'MembershipRequests');
    expect(reads.map(s => s.variables)).toEqual([
      { resource: 'space-1', first: 100 },
      { resource: 'space-1', first: 100, after: 'cursor-1' },
    ]);
    expect(reads[0].query).toContain('requests(resource: $resource, first: $first, after: $after)');
    expect(reads[0].query).not.toMatch(/lookup|roleSet/);

    const { applications, invitations, platformInvitations } = fixture.result.current;
    expect(applications.map(a => [a.id, a.state])).toEqual([
      ['app-1', 'new'],
      ['app-archived', 'archived'],
    ]);
    expect(applications[0]).toMatchObject({
      contributorType: ActorType.User,
      nextEvents: ['APPROVE', 'REJECT'],
      actor: { id: 'u1', profile: { displayName: 'User u1', url: '/user/u1' } },
      questions: [
        { id: '0', name: 'Who?', value: 'Me' },
        { id: '1', name: 'Why?', value: 'Because' },
      ],
    });
    expect(invitations).toEqual([
      expect.objectContaining({ id: 'inv-1', state: 'invited', extraRoles: ['lead'], contributorType: ActorType.User }),
    ]);
    expect(platformInvitations).toEqual([expect.objectContaining({ id: 'pi-1', email: 'new@example.org' })]);
  });

  it('revokes an open invitation with CANCEL and sends application events through respondToRequest', async () => {
    const respond: Reply = variables => ({
      data: {
        respondToRequest: {
          __typename: 'MembershipResult',
          request: { __typename: 'MembershipRequest', id: variables.id, state: 'REJECTED', availableEvents: [] },
        },
      },
    });
    const fixture = setup({
      MembershipRequests: [() => ({ data: page([]) }), () => ({ data: page([]) }), () => ({ data: page([]) })],
      RespondToMembershipRequest: [respond, respond],
    });
    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    await act(() => fixture.result.current.deleteInvitation('inv-1'));
    await act(() => fixture.result.current.applicationStateChange('app-1', 'REJECT'));

    const writes = fixture.sent.filter(s => s.operationName === 'RespondToMembershipRequest');
    expect(writes.map(s => s.variables)).toEqual([
      { id: 'inv-1', event: 'CANCEL' },
      { id: 'app-1', event: 'REJECT' },
    ]);
    expect(writes[0].query).toContain('respondToRequest(id: $id, event: $event)');
  });

  it('shows a refused request through useApolloErrorHandler and rejects', async () => {
    const fixture = setup({
      MembershipRequests: [() => ({ data: page([]) })],
      RespondToMembershipRequest: [() => ({ errors: [{ message: 'denied', extensions: { code: 'FORBIDDEN' } }] })],
    });
    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    await act(async () => {
      await expect(fixture.result.current.deletePlatformInvitation('pi-1')).rejects.toBeTruthy();
    });
    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('resends an email invitation through resendInvitation', async () => {
    const fixture = setup({
      MembershipRequests: [() => ({ data: page([]) })],
      ResendMembershipInvitation: [
        variables => ({ data: { resendInvitation: { __typename: 'MembershipRequest', id: variables.id } } }),
      ],
    });
    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    await act(() => fixture.result.current.resendPlatformInvitation('pi-1'));
    expect(fixture.sent.find(s => s.operationName === 'ResendMembershipInvitation')?.variables).toEqual({ id: 'pi-1' });
  });
});

import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MembershipRequestsDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import type { MembershipRequestRowFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const dialog = vi.fn();
vi.mock('@/crd/components/space/settings/MembershipDetailDialog', () => ({
  MembershipDetailDialog: (props: Record<string, unknown>) => {
    dialog(props);
    return null;
  },
}));

import { MembershipDetailDialogConnector, type ViewingMembership } from './MembershipDetailDialogConnector';

const request = (overrides: Partial<MembershipRequestRowFragment>): MembershipRequestRowFragment => ({
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

function renderWith(rows: MembershipRequestRowFragment[], membership: ViewingMembership | null) {
  const requests: unknown[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(operation => {
      requests.push(operation.operationName);
      return new Observable(observer => observer.error(new Error('the dialog must not read')));
    }),
  });
  // The rows as the pending table's `requests` read left them in the cache.
  client.writeQuery({
    query: MembershipRequestsDocument,
    variables: { resource: 'space-1', first: 100 },
    data: {
      requests: {
        __typename: 'MembershipRequestConnection',
        edges: rows.map(node => ({ __typename: 'MembershipRequestEdge', node })),
        pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
      },
    },
  });
  render(
    <ApolloProvider client={client}>
      <MembershipDetailDialogConnector membership={membership} onOpenChange={() => {}} />
    </ApolloProvider>
  );
  return { requests, props: dialog.mock.calls[dialog.mock.calls.length - 1][0] };
}

describe('MembershipDetailDialogConnector (the requests row, A9.25)', () => {
  it('shows an application from its list row: answers by sort_order, location, decided date', () => {
    const { requests, props } = renderWith(
      [
        request({
          id: 'app-1',
          decidedAt: '2026-02-01T00:00:00.000Z',
          answers: [
            { question: 'B', value: 'second', sort_order: 2 },
            { question: 'A', value: 'first', sort_order: 1 },
          ],
          actor: {
            __typename: 'User',
            id: 'u1',
            actorType: 'user',
            url: '/user/u1',
            about: {
              __typename: 'About',
              displayName: 'Alice',
              location: { city: 'Delft', country: 'NL' },
              avatar: { __typename: 'FileRef', file: { __typename: 'File', url: '/a.png' } },
            },
          },
        }),
      ],
      { id: 'app-1', type: 'application' }
    );

    expect(requests).toEqual([]);
    expect(props).toMatchObject({
      open: true,
      kind: 'application',
      loading: false,
      displayName: 'Alice',
      avatarUrl: '/a.png',
      city: 'Delft',
      country: 'NL',
      createdDate: '2026-01-01T00:00:00.000Z',
      updatedDate: '2026-02-01T00:00:00.000Z',
      questions: [
        { id: '0', question: 'A', answer: 'first' },
        { id: '1', question: 'B', answer: 'second' },
      ],
    });
  });

  it('shows an email invitation with its address and welcome message', () => {
    const { props } = renderWith(
      [request({ id: 'pi-1', direction: 'OUTBOUND', state: 'INVITED', email: 'new@example.org', message: 'Welcome' })],
      { id: 'pi-1', type: 'platformInvitation' }
    );
    expect(props).toMatchObject({
      kind: 'invitation',
      loading: false,
      email: 'new@example.org',
      welcomeMessage: 'Welcome',
      updatedDate: '2026-01-01T00:00:00.000Z',
    });
  });

  it('is closed and reads nothing without a membership', () => {
    const { requests, props } = renderWith([], null);
    expect(requests).toEqual([]);
    expect(props).toMatchObject({ open: false, loading: false });
  });
});

import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import { CrdSpaceCommunityDialogConnector } from './CrdSpaceCommunityDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', exists: () => false } }),
}));
vi.mock('@/crd/components/space/SubspaceCommunityDialog', () => ({
  SubspaceCommunityDialog: ({ open, children }: { open: boolean; children: ReactNode }) => (open ? children : null),
}));
vi.mock('@/crd/components/space/SpaceMembers', () => ({
  SpaceMembers: ({ members }: { members: MemberCardData[] }) => <output aria-label="members">{members.length}</output>,
}));

const member = (index: number) => ({
  __typename: 'Member',
  id: `m${index}`,
  roles: ['member'],
  joinedAt: null,
  actor: {
    __typename: 'User',
    id: `user-${index}`,
    actorType: 'user',
    url: `/user/${index}`,
    about: { __typename: 'About', displayName: `User ${index}`, avatar: null, location: null, description: null },
    skills: [],
    keywords: [],
  },
});
const page = (from: number, to: number, hasNextPage: boolean) => ({
  members: {
    __typename: 'MemberConnection',
    edges: Array.from({ length: to - from }, (_, offset) => ({
      __typename: 'MemberEdge',
      cursor: `c${from + offset + 1}`,
      node: member(from + offset + 1),
    })),
    pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: `c${to}` },
    totalCount: 501,
  },
});

function setup(open: boolean) {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation);
          observer.next({ data: operation.variables.after ? page(500, 501, false) : page(0, 500, true) });
          observer.complete();
        })
    ),
  });
  const view = (isOpen: boolean) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>
        <CrdSpaceCommunityDialogConnector open={isOpen} onOpenChange={vi.fn()} roleSetId="space" />
      </GlobalStateProvider>
    </ApolloProvider>
  );
  const { rerender } = render(view(open));
  return { sent, reopen: (isOpen: boolean) => rerender(view(isOpen)) };
}

describe('CrdSpaceCommunityDialogConnector (021 T016, D6)', () => {
  test('nothing is sent while the dialog is closed', async () => {
    const { sent } = setup(false);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent).toEqual([]);
  });

  test('opening sends one SpaceCommunity; a 501-member roster lists all after one continuation', async () => {
    const { sent, reopen } = setup(false);
    reopen(true);
    await waitFor(() => expect(screen.getByLabelText('members')).toHaveTextContent('501'));
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpaceCommunity', { space: 'space', first: 500 }],
      ['SpaceCommunity', { space: 'space', first: 500, after: 'c500' }],
    ]);
    // closing and reopening reads the cached roster
    reopen(false);
    reopen(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent).toHaveLength(2);
  });
});

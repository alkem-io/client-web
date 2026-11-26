import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SpacePageDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spacePageVariables, spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { nativePost, nativeResponseRow, treeOf } from '../../space/dataMappers/nativePostFixtures.test-utils';
import { CrdSubspaceIndexDialogConnector } from './CrdSubspaceIndexDialogConnector';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

// The subspace's tree: six posts alternating between the two stages, and a response row the index does not list.
const post = (index: number) =>
  nativePost(`p${index}`, {
    url: `/root/challenges/l1/collaboration/p${index}`,
    sortOrder: index,
    stage: { __typename: 'Stage', id: index % 2 ? 'stage-b' : 'stage-a' },
  });
const tree = treeOf([...Array.from({ length: 6 }, (_, index) => post(index)), nativeResponseRow('p0', 'r1')]);
const NOT_SERVED = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};

function setup(id = 'l1', served = true) {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation);
          observer.next(served ? { data: { tree } } : NOT_SERVED);
          observer.complete();
        })
    ),
  });
  // The page's D2 Space document: the stage names and order the index groups by.
  client.writeQuery({
    query: SpacePageDocument,
    variables: spacePageVariables(id, ['space']),
    data: {
      node: {
        __typename: 'Space',
        id,
        entityType: 'space',
        handle: 'l1',
        url: '/root/challenges/l1',
        depth: 1,
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        tags: [],
        isContentPublic: true,
        settings: null,
        videoCallUrl: null,
        memberCount: null,
        about: {
          __typename: 'About',
          displayName: 'Subspace',
          tagline: null,
          description: null,
          location: null,
          facets: [],
          avatar: null,
          banner: null,
          card: null,
        },
        links: [],
        classifications: [],
        guidelines: null,
        applicationForm: null,
        host: null,
        leads: null,
        membership: null,
        parent: null,
        entitlements: null,
        can: {
          __typename: 'SpaceCan',
          ...Object.fromEntries(
            [
              'read',
              'update',
              'delete',
              'archive',
              'createPost',
              'createSubspace',
              'createDocument',
              'invite',
              'manageMembers',
              'manageTemplates',
              'upload',
              'readActivity',
              'saveAsTemplate',
              'join',
              'apply',
            ].map(flag => [flag, true])
          ),
        },
        stages: [
          { __typename: 'Stage', id: 'stage-a', name: 'Explore', description: null, sortOrder: 1 },
          { __typename: 'Stage', id: 'stage-b', name: 'Build', description: null, sortOrder: 2 },
        ],
      },
    },
  });
  const view = (open: boolean) => (
    <ApolloProvider client={client}>
      <CrdSubspaceIndexDialogConnector
        open={open}
        onOpenChange={() => {}}
        calloutsSetId={id}
        phaseNames={['Explore', 'Build']}
      />
    </ApolloProvider>
  );
  return { sent, view };
}

describe('CrdSubspaceIndexDialogConnector (021 T021, D9)', () => {
  test("nothing while closed; on open the page's one space tree lists the subspace's posts, grouped by stage", async () => {
    const { sent, view } = setup();
    const { rerender } = render(view(false));
    expect(sent).toHaveLength(0);

    rerender(view(true));
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(6));
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpaceTree', spaceTreeVariables('l1')],
    ]);
    const [explore, build] = screen.getAllByRole('list');
    expect(within(explore).getAllByRole('link')).toHaveLength(3);
    expect(within(build).getAllByRole('link')[0]).toHaveAttribute('href', '/root/challenges/l1/collaboration/p1');
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.queryByText('Response r1')).not.toBeInTheDocument();
  });

  test('a space tree the server does not serve yet: the index says so in place, asked once', async () => {
    const { sent, view } = setup('l1-tree-not-served', false);
    const { rerender } = render(view(true));
    expect(await screen.findByText('tabs.unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    rerender(view(false));
    rerender(view(true));
    await waitFor(() => expect(screen.getByText('tabs.unavailable')).toBeInTheDocument());
    expect(sent.map(operation => operation.operationName)).toEqual(['SpaceTree']);
  });
});

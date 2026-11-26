import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SpaceTreeDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { nativePost, nativeResponseRow, treeOf } from '../dataMappers/nativePostFixtures.test-utils';
import { PostIndexDialogConnector } from './PostIndexDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('./CrdCalloutDialogById', () => ({ CrdCalloutDialogById: () => null }));
// The route resolution's space stages (D1 SpaceInputs): tab 1 is the first stage in the designed order.
vi.mock('@/main/routing/urlResolver/native/useNativeRouteSpace', () => ({
  useNativeRouteSpace: () => ({
    space: {
      stages: [
        { id: 'build', sortOrder: 2 },
        { id: 'explore', sortOrder: 1 },
      ],
    },
  }),
}));

const stage = (id: string) => ({ __typename: 'Stage' as const, id });
// The space tree: posts of two stages (depth 1) and a response of the first (depth 2), which the index does not list.
const tree = treeOf([
  nativePost('p2', { sortOrder: 2, stage: stage('explore') }),
  nativeResponseRow('p0', 'r1', { stage: stage('explore') }),
  nativePost('p0', { sortOrder: 0, stage: stage('explore') }),
  nativePost('p1', { sortOrder: 1, stage: stage('explore') }),
  nativePost('b1', { sortOrder: 3, stage: stage('build') }),
]);
const SCHEMA = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};
type Mode = { tree: 'served' | 'not served' | 'cached' };

function setup(space: string, { tree: treeMode }: Mode) {
  const operations: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          operations.push(operation.operationName);
          expect(operation.variables).toEqual(spaceTreeVariables(space));
          observer.next(treeMode === 'not served' ? SCHEMA : { data: { tree } });
          observer.complete();
        })
    ),
  });
  if (treeMode === 'cached') {
    client.writeQuery({ query: SpaceTreeDocument, variables: spaceTreeVariables(space), data: { tree } });
  }
  const view = (open: boolean) => (
    <ApolloProvider client={client}>
      <PostIndexDialogConnector
        open={open}
        onOpenChange={vi.fn()}
        calloutsSetId={space}
        classificationTagsets={[]}
        tabSectionNumber={1}
      />
    </ApolloProvider>
  );
  return { operations, view };
}

describe('PostIndexDialogConnector (021 D9)', () => {
  test("closed sends nothing; open reads the space tree once and lists the tab stage's own posts", async () => {
    const { operations, view } = setup('space-1', { tree: 'served' });
    const { rerender } = render(view(false));
    expect(operations).toEqual([]);

    rerender(view(true));
    expect(await screen.findByText('Post p2')).toBeInTheDocument();
    expect(screen.getAllByText(/^Post [pb]\d$/).map(item => item.textContent)).toEqual([
      'Post p0',
      'Post p1',
      'Post p2',
    ]);
    expect(screen.queryByText('Response r1')).not.toBeInTheDocument();
    expect(operations).toEqual(['SpaceTree']);
  });

  test('the space tree the page already cached answers the index with no request', async () => {
    const { operations, view } = setup('space-2', { tree: 'cached' });
    render(view(true));
    expect(await screen.findByText('Post p0')).toBeInTheDocument();
    expect(operations).toEqual([]);
  });

  test('a space tree the server does not serve yet: the index says so, asked once', async () => {
    const { operations, view } = setup('space-tree-not-served', { tree: 'not served' });
    const { rerender } = render(view(true));
    expect(await screen.findByText('tabs.unavailable')).toBeInTheDocument();
    rerender(view(false));
    rerender(view(true));
    await waitFor(() => expect(screen.getByText('tabs.unavailable')).toBeInTheDocument());
    expect(operations).toEqual(['SpaceTree']);
  });
});

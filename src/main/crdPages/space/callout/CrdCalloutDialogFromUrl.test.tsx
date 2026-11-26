import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PostDetailDocument, SpaceTreeDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { nativePost, nativeResponseRow, treeOf } from '../dataMappers/nativePostFixtures.test-utils';
import { CrdCalloutDialogFromUrl } from './CrdCalloutDialogFromUrl';

const route = vi.hoisted(() => ({ post: { id: 'p1', parentPost: null as { id: string } | null } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
    i18n: { language: 'en' },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-1', loading: false }),
}));
vi.mock('@/main/routing/urlResolver/native/useNativeRouteSpace', () => ({
  useNativeRouteSpace: () => ({ post: route.post }),
}));
vi.mock('@/main/ui/layout/MemoSigningReturnContext', () => ({
  useMemoSigningReturnContext: () => ({
    setRestoreIntent: vi.fn(),
    setRestoreResolution: vi.fn(),
    setRouteSettlement: vi.fn(),
  }),
}));
// Write controls owned by another task, with legacy reads of their own: not part of the dialog's read path here.
vi.mock('./CalloutSettingsConnector', () => ({ CalloutSettingsConnector: () => null }));
vi.mock('./CalloutShareDialog', () => ({ CalloutShareDialog: () => null }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

const response = (id: string) =>
  nativeResponseRow('p1', id, {
    room: null,
    sortOrder: Number(id.slice(1)),
    links: [
      {
        __typename: 'Link',
        id: `l-${id}`,
        title: `Spec ${id}`,
        description: null,
        uri: 'https://example.org',
        sortOrder: 0,
        file: null,
      },
    ],
  });

function renderColdUrl() {
  const operations: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(operation => {
      operations.push(operation.operationName);
      return Observable.of();
    }),
  });
  const post = nativePost('p1', { responseKind: 'text', responseCount: 2 });
  // The layout's SpacePageWithPost already carried the URL's post, `post: node(id: $post) { ...PostDetail }` (021 D2).
  const urlPost = route.post.parentPost ? response(route.post.id) : post;
  client.writeQuery({
    query: PostDetailDocument,
    variables: { id: urlPost.id },
    data: {
      post: {
        ...urlPost,
        entityType: 'post',
        space: { __typename: 'Space', id: 'space-1', url: '/space' },
        parentPost: urlPost.parentPost && { ...urlPost.parentPost, url: '/space/collaboration/p1' },
      },
    },
  });
  // The page's space tree holds the post and its responses (depth 2).
  client.writeQuery({
    query: SpaceTreeDocument,
    variables: spaceTreeVariables('space-1'),
    data: { tree: treeOf([post, response('r1'), response('r2')]) },
  });
  render(
    <ApolloProvider client={client}>
      <CrdCalloutDialogFromUrl onClose={vi.fn()} />
    </ApolloProvider>
  );
  return operations;
}

describe('CrdCalloutDialogFromUrl (021 D2, D4)', () => {
  test('a cold post URL opens the dialog from the post and the space tree the page load cached, with no request', async () => {
    route.post = { id: 'p1', parentPost: null };
    const operations = renderColdUrl();
    expect(await screen.findByText('Response r2')).toBeInTheDocument();
    expect(operations).toEqual([]);
  });

  test('a response URL opens its parent post with that response selected from the space tree, with no request', async () => {
    route.post = { id: 'r2', parentPost: { id: 'p1' } };
    const operations = renderColdUrl();
    const preview = await screen.findByLabelText('postPreview.label');
    expect(within(preview).getByText('Response r2')).toBeInTheDocument();
    expect(within(preview).queryByText('Response r1')).not.toBeInTheDocument();
    expect(within(preview).getByText('Spec r2')).toBeInTheDocument();
    expect(operations).toEqual([]);
  });
});

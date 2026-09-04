import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import CrdForumPage from './CrdForumPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const routeParams = vi.fn<() => { categorySlug?: string }>(() => ({}));

vi.mock('react-router-dom', async importOriginal => ({
  ...((await importOriginal()) as object),
  useParams: () => routeParams(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));

vi.mock('@/domain/community/user/hooks/useAuthorsDetails', () => ({
  useAuthorsDetails: () => ({ getAuthor: () => undefined }),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    loading: false,
    platformPrivilegeWrapper: { hasPlatformPrivilege: () => false },
  }),
}));

vi.mock('@/main/crdPages/topLevelPages/forum/useForumSubscription', () => ({
  useForumSubscription: () => {},
}));

// The server is deployed ahead of this client build: it sends an active
// category whose wire value the compiled enum has never seen.
const UNKNOWN_FROM_SERVER = 'FUTURE_CATEGORY' as ForumDiscussionCategory;

const discussionAt = (id: string, title: string, category: ForumDiscussionCategory) => ({
  id,
  profile: { id: `${id}-profile`, url: `/forum/discussion/${id}`, displayName: title },
  createdBy: 'user-1',
  timestamp: 1700000000,
  category,
  comments: { id: `${id}-comments`, messagesCount: 0 },
});

const discussions = [
  discussionAt('d-1', 'A help post', ForumDiscussionCategory.Help),
  discussionAt('d-2', 'An other post', ForumDiscussionCategory.Other),
  discussionAt('d-3', 'A future post', UNKNOWN_FROM_SERVER),
];

const usePlatformDiscussionsQuery = vi.fn(() => ({
  loading: false,
  subscribeToMore: vi.fn(),
  data: {
    platform: {
      id: 'platform-1',
      forum: {
        id: 'forum-1',
        // Deliberately omits `Other`: it models a category retired from the
        // active list that posts still carry, and so must still resolve.
        discussionCategories: [ForumDiscussionCategory.Help, UNKNOWN_FROM_SERVER],
        authorization: { id: 'forum-auth', myPrivileges: [] },
        discussions,
      },
    },
  },
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformDiscussionsQuery: () => usePlatformDiscussionsQuery(),
  useCreateDiscussionMutation: () => [vi.fn(), { loading: false }],
  refetchPlatformDiscussionsQuery: () => ({}),
}));

const renderedItemCount = () => screen.getAllByRole('listitem').length;
const isRendered = (title: string) => screen.queryByText(title) !== null;

// Guards the page-level slug -> category resolution. `categoryFor` returning
// `undefined` means "no category filter", so a category page that fails to
// resolve does not render empty — it renders the entire forum. That failure
// mode is invisible in a build whose enum happens to know every category the
// server sends, which is why the fixture deliberately includes one it doesn't.
describe('CrdForumPage — category filtering', () => {
  beforeEach(() => {
    routeParams.mockReturnValue({});
  });

  test('a category page the client build knows lists only that category', () => {
    routeParams.mockReturnValue({ categorySlug: 'help' });
    render(<CrdForumPage />);

    expect(renderedItemCount()).toBe(1);
    expect(isRendered('A help post')).toBe(true);
    expect(isRendered('An other post')).toBe(false);
  });

  test('a category page the client build does not know lists only that category, not the whole forum', () => {
    routeParams.mockReturnValue({ categorySlug: 'future-category' });
    render(<CrdForumPage />);

    expect(renderedItemCount()).toBe(1);
    expect(isRendered('A future post')).toBe(true);
    expect(isRendered('A help post')).toBe(false);
  });

  test('a retired category still filters, resolving from the compiled enum once it leaves the active list', () => {
    routeParams.mockReturnValue({ categorySlug: 'other' });
    render(<CrdForumPage />);

    expect(renderedItemCount()).toBe(1);
    expect(isRendered('An other post')).toBe(true);
  });

  test('the forum landing page lists every discussion', () => {
    render(<CrdForumPage />);

    expect(renderedItemCount()).toBe(discussions.length);
  });
});

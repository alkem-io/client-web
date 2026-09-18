import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege, ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import CrdDiscussionPage from './CrdDiscussionPage';

// Radix Select opens via pointer-capture APIs jsdom doesn't implement.
// These three stubs are the well-known minimum for exercising an actual
// open/select interaction in this environment (see @radix-ui/react-select
// issue trackers) — without them `hasPointerCapture` throws mid-click.
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ discussionId: 'discussion-1', loading: false }),
}));

vi.mock('@/domain/community/user/hooks/useAuthorsDetails', () => ({
  useAuthorsDetails: () => ({ getAuthor: () => undefined }),
}));

// Per-test platform privilege set. Default: none (an ordinary member).
let heldPlatformPrivileges: AuthorizationPrivilege[] = [];
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    platformPrivilegeWrapper: {
      hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => heldPlatformPrivileges.includes(privilege),
    },
  }),
}));

vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));

vi.mock('@/main/crdPages/topLevelPages/forum/DiscussionCommentsConnector', () => ({
  DiscussionCommentsConnector: () => <div data-testid="comments-stub" />,
}));

vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value }: { value: string }) => <div data-testid="markdown">{value}</div>,
}));
vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));

const activeCategories = [
  ForumDiscussionCategory.Help,
  ForumDiscussionCategory.Other,
  ForumDiscussionCategory.TipsAndTricks,
];

const discussion = {
  id: 'discussion-1',
  profile: {
    id: 'profile-1',
    url: 'http://localhost:3000/forum/discussion/a-post',
    displayName: 'An existing post',
    description: 'Body',
  },
  createdBy: 'user-1',
  timestamp: 1700000000,
  category: ForumDiscussionCategory.Other,
  comments: {
    id: 'comments-1',
    messagesCount: 0,
    authorization: { myPrivileges: [] },
    messages: [],
  },
  authorization: { myPrivileges: [AuthorizationPrivilege.Update] },
};

// Per-test active list (the forum's own `discussionCategories`). Default: the
// three member categories above.
let forumActiveCategories: ForumDiscussionCategory[] = activeCategories;

const usePlatformDiscussionQuery = vi.fn(() => ({
  loading: false,
  data: {
    platform: {
      id: 'platform-1',
      forum: {
        id: 'forum-1',
        discussionCategories: forumActiveCategories,
        authorization: { id: 'forum-auth', myPrivileges: [] },
        discussion,
      },
    },
  },
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformDiscussionQuery: () => usePlatformDiscussionQuery(),
  useDeleteDiscussionMutation: () => [vi.fn(), { loading: false }],
  useCreateDiscussionMutation: () => [vi.fn(), { loading: false }],
  useUpdateDiscussionMutation: () => [vi.fn(), { loading: false }],
  refetchPlatformDiscussionsQuery: () => ({}),
  refetchPlatformDiscussionQuery: () => ({}),
}));

// Guards the CrdDiscussionPage -> availableCategoriesFor wiring (the page-level
// call site the pure-helper and connector-level tests below it don't reach —
// see forumDataMapper.test.tsx for the helper's own unit coverage and
// ForumDiscussionFormConnector.test.tsx for the enabled/disabled lock).
// A regression that hardcodes `availableCategories={[rawDiscussion.category]}`
// again, or drops `discussionCategories` from the query so the active list
// resolves empty, collapses the edit dialog back to a single-option selector
// and this test catches it.
const editorialCategories = [ForumDiscussionCategory.Releases, ForumDiscussionCategory.Newsletter];

const openEditCategoryListbox = async () => {
  const user = userEvent.setup();
  render(<CrdDiscussionPage />);

  const editButton = await screen.findByRole('button', { name: 'detail.edit' });
  await user.click(editButton);

  const categorySelect = await screen.findByRole('combobox');
  await user.click(categorySelect);

  return screen.findByRole('listbox');
};

describe('CrdDiscussionPage — edit dialog category wiring', () => {
  afterEach(() => {
    heldPlatformPrivileges = [];
    forumActiveCategories = activeCategories;
  });

  // 027-platform-role-redesign A15 (spec-clientweb-5): the forum is owned by
  // `PLATFORM_FORUM_MANAGE`, the same disjunction CrdForumPage already uses.
  // A Platform Support holder — who has that privilege and NOT the retiring
  // `PLATFORM_ADMIN` catch-all — must be offered the editorial categories
  // when re-categorising a post, exactly as on the forum page.
  test('a PLATFORM_FORUM_MANAGE holder without PLATFORM_ADMIN is offered the editorial categories', async () => {
    heldPlatformPrivileges = [AuthorizationPrivilege.PlatformForumManage];
    forumActiveCategories = [...activeCategories, ...editorialCategories];

    const listbox = await openEditCategoryListbox();

    await waitFor(() => {
      expect(within(listbox).getAllByRole('option')).toHaveLength(activeCategories.length + editorialCategories.length);
    });
    const optionValues = within(listbox)
      .getAllByRole('option')
      .map(option => option.textContent);
    for (const category of editorialCategories) {
      expect(optionValues).toContain(`common.enums.discussion-category.${category}`);
    }
  });

  test('a member without any forum privilege is not offered the editorial categories, even when active', async () => {
    forumActiveCategories = [...activeCategories, ...editorialCategories];

    const listbox = await openEditCategoryListbox();

    await waitFor(() => {
      expect(within(listbox).getAllByRole('option')).toHaveLength(activeCategories.length);
    });
  });

  test('the edit dialog offers every active category, not just the post’s current one', async () => {
    const user = userEvent.setup();
    render(<CrdDiscussionPage />);

    const editButton = await screen.findByRole('button', { name: 'detail.edit' });
    await user.click(editButton);

    const categorySelect = await screen.findByRole('combobox');
    await user.click(categorySelect);

    const listbox = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(within(listbox).getAllByRole('option')).toHaveLength(activeCategories.length);
    });

    const optionValues = within(listbox)
      .getAllByRole('option')
      .map(option => option.textContent);
    expect(optionValues).toEqual(activeCategories.map(category => `common.enums.discussion-category.${category}`));
  });
});

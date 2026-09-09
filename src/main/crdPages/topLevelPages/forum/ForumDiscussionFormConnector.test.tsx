import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import { ForumDiscussionFormConnector } from './ForumDiscussionFormConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Heavy deps unrelated to the disabled/enabled behavior under test — stub
// them so this stays a focused render check.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value }: { value: string }) => <div data-testid="markdown">{value}</div>,
}));
vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateDiscussionMutation: () => [vi.fn(), { loading: false }],
  useUpdateDiscussionMutation: () => [vi.fn(), { loading: false }],
  refetchPlatformDiscussionsQuery: () => ({}),
  refetchPlatformDiscussionQuery: () => ({}),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));

describe('ForumDiscussionFormConnector — category selector lock (A-05)', () => {
  test('the category Select is enabled while editing an existing discussion', () => {
    render(
      <ForumDiscussionFormConnector
        mode="update"
        discussion={{
          id: 'discussion-1',
          title: 'An existing post',
          description: 'Body',
          category: ForumDiscussionCategory.Other,
        }}
        availableCategories={[ForumDiscussionCategory.Other, ForumDiscussionCategory.TipsAndTricks]}
        onStateChange={vi.fn()}
        onCompleted={vi.fn()}
      />
    );

    const categorySelect = screen.getByRole('combobox');
    expect(categorySelect).not.toBeDisabled();
    expect(categorySelect).not.toHaveAttribute('data-disabled');
  });
});

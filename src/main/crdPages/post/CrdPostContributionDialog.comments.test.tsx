import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { CrdPostContributionDialog } from './CrdPostContributionDialog';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePostSettingsQuery: () => ({
    data: {
      lookup: {
        post: {
          id: 'post-1',
          authorization: { myPrivileges: [AuthorizationPrivilege.Update] },
          profile: {
            id: 'profile-1',
            displayName: 'Original title',
            description: 'Original description',
            tagset: { id: 'tagset-1', tags: [] },
            references: [],
          },
        },
      },
    },
    loading: false,
  }),
  usePostCalloutsInCalloutSetQuery: () => ({ data: undefined, refetch: vi.fn() }),
  // A post that DOES have a comments room — the interesting case: the room exists,
  // so any edit-mode comment surface would render.
  useCalloutContributionCommentsQuery: () => ({
    data: { lookup: { contribution: { post: { comments: { id: 'room-1', messagesCount: 2, messages: [] } } } } },
  }),
  useCreatePostOnCalloutMutation: () => [vi.fn(), { loading: false }],
  useUpdatePostMutation: () => [vi.fn(), { loading: false }],
  useDeleteContributionMutation: () => [vi.fn()],
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useMoveContributionToCalloutMutation: () => [vi.fn()],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value }: { value: string }) => <textarea aria-label="description" defaultValue={value} />,
}));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({ ReferencesEditor: () => null }));
vi.mock('@/crd/forms/tags-input', () => ({ TagsInput: () => null }));
// Marked, not stubbed to null: the whole point is whether it is mounted at all.
vi.mock('@/main/crdPages/space/callout/CalloutCommentsConnector', () => ({
  CalloutCommentsConnector: () => <div data-testid="post-comments">comments</div>,
}));
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({ useStorageConfigContext: () => undefined }));
vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));
vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({ onFileUpload: vi.fn(), accept: '' }),
}));

const editProps = {
  mode: 'edit',
  calloutId: 'callout-1',
  postId: 'post-1',
  contributionId: 'contribution-1',
} as const;

describe('CrdPostContributionDialog — no comment surface inside the edit form', () => {
  test('editing a post response shows the form without a comment surface below it', async () => {
    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={vi.fn()} />);

    // The form is up...
    expect(await screen.findByDisplayValue('Original title')).toBeInTheDocument();
    // ...and the comment box is not in the way.
    expect(screen.queryByTestId('post-comments')).not.toBeInTheDocument();
  });

  test('editing a task on a board shows the form without a comment surface below it', async () => {
    render(<CrdPostContributionDialog {...editProps} isTaskBoard={true} open={true} onOpenChange={vi.fn()} />);

    expect(await screen.findByDisplayValue('Original title')).toBeInTheDocument();
    expect(screen.queryByTestId('post-comments')).not.toBeInTheDocument();
  });
});

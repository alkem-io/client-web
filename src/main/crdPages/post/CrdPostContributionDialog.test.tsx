import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { CrdPostContributionDialog } from './CrdPostContributionDialog';

const state = vi.hoisted(() => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deleteContribution: vi.fn(),
  createReference: vi.fn(),
  deleteReference: vi.fn(),
  moveContribution: vi.fn(),
  notify: vi.fn(),
}));

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
  useCalloutContributionCommentsQuery: () => ({ data: undefined }),
  useCreatePostOnCalloutMutation: () => [state.createPost, { loading: false }],
  useUpdatePostMutation: () => [state.updatePost, { loading: false }],
  useDeleteContributionMutation: () => [state.deleteContribution],
  useCreateReferenceOnProfileMutation: () => [state.createReference],
  useDeleteReferenceMutation: () => [state.deleteReference],
  useMoveContributionToCalloutMutation: () => [state.moveContribution],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => state.notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

// Editor / uploader surfaces are not what this spec exercises — stub them so the
// save handler's close behaviour is isolated from their data and DOM machinery.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
    <textarea aria-label="description" value={value} onChange={e => onChange(e.target.value)} />
  ),
}));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({ ReferencesEditor: () => null }));
vi.mock('@/crd/forms/tags-input', () => ({ TagsInput: () => null }));
vi.mock('@/main/crdPages/space/callout/CalloutCommentsConnector', () => ({ CalloutCommentsConnector: () => null }));
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

const createProps = {
  mode: 'create',
  calloutId: 'callout-1',
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  state.updatePost.mockResolvedValue({ data: {} });
  state.createPost.mockResolvedValue({
    data: { createContributionOnCallout: { post: { id: 'post-new', profile: { id: 'profile-new' } } } },
  });
});

describe('CrdPostContributionDialog — save closes the dialog', () => {
  test('edit mode: saving a post response asks the owner to close the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={onOpenChange} />);

    const title = await screen.findByDisplayValue('Original title');
    await user.clear(title);
    await user.type(title, 'Edited title');

    await user.click(screen.getByRole('button', { name: 'callout.postSave' }));

    await waitFor(() => expect(state.updatePost).toHaveBeenCalledTimes(1));
    // The defect: the update fired but the dialog was never dismissed.
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test('edit mode: saving a task on a board closes the same dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<CrdPostContributionDialog {...editProps} isTaskBoard={true} open={true} onOpenChange={onOpenChange} />);

    await user.click(await screen.findByRole('button', { name: 'callout.postSave' }));

    await waitFor(() => expect(state.updatePost).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test('edit mode: the owner is told about the save before the dialog goes away', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onUpdated = vi.fn(() => expect(onOpenChange).not.toHaveBeenCalled());

    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={onOpenChange} onUpdated={onUpdated} />);

    await user.click(await screen.findByRole('button', { name: 'callout.postSave' }));

    // A board owner reacts to `onUpdated` by dismissing the focused-task layer,
    // so it has to fire on a successful save — and while the dialog is still up.
    await waitFor(() => expect(onUpdated).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test('edit mode: a save that never happens leaves the dialog open with the input intact', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={onOpenChange} />);

    // An empty title fails validation, so the save is refused — closing is bound
    // to a successful save, not to the click.
    await user.clear(await screen.findByDisplayValue('Original title'));
    await user.click(screen.getByRole('button', { name: 'callout.postSave' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'description' })).toBeInTheDocument());
    expect(state.updatePost).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(state.notify).not.toHaveBeenCalled();
  });
});

// workspace#070-contribution-notify-switch — off-by-default "Notify space members" switch (US1/US2).
describe('CrdPostContributionDialog — notify members switch (create mode)', () => {
  test('renders OFF for a plain response', async () => {
    render(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    const toggle = await screen.findByRole('switch', { name: 'forms.notifyMembers' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('renders OFF for a task on a Tasks board', async () => {
    render(<CrdPostContributionDialog {...createProps} isTaskBoard={true} open={true} onOpenChange={vi.fn()} />);

    const toggle = await screen.findByRole('switch', { name: 'forms.notifyMembers' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('submit untouched sends sendNotification: false', async () => {
    const user = userEvent.setup();
    render(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    await user.type(screen.getByRole('textbox', { name: 'description' }), 'A description');
    await user.click(screen.getByRole('button', { name: 'callout.postCreate' }));

    await waitFor(() => expect(state.createPost).toHaveBeenCalledTimes(1));
    expect(state.createPost.mock.calls[0][0].variables).toMatchObject({ sendNotification: false });
  });

  test('toggling the switch then submitting sends sendNotification: true', async () => {
    const user = userEvent.setup();
    render(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    await user.click(await screen.findByRole('switch', { name: 'forms.notifyMembers' }));
    await user.type(screen.getByRole('textbox', { name: 'description' }), 'A description');
    await user.click(screen.getByRole('button', { name: 'callout.postCreate' }));

    await waitFor(() => expect(state.createPost).toHaveBeenCalledTimes(1));
    expect(state.createPost.mock.calls[0][0].variables).toMatchObject({ sendNotification: true });
  });

  test('reopening after a successful create resets the switch to OFF', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    await user.click(await screen.findByRole('switch', { name: 'forms.notifyMembers' }));
    await user.type(screen.getByRole('textbox', { name: 'description' }), 'A description');
    await user.click(screen.getByRole('button', { name: 'callout.postCreate' }));
    await waitFor(() => expect(state.createPost).toHaveBeenCalledTimes(1));

    // Simulate the owner closing then reopening the dialog for the next contribution.
    rerender(<CrdPostContributionDialog {...createProps} open={false} onOpenChange={vi.fn()} />);
    rerender(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    const toggle = await screen.findByRole('switch', { name: 'forms.notifyMembers' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('edit mode renders no switch and the update path carries no sendNotification key', async () => {
    const user = userEvent.setup();
    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={vi.fn()} />);

    await screen.findByDisplayValue('Original title');
    expect(screen.queryByRole('switch', { name: 'forms.notifyMembers' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'callout.postSave' }));

    await waitFor(() => expect(state.updatePost).toHaveBeenCalledTimes(1));
    expect(state.updatePost.mock.calls[0][0].variables).not.toHaveProperty('sendNotification');
    expect(state.updatePost.mock.calls[0][0].variables.input).not.toHaveProperty('sendNotification');
  });
});

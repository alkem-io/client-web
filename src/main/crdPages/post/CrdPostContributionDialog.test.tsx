import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
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

const screenSize = { isSmallScreen: false, isMediumScreen: false, isLargeScreen: true };
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useScreenSize: () => screenSize }));

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

describe('CrdPostContributionDialog — full screen on a small screen', () => {
  afterEach(() => {
    screenSize.isSmallScreen = false;
    vi.unstubAllGlobals();
  });

  const backArrow = () =>
    screen.getAllByRole('dialog').at(-1)?.querySelector('.lucide-chevron-left')?.closest('button') as HTMLButtonElement;

  const stubVisualViewport = (offsetTop: number, height: number) => {
    const viewport = Object.assign(new EventTarget(), { offsetTop, height });
    vi.stubGlobal('visualViewport', viewport);
    return viewport;
  };

  test('fills the screen and closes from a single back arrow', async () => {
    screenSize.isSmallScreen = true;
    const onOpenChange = vi.fn();
    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={onOpenChange} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass(
      'inset-0',
      'max-w-none',
      'translate-x-0',
      'translate-y-0',
      'rounded-none',
      'border-none'
    );
    expect(dialog).not.toHaveClass('top-[50%]', 'left-[50%]', 'max-h-[90vh]');
    expect(dialog.querySelector('.lucide-x')).toBeNull();
    expect(backArrow()).toHaveAccessibleName('calloutDialog.close');

    await userEvent.click(backArrow());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('asks before discarding unsaved changes when closed from the back arrow', async () => {
    screenSize.isSmallScreen = true;
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={onOpenChange} />);

    await user.type(await screen.findByDisplayValue('Original title'), ' edited');
    await user.click(backArrow());

    expect(await screen.findByText('callout.postUnsavedCloseTitle')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'callout.postUnsavedCloseConfirm' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('follows the visual viewport, so the actions stay above the on-screen keyboard', () => {
    screenSize.isSmallScreen = true;
    const viewport = stubVisualViewport(0, 844);
    render(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ top: '0px', height: '844px' });

    Object.assign(viewport, { offsetTop: 24, height: 460 });
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });
    expect(dialog).toHaveStyle({ top: '24px', height: '460px', bottom: 'auto' });
  });

  test('wraps the actions so the submit button cannot be pushed off screen', () => {
    screenSize.isSmallScreen = true;
    render(<CrdPostContributionDialog {...createProps} open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'callout.postCreate' }).parentElement).toHaveClass('flex-wrap');
  });

  test('closing from the back arrow over a full-screen post returns to the post', async () => {
    screenSize.isSmallScreen = true;
    const user = userEvent.setup();
    const onPostOpenChange = vi.fn();

    const PostWithEditForm = () => {
      const [editing, setEditing] = useState(false);
      return (
        <>
          <CalloutDetailDialog
            open={true}
            onOpenChange={onPostOpenChange}
            callout={{ id: 'c1', title: 'The post' }}
            commentsSlot={
              <button type="button" onClick={() => setEditing(true)}>
                edit
              </button>
            }
          />
          <CrdPostContributionDialog {...editProps} open={editing} onOpenChange={setEditing} />
        </>
      );
    };
    render(<PostWithEditForm />);
    await user.click(screen.getByRole('button', { name: 'edit' }));

    expect(screen.getByRole('dialog', { name: 'callout.editPost' })).toBeInTheDocument();
    await user.click(backArrow());

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'callout.editPost' })).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: 'The post' })).toBeInTheDocument();
    expect(onPostOpenChange).not.toHaveBeenCalled();
  });

  test('stays a centered box with its close button above a small screen', async () => {
    stubVisualViewport(0, 500);
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CrdPostContributionDialog {...editProps} open={true} onOpenChange={onOpenChange} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('top-[50%]', 'left-[50%]', 'sm:max-w-3xl', 'max-h-[90vh]');
    expect(dialog).not.toHaveClass('inset-0');
    expect(dialog.style.height).toBe('');
    expect(screen.getByRole('button', { name: 'callout.postSave' }).parentElement).not.toHaveClass('flex-wrap');
    expect(dialog.querySelector('.lucide-chevron-left')).toBeNull();

    // The corner close button routes through the same unsaved-changes guard.
    await user.type(await screen.findByDisplayValue('Original title'), ' edited');
    await user.click(dialog.querySelector('.lucide-x')?.closest('button') as HTMLButtonElement);
    expect(await screen.findByText('callout.postUnsavedCloseTitle')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

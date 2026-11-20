import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutDeeplinkView } from './CalloutDeeplinkView';
import { LazyCalloutItem } from './LazyCalloutItem';

/**
 * A Tasks board callout must open to the same detail dialog every other callout
 * gets — title, description, framing content — with the board where the
 * responses normally sit. These tests drive the real deep-link view, feed item,
 * detail connector, detail dialog and board dialog; only the data-fetching
 * leaves (board query, framing previews, contribution grid) are stubbed.
 */

const state = vi.hoisted(() => ({
  isBoard: true,
  detectionPending: false,
  boardEnabled: true,
}));

const callout = {
  id: 'callout-1',
  draft: false,
  calloutsSetId: 'callouts-set-1',
  contributions: [],
  framing: {
    type: CalloutFramingType.Whiteboard,
    profile: { displayName: 'Sprint planning', url: '/space/collaboration/sprint-planning' },
    whiteboard: { id: 'whiteboard-1' },
  },
  settings: {
    framing: { commentsEnabled: false },
    contribution: { allowedTypes: [CalloutContributionType.Post], enabled: true, commentsEnabled: false },
  },
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutCommentsRevalidateQuery: () => ({}),
  useCalloutContributionQuery: (options: { skip?: boolean; variables: { contributionId: string } }) => ({
    data: options.skip
      ? undefined
      : {
          lookup: {
            contribution: {
              id: options.variables.contributionId,
              post: { id: 'post-1', profile: { displayName: 'Write the agenda' } },
            },
          },
        },
    loading: false,
  }),
  useDeleteContributionMutation: () => [vi.fn()],
  useMemoMarkdownLazyQuery: () => [vi.fn()],
}));

vi.mock('@/crd/components/callout/task-board/taskBoard', () => ({
  isTaskBoardEnabled: () => state.boardEnabled,
}));

// Stands in for the board query: reports board-ness once "resolved" and renders
// a recognisable board (inline, or filling the board-only dialog) with one task.
vi.mock('./TaskBoardConnector', () => ({
  TaskBoardConnector: (props: {
    fill?: boolean;
    detectOnly?: boolean;
    fallback: ReactNode;
    onBoardResolved?: (isBoard: boolean) => void;
    onOpenTask?: (contributionId: string) => void;
  }) => {
    const { onBoardResolved } = props;
    const pending = state.detectionPending;
    useEffect(() => {
      if (!pending) onBoardResolved?.(state.isBoard);
    }, [onBoardResolved, pending]);
    if (props.detectOnly) return null;
    if (pending || !state.isBoard) return <>{props.fallback}</>;
    return (
      <div data-testid={props.fill ? 'board-only-view' : 'inline-board'}>
        <button type="button" onClick={() => props.onOpenTask?.('task-1')}>
          Write the agenda
        </button>
      </div>
    );
  },
}));
vi.mock('./TaskBoardManageColumnsButton', () => ({ TaskBoardManageColumnsButton: () => null }));

vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => CalloutContributionType.Post,
  mapCalloutDetailsToDialogData: () => ({
    id: 'callout-1',
    title: 'Sprint planning',
    description: 'Read this before picking up a task.',
  }),
  mapCalloutDetailsToPostCard: () => ({ id: 'callout-1', type: 'whiteboard', title: 'Sprint planning' }),
  mapReferenceToStripData: vi.fn(),
}));

vi.mock('@/crd/components/common/MarkdownContent', () => ({
  MarkdownContent: (props: { content: string }) => <p>{props.content}</p>,
}));
vi.mock('./WhiteboardFramingConnector', () => ({
  WhiteboardFramingConnector: () => <div data-testid="whiteboard-framing">whiteboard</div>,
}));
vi.mock('./ContributionGridConnector', () => ({
  ContributionGridConnector: () => <div data-testid="responses-grid">responses</div>,
}));
vi.mock('./ContributionsPreviewConnector', () => ({ ContributionsPreviewConnector: () => null }));
vi.mock('@/crd/components/callout/CalloutPostPreview', () => ({
  CalloutPostPreview: (props: { post: { title: string }; onClose: () => void }) => (
    <div data-testid="focused-task">
      {props.post.title}
      <button type="button" onClick={props.onClose}>
        close task
      </button>
    </div>
  ),
}));

vi.mock('@/crd/components/space/PostCard', () => ({
  PostCard: (props: {
    children?: ReactNode;
    onClick?: () => void;
    onExpandClick?: () => void;
    contributionsPreview?: ReactNode;
  }) => (
    <div data-testid="feed-card">
      <button type="button" onClick={props.onClick}>
        open callout
      </button>
      <button type="button" onClick={props.onExpandClick}>
        feed fullscreen
      </button>
      {props.children}
      {props.contributionsPreview}
    </div>
  ),
}));
vi.mock('@/crd/components/space/PostCardSkeleton', () => ({ PostCardSkeleton: () => null }));
vi.mock('@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView', () => ({
  default: () => ({ ref: vi.fn(), inView: true, loading: false, callout }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock(
  '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions',
  () => ({ default: () => ({ canCreateContribution: false }) })
);
vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', () => ({
  default: () => ({ inViewRef: vi.fn(), contributions: { items: [], total: 0 }, loading: false, loaded: true }),
}));
vi.mock('@/domain/collaboration/whiteboard/utils/buildGuestShareUrl', () => ({ default: () => '' }));
vi.mock('@/main/crdPages/topLevelPages/common/useSendMessageHandler', () => ({
  useMessageContributor: () => vi.fn(),
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({ CrdMemoDialog: () => null }));
vi.mock('@/main/crdPages/memo/MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: () => null,
}));
vi.mock('@/main/crdPages/whiteboard/CrdWhiteboardView', () => ({ default: () => null }));
vi.mock('@/crd/components/callout/CalloutWhiteboardContributionPreview', () => ({
  CalloutWhiteboardContributionPreview: () => null,
}));
vi.mock('@/crd/components/common/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('@/crd/components/contribution/ContributionLinkList', () => ({ ContributionLinkList: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('../hooks/useCrdCalloutMoveActions', () => ({ useCrdCalloutMoveActions: () => undefined }));
vi.mock('../hooks/useFlowStateLayout', () => ({
  useFlowStateLayout: () => ({ descriptionCollapsed: false, showPublishDetails: true }),
}));
vi.mock('../hooks/useMediaGalleryDirectUpload', () => ({
  useMediaGalleryDirectUpload: () => ({ triggerAddImages: vi.fn(), fileInputElement: null }),
}));
vi.mock('./CalloutCommentsConnector', () => ({}));
vi.mock('./CalloutFramingFormConnector', () => ({}));
vi.mock('./CalloutPollConnector', () => ({}));
vi.mock('./CalloutReactionsConnector', () => ({}));
vi.mock('./CalloutSettingsConnector', () => ({ CalloutSettingsConnector: () => null }));
vi.mock('./CalloutShareDialog', () => ({ CalloutShareDialog: () => null }));
vi.mock('./CallToActionFramingConnector', () => ({}));
vi.mock('./CollaboraFramingConnector', () => ({}));
vi.mock('./CollaboraFramingEditorOverlay', () => ({}));
vi.mock('./ContributorCollectionConnector', () => ({}));
vi.mock('./DocumentContributionAddConnector', () => ({}));
vi.mock('./DocumentContributionConnector', () => ({}));
vi.mock('./LinkContributionAddConnector', () => ({}));
vi.mock('./LinkContributionEditConnector', () => ({}));
vi.mock('./MediaGalleryFramingConnector', () => ({}));
vi.mock('./MemoContributionAddConnector', () => ({}));
vi.mock('./MemoContributionConnector', () => ({}));
vi.mock('./MemoFramingConnector', () => ({}));
vi.mock('./PostContributionAddConnector', () => ({}));
vi.mock('./PostContributionConnector', () => ({}));
vi.mock('./SpaceCollectionConnector', () => ({}));
vi.mock('./WhiteboardContributionAddConnector', () => ({}));
vi.mock('./WhiteboardContributionConnector', () => ({}));

const renderDeeplink = (contributionId?: string) =>
  render(<CalloutDeeplinkView callout={callout as never} contributionId={contributionId} onClose={vi.fn()} />);

/**
 * The callout detail dialog: the one that shows the callout's description.
 * `hidden` because a dialog stacked on top (a task, the board-only view) hides
 * the ones beneath it from the accessibility tree.
 */
const calloutDetailDialog = () => {
  const dialog = screen
    .getAllByRole('dialog', { hidden: true })
    .find(candidate => within(candidate).queryByText('Read this before picking up a task.'));
  if (!dialog) throw new Error('The callout detail dialog is not open');
  return dialog;
};

beforeEach(() => {
  state.isBoard = true;
  state.detectionPending = false;
  state.boardEnabled = true;
});

describe('a Tasks board callout opened by its link', () => {
  it('shows the description, the framing content and the board together', () => {
    renderDeeplink();

    const detail = within(calloutDetailDialog());
    expect(detail.getByRole('heading', { level: 1, name: 'Sprint planning' })).toBeInTheDocument();
    expect(detail.getByText('Read this before picking up a task.')).toBeInTheDocument();
    expect(detail.getByTestId('whiteboard-framing')).toBeInTheDocument();
    expect(detail.getByTestId('inline-board')).toBeInTheDocument();
    // The board is headed as tasks, not as contributions.
    expect(detail.getByRole('heading', { level: 2, name: /tasksHeader/ })).toBeInTheDocument();
    expect(detail.queryByRole('heading', { name: /calloutDialog\.contributions/ })).not.toBeInTheDocument();
    // The board replaces the responses grid; the board-only view is not forced open.
    expect(screen.queryByTestId('responses-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('board-only-view')).not.toBeInTheDocument();
  });

  it('keeps the board-only view reachable from the detail dialog, on top of it', async () => {
    const user = userEvent.setup();
    renderDeeplink();

    await user.click(within(calloutDetailDialog()).getByRole('button', { name: 'callout.fullscreen' }));

    expect(screen.getByTestId('board-only-view')).toBeInTheDocument();

    // Closing the board-only view returns to the detail dialog.
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('board-only-view')).not.toBeInTheDocument();
    expect(within(calloutDetailDialog()).getByTestId('inline-board')).toBeInTheDocument();
    // Keyboard users land back on the control that opened it, not on the page body.
    expect(within(calloutDetailDialog()).getByRole('button', { name: 'callout.fullscreen' })).toHaveFocus();
  });

  it('opens a deep-linked task as a focused dialog on top of the callout detail', async () => {
    const user = userEvent.setup();
    renderDeeplink('task-1');

    expect(screen.getByTestId('focused-task')).toHaveTextContent('Write the agenda');
    const detail = calloutDetailDialog();
    expect(within(detail).getByTestId('inline-board')).toBeInTheDocument();
    // The task is its own dialog, not a selection inside the callout detail.
    expect(within(detail).queryByTestId('focused-task')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'close task' }));
    expect(screen.queryByTestId('focused-task')).not.toBeInTheDocument();
    expect(within(calloutDetailDialog()).getByTestId('whiteboard-framing')).toBeInTheDocument();
  });

  it('opens a task clicked in the board as a focused dialog on top', async () => {
    const user = userEvent.setup();
    renderDeeplink();

    await user.click(within(calloutDetailDialog()).getByRole('button', { name: 'Write the agenda' }));

    expect(screen.getByTestId('focused-task')).toBeInTheDocument();
    expect(calloutDetailDialog()).toBeInTheDocument();
  });

  it('returns focus to the task that was opened when its dialog closes', async () => {
    const user = userEvent.setup();
    renderDeeplink();

    await user.click(within(calloutDetailDialog()).getByRole('button', { name: 'Write the agenda' }));
    await user.click(screen.getByRole('button', { name: 'close task' }));

    expect(screen.queryByTestId('focused-task')).not.toBeInTheDocument();
    // Keyboard users land back on the task they opened, not on the page body.
    await waitFor(() =>
      expect(within(calloutDetailDialog()).getByRole('button', { name: 'Write the agenda' })).toHaveFocus()
    );
  });

  it('returns focus to the task opened from the board-only view when its dialog closes', async () => {
    const user = userEvent.setup();
    renderDeeplink();

    await user.click(within(calloutDetailDialog()).getByRole('button', { name: 'callout.fullscreen' }));
    const task = within(screen.getByTestId('board-only-view')).getByRole('button', { name: 'Write the agenda' });
    await user.click(task);
    await user.click(screen.getByRole('button', { name: 'close task' }));

    await waitFor(() => expect(task).toHaveFocus());
  });

  it('keeps focus in the callout detail when a deep-linked task, which has no opening control, closes', async () => {
    const user = userEvent.setup();
    renderDeeplink('task-1');

    await user.click(screen.getByRole('button', { name: 'close task' }));

    expect(screen.queryByTestId('focused-task')).not.toBeInTheDocument();
    await waitFor(() => expect(calloutDetailDialog()).toContainElement(document.activeElement as HTMLElement));
  });

  it('renders nothing until board detection resolves, so the plain responses never flash', () => {
    state.detectionPending = true;
    renderDeeplink();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('responses-grid')).not.toBeInTheDocument();
  });

  it('leaves a callout that is not a board on the plain responses grid with no board controls', () => {
    state.isBoard = false;
    renderDeeplink();

    const detail = within(calloutDetailDialog());
    expect(detail.getByTestId('responses-grid')).toBeInTheDocument();
    expect(detail.queryByTestId('inline-board')).not.toBeInTheDocument();
    expect(detail.queryByRole('button', { name: 'callout.fullscreen' })).not.toBeInTheDocument();
  });

  it('skips the board entirely when the board view is switched off', () => {
    state.boardEnabled = false;
    renderDeeplink();

    const detail = within(calloutDetailDialog());
    expect(detail.getByTestId('responses-grid')).toBeInTheDocument();
    expect(detail.queryByTestId('inline-board')).not.toBeInTheDocument();
  });
});

describe('a Tasks board callout opened from its feed card', () => {
  const renderFeedItem = () => render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" />);

  it('opens the detail dialog with description, framing content and board', async () => {
    const user = userEvent.setup();
    renderFeedItem();

    await user.click(screen.getByRole('button', { name: 'open callout' }));

    const detail = within(calloutDetailDialog());
    expect(detail.getByText('Read this before picking up a task.')).toBeInTheDocument();
    expect(detail.getByTestId('whiteboard-framing')).toBeInTheDocument();
    expect(detail.getByTestId('inline-board')).toBeInTheDocument();
    expect(screen.queryByTestId('board-only-view')).not.toBeInTheDocument();

    await user.click(detail.getByRole('button', { name: 'callout.fullscreen' }));
    expect(screen.getByTestId('board-only-view')).toBeInTheDocument();
  });

  it('still opens the board-only view straight from the feed fullscreen control', async () => {
    const user = userEvent.setup();
    renderFeedItem();

    await user.click(screen.getByRole('button', { name: 'feed fullscreen' }));

    expect(screen.getByTestId('board-only-view')).toBeInTheDocument();
    expect(screen.queryByText('Read this before picking up a task.')).not.toBeInTheDocument();
  });

  it('opens a task clicked in the inline board over the board-only view', async () => {
    const user = userEvent.setup();
    renderFeedItem();

    await user.click(within(screen.getByTestId('feed-card')).getByRole('button', { name: 'Write the agenda' }));

    expect(screen.getByTestId('board-only-view')).toBeInTheDocument();
    expect(screen.getByTestId('focused-task')).toBeInTheDocument();
    expect(screen.queryByText('Read this before picking up a task.')).not.toBeInTheDocument();
    // The task dialog is the top layer, so assistive technology must reach it.
    expect(screen.getByTestId('focused-task').closest('[aria-hidden="true"]')).toBeNull();
  });

  it('returns focus to the task opened from the board-only view when its dialog closes', async () => {
    const user = userEvent.setup();
    renderFeedItem();

    await user.click(screen.getByRole('button', { name: 'feed fullscreen' }));
    const task = within(screen.getByTestId('board-only-view')).getByRole('button', { name: 'Write the agenda' });
    await user.click(task);
    await user.click(screen.getByRole('button', { name: 'close task' }));

    expect(screen.queryByTestId('focused-task')).not.toBeInTheDocument();
    await waitFor(() => expect(task).toHaveFocus());
  });

  it('keeps focus in the board-only view when a task opened from the inline board closes', async () => {
    const user = userEvent.setup();
    renderFeedItem();

    // The inline task sits beneath the board-only view that opens with it, so
    // focus cannot go back there: it stays in the board-only view.
    await user.click(within(screen.getByTestId('feed-card')).getByRole('button', { name: 'Write the agenda' }));
    await user.click(screen.getByRole('button', { name: 'close task' }));

    expect(screen.queryByTestId('focused-task')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('board-only-view').closest('[role="dialog"]')).toContainElement(
        document.activeElement as HTMLElement
      )
    );
  });
});

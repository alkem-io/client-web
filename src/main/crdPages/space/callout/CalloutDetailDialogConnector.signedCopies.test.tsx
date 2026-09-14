import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutContributionQuery: () => ({ data: undefined, loading: false }),
  useDeleteContributionMutation: () => [vi.fn()],
  useMemoMarkdownLazyQuery: () => [vi.fn()],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock(
  '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions',
  () => ({
    default: () => ({ canCreateContribution: false }),
  })
);
vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', () => ({
  default: () => ({
    inViewRef: vi.fn(),
    contributions: { items: [], total: 0 },
    loading: false,
    loaded: true,
  }),
}));

vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => CalloutContributionType.Memo,
  mapCalloutDetailsToDialogData: () => ({ id: 'callout-1', title: 'Decision' }),
  mapReferenceToStripData: vi.fn(),
}));

vi.mock('@/crd/components/callout/CalloutDetailDialog', () => ({
  CalloutDetailDialog: (props: { open: boolean; memoFramingSlot?: ReactNode; contributionsSlot?: ReactNode }) =>
    props.open ? (
      <div data-testid="callout-dialog">
        {props.memoFramingSlot}
        {props.contributionsSlot}
      </div>
    ) : null,
}));
vi.mock('./MemoFramingConnector', () => ({
  MemoFramingConnector: (props: { onOpen: () => void; onOpenSignedCopies?: (memoId: string) => void }) => (
    <div>
      <button type="button" onClick={props.onOpen}>
        Open memo
      </button>
      {props.onOpenSignedCopies && (
        <button type="button" onClick={() => props.onOpenSignedCopies?.('memo-1')}>
          Signed copies (1)
        </button>
      )}
    </div>
  ),
}));
vi.mock('@/main/crdPages/memo/MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: (props: {
    open: boolean;
    memoId: string;
    onOpenChange: (open: boolean) => void;
    overlayClassName?: string;
    contentClassName?: string;
  }) =>
    props.open ? (
      <div
        data-testid="signed-copies-dialog"
        data-memo-id={props.memoId}
        data-overlay-class={props.overlayClassName}
        data-content-class={props.contentClassName}
      >
        <button type="button" onClick={() => props.onOpenChange(false)}>
          close history
        </button>
      </div>
    ) : null,
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({
  CrdMemoDialog: (props: { open: boolean; memoId: string; refreshAfterSigningAttemptId?: string }) =>
    props.open ? (
      <div
        data-testid="memo-editor"
        data-memo-id={props.memoId}
        data-refresh-attempt-id={props.refreshAfterSigningAttemptId}
      >
        memo editor
      </div>
    ) : null,
}));

vi.mock('./CalloutCommentsConnector', () => ({}));
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
vi.mock('./MemoContributionConnector', () => ({
  MemoContributionConnector: (props: {
    open: boolean;
    contributionId: string;
    memoId: string;
    refreshAfterSigningAttemptId?: string;
  }) =>
    props.open ? (
      <div
        data-testid="contribution-memo-editor"
        data-contribution-id={props.contributionId}
        data-memo-id={props.memoId}
        data-refresh-attempt-id={props.refreshAfterSigningAttemptId}
      />
    ) : null,
}));
vi.mock('./ContributionGridConnector', () => ({
  ContributionGridConnector: (props: { onOpenMemoSignedCopies?: (memoId: string) => void }) =>
    props.onOpenMemoSignedCopies ? (
      <button type="button" onClick={() => props.onOpenMemoSignedCopies?.('contribution-memo-1')}>
        Contribution signed copies (1)
      </button>
    ) : null,
}));
vi.mock('./PostContributionAddConnector', () => ({}));
vi.mock('./PostContributionConnector', () => ({}));
vi.mock('./SpaceCollectionConnector', () => ({}));
vi.mock('./WhiteboardContributionAddConnector', () => ({}));
vi.mock('./WhiteboardContributionConnector', () => ({}));
vi.mock('./WhiteboardFramingConnector', () => ({}));

vi.mock('@/crd/components/callout/CalloutPostPreview', () => ({ CalloutPostPreview: () => null }));
vi.mock('@/crd/components/callout/CalloutWhiteboardContributionPreview', () => ({
  CalloutWhiteboardContributionPreview: () => null,
}));
vi.mock('@/crd/components/common/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('@/crd/components/contribution/ContributionLinkList', () => ({ ContributionLinkList: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));

describe('CalloutDetailDialogConnector framing signed copies', () => {
  it('opens one sibling history dialog for the framing memo and leaves the memo editor closed', async () => {
    const user = userEvent.setup();
    const callout = {
      id: 'callout-1',
      draft: false,
      contributions: [],
      framing: {
        type: CalloutFramingType.Memo,
        profile: { displayName: 'Decision' },
        memo: {
          id: 'memo-1',
          signatures: [{ id: 'attempt-1', document: { id: 'document-1' } }],
        },
      },
      settings: {
        framing: { commentsEnabled: true },
        contribution: {
          allowedTypes: [CalloutContributionType.Memo],
          enabled: false,
          commentsEnabled: false,
        },
      },
    };

    const onOpenChange = vi.fn();
    const { rerender } = render(
      <CalloutDetailDialogConnector open={true} onOpenChange={onOpenChange} callout={callout as never} />
    );

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));

    const calloutDialog = screen.getByTestId('callout-dialog');
    const historyDialog = screen.getByTestId('signed-copies-dialog');
    expect(calloutDialog.contains(historyDialog)).toBe(false);
    expect(screen.getAllByTestId('signed-copies-dialog')).toHaveLength(1);
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();
    expect(historyDialog).toHaveAttribute('data-memo-id', 'memo-1');

    await user.click(screen.getByRole('button', { name: 'close history' }));
    expect(screen.queryByTestId('signed-copies-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('callout-dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));
    rerender(<CalloutDetailDialogConnector open={false} onOpenChange={onOpenChange} callout={callout as never} />);
    expect(screen.queryByTestId('signed-copies-dialog')).not.toBeInTheDocument();

    rerender(<CalloutDetailDialogConnector open={true} onOpenChange={onOpenChange} callout={callout as never} />);
    expect(screen.queryByTestId('signed-copies-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('callout-dialog')).toBeInTheDocument();
  });

  it('passes the full-grid memo history action through the opened-callout parent', async () => {
    const user = userEvent.setup();
    const callout = {
      id: 'callout-1',
      draft: false,
      contributions: [],
      framing: {
        type: CalloutFramingType.Memo,
        profile: { displayName: 'Decision' },
        memo: { id: 'memo-1', signatures: [] },
      },
      settings: {
        framing: { commentsEnabled: true },
        contribution: {
          allowedTypes: [CalloutContributionType.Memo],
          enabled: false,
          commentsEnabled: false,
        },
      },
    };

    render(<CalloutDetailDialogConnector open={true} onOpenChange={vi.fn()} callout={callout as never} />);

    await user.click(screen.getByRole('button', { name: 'Contribution signed copies (1)' }));

    expect(screen.getAllByTestId('signed-copies-dialog')).toHaveLength(1);
    expect(screen.getByTestId('signed-copies-dialog')).toHaveAttribute('data-memo-id', 'contribution-memo-1');
    expect(screen.getByTestId('callout-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();
  });

  it('raises signed-copy history above an elevated focused-board dialog', async () => {
    const user = userEvent.setup();
    const callout = {
      id: 'callout-1',
      draft: false,
      contributions: [],
      framing: {
        type: CalloutFramingType.Memo,
        profile: { displayName: 'Decision' },
        memo: {
          id: 'memo-1',
          signatures: [{ id: 'attempt-1', document: { id: 'document-1' } }],
        },
      },
      settings: {
        framing: { commentsEnabled: true },
        contribution: {
          allowedTypes: [CalloutContributionType.Memo],
          enabled: false,
          commentsEnabled: false,
        },
      },
    };

    render(
      <CalloutDetailDialogConnector open={true} onOpenChange={vi.fn()} callout={callout as never} elevated={true} />
    );

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));

    expect(screen.getByTestId('signed-copies-dialog')).toHaveAttribute('data-overlay-class', 'z-[120]');
    expect(screen.getByTestId('signed-copies-dialog')).toHaveAttribute('data-content-class', 'z-[120]');
  });
});

type MemoSigningRestoreIntent = {
  attemptId: string;
  calloutId: string;
  memoId: string;
  kind: 'framing' | 'contribution';
  contributionId?: string;
  refreshMemo: boolean;
};

const RestoreCapableCalloutDetailDialogConnector = CalloutDetailDialogConnector as unknown as ComponentType<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: never;
  initialContributionId?: string;
  memoSigningRestore?: MemoSigningRestoreIntent;
  onMemoSigningRestoreConsumed?: (attemptId: string) => void;
}>;

const memoCallout = {
  id: 'callout-1',
  draft: false,
  contributions: [],
  framing: {
    type: CalloutFramingType.Memo,
    profile: { displayName: 'Decision' },
    memo: { id: 'memo-1', signatures: [] },
  },
  settings: {
    framing: { commentsEnabled: true },
    contribution: {
      allowedTypes: [CalloutContributionType.Memo],
      enabled: false,
      commentsEnabled: false,
    },
  },
} as never;

describe('CalloutDetailDialogConnector memo-signing restoration', () => {
  it('synchronizes a late framing restore once and carries the exact success refresh signal', async () => {
    const onConsumed = vi.fn();
    const view = render(
      <RestoreCapableCalloutDetailDialogConnector
        open={true}
        onOpenChange={vi.fn()}
        callout={memoCallout}
        initialContributionId="contribution-1"
        onMemoSigningRestoreConsumed={onConsumed}
      />
    );
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();

    view.rerender(
      <RestoreCapableCalloutDetailDialogConnector
        open={true}
        onOpenChange={vi.fn()}
        callout={memoCallout}
        initialContributionId="contribution-1"
        memoSigningRestore={{
          attemptId: 'attempt-1',
          calloutId: 'callout-1',
          memoId: 'memo-1',
          kind: 'framing',
          refreshMemo: true,
        }}
        onMemoSigningRestoreConsumed={onConsumed}
      />
    );

    expect(await screen.findByTestId('memo-editor')).toHaveAttribute('data-memo-id', 'memo-1');
    expect(screen.getByTestId('memo-editor')).toHaveAttribute('data-refresh-attempt-id', 'attempt-1');
    expect(onConsumed).toHaveBeenCalledOnce();
    expect(onConsumed).toHaveBeenCalledWith('attempt-1');
  });

  it('restores only an exact contribution wrapper and memo pair after the callout is mounted', async () => {
    const onConsumed = vi.fn();
    const view = render(
      <RestoreCapableCalloutDetailDialogConnector
        open={true}
        onOpenChange={vi.fn()}
        callout={memoCallout}
        initialContributionId="contribution-1"
        onMemoSigningRestoreConsumed={onConsumed}
      />
    );

    view.rerender(
      <RestoreCapableCalloutDetailDialogConnector
        open={true}
        onOpenChange={vi.fn()}
        callout={memoCallout}
        initialContributionId="contribution-1"
        memoSigningRestore={{
          attemptId: 'attempt-2',
          calloutId: 'callout-1',
          contributionId: 'contribution-1',
          memoId: 'contribution-memo-1',
          kind: 'contribution',
          refreshMemo: true,
        }}
        onMemoSigningRestoreConsumed={onConsumed}
      />
    );

    expect(await screen.findByTestId('contribution-memo-editor')).toHaveAttribute(
      'data-contribution-id',
      'contribution-1'
    );
    expect(screen.getByTestId('contribution-memo-editor')).toHaveAttribute('data-memo-id', 'contribution-memo-1');
    expect(screen.getByTestId('contribution-memo-editor')).toHaveAttribute('data-refresh-attempt-id', 'attempt-2');
    expect(onConsumed).toHaveBeenCalledWith('attempt-2');
  });

  it('acknowledges mismatched framing context without opening an editor', async () => {
    const onConsumed = vi.fn();

    render(
      <RestoreCapableCalloutDetailDialogConnector
        open={true}
        onOpenChange={vi.fn()}
        callout={memoCallout}
        memoSigningRestore={{
          attemptId: 'attempt-3',
          calloutId: 'callout-1',
          memoId: 'different-memo',
          kind: 'framing',
          refreshMemo: true,
        }}
        onMemoSigningRestoreConsumed={onConsumed}
      />
    );

    await waitFor(() => expect(onConsumed).toHaveBeenCalledWith('attempt-3'));
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contribution-memo-editor')).not.toBeInTheDocument();
  });
});

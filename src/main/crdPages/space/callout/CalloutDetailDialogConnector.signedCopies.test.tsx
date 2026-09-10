import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
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
  MemoSignedCopiesDialogConnector: (props: { open: boolean; memoId: string; onOpenChange: (open: boolean) => void }) =>
    props.open ? (
      <div data-testid="signed-copies-dialog" data-memo-id={props.memoId}>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          close history
        </button>
      </div>
    ) : null,
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({
  CrdMemoDialog: (props: { open: boolean }) => (props.open ? <div data-testid="memo-editor">memo editor</div> : null),
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
vi.mock('./MemoContributionConnector', () => ({}));
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

    render(<CalloutDetailDialogConnector open={true} onOpenChange={vi.fn()} callout={callout as never} />);

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
});

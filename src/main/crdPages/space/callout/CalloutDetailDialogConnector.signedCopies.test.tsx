import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

const mocks = vi.hoisted(() => ({
  historyOptions: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutContributionQuery: () => ({ data: undefined, loading: false }),
  useDeleteContributionMutation: () => [vi.fn()],
  useMemoMarkdownLazyQuery: () => [vi.fn()],
  useMemoSignedCopiesQuery: (options: unknown) => {
    mocks.historyOptions(options);
    return {
      data: {
        lookup: {
          memo: {
            signatures: [
              {
                id: 'attempt-1',
                document: { id: 'document-1', url: '/api/private/document-1', displayName: 'Decision.pdf' },
                updatedDate: '2026-09-10T09:00:00.000Z',
              },
            ],
          },
        },
      },
      loading: false,
      error: undefined,
    };
  },
  useVerifyMemoSignatureLazyQuery: () => [vi.fn(), { loading: false, data: undefined, error: undefined }],
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
  getCalloutContributionType: () => undefined,
  mapCalloutDetailsToDialogData: () => ({ id: 'callout-1', title: 'Decision' }),
  mapReferenceToStripData: vi.fn(),
}));

vi.mock('@/crd/components/callout/CalloutDetailDialog', () => ({
  CalloutDetailDialog: (props: { open: boolean; memoFramingSlot?: ReactNode }) =>
    props.open ? <div data-testid="callout-dialog">{props.memoFramingSlot}</div> : null,
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
vi.mock('@/crd/components/memo/MemoSigningDialog', () => ({
  MemoSigningDialog: (props: { open: boolean }) =>
    props.open ? <div data-testid="signed-copies-dialog">signed copies dialog</div> : null,
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({
  CrdMemoDialog: (props: { open: boolean }) => (props.open ? <div data-testid="memo-editor">memo editor</div> : null),
}));

vi.mock('./CalloutCommentsConnector', () => ({}));
vi.mock('./CalloutPollConnector', () => ({}));
vi.mock('./CalloutReactionsConnector', () => ({}));
vi.mock('./CalloutSettingsConnector', () => ({}));
vi.mock('./CalloutShareDialog', () => ({}));
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
        contribution: { allowedTypes: [], enabled: false, commentsEnabled: false },
      },
    };

    render(<CalloutDetailDialogConnector open={true} onOpenChange={vi.fn()} callout={callout as never} />);

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));

    const calloutDialog = screen.getByTestId('callout-dialog');
    const historyDialog = screen.getByTestId('signed-copies-dialog');
    expect(calloutDialog.contains(historyDialog)).toBe(false);
    expect(screen.getAllByTestId('signed-copies-dialog')).toHaveLength(1);
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();
    expect(mocks.historyOptions).toHaveBeenLastCalledWith({
      variables: { memoID: 'memo-1' },
      skip: false,
      fetchPolicy: 'cache-and-network',
    });
  });
});

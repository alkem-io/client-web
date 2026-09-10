import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { LazyCalloutItem } from './LazyCalloutItem';

const mocks = vi.hoisted(() => ({
  onCardOpen: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useMemoMarkdownLazyQuery: () => [vi.fn()],
}));

vi.mock('@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView', () => ({
  default: () => ({
    ref: vi.fn(),
    inView: true,
    loading: false,
    callout: {
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
        contribution: { allowedTypes: [CalloutContributionType.Memo], enabled: false },
      },
    },
  }),
}));

vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => CalloutContributionType.Memo,
  mapCalloutDetailsToPostCard: () => ({
    id: 'callout-1',
    type: 'memo',
    title: 'Decision',
    memoSignedCopiesCount: 1,
  }),
}));

vi.mock('@/crd/components/space/PostCard', () => ({
  PostCard: (props: {
    children?: ReactNode;
    onClick?: () => void;
    onOpenMemoSignedCopies?: () => void;
    contributionsPreview?: ReactNode;
  }) => (
    <div>
      <button type="button" onClick={props.onClick}>
        open callout
      </button>
      {props.onOpenMemoSignedCopies && (
        <button type="button" onClick={props.onOpenMemoSignedCopies}>
          Signed copies (1)
        </button>
      )}
      {props.children}
      {props.contributionsPreview}
    </div>
  ),
  PostCardData: {},
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

vi.mock('./CalloutDetailDialogConnector', () => ({
  CalloutDetailDialogConnector: (props: { open: boolean }) =>
    props.open ? <div data-testid="callout-dialog">callout dialog</div> : null,
}));
vi.mock('./CalloutSettingsConnector', () => ({ CalloutSettingsConnector: () => null }));
vi.mock('./CalloutShareDialog', () => ({ CalloutShareDialog: () => null }));
vi.mock('./ContributionsPreviewConnector', () => ({
  ContributionsPreviewConnector: (props: { onOpenMemoSignedCopies?: (memoId: string) => void }) =>
    props.onOpenMemoSignedCopies ? (
      <button type="button" onClick={() => props.onOpenMemoSignedCopies?.('contribution-memo-1')}>
        Contribution signed copies (1)
      </button>
    ) : null,
}));
vi.mock('./CalloutPollConnector', () => ({ CalloutPollConnector: () => null }));
vi.mock('./CalloutReactionsConnector', () => ({ CalloutReactionsConnector: () => null }));
vi.mock('./ContributorCollectionConnector', () => ({ ContributorCollectionConnector: () => null }));
vi.mock('./SpaceCollectionConnector', () => ({ SpaceCollectionConnector: () => null }));
vi.mock('./CollaboraFramingEditorOverlay', () => ({ CollaboraFramingEditorOverlay: () => null }));
vi.mock('./TaskBoardConnector', () => ({ TaskBoardConnector: () => null }));
vi.mock('./TaskBoardDialog', () => ({ TaskBoardDialog: () => null }));
vi.mock('../hooks/useCrdCalloutMoveActions', () => ({ useCrdCalloutMoveActions: () => undefined }));
vi.mock('../hooks/useFlowStateLayout', () => ({
  useFlowStateLayout: () => ({ descriptionCollapsed: false, showPublishDetails: true }),
}));
vi.mock('../hooks/useMediaGalleryDirectUpload', () => ({
  useMediaGalleryDirectUpload: () => ({ triggerAddImages: vi.fn(), fileInputElement: null }),
}));

describe('LazyCalloutItem framing signed copies', () => {
  it('opens exactly one history dialog for the framing memo without opening the callout or memo editor', async () => {
    const user = userEvent.setup();
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" onClick={mocks.onCardOpen} />);

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));

    expect(mocks.onCardOpen).not.toHaveBeenCalled();
    expect(screen.queryByTestId('callout-dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('signed-copies-dialog')).toHaveLength(1);
    expect(screen.getByTestId('signed-copies-dialog')).toHaveAttribute('data-memo-id', 'memo-1');

    await user.click(screen.getByRole('button', { name: 'close history' }));
    expect(screen.queryByTestId('signed-copies-dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'open callout' })).toBeInTheDocument();
  });

  it('passes the contribution-preview memo history action through the feed parent', async () => {
    const user = userEvent.setup();
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" onClick={mocks.onCardOpen} />);

    await user.click(screen.getByRole('button', { name: 'Contribution signed copies (1)' }));

    expect(mocks.onCardOpen).not.toHaveBeenCalled();
    expect(screen.queryByTestId('callout-dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('memo-editor')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('signed-copies-dialog')).toHaveLength(1);
    expect(screen.getByTestId('signed-copies-dialog')).toHaveAttribute('data-memo-id', 'contribution-memo-1');
  });
});

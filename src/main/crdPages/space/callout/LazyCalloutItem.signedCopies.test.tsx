import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { LazyCalloutItem } from './LazyCalloutItem';

const mocks = vi.hoisted(() => ({
  historyOptions: vi.fn(),
  onCardOpen: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
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
        contribution: { allowedTypes: [], enabled: false },
      },
    },
  }),
}));

vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => undefined,
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

vi.mock('@/crd/components/memo/MemoSigningDialog', () => ({
  MemoSigningDialog: (props: { open: boolean }) =>
    props.open ? <div data-testid="signed-copies-dialog">signed copies dialog</div> : null,
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
vi.mock('./ContributionsPreviewConnector', () => ({ ContributionsPreviewConnector: () => null }));
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
    expect(mocks.historyOptions).toHaveBeenLastCalledWith({
      variables: { memoID: 'memo-1' },
      skip: false,
      fetchPolicy: 'cache-and-network',
    });
  });
});

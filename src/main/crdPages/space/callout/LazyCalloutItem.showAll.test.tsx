import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { LazyCalloutItem } from './LazyCalloutItem';

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
      framing: { type: CalloutFramingType.None, profile: { displayName: 'Ideas' } },
      settings: {
        framing: { commentsEnabled: true },
        contribution: { allowedTypes: [CalloutContributionType.Whiteboard], enabled: true },
      },
    },
  }),
}));

vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => CalloutContributionType.Whiteboard,
  mapCalloutDetailsToPostCard: () => ({ id: 'callout-1', type: 'whiteboard', title: 'Ideas' }),
}));

vi.mock('@/crd/components/space/PostCard', () => ({
  PostCard: (props: { onClick?: () => void; contributionsPreview?: ReactNode }) => (
    <div>
      <button type="button" onClick={props.onClick}>
        open callout
      </button>
      {props.contributionsPreview}
    </div>
  ),
  PostCardData: {},
}));

vi.mock('./ContributionsPreviewConnector', () => ({
  ContributionsPreviewConnector: (props: { onShowAll: () => void }) => (
    <button type="button" onClick={props.onShowAll}>
      callout.moreContributions
    </button>
  ),
}));

vi.mock('./CalloutDetailDialogConnector', () => ({
  CalloutDetailDialogConnector: (props: {
    open: boolean;
    contributionsExpanded?: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    props.open ? (
      <div data-testid="callout-dialog" data-contributions-expanded={String(Boolean(props.contributionsExpanded))}>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          close dialog
        </button>
      </div>
    ) : null,
}));

vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({ CrdMemoDialog: () => null }));
vi.mock('@/main/crdPages/memo/MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: () => null,
}));
vi.mock('./CalloutSettingsConnector', () => ({ CalloutSettingsConnector: () => null }));
vi.mock('./CalloutShareDialog', () => ({ CalloutShareDialog: () => null }));
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

describe('LazyCalloutItem "+N more"', () => {
  it('opens the detail dialog with its contributions expanded, so one click shows them all', async () => {
    const user = userEvent.setup();
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" />);

    await user.click(screen.getByRole('button', { name: 'callout.moreContributions' }));

    expect(screen.getByTestId('callout-dialog')).toHaveAttribute('data-contributions-expanded', 'true');
  });

  it('opens the dialog collapsed from any other entry point, even after a "+N more" visit', async () => {
    const user = userEvent.setup();
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" />);

    await user.click(screen.getByRole('button', { name: 'callout.moreContributions' }));
    await user.click(screen.getByRole('button', { name: 'close dialog' }));
    await user.click(screen.getByRole('button', { name: 'open callout' }));

    expect(screen.getByTestId('callout-dialog')).toHaveAttribute('data-contributions-expanded', 'false');
  });
});

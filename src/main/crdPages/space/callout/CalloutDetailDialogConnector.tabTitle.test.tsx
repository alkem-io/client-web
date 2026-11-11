/**
 * @vitest-environment jsdom
 *
 * Every opener of the callout detail dialog (feed card, callout URL, Post
 * Index) renders this connector, so the tab title follows the open callout
 * here: `<callout title> | Alkemio` while open, the page title once closed.
 */
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { setBaseTitle, setTitlePrefix } from '@/core/routing/documentTitle';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

const translations: Record<string, string> = {
  'pages.titles.separator': ' | ',
  'pages.titles.alkemio': 'Alkemio',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => translations[key] ?? key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutCommentsRevalidateQuery: () => ({}),
  useCalloutContributionQuery: () => ({ data: undefined, loading: false }),
  useDeleteContributionMutation: () => [vi.fn()],
  useMemoMarkdownLazyQuery: () => [vi.fn()],
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock(
  '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions',
  () => ({ default: () => ({ canCreateContribution: false }) })
);
vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', () => ({
  default: () => ({ inViewRef: vi.fn(), contributions: { items: [], total: 0 }, loading: false, loaded: true }),
}));
vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => undefined,
  mapCalloutDetailsToDialogData: () => ({ id: 'callout-1', title: 'Mobile issues tracker' }),
  mapReferenceToStripData: vi.fn(),
}));
vi.mock('@/crd/components/callout/CalloutDetailDialog', () => ({
  CalloutDetailDialog: (props: { open: boolean }) => (props.open ? <div data-testid="callout-dialog" /> : null),
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({ CrdMemoDialog: () => null }));
vi.mock('@/main/crdPages/memo/MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: () => null,
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
vi.mock('./ContributionGridConnector', () => ({ ContributionGridConnector: () => null }));
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
vi.mock('./WhiteboardFramingConnector', () => ({}));
vi.mock('@/crd/components/callout/CalloutPostPreview', () => ({ CalloutPostPreview: () => null }));
vi.mock('@/crd/components/callout/CalloutWhiteboardContributionPreview', () => ({
  CalloutWhiteboardContributionPreview: () => null,
}));
vi.mock('@/crd/components/common/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('@/crd/components/contribution/ContributionLinkList', () => ({ ContributionLinkList: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));

const callout = {
  id: 'callout-1',
  draft: false,
  contributions: [],
  framing: { type: CalloutFramingType.None, profile: { displayName: 'Mobile issues tracker' } },
  settings: {
    framing: { commentsEnabled: false },
    contribution: { allowedTypes: [], enabled: false, commentsEnabled: false },
  },
} as never;

const PAGE_TITLE = 'Building the A-team | Alkemio';

describe('CalloutDetailDialogConnector tab title', () => {
  beforeEach(() => {
    setTitlePrefix('');
    setBaseTitle(PAGE_TITLE);
  });

  afterEach(() => {
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('leaves the page title alone while the dialog is closed', () => {
    render(<CalloutDetailDialogConnector open={false} onOpenChange={vi.fn()} callout={callout} />);
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('shows the callout title while open and the page title again once closed', () => {
    const view = render(<CalloutDetailDialogConnector open={true} onOpenChange={vi.fn()} callout={callout} />);
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    view.rerender(<CalloutDetailDialogConnector open={false} onOpenChange={vi.fn()} callout={callout} />);
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('keeps the unread badge prefix on top of the callout title', () => {
    setTitlePrefix('(3) ');
    const view = render(<CalloutDetailDialogConnector open={true} onOpenChange={vi.fn()} callout={callout} />);
    expect(document.title).toBe('(3) Mobile issues tracker | Alkemio');

    view.unmount();
    expect(document.title).toBe(`(3) ${PAGE_TITLE}`);
  });
});

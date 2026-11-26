import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { LazyCalloutItem } from './LazyCalloutItem';

const mocks = vi.hoisted(() => ({
  hasCommentsRoom: true,
  commentsEnabled: true,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

// The card renders from the feed's PostCard in the cache (021 FR-008); the mapped callout is stubbed below.
vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useFragment: () => ({
    complete: true,
    data: { id: 'callout-1', contentKind: 'form', responseCount: 0 },
  }),
}));
// The card's response preview reads the page's space tree; this card's form framing needs none of it.
vi.mock('@/domain/space/hooks/useSpacePage', async importOriginal => ({
  ...(await importOriginal<typeof import('@/domain/space/hooks/useSpacePage')>()),
  usePostResponses: () => ({ responses: [], complete: true, notServed: false }),
}));

const legacyCallout = () => ({
  id: 'callout-1',
  draft: false,
  contributions: [],
  comments: mocks.hasCommentsRoom ? { id: 'room-1', messages: [] } : undefined,
  framing: { type: CalloutFramingType.Form, profile: { displayName: 'Survey' } },
  settings: {
    framing: { commentsEnabled: mocks.commentsEnabled },
    contribution: { allowedTypes: [CalloutContributionType.Post], enabled: false },
  },
});

vi.mock('../dataMappers/calloutDataMapper', () => ({
  getCalloutContributionType: () => CalloutContributionType.Post,
  mapPostToCallout: () => legacyCallout(),
  mapCalloutDetailsToPostCard: () => ({ id: 'callout-1', type: 'post', title: 'Survey' }),
}));

vi.mock('@/crd/components/space/PostCard', () => ({
  PostCard: (props: { children?: ReactNode }) => <div>{props.children}</div>,
  PostCardData: {},
}));

vi.mock('./CalloutCommentsConnector', () => ({
  CalloutCommentsConnector: (props: {
    children: (slots: { thread: ReactNode; commentInput: ReactNode }) => ReactNode;
  }) => <>{props.children({ thread: null, commentInput: null })}</>,
}));

vi.mock('./CalloutFramingFormConnector', () => ({
  CalloutFramingFormConnector: () => <div data-testid="framing-form" />,
}));

vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({ CrdMemoDialog: () => null }));
vi.mock('@/main/crdPages/memo/MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: () => null,
}));
vi.mock('./CalloutDetailDialogConnector', () => ({ CalloutDetailDialogConnector: () => null }));
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
vi.mock('../hooks/useMediaGalleryDirectUpload', () => ({
  useMediaGalleryDirectUpload: () => ({ triggerAddImages: vi.fn(), fileInputElement: null }),
}));

describe('LazyCalloutItem form framing', () => {
  beforeEach(() => {
    mocks.hasCommentsRoom = true;
    mocks.commentsEnabled = true;
  });

  it('renders exactly one form fill-in on a card with a comments room', () => {
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" />);
    expect(screen.getAllByTestId('framing-form')).toHaveLength(1);
  });

  it('renders exactly one form fill-in on a card with comments disabled', () => {
    mocks.commentsEnabled = false;
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" />);
    expect(screen.getAllByTestId('framing-form')).toHaveLength(1);
  });

  it('renders exactly one form fill-in on a card without a comments room', () => {
    mocks.hasCommentsRoom = false;
    render(<LazyCalloutItem calloutId="callout-1" calloutsSetId="callouts-set-1" />);
    expect(screen.getAllByTestId('framing-form')).toHaveLength(1);
  });
});

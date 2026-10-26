/**
 * @vitest-environment jsdom
 *
 * Regression: reopening a callout must show the callout comments added since
 * it was last loaded, whichever opener mounts the dialog.
 *
 * With no post selected, the dialog's thread is `callout.comments`, handed to
 * the real CalloutCommentsConnector as `roomData`, which then runs no query of
 * its own. The callout itself comes from a cache-first query, and the live room
 * subscription only carries messages posted while the dialog is open. So a
 * comment posted while the dialog was closed (the one a notification points
 * at) exists nowhere in the client unless the dialog revalidates the room.
 *
 * The harness below stands in for the callout loader: it renders the dialog
 * from the cache only (it never issues a request itself), the way an opener
 * renders a callout that was loaded earlier in the session. Every network
 * request therefore comes from the dialog connector. Server responses are
 * delayed so the test can observe that the cached thread stays on screen while
 * the revalidation is in flight.
 */
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, useQuery } from '@apollo/client';
import { type MockedResponse, MockLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { typePolicies } from '@/core/apollo/config/typePolicies';
import { CalloutCommentsRevalidateDocument } from '@/core/apollo/generated/apollo-hooks';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

// jsdom has no IntersectionObserver. The dialog mounts the comments connector
// with `eager`, so the sentinel never needs to fire.
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}));

// The live subscription is not what this test is about: it only covers the
// time the dialog is open, and the gap being tested is the time it was closed.
vi.mock('@/domain/collaboration/callout/useSubscribeOnRoomEvents', () => ({ default: () => false }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: undefined, isAuthenticated: false }),
}));
vi.mock('../hooks/useMentionableContributors', () => ({ useMentionableContributors: () => vi.fn() }));

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
  mapCalloutDetailsToDialogData: () => ({ id: 'callout-1', title: 'Callout' }),
  mapReferenceToStripData: vi.fn(),
}));

// Dialog chrome only: it renders the comment slot the connector hands it, which
// is the real thread from CalloutCommentsConnector.
vi.mock('@/crd/components/callout/CalloutDetailDialog', () => ({
  CalloutDetailDialog: (props: { open: boolean; commentsSlot?: ReactNode }) =>
    props.open ? <div data-testid="callout-dialog">{props.commentsSlot}</div> : null,
}));

// Framing, contribution and sharing surfaces this callout does not use.
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({ CrdMemoDialog: () => null }));
vi.mock('@/main/crdPages/memo/MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: () => null,
}));
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

import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

const CALLOUT_ID = 'callout-1';
const ROOM_ID = 'room-1';

const message = (id: string, body: string) => ({
  __typename: 'Message',
  id,
  message: body,
  timestamp: 1700000000000,
  reactions: [],
  threadID: null,
  sender: null,
  attachments: [],
});

const calloutComments = (messages: ReturnType<typeof message>[]) => ({
  lookup: {
    __typename: 'LookupQueryResults',
    callout: {
      __typename: 'Callout',
      id: CALLOUT_ID,
      comments: {
        __typename: 'Room',
        id: ROOM_ID,
        attachmentBucketId: null,
        messagesCount: messages.length,
        authorization: { __typename: 'Authorization', id: 'room-auth-1', myPrivileges: [] },
        messages,
        vcInteractions: [],
      },
    },
  },
});

const serverResponse = (messages: ReturnType<typeof message>[]): MockedResponse => ({
  request: { query: CalloutCommentsRevalidateDocument, variables: { calloutId: CALLOUT_ID } },
  delay: 50,
  result: { data: calloutComments(messages) },
});

type CachedCallout = { lookup: { callout: { comments: unknown } } };

const CachedCalloutDialog = ({ open }: { open: boolean }) => {
  const { data } = useQuery<CachedCallout>(CalloutCommentsRevalidateDocument, {
    variables: { calloutId: CALLOUT_ID },
    fetchPolicy: 'cache-only',
  });
  const comments = data?.lookup.callout.comments;
  if (!comments) return null;
  const callout = {
    id: CALLOUT_ID,
    draft: false,
    contributions: [],
    comments,
    reactionsSummary: null,
    framing: { type: CalloutFramingType.None, profile: { displayName: 'Callout' } },
    settings: {
      framing: { commentsEnabled: true },
      contribution: { enabled: false, allowedTypes: [], commentsEnabled: false },
    },
  };
  return <CalloutDetailDialogConnector open={open} onOpenChange={vi.fn()} callout={callout as never} />;
};

type Opener = 'feed card (dialog stays mounted, open toggles)' | 'deep link (dialog mounts per open)';

const setup = () => {
  const first = message('message-1', 'First comment');
  const second = message('message-2', 'Comment from the notification');

  let completedRequests = 0;
  const countCompleted = new ApolloLink((operation, forward) =>
    forward(operation).map(result => {
      completedRequests += 1;
      return result;
    })
  );
  const client = new ApolloClient({
    link: countCompleted.concat(new MockLink([serverResponse([first]), serverResponse([first, second])])),
    cache: new InMemoryCache({ typePolicies }),
  });
  // The callout was loaded earlier in the session.
  client.writeQuery({
    query: CalloutCommentsRevalidateDocument,
    variables: { calloutId: CALLOUT_ID },
    data: calloutComments([first]),
  });

  return { client, completed: () => completedRequests };
};

describe('CalloutDetailDialogConnector — reopening shows callout comments added meanwhile', () => {
  it.each<Opener>([
    'feed card (dialog stays mounted, open toggles)',
    'deep link (dialog mounts per open)',
  ])('opened from a %s', async opener => {
    const { client, completed } = setup();
    const tree = (open: boolean, mounted: boolean) => (
      <ApolloProvider client={client}>{mounted && <CachedCalloutDialog open={open} />}</ApolloProvider>
    );
    const isFeed = opener === 'feed card (dialog stays mounted, open toggles)';

    // First open: the thread shows the cached comment and is revalidated.
    const view = render(tree(true, true));
    expect(screen.getByText('First comment')).toBeTruthy();
    await waitFor(() => expect(completed()).toBe(1));

    // Close. Someone comments while the dialog is closed.
    view.rerender(tree(false, isFeed));
    expect(screen.queryByTestId('callout-dialog')).toBeNull();

    // Reopen: the cached thread is on screen at once, before the server answers...
    view.rerender(tree(true, true));
    expect(screen.getByText('First comment')).toBeTruthy();
    expect(screen.queryByText('Comment from the notification')).toBeNull();

    // ...and the comment posted while it was closed appears once it does.
    await waitFor(() => expect(screen.getByText('Comment from the notification')).toBeTruthy());
    expect(screen.getByText('First comment')).toBeTruthy();
    expect(completed()).toBe(2);
  });
});

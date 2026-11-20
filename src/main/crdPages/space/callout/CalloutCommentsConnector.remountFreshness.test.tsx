/**
 * @vitest-environment jsdom
 *
 * Regression: opening a post response a second time in the same session must
 * show comments that arrived in between.
 *
 * The post-response comment thread in the callout detail dialog is fed by
 * `useCalloutContributionCommentsQuery` inside this connector (the dialog
 * passes `contributionId` and leaves `roomData` undefined, so the query is the
 * only producer on that path). Apollo's default watch-query fetch policy is
 * `cache-first` and the client configures no `defaultOptions`, so on a second
 * mount the already-normalized `Room` is served straight from the cache and no
 * request goes out. The live room subscription cannot cover the gap either: it
 * only delivers messages published while it is active, and it is torn down with
 * the dialog. Result: a comment posted between the two opens stays invisible
 * until a full page reload drops the cache.
 *
 * The test mounts the connector twice against ONE Apollo client (so the second
 * mount sees a warm cache) and asserts the second mount renders the message
 * that only the second server response contains. Under `cache-first` the
 * second response is never requested and the assertion fails; it passes only
 * when the connector actually revalidates on mount.
 */
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { type MockedResponse, MockLink } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { typePolicies } from '@/core/apollo/config/typePolicies';
import { CalloutContributionCommentsDocument } from '@/core/apollo/generated/apollo-hooks';
import type { CalloutContributionCommentsQuery } from '@/core/apollo/generated/graphql-schema';

// jsdom has no IntersectionObserver. The connector is exercised through its
// `eager` path (what the dialog uses), so the sentinel never needs to fire.
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}));

// Stand in for the rendering half of the connector (CRD comment thread, live
// subscription, mutations, current-user context). It renders exactly what the
// real thread renders — the `room.messages` the connector hands it — so the
// assertion below is about which room the connector supplies, not about how it
// is painted.
vi.mock('../hooks/useCrdRoomComments', () => ({
  useCrdRoomComments: ({ room }: { room?: { messages: { id: string; message: string }[] } }) => ({
    thread: (
      <div data-testid="thread">
        {(room?.messages ?? []).map(message => (
          <p key={message.id}>{message.message}</p>
        ))}
      </div>
    ),
    commentInput: null,
    commentCount: room?.messages?.length ?? 0,
  }),
}));

import { CalloutCommentsConnector } from './CalloutCommentsConnector';

const CONTRIBUTION_ID = 'contribution-1';
const ROOM_ID = 'room-1';

type Message = NonNullable<
  NonNullable<CalloutContributionCommentsQuery['lookup']['contribution']>['post']
>['comments']['messages'][number];

// Nullable fields are sent as `null`, the way the server does — not omitted and
// not `undefined`. A field the cache never received is a cache MISS, which makes
// even `cache-first` fall through to the network and would hide the very defect
// this test is here to catch.
const message = (id: string, body: string): Message =>
  ({
    __typename: 'Message',
    id,
    message: body,
    timestamp: 1700000000000,
    threadID: null,
    reactions: [],
    sender: null,
    attachments: [],
  }) as unknown as Message;

const commentsMock = (messages: Message[]): MockedResponse<CalloutContributionCommentsQuery> => ({
  request: {
    query: CalloutContributionCommentsDocument,
    variables: { contributionId: CONTRIBUTION_ID, includePost: true },
  },
  result: {
    data: {
      __typename: 'Query',
      lookup: {
        __typename: 'LookupQueryResults',
        contribution: {
          __typename: 'CalloutContribution',
          id: CONTRIBUTION_ID,
          post: {
            __typename: 'Post',
            id: 'post-1',
            comments: {
              __typename: 'Room',
              id: ROOM_ID,
              messagesCount: messages.length,
              authorization: { __typename: 'Authorization', id: 'auth-1', myPrivileges: [] },
              messages,
              vcInteractions: [],
            },
          },
        },
      },
    },
  },
});

describe('CalloutCommentsConnector — reopening a post response shows comments added meanwhile', () => {
  it('renders the comment that arrived between two opens of the same response', async () => {
    const first = message('message-1', 'First comment');
    const second = message('message-2', 'Comment from the notification');

    const client = new ApolloClient({
      link: new MockLink([commentsMock([first]), commentsMock([first, second])]),
      cache: new InMemoryCache({ typePolicies }),
    });

    const renderConnector = () =>
      render(
        <ApolloProvider client={client}>
          <CalloutCommentsConnector roomId={ROOM_ID} contributionId={CONTRIBUTION_ID} eager={true} />
        </ApolloProvider>
      );

    // First open of the response — the thread loads and the cache warms up.
    const firstOpen = renderConnector();
    await waitFor(() => expect(document.body.textContent).toContain('First comment'));
    expect(document.body.textContent).not.toContain('Comment from the notification');

    // The dialog closes: the connector unmounts and the live subscription goes
    // with it. Someone comments while it is closed.
    firstOpen.unmount();

    // Reopening from the in-app notification remounts the connector against the
    // warm cache — it must still show the current thread.
    renderConnector();
    await waitFor(() => expect(document.body.textContent).toContain('Comment from the notification'));
    expect(document.body.textContent).toContain('First comment');
  });
});

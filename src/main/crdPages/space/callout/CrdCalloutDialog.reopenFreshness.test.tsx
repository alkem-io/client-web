/**
 * @vitest-environment jsdom
 *
 * Regression: opening a callout a second time in the same session must show
 * the callout comments that arrived in between.
 *
 * With no post selected, the callout dialog feeds its comment thread straight
 * from `callout.comments` of the `CalloutDetails` query (the comments connector
 * receives it as `roomData` and skips its own query). Both dialog openers below
 * read that query through `useCalloutDetails`. Under Apollo's default
 * `cache-first`, a callout opened earlier in the session is served from the
 * normalized cache on the second open and no request goes out; the live room
 * subscription only carries messages posted while the dialog is open. So a
 * comment posted between two opens — the one an in-app notification points at —
 * stays invisible until a full reload.
 *
 * Each case mounts an opener twice against ONE Apollo client (warm cache on the
 * second mount) and asserts that:
 *  - the second mount paints the cached thread straight away, with no spinner,
 *    while the revalidation is still in flight (the second response is delayed
 *    so that window is observable), and
 *  - the comment only the second server response contains then appears.
 * Under `cache-first` the second response is never requested and the last
 * assertion fails.
 */
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { type MockedResponse, MockLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import {
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  Kind,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { typePolicies } from '@/core/apollo/config/typePolicies';
import { CalloutDetailsDocument } from '@/core/apollo/generated/apollo-hooks';
import { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

const CALLOUT_ID = 'callout-1';
const CALLOUTS_SET_ID = 'callouts-set-1';
const ROOM_ID = 'room-1';

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ calloutId: 'callout-1', calloutsSetId: 'callouts-set-1', loading: false }),
}));

vi.mock('@/main/ui/layout/MemoSigningReturnContext', () => ({
  useMemoSigningReturnContext: () => ({
    restoreIntent: undefined,
    setRestoreIntent: vi.fn(),
    setRestoreResolution: vi.fn(),
    routeSettlementRequest: undefined,
    setRouteSettlement: vi.fn(),
  }),
}));

vi.mock('@/domain/space/hooks/useSpacePermissionsAndEntitlements', () => ({
  default: () => ({ permissions: { canSaveAsTemplate: false }, entitlements: { entitledToSaveAsTemplate: false } }),
}));

vi.mock('@/domain/collaboration/calloutsSet/authorization/useCalloutsSetAuthorization', () => ({
  useCalloutsSetAuthorization: () => ({ canMoveCallouts: false }),
}));

vi.mock('@/crd/components/common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

// Stand in for the dialog. With no post selected the real dialog hands
// `callout.comments` to the comment thread as its room, so rendering those
// messages is exactly what the user sees in the callout's own thread.
vi.mock('./CalloutDeeplinkView', () => ({
  CalloutDeeplinkView: ({ callout }: { callout: { comments?: { messages: { id: string; message: string }[] } } }) => (
    <div data-testid="thread">
      {(callout.comments?.messages ?? []).map(message => (
        <p key={message.id}>{message.message}</p>
      ))}
    </div>
  ),
}));

import { CrdCalloutDialogById } from './CrdCalloutDialogById';
import { CrdCalloutDialogFromUrl } from './CrdCalloutDialogFromUrl';

// The CalloutDetails payload is large. Rather than hand-writing it, derive it
// from the query document: every selected field is present, set to `null`
// unless overridden. A field the cache never received is a cache MISS, which
// would make even `cache-first` go to the network and hide the defect, so the
// payload has to be complete. The test also asserts that it is.
const fragments = new Map(
  (CalloutDetailsDocument as DocumentNode).definitions
    .filter((definition): definition is FragmentDefinitionNode => definition.kind === Kind.FRAGMENT_DEFINITION)
    .map(definition => [definition.name.value, definition])
);

const fieldsOf = (selectionSet: SelectionSetNode): FieldNode[] =>
  selectionSet.selections.flatMap(selection => {
    if (selection.kind === Kind.FIELD) return [selection];
    if (selection.kind === Kind.INLINE_FRAGMENT) return fieldsOf(selection.selectionSet);
    const fragment = fragments.get(selection.name.value);
    return fragment ? fieldsOf(fragment.selectionSet) : [];
  });

const selectionAt = (selectionSet: SelectionSetNode, path: string[]): SelectionSetNode =>
  path.reduce((current, name) => {
    const field = fieldsOf(current).find(candidate => candidate.name.value === name && candidate.selectionSet);
    if (!field?.selectionSet) throw new Error(`No selection for ${path.join('.')}`);
    return field.selectionSet;
  }, selectionSet);

const nulls = (selectionSet: SelectionSetNode): Record<string, unknown> =>
  Object.fromEntries(fieldsOf(selectionSet).map(field => [field.alias?.value ?? field.name.value, null]));

const operation = (CalloutDetailsDocument as DocumentNode).definitions.find(
  (definition): definition is OperationDefinitionNode => definition.kind === Kind.OPERATION_DEFINITION
);
if (!operation) throw new Error('CalloutDetails has no operation');
const calloutSelection = selectionAt(operation.selectionSet, ['lookup', 'callout']);

const message = (id: string, body: string) => ({
  ...nulls(selectionAt(calloutSelection, ['comments', 'messages'])),
  __typename: 'Message',
  id,
  message: body,
  timestamp: 1700000000000,
});

const calloutDetailsMock = (
  messages: ReturnType<typeof message>[],
  delay?: number
): MockedResponse<Record<string, unknown>> => ({
  request: { query: CalloutDetailsDocument, variables: { calloutId: CALLOUT_ID, withClassification: true } },
  delay,
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        callout: {
          ...nulls(calloutSelection),
          __typename: 'Callout',
          id: CALLOUT_ID,
          settings: {
            ...nulls(selectionAt(calloutSelection, ['settings'])),
            __typename: 'CalloutSettings',
            visibility: CalloutVisibility.Published,
          },
          comments: {
            ...nulls(selectionAt(calloutSelection, ['comments'])),
            __typename: 'Room',
            id: ROOM_ID,
            messagesCount: messages.length,
            messages,
          },
        },
      },
    },
  },
});

const openers: [string, () => ReactElement][] = [
  ['from a notification / deep link', () => <CrdCalloutDialogFromUrl onClose={vi.fn()} />],
  [
    'in place by id',
    () => <CrdCalloutDialogById calloutId={CALLOUT_ID} calloutsSetId={CALLOUTS_SET_ID} onClose={vi.fn()} />,
  ],
];

describe('Callout dialog — reopening a callout shows its comments added meanwhile', () => {
  it.each(openers)('renders the comment that arrived between two opens (%s)', async (_name, opener) => {
    const first = message('message-1', 'First comment');
    const second = message('message-2', 'Comment from the notification');

    const client = new ApolloClient({
      link: new MockLink([calloutDetailsMock([first]), calloutDetailsMock([first, second], 50)]),
      cache: new InMemoryCache({ typePolicies }),
    });

    const open = () =>
      render(
        <MemoryRouter>
          <ApolloProvider client={client}>{opener()}</ApolloProvider>
        </MemoryRouter>
      );

    // First open — the callout loads and the cache warms up.
    const firstOpen = open();
    await waitFor(() => expect(screen.getByText('First comment')).toBeTruthy());
    expect(screen.queryByText('Comment from the notification')).toBeNull();
    // The cached callout must be complete, or the second open would miss the
    // cache and refetch regardless of the fetch policy.
    expect(
      client.readQuery({
        query: CalloutDetailsDocument,
        variables: { calloutId: CALLOUT_ID, withClassification: true },
      })
    ).not.toBeNull();

    // The dialog closes; someone comments while it is closed.
    firstOpen.unmount();

    // Second open: the cached thread is painted immediately, with no spinner,
    // while the revalidation is still in flight...
    open();
    expect(screen.getByText('First comment')).toBeTruthy();
    expect(screen.queryByTestId('loading-spinner')).toBeNull();
    expect(screen.queryByText('Comment from the notification')).toBeNull();

    // ...and the current thread replaces it once the server answers.
    await waitFor(() => expect(screen.getByText('Comment from the notification')).toBeTruthy());
    expect(screen.getByText('First comment')).toBeTruthy();
    expect(screen.queryByTestId('loading-spinner')).toBeNull();
  });
});

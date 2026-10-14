import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationEventType } from '@/core/apollo/generated/graphql-schema';

const harness = vi.hoisted(() => ({
  onData: undefined as ((options: { data: { data: unknown } }) => void) | undefined,
  updateQuery: vi.fn(),
  readQuery: vi.fn(),
}));

vi.mock('@apollo/client', () => ({
  useApolloClient: () => ({ cache: { updateQuery: harness.updateQuery, readQuery: harness.readQuery } }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  ConversationDetailsDocument: {},
  UserConversationsDocument: {},
  UserConversationsUnreadCountDocument: {},
  useConversationEventsSubscription: (options: { onData: typeof harness.onData }) => {
    harness.onData = options.onData;
  },
}));
vi.mock('@/core/apollo/utils/evictFromCache', () => ({ evictFromCache: vi.fn() }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ isAuthenticated: true, userModel: { id: 'me' } }),
}));
vi.mock('./UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: true,
    selectedConversationId: null,
    setSelectedConversationId: vi.fn(),
    setSelectedRoomId: vi.fn(),
  }),
}));

import { useConversationEventsSubscription } from './useConversationEventsSubscription';

const deliver = (event: Record<string, unknown>) => harness.onData?.({ data: { data: { conversationEvents: event } } });

describe('useConversationEventsSubscription', () => {
  beforeEach(() => {
    harness.updateQuery.mockReset();
    harness.readQuery.mockReset();
    renderHook(() => useConversationEventsSubscription());
  });

  it('ignores message events: content comes from sync, so no cache is written', () => {
    deliver({ eventType: ConversationEventType.MessageReceived, messageReceived: { message: { id: 'm' } } });
    deliver({ eventType: ConversationEventType.MessageRemoved, messageRemoved: { messageID: 'm' } });
    deliver({ eventType: ConversationEventType.ReadReceiptUpdated, readReceiptUpdated: { lastReadEventId: 'm' } });

    expect(harness.updateQuery).not.toHaveBeenCalled();
  });

  it('still applies control events to the conversation list', () => {
    deliver({
      eventType: ConversationEventType.ConversationDeleted,
      conversationDeleted: { conversationID: 'c1' },
    });

    expect(harness.updateQuery).toHaveBeenCalled();
  });
});

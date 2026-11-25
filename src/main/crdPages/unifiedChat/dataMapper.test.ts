import { describe, expect, it } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { ConversationMessage, MessageReaction } from '@/main/userMessaging/models';
import {
  GUIDANCE_INTRO_ID,
  injectGuidanceIntro,
  isGuidanceConversation,
  mapConversationToListItem,
  mapMembersToGroupMembers,
  mapMessageToChatMessage,
  mapReactionsToCommentReactions,
  sortUnifiedConversations,
  type UnifiedConversation,
  withActiveCallsFirst,
} from './dataMapper';

const GUIDANCE_VC = 'vc-guidance';
const ME = 'user-me';

const makeConversation = (overrides: Partial<UnifiedConversation> = {}): UnifiedConversation => ({
  id: 'c1',
  roomId: 'r1',
  isGroup: false,
  displayName: 'Conversation',
  avatarUri: undefined,
  unreadCount: 0,
  createdDate: new Date(0),
  lastMessage: undefined,
  members: [],
  isGuidance: false,
  pinned: false,
  userPinned: false,
  ...overrides,
});

describe('isGuidanceConversation', () => {
  it('returns false when there is no guidance VC id', () => {
    expect(isGuidanceConversation([{ id: ME }, { id: GUIDANCE_VC }], null)).toBe(false);
  });

  it('flags a 1:1 conversation with the guidance VC', () => {
    expect(isGuidanceConversation([{ id: ME }, { id: GUIDANCE_VC }], GUIDANCE_VC)).toBe(true);
  });

  it('does NOT flag a 3+ member group that merely includes the guidance VC', () => {
    expect(isGuidanceConversation([{ id: ME }, { id: 'u2' }, { id: GUIDANCE_VC }], GUIDANCE_VC)).toBe(false);
  });

  it('returns false when the guidance VC is not a member', () => {
    expect(isGuidanceConversation([{ id: ME }, { id: 'u2' }], GUIDANCE_VC)).toBe(false);
  });
});

describe('sortUnifiedConversations', () => {
  it('places the pinned guidance conversation first, then newly-created, then by recency', () => {
    const guidance = makeConversation({ id: 'g', pinned: true, isGuidance: true, createdDate: new Date(1) });
    const newly = makeConversation({ id: 'new', createdDate: new Date(2) });
    const older = makeConversation({
      id: 'older',
      lastMessage: { id: 'm1', message: 'hi', timestamp: 100, reactions: [], attachments: [] },
    });
    const newer = makeConversation({
      id: 'newer',
      lastMessage: { id: 'm2', message: 'yo', timestamp: 200, reactions: [], attachments: [] },
    });

    const sorted = sortUnifiedConversations([older, newly, newer, guidance], 'new');
    expect(sorted.map(c => c.id)).toEqual(['g', 'new', 'newer', 'older']);
  });

  it('places user-pinned conversations below guidance and above the rest, newest first within each group', () => {
    const message = (timestamp: number) => ({
      id: `m${timestamp}`,
      message: 'x',
      timestamp,
      reactions: [],
      attachments: [],
    });
    const guidance = makeConversation({ id: 'g', pinned: true, isGuidance: true, createdDate: new Date(1) });
    const pinnedOld = makeConversation({ id: 'pinned-old', userPinned: true, lastMessage: message(100) });
    const pinnedNew = makeConversation({ id: 'pinned-new', userPinned: true, lastMessage: message(300) });
    const newly = makeConversation({ id: 'new', createdDate: new Date(2) });
    const recent = makeConversation({ id: 'recent', lastMessage: message(500) });
    const stale = makeConversation({ id: 'stale', lastMessage: message(50) });

    const sorted = sortUnifiedConversations([stale, pinnedOld, recent, newly, pinnedNew, guidance], 'new');
    expect(sorted.map(c => c.id)).toEqual(['g', 'pinned-new', 'pinned-old', 'new', 'recent', 'stale']);
  });

  it('keeps a user-pinned newly-created conversation in the pinned group by recency', () => {
    const pinnedNewly = makeConversation({ id: 'new', userPinned: true, createdDate: new Date(10) });
    const pinnedRecent = makeConversation({
      id: 'pinned-recent',
      userPinned: true,
      lastMessage: { id: 'm', message: 'x', timestamp: 500, reactions: [], attachments: [] },
    });

    const sorted = sortUnifiedConversations([pinnedNewly, pinnedRecent], 'new');
    expect(sorted.map(c => c.id)).toEqual(['pinned-recent', 'new']);
  });
});

describe('mapReactionsToCommentReactions', () => {
  const reaction = (emoji: string, senderId: string): MessageReaction => ({
    id: `${emoji}-${senderId}`,
    emoji,
    timestamp: 0,
    sender: { id: senderId, profile: { displayName: senderId } },
  });

  it('groups by emoji with counts and hasReacted for the current user', () => {
    const result = mapReactionsToCommentReactions([reaction('👍', ME), reaction('👍', 'u2'), reaction('🎉', 'u2')], ME);
    const thumbs = result.find(r => r.emoji === '👍');
    const party = result.find(r => r.emoji === '🎉');
    expect(thumbs).toMatchObject({ count: 2, hasReacted: true });
    expect(party).toMatchObject({ count: 1, hasReacted: false });
  });
});

describe('mapMessageToChatMessage', () => {
  it('marks own messages and maps sender to an author', () => {
    const msg: ConversationMessage = {
      id: 'm1',
      message: 'hello',
      timestamp: 500,
      sender: { id: ME, displayName: 'Me', avatarUri: undefined, presence: 'unknown' },
      reactions: [],
      attachments: [],
    };
    const result = mapMessageToChatMessage(msg, { currentUserId: ME });
    expect(result).toMatchObject({ id: 'm1', isOwn: true, timestampMs: 500 });
    expect(result.author).toMatchObject({ id: ME, name: 'Me' });
  });

  it('treats messages from another sender as not own', () => {
    const msg: ConversationMessage = {
      id: 'm2',
      message: 'hi',
      timestamp: 1,
      sender: { id: 'other', displayName: 'Other', presence: 'unknown' },
      reactions: [],
      attachments: [],
    };
    expect(mapMessageToChatMessage(msg, { currentUserId: ME }).isOwn).toBe(false);
  });

  it('carries the sender presence and status message to the author', () => {
    const msg: ConversationMessage = {
      id: 'm3',
      message: 'hi',
      timestamp: 1,
      sender: { id: 'other', displayName: 'Other', presence: 'away', statusMessage: 'In a workshop' },
      reactions: [],
      attachments: [],
    };
    expect(mapMessageToChatMessage(msg, { currentUserId: ME }).author).toMatchObject({
      presence: 'away',
      statusMessage: 'In a workshop',
    });
  });
});

describe('mapConversationToListItem presence', () => {
  const member = (id: string, presence: 'online' | 'offline') => ({
    id,
    type: ActorType.User,
    displayName: id,
    presence,
  });
  const options = { currentUserId: ME, formatTimestamp: String };

  it('a 1:1 row carries the counterpart presence', () => {
    const conversation = makeConversation({ members: [member(ME, 'offline'), member('ann', 'online')] });
    expect(mapConversationToListItem(conversation, options).presence).toBe('online');
  });

  it.each([
    ['a group', { isGroup: true }],
    ['the guidance conversation', { isGuidance: true }],
  ])('%s row carries no presence', (_name, overrides) => {
    const conversation = makeConversation({ ...overrides, members: [member(ME, 'online'), member('ann', 'online')] });
    expect(mapConversationToListItem(conversation, options).presence).toBeUndefined();
  });
});

describe('mapMembersToGroupMembers', () => {
  it("carries each member's presence and status message, the current user's included", () => {
    const members = [
      { id: ME, type: ActorType.User, displayName: 'Me', presence: 'online' as const, statusMessage: 'Focusing' },
      { id: 'ann', type: ActorType.User, displayName: 'Ann', presence: 'busy' as const },
    ];
    expect(mapMembersToGroupMembers(members, ME)).toEqual([
      { id: ME, name: 'Me', avatarUrl: undefined, isCurrentUser: true, presence: 'online', statusMessage: 'Focusing' },
      {
        id: 'ann',
        name: 'Ann',
        avatarUrl: undefined,
        isCurrentUser: false,
        presence: 'busy',
        statusMessage: undefined,
      },
    ]);
  });
});

describe('injectGuidanceIntro', () => {
  const author = { id: GUIDANCE_VC, name: 'Guidance', isVirtualContributor: true };

  it('returns only the intro when there is no history', () => {
    const result = injectGuidanceIntro([], { text: 'Welcome', author });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: GUIDANCE_INTRO_ID, content: 'Welcome', timestampMs: 0, isOwn: false });
  });

  it('prepends the intro before existing messages', () => {
    const existing = [{ id: 'm1', content: 'hi', timestampMs: 1, reactions: [], isOwn: false }];
    const result = injectGuidanceIntro(existing, { text: 'Welcome', author });
    expect(result.map(m => m.id)).toEqual([GUIDANCE_INTRO_ID, 'm1']);
  });
});

describe('mapMemberToCommentAuthor virtual contributor flag', () => {
  it('is derived from ActorType, not __typename', async () => {
    const { mapMemberToCommentAuthor } = await import('./dataMapper');
    const author = mapMemberToCommentAuthor({
      id: GUIDANCE_VC,
      type: ActorType.VirtualContributor,
      presence: 'unknown',
      displayName: 'Guidance',
    });
    expect(author.isVirtualContributor).toBe(true);
  });
});

describe('withActiveCallsFirst', () => {
  it('moves conversations with a running call to the top, below the pinned one, keeping the order otherwise', () => {
    const items = [
      { id: 'pinned', pinned: true },
      { id: 'recent' },
      { id: 'older-call', hasActiveCall: true },
      { id: 'older' },
      { id: 'oldest-call', hasActiveCall: true },
    ];
    expect(withActiveCallsFirst(items, null).map(item => item.id)).toEqual([
      'pinned',
      'older-call',
      'oldest-call',
      'recent',
      'older',
    ]);
  });

  it('keeps the newly-created conversation directly below the pinned one', () => {
    const items = [{ id: 'pinned', pinned: true }, { id: 'new' }, { id: 'call', hasActiveCall: true }];
    expect(withActiveCallsFirst(items, 'new').map(item => item.id)).toEqual(['pinned', 'new', 'call']);
  });

  it('keeps user-pinned conversations above the newly-created one and running calls', () => {
    const items = [
      { id: 'guidance', pinned: true },
      { id: 'new' },
      { id: 'call', hasActiveCall: true },
      { id: 'user-pinned', userPinned: true },
    ];
    expect(withActiveCallsFirst(items, 'new').map(item => item.id)).toEqual(['guidance', 'user-pinned', 'new', 'call']);
  });
});

describe('calls', () => {
  const ring = (call: ConversationMessage['call'], senderId = 'other'): ConversationMessage => ({
    id: 'ring',
    message: '',
    timestamp: 2_000,
    sender: { id: senderId, displayName: 'Ringer', presence: 'unknown' },
    reactions: [],
    attachments: [],
    call,
  });
  const callFor = (message: ConversationMessage) => mapMessageToChatMessage(message, { currentUserId: ME }).call;

  it('reads an unanswered ring as missed by the person rung and as no answer for the ringer', () => {
    expect(callFor(ring({ outcome: 'unanswered' }))).toEqual({ kind: 'missed' });
    expect(callFor(ring({ outcome: 'unanswered' }, ME))).toEqual({ kind: 'noAnswer' });
  });

  it('reads a declined ring as declined for both', () => {
    expect(callFor(ring({ outcome: 'declined' }))).toEqual({ kind: 'declined' });
    expect(callFor(ring({ outcome: 'declined' }, ME))).toEqual({ kind: 'declined' });
  });

  it('reads an answered call with its length in whole minutes, at least one, and without it when unknown', () => {
    expect(callFor(ring({ outcome: 'answered', durationMs: 12 * 60_000 + 20_000 }))).toEqual({
      kind: 'call',
      minutes: 12,
    });
    expect(callFor(ring({ outcome: 'answered', durationMs: 15_000 }))).toEqual({ kind: 'call', minutes: 1 });
    expect(callFor(ring({ outcome: 'answered' }))).toEqual({ kind: 'call', minutes: undefined });
  });

  it('gives a call no author, so it stands alone in the thread', () => {
    expect(mapMessageToChatMessage(ring({ outcome: 'unanswered' }), { currentUserId: ME }).author).toBeUndefined();
  });

  it('makes a call the last message of the list row, which sorts the conversation by it', () => {
    const options = { currentUserId: ME, formatTimestamp: String };
    const called = makeConversation({ id: 'called', lastMessage: ring({ outcome: 'unanswered' }) });
    const older = makeConversation({ id: 'older', lastMessage: { ...ring(undefined), id: 'm', timestamp: 1_000 } });
    expect(mapConversationToListItem(called, options).lastMessageCall).toBe('missed');
    expect(mapConversationToListItem(older, options).lastMessageCall).toBeUndefined();
    expect(sortUnifiedConversations([older, called], null).map(conversation => conversation.id)).toEqual([
      'called',
      'older',
    ]);
  });
});

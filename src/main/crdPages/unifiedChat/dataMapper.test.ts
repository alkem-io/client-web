import { describe, expect, it } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { ConversationMessage, MessageReaction } from '@/main/userMessaging/models';
import {
  GUIDANCE_INTRO_ID,
  injectGuidanceIntro,
  isGuidanceConversation,
  mapMessageToChatMessage,
  mapReactionsToCommentReactions,
  sortUnifiedConversations,
  type UnifiedConversation,
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
  messagesCount: 0,
  createdDate: new Date(0),
  lastMessage: undefined,
  members: [],
  isGuidance: false,
  pinned: false,
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
      lastMessage: { id: 'm1', message: 'hi', timestamp: 100, reactions: [] },
    });
    const newer = makeConversation({
      id: 'newer',
      lastMessage: { id: 'm2', message: 'yo', timestamp: 200, reactions: [] },
    });

    const sorted = sortUnifiedConversations([older, newly, newer, guidance], 'new');
    expect(sorted.map(c => c.id)).toEqual(['g', 'new', 'newer', 'older']);
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
  const formatTimestamp = (ms: number) => `t:${ms}`;

  it('marks own messages and maps sender to an author', () => {
    const msg: ConversationMessage = {
      id: 'm1',
      message: 'hello',
      timestamp: 500,
      sender: { id: ME, displayName: 'Me', avatarUri: undefined },
      reactions: [],
    };
    const result = mapMessageToChatMessage(msg, { currentUserId: ME, formatTimestamp });
    expect(result).toMatchObject({ id: 'm1', isOwn: true, timestamp: 't:500', timestampMs: 500 });
    expect(result.author).toMatchObject({ id: ME, name: 'Me' });
  });

  it('treats messages from another sender as not own', () => {
    const msg: ConversationMessage = {
      id: 'm2',
      message: 'hi',
      timestamp: 1,
      sender: { id: 'other', displayName: 'Other' },
      reactions: [],
    };
    expect(mapMessageToChatMessage(msg, { currentUserId: ME, formatTimestamp }).isOwn).toBe(false);
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
    const existing = [{ id: 'm1', content: 'hi', timestamp: 't', timestampMs: 1, reactions: [], isOwn: false }];
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
      displayName: 'Guidance',
    });
    expect(author.isVirtualContributor).toBe(true);
  });
});

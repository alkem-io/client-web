import { describe, expect, it } from 'vitest';
import type { ConversationMember } from '../models';
import type { ParsedMessage } from './matrixEvents';
import { nonMemberActorIds, toConversationMessage } from './toConversationMessage';

const member = (id: string, displayName: string): ConversationMember =>
  ({ id, displayName, avatarUri: `https://avatar/${id}`, type: 'USER' }) as ConversationMember;

const parsed = (overrides: Partial<ParsedMessage> = {}): ParsedMessage => ({
  eventId: '$e1',
  body: 'hi',
  timestamp: 5,
  sender: '@alice:hs',
  reactions: [],
  ...overrides,
});

describe('toConversationMessage', () => {
  it('maps the sender to the member whose actor id is the Matrix localpart', () => {
    const message = toConversationMessage(parsed(), {
      members: [member('alice', 'Alice')],
      otherProfiles: new Map(),
      attachments: new Map(),
    });
    expect(message).toEqual({
      id: '$e1',
      message: 'hi',
      timestamp: 5,
      sender: { id: 'alice', displayName: 'Alice', avatarUri: 'https://avatar/alice' },
      reactions: [],
      attachments: [],
    });
  });

  it('uses a looked-up profile for a former member, and no profile when the lookup gave none', () => {
    const context = {
      members: [],
      otherProfiles: new Map([['alice', { displayName: 'Alice (left)' }]]),
      attachments: new Map(),
    };
    expect(toConversationMessage(parsed(), context).sender?.displayName).toBe('Alice (left)');
    expect(toConversationMessage(parsed({ sender: '@ghost:hs' }), context).sender).toEqual({
      id: 'ghost',
      displayName: '',
      avatarUri: undefined,
    });
  });

  it('shows media by filename until resolved, then the resolved attachment', () => {
    const media = parsed({ media: { mediaID: 'm1', displayName: 'photo.png' } });
    const unresolved = toConversationMessage(media, { members: [], otherProfiles: new Map(), attachments: new Map() });
    expect(unresolved.attachments).toEqual([{ displayName: 'photo.png' }]);

    const resolved = toConversationMessage(media, {
      members: [],
      otherProfiles: new Map(),
      attachments: new Map([['$e1', { id: 'doc', url: 'https://doc', displayName: 'photo.png' }]]),
    });
    expect(resolved.attachments).toEqual([{ id: 'doc', url: 'https://doc', displayName: 'photo.png' }]);
  });

  it('maps reactions with their senders', () => {
    const message = toConversationMessage(
      parsed({ reactions: [{ eventId: '$r', emoji: '👍', timestamp: 6, sender: '@bob:hs' }] }),
      { members: [member('bob', 'Bob')], otherProfiles: new Map(), attachments: new Map() }
    );
    expect(message.reactions).toEqual([
      { id: '$r', emoji: '👍', timestamp: 6, sender: { id: 'bob', profile: { displayName: 'Bob' } } },
    ]);
  });
});

describe('nonMemberActorIds', () => {
  it('lists senders and reactors who are not members, once each', () => {
    expect(
      nonMemberActorIds(
        [
          parsed({
            sender: '@alice:hs',
            reactions: [{ eventId: '$r', emoji: 'x', timestamp: 1, sender: '@carol:hs' }],
          }),
          parsed({ sender: '@bob:hs' }),
          parsed({ sender: '@bob:hs' }),
        ],
        [member('alice', 'Alice')]
      ).sort()
    ).toEqual(['bob', 'carol']);
  });
});

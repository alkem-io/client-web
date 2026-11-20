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
      attachmentBucketId: undefined,
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
      attachmentBucketId: undefined,
    };
    expect(toConversationMessage(parsed(), context).sender?.displayName).toBe('Alice (left)');
    expect(toConversationMessage(parsed({ sender: '@ghost:hs' }), context).sender).toEqual({
      id: 'ghost',
      displayName: '',
      avatarUri: undefined,
    });
  });

  it('uses the room bucket and Matrix reference directly for every media event', () => {
    const media = parsed({
      media: { externalReference: 'm1', displayName: 'résumé.mp4', mimeType: 'video/mp4', size: 123 },
    });
    const context = { members: [], otherProfiles: new Map(), attachmentBucketId: 'bucket-A' };
    const [attachment] = toConversationMessage(media, context).attachments;
    expect(attachment).toEqual({
      id: 'm1',
      displayName: 'résumé.mp4',
      mimeType: 'video/mp4',
      size: 123,
      width: undefined,
      height: undefined,
      url: `${window.location.origin}/api/private/rest/storage/file/by-reference?bucketId=bucket-A&ref=m1`,
    });
    const forwarded = toConversationMessage(media, { ...context, attachmentBucketId: 'bucket-B' });
    expect(forwarded.attachments[0].url).toContain('bucketId=bucket-B&ref=m1');
    expect(toConversationMessage(media, { ...context, attachmentBucketId: null }).attachments[0].url).toBeUndefined();
  });

  it('maps reactions with their senders', () => {
    const message = toConversationMessage(
      parsed({ reactions: [{ eventId: '$r', emoji: '👍', timestamp: 6, sender: '@bob:hs' }] }),
      { members: [member('bob', 'Bob')], otherProfiles: new Map(), attachmentBucketId: undefined }
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

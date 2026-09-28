import { describe, expect, it } from 'vitest';
import { lastMessageOf, localMediaId, projectMessages, type RawEvent } from './matrixEvents';

const HS = 'matrix.alkem.io';
const ALICE = `@alice-id:${HS}`;
const BOB = `@bob-id:${HS}`;

let ts = 0;
const event = (type: string, content: Record<string, unknown>, overrides: Partial<RawEvent> = {}): RawEvent => ({
  eventId: `$e${++ts}`,
  type,
  sender: ALICE,
  timestamp: ts,
  content,
  ...overrides,
});

describe('localMediaId', () => {
  it('returns the media id only for this homeserver', () => {
    expect(localMediaId(`mxc://${HS}/abc`, HS)).toBe('abc');
    expect(localMediaId('mxc://other.org/abc', HS)).toBeUndefined();
    expect(localMediaId(`mxc://${HS}/`, HS)).toBeUndefined();
    expect(localMediaId(`mxc://${HS}/a/b`, HS)).toBeUndefined();
    expect(localMediaId('https://example.com/abc', HS)).toBeUndefined();
    expect(localMediaId(undefined, HS)).toBeUndefined();
  });
});

describe('projectMessages', () => {
  it('keeps text messages verbatim and skips blank ones (e.g. redacted)', () => {
    const messages = projectMessages(
      [
        event('m.room.message', { msgtype: 'm.text', body: '**hi**' }),
        event('m.room.message', {}),
        event('m.room.member', { membership: 'join' }),
      ],
      HS
    );
    expect(messages.map(message => message.body)).toEqual(['**hi**']);
  });

  it('surfaces own-homeserver media with the filename, dimensions and document hint', () => {
    const [message] = projectMessages(
      [
        event('m.room.message', {
          msgtype: 'm.image',
          body: 'look at this',
          filename: 'photo.png',
          url: `mxc://${HS}/media-1`,
          info: { w: 40, h: 30, mimetype: 'image/png' },
          'io.alkemio.document_id': 'doc-1',
        }),
      ],
      HS
    );
    expect(message.body).toBe('look at this');
    expect(message.media).toEqual({
      mediaID: 'media-1',
      documentID: 'doc-1',
      displayName: 'photo.png',
      width: 40,
      height: 30,
    });
  });

  it('uses the body as filename only when no filename is declared', () => {
    const [legacy, captioned] = projectMessages(
      [
        event('m.room.message', { msgtype: 'm.file', body: 'report.pdf', url: `mxc://${HS}/m1` }),
        event('m.room.message', { msgtype: 'm.file', body: 'caption', filename: '', url: `mxc://${HS}/m2` }),
      ],
      HS
    );
    expect(legacy.media?.displayName).toBe('report.pdf');
    expect(captioned.media?.displayName).toBe('');
  });

  it('never surfaces a foreign-homeserver media id; without a document hint the event is text only', () => {
    const [foreign] = projectMessages(
      [event('m.room.message', { msgtype: 'm.image', body: 'x.png', url: 'mxc://evil.org/media-1' })],
      HS
    );
    expect(foreign.media).toBeUndefined();
    expect(foreign.body).toBe('x.png');
  });

  it('treats stickers as media without a msgtype', () => {
    const [sticker] = projectMessages([event('m.sticker', { body: 'wave', url: `mxc://${HS}/s1` })], HS);
    expect(sticker.media?.mediaID).toBe('s1');
  });

  it('attaches reactions to their message; reactions without a target are dropped', () => {
    const message = event('m.room.message', { msgtype: 'm.text', body: 'hi' });
    const [projected] = projectMessages(
      [
        message,
        event(
          'm.reaction',
          { 'm.relates_to': { rel_type: 'm.annotation', event_id: message.eventId, key: '👍' } },
          { sender: BOB }
        ),
        event('m.reaction', {}),
      ],
      HS
    );
    expect(projected.reactions).toEqual([expect.objectContaining({ emoji: '👍', sender: BOB })]);
  });
});

describe('lastMessageOf', () => {
  it('returns the newest non-blank message, ignoring reactions and blanks after it', () => {
    const text = event('m.room.message', { msgtype: 'm.text', body: 'latest' });
    const last = lastMessageOf(
      [
        event('m.room.message', { msgtype: 'm.text', body: 'older' }),
        text,
        event('m.reaction', { 'm.relates_to': { event_id: text.eventId, key: 'x' } }),
        event('m.room.message', {}),
      ],
      HS
    );
    expect(last?.body).toBe('latest');
  });
});

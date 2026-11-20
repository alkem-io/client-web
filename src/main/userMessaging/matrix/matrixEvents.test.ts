import { describe, expect, it } from 'vitest';
import { lastMessageOf, newestMessageLikeId, projectMessages, type RawEvent } from './matrixEvents';

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

  it('projects native media metadata and ignores an old document hint', () => {
    const [message] = projectMessages(
      [
        event('m.room.message', {
          msgtype: 'm.image',
          body: 'look at this',
          filename: 'photo.png',
          url: `mxc://${HS}/media-1`,
          info: { w: 40, h: 30, mimetype: 'image/png', size: 123 },
          'io.alkemio.document_id': '0b4f1c2e-7a3d-4e5f-8a9b-1c2d3e4f5a6b',
        }),
      ],
      HS
    );
    expect(message.body).toBe('look at this');
    expect(message.media).toEqual({
      externalReference: 'media-1',
      displayName: 'photo.png',
      mimeType: 'image/png',
      size: 123,
      width: 40,
      height: 30,
    });
  });

  it('drops out-of-range event dimensions without a document lookup', () => {
    const [message] = projectMessages(
      [
        event('m.room.message', {
          msgtype: 'm.image',
          body: 'x.png',
          url: `mxc://${HS}/media-1`,
          info: { w: 3_000_000_000, h: -1 },
          'io.alkemio.document_id': 'not-a-uuid',
        }),
      ],
      HS
    );
    expect(message.media).toEqual({
      externalReference: 'media-1',
      displayName: 'x.png',
      mimeType: undefined,
      size: undefined,
      width: undefined,
      height: undefined,
    });
  });

  it('a document hint cannot turn a foreign or missing media URI into an attachment', () => {
    const messages = projectMessages(
      [
        event('m.room.message', {
          msgtype: 'm.file',
          body: 'foreign.pdf',
          url: 'mxc://foreign.example/media',
          'io.alkemio.document_id': '0b4f1c2e-7a3d-4e5f-8a9b-1c2d3e4f5a6b',
        }),
        event('m.room.message', {
          msgtype: 'm.file',
          body: 'missing.pdf',
          'io.alkemio.document_id': '0b4f1c2e-7a3d-4e5f-8a9b-1c2d3e4f5a6b',
        }),
      ],
      HS
    );
    expect(messages.map(message => message.media)).toEqual([undefined, undefined]);
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

  it('never surfaces a foreign-homeserver media reference', () => {
    const [foreign] = projectMessages(
      [event('m.room.message', { msgtype: 'm.image', body: 'x.png', url: 'mxc://evil.org/media-1' })],
      HS
    );
    expect(foreign.media).toBeUndefined();
    expect(foreign.body).toBe('x.png');
  });

  it('treats stickers as media without a msgtype', () => {
    const [sticker] = projectMessages([event('m.sticker', { body: 'wave', url: `mxc://${HS}/s1` })], HS);
    expect(sticker.media?.externalReference).toBe('s1');
  });

  it('never shows a sticker alt-text as message text, and drops a sticker without a usable url', () => {
    const withUrl = event('m.sticker', { body: 'wave', url: `mxc://${HS}/s1` });
    const withoutUrl = event('m.sticker', { body: 'wave' });
    const messages = projectMessages([withUrl, withoutUrl], HS);
    expect(messages).toHaveLength(1);
    expect(messages[0].body).toBe('');
    expect(messages[0].media?.externalReference).toBe('s1');
    expect(lastMessageOf([withUrl, withoutUrl], HS)?.eventId).toBe(withUrl.eventId);
    expect(lastMessageOf([withoutUrl], HS)).toBeUndefined();
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

describe('call entries', () => {
  const RING_TYPE = 'org.matrix.msc4075.rtc.notification';
  const CALL_MEMBER = 'org.matrix.msc3401.call.member';
  const at = (timestamp: number, type: string, content: Record<string, unknown>, sender = ALICE): RawEvent =>
    event(type, content, { timestamp, sender });
  const ring = (timestamp: number, content: Record<string, unknown> = {}) =>
    at(timestamp, RING_TYPE, { notification_type: 'ring', lifetime: 30_000, ...content });
  const joined = (timestamp: number, sender: string) =>
    at(timestamp, CALL_MEMBER, { application: 'm.call', call_id: '', device_id: 'D' }, sender);
  const left = (timestamp: number, sender: string) => at(timestamp, CALL_MEMBER, {}, sender);
  const text = (timestamp: number, body: string) => at(timestamp, 'm.room.message', { msgtype: 'm.text', body });

  it('places a ring between the messages around it, as an entry without body', () => {
    const before = text(1_000, 'before');
    const call = ring(2_000);
    const after = text(100_000, 'after');
    const messages = projectMessages([before, call, after], HS, { withCalls: true, now: 200_000 });
    expect(messages.map(message => message.eventId)).toEqual([before.eventId, call.eventId, after.eventId]);
    expect(messages[1]).toMatchObject({ body: '', timestamp: 2_000, sender: ALICE, call: 'unanswered' });
    expect(messages[0].call).toBeUndefined();
  });

  it('is answered when the other member joins within the ring lifetime', () => {
    const [entry] = projectMessages([ring(1_000), joined(5_000, BOB)], HS, { withCalls: true, now: 1_000_000 });
    expect(entry.call).toBe('answered');
  });

  it('is not answered by the ringer joining on another device', () => {
    const [entry] = projectMessages([ring(1_000), joined(2_000, ALICE)], HS, { withCalls: true, now: 1_000_000 });
    expect(entry.call).toBe('unanswered');
  });

  it('is not answered by a join after the ring lifetime', () => {
    const [entry] = projectMessages([ring(1_000), joined(40_000, BOB)], HS, { withCalls: true, now: 1_000_000 });
    expect(entry.call).toBe('unanswered');
  });

  it('is unanswered as soon as the ringer leaves, before the lifetime elapses', () => {
    const [entry] = projectMessages([ring(1_000), left(3_000, ALICE)], HS, { withCalls: true, now: 4_000 });
    expect(entry.call).toBe('unanswered');
  });

  it('is ringing while the lifetime runs and nobody joined or left', () => {
    const [entry] = projectMessages([ring(1_000)], HS, { withCalls: true, now: 20_000 });
    expect(entry.call).toBe('ringing');
  });

  it('caps the lifetime at 90 seconds and defaults it to 30 seconds', () => {
    expect(projectMessages([ring(0, { lifetime: 600_000 })], HS, { withCalls: true, now: 90_000 })[0].call).toBe(
      'unanswered'
    );
    expect(projectMessages([ring(0, { lifetime: 600_000 })], HS, { withCalls: true, now: 89_000 })[0].call).toBe(
      'ringing'
    );
    expect(projectMessages([ring(0, { lifetime: undefined })], HS, { withCalls: true, now: 30_000 })[0].call).toBe(
      'unanswered'
    );
    expect(projectMessages([ring(0, { lifetime: undefined })], HS, { withCalls: true, now: 29_000 })[0].call).toBe(
      'ringing'
    );
  });

  it('ignores group call notifications, removed rings and the deprecated call notify event', () => {
    const messages = projectMessages(
      [
        at(1_000, RING_TYPE, { notification_type: 'notification', lifetime: 30_000 }),
        at(2_000, RING_TYPE, {}),
        at(3_000, 'org.matrix.msc4075.call.notify', { notify_type: 'ring', application: 'm.call', call_id: '' }),
      ],
      HS,
      { withCalls: true, now: 100_000 }
    );
    expect(messages).toEqual([]);
  });

  it('makes a ring newer than the last message the conversation preview, with its outcome', () => {
    const call = ring(5_000);
    const last = lastMessageOf([text(1_000, 'hello'), call, joined(6_000, BOB)], HS, { withCalls: true, now: 100_000 });
    expect(last).toMatchObject({ eventId: call.eventId, call: 'answered' });
  });

  it('moves the read marker to a ring newer than the last message', () => {
    const call = ring(5_000);
    expect(newestMessageLikeId([text(1_000, 'hello'), call, joined(6_000, BOB)], true)).toBe(call.eventId);
  });

  it('makes no entry, preview or read marker from a ring where calls are not shown', () => {
    const hello = text(1_000, 'hello');
    const events = [hello, ring(2_000), joined(6_000, BOB)];
    expect(projectMessages(events, HS, { now: 100_000 }).map(message => message.eventId)).toEqual([hello.eventId]);
    expect(lastMessageOf(events, HS, { now: 100_000 })?.eventId).toBe(hello.eventId);
    expect(newestMessageLikeId(events)).toBe(hello.eventId);
  });
});

import { describe, expect, it } from 'vitest';
import {
  callOf,
  lastMessageOf,
  newestEntryId,
  projectMessages,
  type RawEvent,
  ringingRingId,
  ringingUntil,
} from './matrixEvents';

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

describe('calls', () => {
  const RING = 'org.matrix.msc4075.rtc.notification';
  const at = (timestamp: number, type: string, content: Record<string, unknown>, sender = ALICE): RawEvent =>
    event(type, content, { timestamp, sender });
  const ring = (timestamp: number, content: Record<string, unknown> = {}) =>
    at(timestamp, RING, { notification_type: 'ring', lifetime: 30_000, ...content });
  // The older membership is a state event, empty once the device has left.
  const callMember = (timestamp: number, sender: string, joined: boolean) =>
    at(timestamp, 'org.matrix.msc3401.call.member', joined ? { application: 'm.call', device_id: 'D' } : {}, sender);
  // The newer one says whether its member joined or left.
  const rtcMember = (timestamp: number, sender: string, membership: 'join' | 'leave') =>
    at(timestamp, 'org.matrix.msc4143.rtc.member', { slot_id: 's', member: { id: 'm', membership } }, sender);
  const text = (timestamp: number, body: string) => at(timestamp, 'm.room.message', { msgtype: 'm.text', body });
  // What became of the first event, a ring, judged by the events after it.
  const judged = ([first, ...newer]: RawEvent[], now = 1_000_000) => callOf(first, newer, now);

  it('places a ring at its time between the messages around it, without a body', () => {
    const before = text(1_000, 'before');
    const call = ring(2_000);
    const after = text(100_000, 'after');
    const messages = projectMessages([before, call, after], HS, { withCalls: true, now: 200_000 });
    expect(messages.map(message => message.eventId)).toEqual([before.eventId, call.eventId, after.eventId]);
    expect(messages[1]).toMatchObject({ body: '', timestamp: 2_000, sender: ALICE, call: { outcome: 'unanswered' } });
    expect(messages[0].call).toBeUndefined();
  });

  it('is answered when the other person joins while it rings, lasting until either leaves', () => {
    expect(judged([ring(1_000), callMember(5_000, BOB, true), callMember(725_000, ALICE, false)])).toEqual({
      outcome: 'answered',
      durationMs: 720_000,
    });
    expect(judged([ring(1_000), rtcMember(5_000, BOB, 'join'), rtcMember(65_000, BOB, 'leave')])).toEqual({
      outcome: 'answered',
      durationMs: 60_000,
    });
  });

  it('has no length while the leave that ended an answered call is not loaded', () => {
    expect(judged([ring(1_000), rtcMember(5_000, BOB, 'join')])).toEqual({ outcome: 'answered' });
  });

  it('is declined when the person rung turns it down', () => {
    const call = ring(1_000);
    const decline = at(3_000, 'org.matrix.msc4310.rtc.decline', { 'm.relates_to': { event_id: call.eventId } }, BOB);
    expect(judged([call, decline, callMember(4_000, ALICE, false)])).toEqual({ outcome: 'declined' });
  });

  it('is not declined by a decline of another ring', () => {
    const decline = at(3_000, 'org.matrix.msc4310.rtc.decline', { 'm.relates_to': { event_id: '$other' } }, BOB);
    expect(judged([ring(1_000), decline], 20_000)).toEqual({ outcome: 'ringing' });
  });

  it('is unanswered once the ringer leaves or the ring lifetime passes, and not answered by a join after the ringer left', () => {
    expect(judged([ring(1_000), rtcMember(3_000, ALICE, 'leave')], 4_000)).toEqual({ outcome: 'unanswered' });
    expect(judged([ring(1_000)], 31_000)).toEqual({ outcome: 'unanswered' });
    expect(judged([ring(1_000), rtcMember(35_000, ALICE, 'leave'), callMember(40_000, BOB, true)])).toEqual({
      outcome: 'unanswered',
    });
    expect(judged([ring(1_000), callMember(2_000, ALICE, true)])).toEqual({ outcome: 'unanswered' });
  });

  it('is answered by a join after the ring stopped while the ringer is still in the call', () => {
    expect(judged([ring(1_000), callMember(40_000, BOB, true), callMember(640_000, BOB, false)])).toEqual({
      outcome: 'answered',
      durationMs: 600_000,
    });
  });

  it('is ringing while the lifetime runs and nobody joined or left', () => {
    expect(judged([ring(1_000)], 20_000)).toEqual({ outcome: 'ringing' });
  });

  it('caps the lifetime at 90 seconds and defaults it to 30 seconds', () => {
    expect(judged([ring(0, { lifetime: 600_000 })], 89_000)?.outcome).toBe('ringing');
    expect(judged([ring(0, { lifetime: 600_000 })], 90_000)?.outcome).toBe('unanswered');
    expect(judged([ring(0, { lifetime: undefined })], 29_000)?.outcome).toBe('ringing');
    expect(judged([ring(0, { lifetime: undefined })], 30_000)?.outcome).toBe('unanswered');
  });

  it('takes the older call notify ring too, and no group notification or withdrawn ring', () => {
    const notify = at(3_000, 'org.matrix.msc4075.call.notify', { notify_type: 'ring', application: 'm.call' });
    const messages = projectMessages(
      [
        at(1_000, RING, { notification_type: 'notification', lifetime: 30_000 }),
        at(2_000, RING, { msc4354_sticky_key: 's' }),
        notify,
        at(4_000, 'org.matrix.msc4075.call.notify', { notify_type: 'notify', application: 'm.call' }),
      ],
      HS,
      { withCalls: true, now: 100_000 }
    );
    expect(messages.map(message => message.eventId)).toEqual([notify.eventId]);
  });

  it('makes a ring newer than the last message the preview, and moves the read marker to it', () => {
    const call = ring(5_000);
    const events = [text(1_000, 'hello'), call, rtcMember(6_000, BOB, 'join')];
    expect(lastMessageOf(events, HS, { withCalls: true, now: 100_000 })).toMatchObject({
      eventId: call.eventId,
      call: { outcome: 'answered' },
    });
    expect(newestEntryId(events, { withCalls: true, now: 100_000 })).toBe(call.eventId);
  });

  it('makes no entry, preview or read marker from a ring still ringing, and says when it stops', () => {
    const hello = text(1_000, 'hello');
    const call = ring(2_000);
    const events = [hello, call];
    const at = { withCalls: true, now: 20_000 };
    expect(projectMessages(events, HS, at).map(message => message.eventId)).toEqual([hello.eventId]);
    expect(lastMessageOf(events, HS, at)?.eventId).toBe(hello.eventId);
    expect(newestEntryId(events, at)).toBe(hello.eventId);
    expect(ringingUntil(events, 20_000)).toBe(32_000);

    const later = { withCalls: true, now: 32_000 };
    expect(lastMessageOf(events, HS, later)).toMatchObject({ eventId: call.eventId, call: { outcome: 'unanswered' } });
    expect(newestEntryId(events, later)).toBe(call.eventId);
    expect(ringingUntil(events, 32_000)).toBeUndefined();
  });

  it('names the ring from someone else still ringing, never the user’s own', () => {
    const call = ring(2_000);
    expect(ringingRingId([text(1_000, 'hello'), call], BOB, 20_000)).toBe(call.eventId);
    expect(ringingRingId([call], ALICE, 20_000)).toBeUndefined();
    expect(ringingRingId([call], BOB, 32_000)).toBeUndefined();
    expect(ringingRingId([call, rtcMember(5_000, BOB, 'join')], BOB, 20_000)).toBeUndefined();
  });

  it('makes no entry, preview or read marker from a ring where calls are not shown', () => {
    const hello = text(1_000, 'hello');
    const events = [hello, ring(2_000), rtcMember(6_000, BOB, 'join')];
    expect(projectMessages(events, HS, { now: 100_000 }).map(message => message.eventId)).toEqual([hello.eventId]);
    expect(lastMessageOf(events, HS, { now: 100_000 })?.eventId).toBe(hello.eventId);
    expect(newestEntryId(events)).toBe(hello.eventId);
  });
});

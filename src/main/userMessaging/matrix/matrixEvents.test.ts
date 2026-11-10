import { describe, expect, it } from 'vitest';
import { lastMessageOf, projectMessages, type RawEvent } from './matrixEvents';

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

describe('voice messages', () => {
  // Element Web's `createVoiceMessageContent`, on local media.
  const elementVoice = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    msgtype: 'm.audio',
    body: 'Voice message',
    url: `mxc://${HS}/voice-1`,
    info: { duration: 7300, mimetype: 'audio/ogg', size: 4096 },
    'org.matrix.msc1767.audio': { duration: 7300, waveform: [0, 512, 1024] },
    'org.matrix.msc3245.voice': {},
    ...overrides,
  });
  const voiceOf = (content: Record<string, unknown>) =>
    projectMessages([event('m.room.message', content)], HS)[0].media?.voice;

  it('projects an Element voice message with its duration and waveform', () => {
    const [message] = projectMessages([event('m.room.message', elementVoice())], HS);
    expect(message.body).toBe('Voice message');
    expect(message.media?.externalReference).toBe('voice-1');
    expect(message.media?.voice).toEqual({ durationMs: 7300, waveform: [0, 512, 1024] });
  });

  it('ignores the voice marker without m.audio, and m.audio without the marker', () => {
    const asFile = projectMessages([event('m.room.message', elementVoice({ msgtype: 'm.file' }))], HS)[0];
    expect(asFile.media).toBeDefined();
    expect(asFile.media?.voice).toBeUndefined();

    const unmarked = projectMessages(
      [event('m.room.message', elementVoice({ 'org.matrix.msc3245.voice': undefined }))],
      HS
    )[0];
    expect(unmarked.media).toBeDefined();
    expect(unmarked.media?.voice).toBeUndefined();
  });

  it('drops out-of-range voice metadata but keeps the voice player', () => {
    for (const waveform of [[0, 1025], [0, 1.5], [-1, 3], [0, 'x'], 'not-an-array']) {
      expect(voiceOf(elementVoice({ 'org.matrix.msc1767.audio': { duration: 7300, waveform } }))).toEqual({
        durationMs: 7300,
        waveform: [],
      });
    }

    const long = Array.from({ length: 2000 }, (_, index) => index % 1025);
    expect(voiceOf(elementVoice({ 'org.matrix.msc1767.audio': { duration: 7300, waveform: long } }))).toEqual({
      durationMs: 7300,
      waveform: long,
    });

    for (const duration of [0, -5, 2 ** 31, '7300']) {
      expect(voiceOf(elementVoice({ 'org.matrix.msc1767.audio': { duration, waveform: [1] } }))).toEqual({
        durationMs: undefined,
        waveform: [1],
      });
    }
    // `info.duration` is not a second source.
    expect(voiceOf(elementVoice({ 'org.matrix.msc1767.audio': { waveform: [1] } }))).toEqual({
      durationMs: undefined,
      waveform: [1],
    });

    // A malformed container must not throw out of `projectMessages`.
    for (const container of [null, 'x', 7300, [], undefined]) {
      expect(voiceOf(elementVoice({ 'org.matrix.msc1767.audio': container }))).toEqual({ waveform: [] });
    }
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

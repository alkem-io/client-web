import { describe, expect, it } from 'vitest';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { type ControlMessage, decodeControlMessage, readOnlyReasonToCode } from './controlMessage';

const encode = (value: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(value));

describe('decodeControlMessage', () => {
  it('decodes a saved control message with a version', () => {
    const msg = decodeControlMessage(encode({ kind: 'saved', version: 7 }));
    expect(msg).toEqual({ kind: 'saved', version: 7 });
  });

  it('decodes a save-error control message with an error string', () => {
    const msg = decodeControlMessage(encode({ kind: 'save-error', error: 'boom' }));
    expect(msg).toEqual({ kind: 'save-error', error: 'boom' });
  });

  it('decodes a read-only-state control message with readOnly and reason', () => {
    const msg = decodeControlMessage(encode({ kind: 'read-only-state', readOnly: true, reason: 'no-update-access' }));
    expect(msg).toEqual({ kind: 'read-only-state', readOnly: true, reason: 'no-update-access' });
  });

  it('decodes a room-user-change control message', () => {
    const msg = decodeControlMessage(encode({ kind: 'room-user-change', users: 3 }));
    expect(msg).toEqual({ kind: 'room-user-change', users: 3 });
  });

  it('preserves an unknown forward-compat kind for the caller to ignore', () => {
    const msg = decodeControlMessage(encode({ kind: 'some-future-kind', foo: 1 }));
    expect(msg?.kind).toBe('some-future-kind');
  });

  it('returns undefined on malformed JSON', () => {
    expect(decodeControlMessage(new TextEncoder().encode('{not json'))).toBeUndefined();
  });

  it('returns undefined when the payload is not an object', () => {
    expect(decodeControlMessage(encode('a string'))).toBeUndefined();
    expect(decodeControlMessage(encode(42))).toBeUndefined();
  });

  it('returns undefined when kind is missing', () => {
    expect(decodeControlMessage(encode({ version: 1 }))).toBeUndefined();
  });
});

describe('readOnlyReasonToCode', () => {
  it.each([
    ['not-authenticated', ReadOnlyCode.NOT_AUTHENTICATED],
    ['no-update-access', ReadOnlyCode.NO_UPDATE_ACCESS],
    ['room-capacity-reached', ReadOnlyCode.ROOM_CAPACITY_REACHED],
    ['multi-user-not-allowed', ReadOnlyCode.MULTI_USER_NOT_ALLOWED],
  ])('maps the unified reason %s to the memo ReadOnlyCode', (reason, code) => {
    expect(readOnlyReasonToCode(reason)).toBe(code);
  });

  it('returns undefined when the reason is absent (older server, OPEN-1 not landed)', () => {
    expect(readOnlyReasonToCode(undefined)).toBeUndefined();
  });

  it('returns undefined for an unrecognised reason (graceful degrade to generic footer reason)', () => {
    expect(readOnlyReasonToCode('something-new')).toBeUndefined();
  });

  it('keeps the read-only reason path losslessly round-trippable for known causes', () => {
    const msg: ControlMessage = { kind: 'read-only-state', readOnly: true, reason: 'room-capacity-reached' };
    expect(readOnlyReasonToCode(msg.reason)).toBe(ReadOnlyCode.ROOM_CAPACITY_REACHED);
  });
});

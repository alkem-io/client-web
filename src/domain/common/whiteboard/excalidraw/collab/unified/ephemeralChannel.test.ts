import type { EphemeralEvent } from '@alkemio/excalidraw-yjs-binding';
import { describe, expect, it, vi } from 'vitest';
import type { UnifiedCollabProvider } from '@/core/collab/UnifiedCollabProvider';
import { createEphemeralChannel, decodeEphemeralEvent, encodeEphemeralEvent } from './ephemeralChannel';

/** A minimal fake provider exposing just the type-2 ephemeral surface. */
const makeFakeProvider = () => {
  const sent: Uint8Array[] = [];
  const listeners = new Set<(payload: Uint8Array) => void>();
  const provider = {
    sendEphemeral: (payload: Uint8Array) => {
      sent.push(payload);
    },
    onEphemeral: (cb: (payload: Uint8Array) => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  } as unknown as UnifiedCollabProvider;
  const deliver = (payload: Uint8Array) => {
    for (const cb of listeners) {
      cb(payload);
    }
  };
  return { provider, sent, listeners, deliver };
};

const emojiEvent: EphemeralEvent = {
  type: 'EMOJI_REACTION',
  payload: { id: 'e1', emoji: '🎉', x: 10, y: 20 },
};

describe('ephemeralChannel — encode/decode round-trip', () => {
  it('round-trips a structured EphemeralEvent through JSON bytes', () => {
    const bytes = encodeEphemeralEvent(emojiEvent);
    // jsdom's TextEncoder may return a Uint8Array from a different realm, so assert
    // on the structural tag rather than `instanceof` (cross-realm identity).
    expect(Object.prototype.toString.call(bytes)).toBe('[object Uint8Array]');
    expect(decodeEphemeralEvent(bytes)).toEqual(emojiEvent);
  });

  it('returns undefined for malformed JSON', () => {
    expect(decodeEphemeralEvent(new TextEncoder().encode('{not json'))).toBeUndefined();
  });

  it('returns undefined for a non-ephemeral-shaped payload', () => {
    expect(decodeEphemeralEvent(new TextEncoder().encode(JSON.stringify({ kind: 'saved' })))).toBeUndefined();
  });
});

describe('ephemeralChannel — provider wiring', () => {
  it('serializes send() onto the provider type-2 channel', () => {
    const { provider, sent } = makeFakeProvider();
    const channel = createEphemeralChannel(provider);

    channel.send(emojiEvent);

    expect(sent).toHaveLength(1);
    expect(decodeEphemeralEvent(sent[0])).toEqual(emojiEvent);
  });

  it('delivers decoded inbound events to subscribers', () => {
    const { provider, deliver } = makeFakeProvider();
    const channel = createEphemeralChannel(provider);
    const received: EphemeralEvent[] = [];
    channel.subscribe(e => received.push(e));

    deliver(encodeEphemeralEvent(emojiEvent));

    expect(received).toEqual([emojiEvent]);
  });

  it('drops malformed inbound frames without calling the handler', () => {
    const { provider, deliver } = makeFakeProvider();
    const channel = createEphemeralChannel(provider);
    const handler = vi.fn();
    channel.subscribe(handler);

    deliver(new TextEncoder().encode('{bad'));

    expect(handler).not.toHaveBeenCalled();
  });

  it('stops delivering after the subscription is removed', () => {
    const { provider, deliver } = makeFakeProvider();
    const channel = createEphemeralChannel(provider);
    const received: EphemeralEvent[] = [];
    const unsubscribe = channel.subscribe(e => received.push(e));

    unsubscribe();
    deliver(encodeEphemeralEvent(emojiEvent));

    expect(received).toHaveLength(0);
  });

  it('destroy() tears down all inbound subscriptions', () => {
    const { provider, listeners, deliver } = makeFakeProvider();
    const channel = createEphemeralChannel(provider);
    const received: EphemeralEvent[] = [];
    channel.subscribe(e => received.push(e));

    channel.destroy();
    expect(listeners.size).toBe(0);
    deliver(encodeEphemeralEvent(emojiEvent));
    expect(received).toHaveLength(0);
  });
});

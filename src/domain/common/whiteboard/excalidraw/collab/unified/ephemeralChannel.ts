import type { EphemeralChannel, EphemeralEvent } from '@alkemio/excalidraw-yjs-binding';
import type { UnifiedCollabProvider } from '@/core/collab/UnifiedCollabProvider';

/**
 * Adapter bridging the Excalidraw Yjs binding's structured `EphemeralChannel`
 * (`{ send, subscribe }` of `EphemeralEvent` objects) to the unified provider's
 * raw type-2 ephemeral wire (`sendEphemeral` / `onEphemeral`, `Uint8Array`).
 *
 * The unified collaboration-service fans type-2 frames out **opaquely**
 * (`room.go WireEphemeral`: broadcast, never parsed), so the payload encoding is
 * the client's choice — we use UTF-8 JSON, which keeps the structured
 * `EphemeralEvent` shape (`EMOJI_REACTION` / `COUNTDOWN_TIMER` /
 * `USER_VISIBLE_SCENE_BOUNDS`) intact across the wire and is forward-compatible
 * (unknown event types are ignored on receive).
 *
 * Cursors / selection / idle do NOT travel here — those are presence and ride
 * y-protocols **awareness** (type 1) via the binding's `AwarenessRouter`
 * (data-model §7 / D4). Only the volatile, lossy events use this channel.
 */

const encodeEphemeralEvent = (event: EphemeralEvent): Uint8Array => new TextEncoder().encode(JSON.stringify(event));

/**
 * Decode a type-2 payload back into an `EphemeralEvent`. Returns `undefined` for
 * malformed JSON or a payload that is not a recognised ephemeral event shape, so
 * the caller can drop it without throwing (the channel is lossy by design).
 */
export const decodeEphemeralEvent = (payload: Uint8Array): EphemeralEvent | undefined => {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(payload));
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.type === 'string' &&
      parsed.payload &&
      typeof parsed.payload === 'object'
    ) {
      return parsed as EphemeralEvent;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Build an `EphemeralChannel` backed by the provider's type-2 channel. The
 * returned object is what the binding wires its emoji/countdown/bounds broadcasts
 * and subscriptions through. The provided `destroy` tears down the inbound
 * subscription (the binding also calls the returned `subscribe`'s unsubscribe on
 * its own teardown, but this lets the host clean up unconditionally).
 */
export const createEphemeralChannel = (provider: UnifiedCollabProvider): EphemeralChannel & { destroy: () => void } => {
  const unsubscribers = new Set<() => void>();

  return {
    send: (event: EphemeralEvent) => {
      provider.sendEphemeral(encodeEphemeralEvent(event));
    },
    subscribe: (handler: (event: EphemeralEvent) => void) => {
      const unsubscribeFromProvider = provider.onEphemeral(payload => {
        const event = decodeEphemeralEvent(payload);
        if (event) {
          handler(event);
        }
      });
      const unsubscribe = () => {
        unsubscribeFromProvider();
        unsubscribers.delete(unsubscribe);
      };
      unsubscribers.add(unsubscribe);
      return unsubscribe;
    },
    destroy: () => {
      for (const unsubscribe of [...unsubscribers]) {
        unsubscribe();
      }
      unsubscribers.clear();
    },
  };
};

export { encodeEphemeralEvent };

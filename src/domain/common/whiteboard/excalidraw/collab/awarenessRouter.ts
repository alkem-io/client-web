import type { Collaborator, ExcalidrawImperativeAPI, SocketId } from '@excalidraw-yjs/excalidraw/types';
import type { Awareness } from 'y-protocols/awareness';

/**
 * Ephemeral / presence routing for the native-Yjs whiteboard. Cursors and the
 * user identity go to y-protocols **awareness**; emoji reactions and the
 * countdown timer go to the **ephemeral** event channel. NONE of this is ever
 * written to the scene `Y.Doc` — presence in the doc would persist transient
 * state and corrupt the merge model.
 *
 * Ported from the deleted `@alkemio/excalidraw-yjs-binding` (M3 native-Yjs
 * cutover): the editor's `Scene` IS the doc now, so the binding is gone, but
 * this routing is editor-agnostic (it only touches awareness + the imperative
 * API) and stays on the client.
 */

export type PointerPayload = {
  pointer: { x: number; y: number; tool?: 'pointer' | 'laser' } | null;
  button: 'up' | 'down';
  pointersMap?: Map<number, { x: number; y: number }>;
};

export type EmojiReactionPayload = {
  id: string;
  emoji: string;
  x: number;
  y: number;
};

export type CountdownTimerPayload = {
  remainingSeconds: number;
  startedBy: string;
  active: boolean;
};

/** Ephemeral event kinds carried out-of-band (never in the scene doc). */
export type EphemeralEvent =
  | { type: 'EMOJI_REACTION'; payload: EmojiReactionPayload }
  | { type: 'COUNTDOWN_TIMER'; payload: CountdownTimerPayload };

/** Transport seam for the ephemeral channel (wired to the provider's `2` Ephemeral WS type). */
export type EphemeralChannel = {
  send: (event: EphemeralEvent) => void;
  subscribe: (handler: (event: EphemeralEvent) => void) => () => void;
};

export type AwarenessRouterDeps = {
  awareness: Awareness;
  api: Pick<
    ExcalidrawImperativeAPI,
    'updateScene' | 'dispatchIncomingEmojiReaction' | 'dispatchIncomingCountdownTimer'
  >;
  ephemeral?: EphemeralChannel;
};

/**
 * Routes ephemeral state to/from awareness + the ephemeral channel, keeping the
 * scene `Y.Doc` byte-untouched.
 */
export class AwarenessRouter {
  private readonly awareness: Awareness;
  private readonly api: AwarenessRouterDeps['api'];
  private readonly ephemeral?: EphemeralChannel;
  private readonly cleanups: Array<() => void> = [];

  // Pointer presence is throttled to POINTER_THROTTLE_MS (~30fps), restoring the cursor
  // throttle the pre-native-Yjs Collab client applied (legacy parity) and keeping presence
  // traffic bounded no matter how fast Excalidraw fires onPointerUpdate (tens/sec). The
  // throttle is leading+trailing so the cursor moves immediately and its final position
  // always lands; pointer+button are coalesced into ONE awareness frame per window, so a
  // move costs one frame, not two. (The dropped throttle also exposed a since-corrected
  // server-side all-frame disconnect; this client change does not depend on that cap.)
  private static readonly POINTER_THROTTLE_MS = 33;
  private pointerTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingPointer: PointerPayload | null = null;

  constructor(deps: AwarenessRouterDeps) {
    this.awareness = deps.awareness;
    this.api = deps.api;
    this.ephemeral = deps.ephemeral;

    // Remote awareness → collaborator cursors (touches no elements). The
    // y-protocols 'change' event passes an origin; LOCAL-origin changes (our own
    // cursor/selection moves via setLocalStateField) must NOT trigger an
    // applyRemoteAwareness → updateScene → onChange cycle — only remote peers'
    // state does.
    const onChange = (_changes: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
      if (origin === 'local') {
        return;
      }
      this.applyRemoteAwareness();
    };
    this.awareness.on('change', onChange);
    this.cleanups.push(() => this.awareness.off('change', onChange));

    // Incoming ephemeral events → imperative dispatch.
    if (this.ephemeral) {
      const unsub = this.ephemeral.subscribe(event => this.dispatchIncoming(event));
      this.cleanups.push(unsub);
    }
  }

  /**
   * Local pointer move → awareness. Never the scene doc. Throttled leading+trailing at
   * POINTER_THROTTLE_MS: the first move in a window emits immediately, intra-window moves
   * are coalesced, and the latest is flushed at the trailing edge (so the resting cursor
   * position is never lost). Bounds outbound presence to ~30fps — legacy parity.
   */
  onPointerUpdate(payload: PointerPayload): void {
    if (this.pointerTimer === null) {
      this.emitPointer(payload); // leading edge — immediate
      this.openPointerWindow();
    } else {
      this.pendingPointer = payload; // coalesce; the latest flushes at the trailing edge
    }
  }

  /** Arm the trailing-edge flush; re-arm while movement continues so it stays ~30fps. */
  private openPointerWindow(): void {
    this.pointerTimer = setTimeout(() => {
      this.pointerTimer = null;
      if (this.pendingPointer !== null) {
        const latest = this.pendingPointer;
        this.pendingPointer = null;
        this.emitPointer(latest); // trailing edge — the latest coalesced position
        this.openPointerWindow();
      }
    }, AwarenessRouter.POINTER_THROTTLE_MS);
  }

  /**
   * Write pointer + button in a SINGLE awareness state update so a cursor move costs one
   * frame, not two. Merges over the current local state to preserve `user` (and any other
   * field). Never touches the scene doc.
   */
  private emitPointer(payload: PointerPayload): void {
    const current = this.awareness.getLocalState() ?? {};
    this.awareness.setLocalState({ ...current, pointer: payload.pointer, button: payload.button });
  }

  /** Local user identity → awareness. */
  setUser(user: Record<string, unknown>): void {
    this.awareness.setLocalStateField('user', user);
  }

  /** Local emoji reaction → ephemeral channel (never the scene doc). */
  broadcastEmojiReaction(payload: EmojiReactionPayload): void {
    this.ephemeral?.send({ type: 'EMOJI_REACTION', payload });
  }

  /** Local countdown timer → ephemeral channel. */
  broadcastCountdownTimer(payload: CountdownTimerPayload): void {
    this.ephemeral?.send({ type: 'COUNTDOWN_TIMER', payload });
  }

  /** Dispatch an incoming ephemeral event to the editor. */
  private dispatchIncoming(event: EphemeralEvent): void {
    switch (event.type) {
      case 'EMOJI_REACTION':
        this.api.dispatchIncomingEmojiReaction(event.payload);
        break;
      case 'COUNTDOWN_TIMER':
        this.api.dispatchIncomingCountdownTimer(event.payload);
        break;
      default:
        break;
    }
  }

  /** Map remote awareness states → collaborators and apply via updateScene. */
  private applyRemoteAwareness(): void {
    const collaborators = new Map<SocketId, Collaborator>();
    const states = this.awareness.getStates();
    for (const [clientId, state] of states) {
      if (clientId === this.awareness.clientID) {
        continue; // skip self
      }
      const socketId = String(clientId) as SocketId;
      collaborators.set(socketId, {
        pointer: state.pointer ?? undefined,
        button: state.button ?? undefined,
        username: state.user?.username ?? undefined,
        avatarUrl: state.user?.avatarUrl ?? undefined,
        color: state.user?.color ?? undefined,
        id: state.user?.id ?? undefined,
        socketId,
      });
    }
    this.api.updateScene({ collaborators });
  }

  destroy(): void {
    // Cancel any pending trailing pointer flush so no presence frame lands after teardown.
    if (this.pointerTimer !== null) {
      clearTimeout(this.pointerTimer);
      this.pointerTimer = null;
    }
    this.pendingPointer = null;
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups.length = 0;
    // Clear our local presence on teardown so peers drop this client's cursor
    // immediately instead of waiting for the awareness timeout. Emits a 'removed'
    // change to other clients; our own handler is already detached above.
    try {
      this.awareness.setLocalState(null);
    } catch {
      // awareness may already be destroyed (e.g. its doc was destroyed first)
    }
  }
}

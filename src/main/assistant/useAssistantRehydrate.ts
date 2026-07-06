import { useEffect, useRef } from 'react';
import { useAssistantContext } from './AssistantContext';
import { getConversationMessages, resolveExistingRollingConversation } from './assistantApi';
import type { AssistantMessage } from './types';
import { useAssistantConversation } from './useAssistantConversation';

/**
 * Find the id of the pending confirmation in a rehydrated history, if any. A
 * conversation in `awaiting_confirmation` persists the `ProposedWriteSet` as a
 * `confirmation` part on the last assistant message (browser-assistant-sse.md
 * § Resumability) — surface it so the Approve/Decline control reappears.
 */
export function findPendingConfirmationId(messages: AssistantMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    for (let j = message.parts.length - 1; j >= 0; j -= 1) {
      const part = message.parts[j];
      if (part.type === 'confirmation') {
        return part.proposedWriteSetId;
      }
    }
  }
  return null;
}

/**
 * Whether a turn is still in flight (the last message is the user's, with no
 * assistant reply persisted yet) — used to decide whether to re-open the stream
 * on rehydration (FR-011). A conversation `awaiting_confirmation` is NOT
 * in-flight (it is paused on the user) and a completed assistant turn is not
 * either.
 */
export function isTurnInFlight(messages: AssistantMessage[], conversationState: string | undefined): boolean {
  if (conversationState === 'awaiting_confirmation' || conversationState === 'closed') {
    return false;
  }
  const last = messages[messages.length - 1];
  return Boolean(last && last.role === 'user');
}

/**
 * Rehydrate the assistant panel on open/reload (US3 / FR-011, T027):
 * - `GET /conversations` resolves the single rolling conversation (incl. state);
 * - `GET /conversations/{id}/messages` loads the full ordered history, including
 *   a pending `confirmation` part when `awaiting_confirmation`;
 * - the SSE stream is re-opened **only if a turn is still in flight** (T027/T028),
 *   re-issuing the POST with `Last-Event-ID` rather than re-sending the message.
 *
 * Runs once per panel-open. No conversation switcher in v1 — scroll-back is
 * within the single rolling thread only.
 */
export const useAssistantRehydrate = () => {
  const { state, dispatch, isOpen } = useAssistantContext();
  const { reconnectInFlight } = useAssistantConversation();
  const hasRehydratedRef = useRef(false);

  // The effect runs once on open; mirror the live deps into refs so the effect
  // body reads fresh values without re-subscribing on every render (and without
  // an eslint-disable — this repo's flat config has no exhaustive-deps rule).
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  const reconnectRef = useRef(reconnectInFlight);
  reconnectRef.current = reconnectInFlight;
  const isStreamingRef = useRef(state.isStreaming);
  isStreamingRef.current = state.isStreaming;

  useEffect(() => {
    // Closing the panel clears the latch so the next open rehydrates afresh —
    // important when the first open was canceled before its fetch settled,
    // which would otherwise leave the panel permanently empty.
    if (!isOpen) {
      hasRehydratedRef.current = false;
      return;
    }
    if (hasRehydratedRef.current) {
      return;
    }
    hasRehydratedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const conversation = await resolveExistingRollingConversation();
        if (cancelled || !conversation) {
          return;
        }
        dispatchRef.current({ type: 'set-conversation', conversationId: conversation.id });

        const { messages } = await getConversationMessages(conversation.id);
        if (cancelled) {
          return;
        }

        const pendingConfirmationId = findPendingConfirmationId(messages);
        dispatchRef.current({ type: 'rehydrate', messages, pendingConfirmationId });

        // Re-open the stream only if a turn is mid-flight (FR-011). A paused
        // confirmation or a completed turn needs no reconnect. We have no
        // persisted event cursor across a reload, so we replay from the start
        // (null Last-Event-ID) and let the server skip/replay (T028).
        if (!isStreamingRef.current && isTurnInFlight(messages, conversation.state)) {
          void reconnectRef.current(conversation.id, null);
        }
      } catch {
        // Rehydration is best-effort; a failure leaves an empty thread the user
        // can still type into (a new conversation is resolved on first send).
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);
};

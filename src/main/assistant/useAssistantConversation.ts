import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssistantContext } from './AssistantContext';
import { createConversation, resolveRollingConversation } from './assistantApi';
import type { AssistantStreamEvent } from './types';
import { useAssistantStream } from './useAssistantStream';

/**
 * A single in-flight turn's request, retained so a dropped connection can be
 * re-issued with the `Last-Event-ID` header (T028 — `fetch`+`ReadableStream`
 * has no native auto-reconnect; browser-assistant-sse.md § Resumability).
 */
type InFlightRequest = {
  path: string;
  body: unknown;
};

/** Max automatic reconnect attempts for a single dropped turn. */
const MAX_RECONNECTS = 1;

/**
 * Orchestrates a turn: resolve/create the single rolling conversation (FR-011,
 * no switcher), append the user message, then POST it and consume the SSE stream
 * (`token`/`tool-activity`/`tool-result`/`message`/`done`/`error`) into the
 * reducer. A turn always terminates (done or error) — never a silent hang.
 *
 * On a dropped connection mid-turn the same POST is re-issued once with the last
 * seen event `id:` as `Last-Event-ID` so the server replays/skips from that
 * cursor (T028). On reload with a turn still in flight, `reconnectInFlight`
 * resumes it without re-sending the user message (T027).
 */
export const useAssistantConversation = () => {
  const { t } = useTranslation();
  const { state, dispatch, panelContext } = useAssistantContext();
  const { start, cancel: cancelStream } = useAssistantStream();

  /**
   * Stop the current turn (the Stop button). Aborting the fetch alone is NOT
   * enough: the abort resolves the stream silently (no `done`/`error` dispatch),
   * so `state.isStreaming` would stay true and the UI would look frozen — "Stop
   * does nothing". Reset the streaming state here so the composer returns
   * immediately. (The server turn may keep running orphaned; rehydrate reconciles
   * the final state on the next open.)
   */
  const cancel = () => {
    cancelStream();
    dispatch({ type: 'end-turn' });
  };
  // The current in-flight request + how many times it has been reconnected.
  const inFlightRef = useRef<InFlightRequest | null>(null);
  const reconnectsRef = useRef(0);
  // Latest event id seen, kept in a ref so the reconnect closure reads a fresh
  // value (state is captured at render time).
  const lastEventIdRef = useRef<string | null>(null);

  /** Run a stream and auto-reconnect once with Last-Event-ID on a transport drop. */
  const runStream = async (request: InFlightRequest): Promise<void> => {
    inFlightRef.current = request;

    const onEvent = (event: AssistantStreamEvent) => {
      if (event.id) {
        lastEventIdRef.current = event.id;
      }
      dispatch({ type: 'stream-event', event });
    };

    const onTransportError = () => {
      // Reconnect the SAME request with the last cursor, up to the cap; only then
      // surface the transport error so a turn still always terminates.
      if (inFlightRef.current && reconnectsRef.current < MAX_RECONNECTS) {
        reconnectsRef.current += 1;
        void start(
          { path: request.path, body: request.body, lastEventId: lastEventIdRef.current ?? undefined },
          { onEvent, onTransportError }
        );
        return;
      }
      dispatch({ type: 'transport-error', message: t('assistant.errors.transport') });
    };

    await start({ path: request.path, body: request.body }, { onEvent, onTransportError });
  };

  const sendMessage = async (content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed || state.isStreaming) {
      return;
    }

    let conversationId = state.conversationId;
    try {
      if (!conversationId) {
        conversationId = await resolveRollingConversation();
        dispatch({ type: 'set-conversation', conversationId });
      }
    } catch {
      dispatch({ type: 'transport-error', message: t('assistant.errors.transport') });
      return;
    }

    dispatch({ type: 'append-user-message', content: trimmed, id: `user-${Date.now()}` });
    dispatch({ type: 'begin-turn' });
    reconnectsRef.current = 0;
    lastEventIdRef.current = null;

    // Optional, per-turn whiteboard scope so the model can resolve an ambiguous
    // "this whiteboard" to a concrete id. `runStream` retains this same body for
    // the Last-Event-ID reconnect, so context survives a dropped connection.
    await runStream({
      path: `/conversations/${conversationId}/messages`,
      body: {
        content: trimmed,
        context: panelContext ? { whiteboardId: panelContext.whiteboardId } : undefined,
      },
    });
  };

  /**
   * Submit an Approve / Decline decision for the pending proposed-write set and
   * **resume the same SSE protocol** (browser-assistant-sse.md § Confirmation
   * flow). `approve` → the server re-validates + executes the persisted writes,
   * streaming results (or a fresh `confirmation-request` if a destructive target
   * changed, or `error` if the session is invalid/expired). `decline` → the
   * stream ends with `done` and nothing changes (SC-002).
   */
  const submitConfirmationDecision = async (
    proposedWriteSetId: string,
    decision: 'approve' | 'decline'
  ): Promise<void> => {
    const conversationId = state.conversationId;
    if (!conversationId || state.isStreaming) {
      return;
    }

    dispatch({ type: 'begin-decision' });
    reconnectsRef.current = 0;
    lastEventIdRef.current = null;

    await runStream({
      path: `/conversations/${conversationId}/confirmations/${proposedWriteSetId}`,
      body: { decision },
    });
  };

  /**
   * Resume an in-flight turn after a reload (T027/T028): re-open the message
   * stream with the `Last-Event-ID` so the server replays from the cursor. No
   * user message is re-sent — the turn was already accepted server-side. Caller
   * passes the cursor from the rehydrated history (the last persisted part's id),
   * or null to replay from the start.
   */
  const reconnectInFlight = async (conversationId: string, lastEventId: string | null): Promise<void> => {
    if (state.isStreaming) {
      return;
    }
    dispatch({ type: 'begin-decision' });
    reconnectsRef.current = 0;
    lastEventIdRef.current = lastEventId;

    const onEvent = (event: AssistantStreamEvent) => {
      if (event.id) {
        lastEventIdRef.current = event.id;
      }
      dispatch({ type: 'stream-event', event });
    };

    await start(
      { path: `/conversations/${conversationId}/messages`, body: {}, lastEventId: lastEventId ?? undefined },
      {
        onEvent,
        onTransportError: () => dispatch({ type: 'transport-error', message: t('assistant.errors.transport') }),
      }
    );
  };

  /**
   * Start a fresh conversation from the panel (FR-011 — single rolling thread,
   * no switcher). The previous conversation is left intact as non-destructive
   * history.
   *
   * What routes the next turn to the new thread is SERVER-SIDE and the `create`
   * is the load-bearing step: the streaming endpoint ignores the posted
   * conversation id and re-resolves the user's single rolling conversation as the
   * *newest non-closed* one (`get_or_create_rolling`, ordered by `lastActiveAt`).
   * `createConversation()` inserts a row whose `lastActiveAt` defaults to now,
   * making it the newest — so the next turn lands there. A bare reset (no create)
   * would leave the existing conversation newest and re-attach to it.
   * `set-conversation(id)` is then just client hygiene: it points the panel state
   * at the new thread so the UI/rehydrate/confirmation state stays consistent and
   * the next `sendMessage` skips a redundant `resolveRollingConversation`
   * round-trip — it is NOT what drives the server's routing.
   */
  const startNewConversation = async (): Promise<void> => {
    // Abort any in-flight turn before switching threads. Use the raw stream abort
    // (not the public `cancel`): the `reset` dispatch below already clears
    // isStreaming, so an extra `end-turn` would be redundant.
    cancelStream();
    reconnectsRef.current = 0;
    lastEventIdRef.current = null;
    inFlightRef.current = null;
    try {
      const { id } = await createConversation();
      // reset clears messages/error AND pendingConfirmationId (initialState),
      // nulling conversationId — so set-conversation must follow it.
      dispatch({ type: 'reset' });
      dispatch({ type: 'set-conversation', conversationId: id });
    } catch {
      dispatch({ type: 'transport-error', message: t('assistant.errors.transport') });
    }
  };

  return {
    sendMessage,
    submitConfirmationDecision,
    reconnectInFlight,
    startNewConversation,
    cancel,
    isStreaming: state.isStreaming,
  };
};

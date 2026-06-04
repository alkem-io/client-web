import { createContext, type ReactNode, useContext, useReducer, useState } from 'react';
import type {
  AssistantConversation,
  AssistantErrorCode,
  AssistantMessage,
  AssistantStreamEvent,
  ConfirmationPart,
  MessagePart,
  TextPart,
  ToolActivityPart,
} from './types';

/**
 * Holds the active (single rolling) conversation, the ordered message parts, and
 * the streaming/error state for the assistant panel. A reducer folds SSE events
 * (token deltas, tool-activity, tool-result, confirmation, done, error) into the
 * current assistant turn's parts. No model/tool logic here — presentation only.
 */

export type AssistantError = {
  code: AssistantErrorCode;
  message: string;
  retryable?: boolean;
};

export type AssistantState = {
  conversationId: string | null;
  messages: AssistantMessage[];
  isStreaming: boolean;
  /**
   * The id of the proposed-write set the conversation is paused on
   * (`awaiting_confirmation`), or null. Driven by `confirmation-request`; cleared
   * once a decision resumes the stream, the proposal is replaced, or the turn
   * ends/errors (US2).
   */
  pendingConfirmationId: string | null;
  /** The last seen SSE event `id:` — used as Last-Event-ID on reconnect. */
  lastEventId: string | null;
  /** A non-blocking turn error (the red error UI); cleared on the next turn. */
  error: AssistantError | null;
};

const initialState: AssistantState = {
  conversationId: null,
  messages: [],
  isStreaming: false,
  pendingConfirmationId: null,
  lastEventId: null,
  error: null,
};

export type AssistantAction =
  | { type: 'set-conversation'; conversationId: string }
  | { type: 'rehydrate'; messages: AssistantMessage[]; pendingConfirmationId?: string | null }
  | { type: 'append-user-message'; content: string; id: string }
  | { type: 'begin-turn' }
  | { type: 'begin-decision' }
  | { type: 'stream-event'; event: AssistantStreamEvent }
  | { type: 'end-turn' }
  | { type: 'transport-error'; message: string }
  | { type: 'reset' };

/** Id for the in-progress assistant message before the server assigns one. */
const PENDING_ASSISTANT_ID = '__pending_assistant__';

/** Ensure there is a trailing assistant message to append parts to. */
function ensureAssistantTurn(messages: AssistantMessage[]): AssistantMessage[] {
  const last = messages[messages.length - 1];
  if (last && last.role === 'assistant') {
    return messages;
  }
  return [...messages, { id: PENDING_ASSISTANT_ID, role: 'assistant', parts: [] }];
}

/** Replace the trailing assistant message with one whose parts are transformed. */
function withAssistantParts(
  messages: AssistantMessage[],
  transform: (parts: MessagePart[]) => MessagePart[]
): AssistantMessage[] {
  const ensured = ensureAssistantTurn(messages);
  const lastIndex = ensured.length - 1;
  const target = ensured[lastIndex];
  const next = ensured.slice();
  next[lastIndex] = { ...target, parts: transform(target.parts) };
  return next;
}

function applyStreamEvent(state: AssistantState, event: AssistantStreamEvent): AssistantState {
  const lastEventId = event.id ?? state.lastEventId;

  switch (event.event) {
    case 'token': {
      const messages = withAssistantParts(state.messages, parts => {
        const last = parts[parts.length - 1];
        if (last && last.type === 'text') {
          const updated: TextPart = { type: 'text', text: last.text + event.data.text };
          return [...parts.slice(0, -1), updated];
        }
        return [...parts, { type: 'text', text: event.data.text } satisfies TextPart];
      });
      return { ...state, messages, lastEventId };
    }

    case 'tool-activity': {
      const incoming: ToolActivityPart = {
        type: 'tool-activity',
        toolActionId: event.data.toolActionId,
        toolName: event.data.toolName,
        label: event.data.label,
        status: event.data.status,
      };
      const messages = withAssistantParts(state.messages, parts => {
        const existingIndex = parts.findIndex(
          p => p.type === 'tool-activity' && p.toolActionId === incoming.toolActionId
        );
        if (existingIndex === -1) {
          return [...parts, incoming];
        }
        // Update status (started → finished/error) in place.
        const next = parts.slice();
        next[existingIndex] = incoming;
        return next;
      });
      return { ...state, messages, lastEventId };
    }

    case 'tool-result': {
      const messages = withAssistantParts(state.messages, parts => [
        ...parts,
        { type: 'tool-result', toolActionId: event.data.toolActionId, summary: event.data.summary },
      ]);
      return { ...state, messages, lastEventId };
    }

    case 'confirmation-request': {
      const confirmation: ConfirmationPart = {
        type: 'confirmation',
        proposedWriteSetId: event.data.proposedWriteSetId,
        items: event.data.items,
      };
      const messages = withAssistantParts(state.messages, parts => {
        // A re-proposal replaces the prior confirmation item (US2 re-proposal).
        const filtered = parts.filter(p => p.type !== 'confirmation');
        return [...filtered, confirmation];
      });
      // The conversation pauses awaiting Approve/Decline; the proposal id is the
      // current pending set (a re-proposal supersedes the prior one). The server
      // pauses the stream here, so the turn is no longer actively streaming —
      // the Approve/Decline control becomes actionable.
      return {
        ...state,
        messages,
        lastEventId,
        isStreaming: false,
        pendingConfirmationId: confirmation.proposedWriteSetId,
      };
    }

    case 'message': {
      // The server assigned a persisted id to the in-flight assistant message.
      const messages = state.messages.map(m =>
        m.id === PENDING_ASSISTANT_ID ? { ...m, id: event.data.messageId, sequence: event.data.sequence } : m
      );
      return { ...state, messages, lastEventId };
    }

    case 'done': {
      const messages = state.messages.map(m =>
        m.id === PENDING_ASSISTANT_ID ? { ...m, id: event.data.messageId } : m
      );
      // A turn that terminates with `done` is no longer awaiting a confirmation
      // (a decline ends with `done`; an approve streams results then `done`).
      return { ...state, messages, isStreaming: false, lastEventId, pendingConfirmationId: null };
    }

    case 'error': {
      // Clarifying questions are NORMAL text turns, never an error event — so an
      // `error` event always surfaces the non-blocking error UI (T013).
      return {
        ...state,
        isStreaming: false,
        lastEventId,
        pendingConfirmationId: null,
        error: { code: event.data.code, message: event.data.message, retryable: event.data.retryable },
      };
    }

    default:
      return state;
  }
}

function reducer(state: AssistantState, action: AssistantAction): AssistantState {
  switch (action.type) {
    case 'set-conversation':
      return { ...state, conversationId: action.conversationId };
    case 'rehydrate':
      return {
        ...state,
        messages: action.messages,
        error: null,
        pendingConfirmationId: action.pendingConfirmationId ?? null,
      };
    case 'append-user-message':
      return {
        ...state,
        error: null,
        // A new user message while awaiting confirmation expires the prior
        // proposed set (browser-assistant-sse.md § Expiry) — drop the pending id.
        pendingConfirmationId: null,
        messages: [...state.messages, { id: action.id, role: 'user', parts: [{ type: 'text', text: action.content }] }],
      };
    case 'begin-turn':
      return { ...state, isStreaming: true, error: null, lastEventId: null };
    case 'begin-decision':
      // Resuming after Approve/Decline — stream again, keep the pending id until
      // the resumed stream resolves it (done/error/re-proposal).
      return { ...state, isStreaming: true, error: null, lastEventId: null };
    case 'stream-event':
      return applyStreamEvent(state, action.event);
    case 'end-turn':
      return { ...state, isStreaming: false };
    case 'transport-error':
      return {
        ...state,
        isStreaming: false,
        error: { code: 'internal_error', message: action.message },
      };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

/**
 * Per-turn whiteboard scope for the panel: when the assistant is opened from a
 * whiteboard editor it carries that board's id (and display name for the header
 * chip). It is OPTIONAL and PER-TURN — kept out of the reducer (like `isOpen`)
 * because it is panel/UI state, not conversation state. It only lets the model
 * resolve an ambiguous "this whiteboard" to a concrete id; it never bypasses the
 * write-confirmation gate.
 */
export type AssistantPanelContext = { whiteboardId: string; displayName?: string };

type AssistantContextValue = {
  state: AssistantState;
  dispatch: (action: AssistantAction) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  panelContext: AssistantPanelContext | null;
  openForWhiteboard: (wb: AssistantPanelContext) => void;
  clearPanelContext: () => void;
};

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export const AssistantProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [panelContext, setPanelContext] = useState<AssistantPanelContext | null>(null);

  const openForWhiteboard = (wb: AssistantPanelContext) => {
    setPanelContext(wb);
    setIsOpen(true);
  };
  const clearPanelContext = () => setPanelContext(null);

  return (
    <AssistantContext
      value={{ state, dispatch, isOpen, setIsOpen, panelContext, openForWhiteboard, clearPanelContext }}
    >
      {children}
    </AssistantContext>
  );
};

export const useAssistantContext = (): AssistantContextValue => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistantContext must be used within an AssistantProvider');
  }
  return context;
};

export { reducer as assistantReducer, initialState as assistantInitialState };
export type { AssistantConversation };

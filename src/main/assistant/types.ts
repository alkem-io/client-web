/**
 * Message part-model + SSE event-model for the AI assistant.
 *
 * The single source of truth is the browser ⇄ assistant-service SSE contract:
 * specs/004-web-ai-assistant/contracts/browser-assistant-sse.md. Keep this file
 * in lockstep with the `event:` payload table there. No model/MCP/tool logic
 * lives in the browser (FR-007/SC-006).
 */

/** SSE `error.code` values (browser-assistant-sse.md § Error codes). */
export const AssistantErrorCode = {
  CapabilityUnavailable: 'capability_unavailable',
  PermissionDenied: 'permission_denied',
  UsageLimitReached: 'usage_limit_reached',
  SessionInvalid: 'session_invalid',
  InternalError: 'internal_error',
} as const;

export type AssistantErrorCode = (typeof AssistantErrorCode)[keyof typeof AssistantErrorCode];

/** Status of a single tool-activity, surfaced as "Searching…" with progress. */
export const ToolActivityStatus = {
  Started: 'started',
  Finished: 'finished',
  Error: 'error',
} as const;

export type ToolActivityStatus = (typeof ToolActivityStatus)[keyof typeof ToolActivityStatus];

/** Classification of a proposed write item (data-model.md ProposedWrite.kind public projection). */
export const ProposedWriteKind = {
  WriteAdditive: 'write_additive',
  WriteDestructive: 'write_destructive',
} as const;

export type ProposedWriteKind = (typeof ProposedWriteKind)[keyof typeof ProposedWriteKind];

/** Public projection of a destructive target's freshness signal (ProposedWrite.targetRef). */
export type AssistantTargetRef = {
  entityId: string;
  updatedDate?: string;
};

/** A single itemized write inside a consolidated confirmation proposal. */
export type ProposedWriteItem = {
  toolName: string;
  kind: ProposedWriteKind;
  summary: string;
  targetRef?: AssistantTargetRef;
};

// ---------------------------------------------------------------------------
// Message parts — the persisted/rendered discriminated union. Each variant has
// a producing SSE event (browser-assistant-sse.md).
// ---------------------------------------------------------------------------

/** Streamed assistant prose; accumulated from `token` deltas. */
export type TextPart = {
  type: 'text';
  text: string;
};

/** Human-readable capability use, e.g. "Searching whiteboards…" (FR-004). */
export type ToolActivityPart = {
  type: 'tool-activity';
  toolActionId: string;
  toolName: string;
  label: string;
  status: ToolActivityStatus;
};

/** Optional inline indication of a tool's result. */
export type ToolResultPart = {
  type: 'tool-result';
  toolActionId: string;
  summary: string;
};

/** The itemized write proposal awaiting Approve/Decline (US2 / FR-015). */
export type ConfirmationPart = {
  type: 'confirmation';
  proposedWriteSetId: string;
  items: ProposedWriteItem[];
};

export type MessagePart = TextPart | ToolActivityPart | ToolResultPart | ConfirmationPart;

/** A persisted message in a conversation (GET /conversations/{id}/messages). */
export type AssistantMessage = {
  id: string;
  /** Who authored the message. */
  role: 'user' | 'assistant';
  /** Ordered parts (text / tool-activity / tool-result / confirmation). */
  parts: MessagePart[];
  /** Monotonic ordering within the conversation. */
  sequence?: number;
};

/** A single rolling conversation (FR-011 — no switcher in v1). */
export type AssistantConversationState = 'active' | 'awaiting_confirmation' | 'closed';

export type AssistantConversation = {
  id: string;
  title?: string;
  lastActiveAt?: string;
  state?: AssistantConversationState;
};

/**
 * Read-only monthly budget snapshot (D1 — contract §7 /
 * assistant-access-and-budget.md). Surfaced by **assistant-service** at
 * `GET /api/private/rest/assistant/budget`, NOT a server GraphQL field — asvc
 * owns both numbers (`tokensPerMonth` from the §3 MCP budget resource it reads,
 * `monthToDateUsed` from its own monthly counter). Same cookie-auth,
 * privilege-gated edge as the rest of the assistant; read-only, no client
 * enforcement.
 *
 * `tokensPerMonth: null` ⇒ no limit resolvable for the account (D3) — render
 * "no limit configured", never a misleading "0 of 0" meter.
 */
export type AssistantBudget = {
  /** Weighted-token monthly allowance, or `null` when none is configured (D3). */
  tokensPerMonth: number | null;
  /** Weighted tokens spent so far this UTC calendar month. */
  monthToDateUsed: number;
  /** When the monthly counter resets (ISO date / month-boundary wording source). */
  resetsOn?: string;
};

// ---------------------------------------------------------------------------
// SSE events — the wire frames the transport parses (event: / data: / id:).
// ---------------------------------------------------------------------------

export type TokenEvent = { text: string };

export type ToolActivityEvent = {
  toolActionId: string;
  toolName: string;
  label: string;
  status: ToolActivityStatus;
};

export type ToolResultEvent = {
  toolActionId: string;
  summary: string;
};

export type ConfirmationRequestEvent = {
  proposedWriteSetId: string;
  items: ProposedWriteItem[];
};

export type MessageEvent = {
  messageId: string;
  sequence: number;
};

export type DoneEvent = {
  messageId: string;
  tokenUsage?: { prompt: number; completion: number };
};

export type ErrorEvent = {
  code: AssistantErrorCode;
  message: string;
  retryable?: boolean;
};

/**
 * Discriminated SSE event union, keyed by the `event:` frame name. The transport
 * (useAssistantStream) parses the raw frames and yields these typed events.
 */
export type AssistantStreamEvent =
  | { event: 'token'; data: TokenEvent; id?: string }
  | { event: 'tool-activity'; data: ToolActivityEvent; id?: string }
  | { event: 'tool-result'; data: ToolResultEvent; id?: string }
  | { event: 'confirmation-request'; data: ConfirmationRequestEvent; id?: string }
  | { event: 'message'; data: MessageEvent; id?: string }
  | { event: 'done'; data: DoneEvent; id?: string }
  | { event: 'error'; data: ErrorEvent; id?: string };

export type AssistantStreamEventName = AssistantStreamEvent['event'];

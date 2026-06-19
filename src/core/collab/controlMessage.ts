import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';

/**
 * Control channel (wire type 3) — the unified collaboration-service's server→client
 * control messages, mirroring the Go `ControlMessage` (`control.go`). JSON-encoded,
 * one message per WebSocket binary frame, framed `[type as VarUint][payload]`.
 *
 * The kind set is intentionally extensible: unknown kinds MUST be ignored by the
 * client (forward-compat) — see `decodeControlMessage` / the provider's type-3 handler.
 */
export type ControlKind = 'saved' | 'save-error' | 'read-only-state' | 'room-user-change' | 'room-closed';

export interface ControlMessage {
  kind: ControlKind | string;
  /** `saved` — server snapshot/persist version. */
  version?: number;
  /** `save-error` — human-readable persist failure. */
  error?: string;
  /** `read-only-state` — whether the client may not mutate the document. */
  readOnly?: boolean;
  /**
   * `read-only-state` — OPEN-1 additive field: why the document is read-only. The
   * unified service's collab OPEN-1 change emits one of the kebab-case reasons below;
   * older servers omit it (handled gracefully — see `readOnlyReasonToCode`).
   */
  reason?: string;
  /** `room-user-change` — current connected user count (cross-check for presence). */
  users?: number;
}

/**
 * The kebab-case `reason` values the unified service's `read-only-state` control
 * carries (collab OPEN-1). These map 1:1 onto the existing memo `ReadOnlyCode`
 * enum, so the footer's read-only reason UX is preserved without touching the
 * footer or its mapper.
 */
const READ_ONLY_REASON_TO_CODE: Record<string, ReadOnlyCode> = {
  'not-authenticated': ReadOnlyCode.NOT_AUTHENTICATED,
  'no-update-access': ReadOnlyCode.NO_UPDATE_ACCESS,
  'room-capacity-reached': ReadOnlyCode.ROOM_CAPACITY_REACHED,
  'multi-user-not-allowed': ReadOnlyCode.MULTI_USER_NOT_ALLOWED,
};

/**
 * Translate a unified `read-only-state` control `reason` (OPEN-1) into the memo
 * `ReadOnlyCode`. Returns `undefined` when the server omits the reason (older
 * server, OPEN-1 not yet landed) or sends an unrecognised value — the footer
 * then falls back to its generic policy reason, with the lost granularity
 * (capacity / multi-user) flagged.
 */
export const readOnlyReasonToCode = (reason: string | undefined): ReadOnlyCode | undefined => {
  if (!reason) {
    return undefined;
  }
  return READ_ONLY_REASON_TO_CODE[reason];
};

/**
 * Decode a type-3 control payload (UTF-8 JSON). Returns `undefined` on malformed
 * JSON or a non-object payload so the caller can ignore it safely.
 */
export const decodeControlMessage = (payload: Uint8Array): ControlMessage | undefined => {
  try {
    const text = new TextDecoder().decode(payload);
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && typeof parsed.kind === 'string') {
      return parsed as ControlMessage;
    }
    return undefined;
  } catch (_error: unknown) {
    return undefined;
  }
};

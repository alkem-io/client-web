/**
 * Collaborator-mode types for the whiteboard editor.
 *
 * The legacy Socket.IO constants (WS event names, scene-event types, idle/sync
 * timeouts, room-id sizing) were removed with the Socket.IO collaboration path —
 * real-time collaboration now runs on the unified collaboration service via
 * `UnifiedCollabProvider` + the Yjs `WhiteboardBinding`. Only the collaborator
 * read/write mode vocabulary survives, consumed by the editor footer + the
 * collab hook to mirror the server's `collaborator-mode` / `read-only-state`
 * control messages.
 */

export type CollaboratorMode = 'read' | 'write';

export enum CollaboratorModeReasons {
  ROOM_CAPACITY_REACHED = 'roomCapacityReached',
  MULTI_USER_NOT_ALLOWED = 'multiUserNotAllowed',
  INACTIVITY = 'inactivity',
}

export interface CollaboratorModeEvent {
  mode: CollaboratorMode;
  reason: CollaboratorModeReasons;
}

import type { ConnectionStatus } from './unifiedCollabProvider';

export type CollaborationPhase = 'initial' | 'live' | 'recovering' | 'terminal' | 'replaceGeneration';
export type CollaborationAccess = 'readWrite' | 'readOnly';

export type CollaborationPhaseSnapshot = {
  status: ConnectionStatus;
  synced: boolean;
  hasEverSynced: boolean;
  readOnly: boolean;
  terminal: boolean;
  replaceGeneration: boolean;
};

export type CollaborationState = {
  phase: CollaborationPhase;
  access: CollaborationAccess;
};

/** One orthogonal interpretation of provider lifecycle and server access. */
export function deriveCollaborationState(snapshot: CollaborationPhaseSnapshot): CollaborationState {
  const access: CollaborationAccess = snapshot.readOnly ? 'readOnly' : 'readWrite';
  if (snapshot.replaceGeneration) return { phase: 'replaceGeneration', access };
  if (snapshot.terminal) return { phase: 'terminal', access };
  if (!snapshot.hasEverSynced) return { phase: 'initial', access };
  if (snapshot.status === 'connected' && snapshot.synced) return { phase: 'live', access };
  return { phase: 'recovering', access };
}

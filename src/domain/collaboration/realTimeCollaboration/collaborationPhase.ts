import type { ConnectionStatus } from './unifiedCollabProvider';

export type CollaborationPhase = 'initial' | 'live' | 'recovering' | 'readOnly' | 'terminal' | 'replaceGeneration';

export type CollaborationPhaseSnapshot = {
  status: ConnectionStatus;
  synced: boolean;
  hasEverSynced: boolean;
  readOnly: boolean;
  terminal: boolean;
  replaceGeneration: boolean;
};

/** One interpretation of provider facts shared by memo and whiteboard consumers. */
export function deriveCollaborationPhase(snapshot: CollaborationPhaseSnapshot): CollaborationPhase {
  if (snapshot.replaceGeneration) return 'replaceGeneration';
  if (snapshot.terminal) return 'terminal';
  if (snapshot.readOnly) return 'readOnly';
  if (!snapshot.hasEverSynced) return 'initial';
  if (snapshot.status === 'connected' && snapshot.synced) return 'live';
  return 'recovering';
}

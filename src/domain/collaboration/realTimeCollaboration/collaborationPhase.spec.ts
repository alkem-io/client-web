import { describe, expect, it } from 'vitest';
import { type CollaborationPhaseSnapshot, deriveCollaborationState } from './collaborationPhase';

const live: CollaborationPhaseSnapshot = {
  status: 'connected',
  synced: true,
  hasEverSynced: true,
  readOnly: false,
  terminal: false,
  replaceGeneration: false,
};

describe('deriveCollaborationState', () => {
  it.each([
    [{ ...live, hasEverSynced: false, synced: false, status: 'connecting' }, 'initial', 'readWrite'],
    [live, 'live', 'readWrite'],
    [{ ...live, status: 'disconnected', synced: false }, 'recovering', 'readWrite'],
    [{ ...live, status: 'disconnected', synced: false, readOnly: true }, 'recovering', 'readOnly'],
    [{ ...live, readOnly: true }, 'live', 'readOnly'],
    [{ ...live, terminal: true, readOnly: true }, 'terminal', 'readOnly'],
    [{ ...live, replaceGeneration: true, readOnly: true }, 'replaceGeneration', 'readOnly'],
  ] as const)('derives %s as lifecycle %s with access %s', (snapshot, phase, access) => {
    expect(deriveCollaborationState(snapshot)).toEqual({ phase, access });
  });
});

import { describe, expect, it } from 'vitest';
import { type CollaborationPhaseSnapshot, deriveCollaborationPhase } from './collaborationPhase';

const live: CollaborationPhaseSnapshot = {
  status: 'connected',
  synced: true,
  hasEverSynced: true,
  readOnly: false,
  terminal: false,
  replaceGeneration: false,
};

describe('deriveCollaborationPhase', () => {
  it.each([
    [{ ...live, hasEverSynced: false, synced: false, status: 'connecting' }, 'initial'],
    [live, 'live'],
    [{ ...live, status: 'disconnected', synced: false }, 'recovering'],
    [{ ...live, readOnly: true }, 'readOnly'],
    [{ ...live, terminal: true }, 'terminal'],
    [{ ...live, replaceGeneration: true }, 'replaceGeneration'],
  ] as const)('derives %s as %s', (snapshot, expected) => {
    expect(deriveCollaborationPhase(snapshot)).toBe(expected);
  });
});

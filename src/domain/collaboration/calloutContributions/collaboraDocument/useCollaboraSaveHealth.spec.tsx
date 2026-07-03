/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCollaboraSaveHealth } from './useCollaboraSaveHealth';

// The backend probe is intentionally DISABLED (it re-ran a side-effectful query — token issuance
// + COLLABORA_DOCUMENT_OPENED analytics — every few seconds). Until a side-effect-free detection
// channel exists, the hook must report no outage regardless of save state, and must NOT hit Apollo
// (so it needs no provider here).
describe('useCollaboraSaveHealth (probe disabled)', () => {
  it('reports no service outage while unsaved (no side-effectful probing)', () => {
    const { result } = renderHook(() => useCollaboraSaveHealth('doc-1', 'unsaved'));
    expect(result.current.serviceUnavailable).toBe(false);
  });

  it('reports no service outage while saved', () => {
    const { result } = renderHook(() => useCollaboraSaveHealth('doc-1', 'saved'));
    expect(result.current.serviceUnavailable).toBe(false);
  });
});

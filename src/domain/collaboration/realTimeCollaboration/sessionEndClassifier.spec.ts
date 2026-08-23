import { describe, expect, it } from 'vitest';
import { classifySessionEnd, SESSION_END_TABLE } from './unifiedCollabProvider';

describe('classifySessionEnd — exhaustive tuple validation (fail closed)', () => {
  // The single source of truth for the known code → (scope, disposition) tuples.
  const EXPECTED = [
    { code: 'update-rate-exceeded', scope: 'member', disposition: 'transient' },
    { code: 'update-not-accepted', scope: 'member', disposition: 'transient' },
    { code: 'document-size-limit-exceeded', scope: 'member', disposition: 'manual' },
    { code: 'document-deleted', scope: 'document', disposition: 'terminal' },
    { code: 'edits-not-saved', scope: 'document', disposition: 'terminal' },
    { code: 'server-shutdown', scope: 'document', disposition: 'transient' },
  ] as const;

  it('the table has exactly the six known codes', () => {
    expect(Object.keys(SESSION_END_TABLE).sort()).toEqual(EXPECTED.map(e => e.code).sort());
  });

  it.each(EXPECTED)('accepts the consistent tuple for %s', ({ code, scope, disposition }) => {
    expect(classifySessionEnd({ code, scope, disposition })).toEqual({ code, scope, disposition });
  });

  it('derives the AUTHORITATIVE disposition from the table, not the wire (rejects an inconsistent disposition)', () => {
    // Wire claims transient for a terminal code → inconsistent → fail closed.
    expect(classifySessionEnd({ code: 'document-deleted', scope: 'document', disposition: 'transient' })).toBeNull();
  });

  it('rejects an inconsistent scope', () => {
    expect(
      classifySessionEnd({ code: 'update-rate-exceeded', scope: 'document', disposition: 'transient' })
    ).toBeNull();
  });

  it('rejects an unknown code (arbitrary wire string)', () => {
    expect(
      classifySessionEnd({ code: 'totally-made-up' as never, scope: 'member', disposition: 'transient' })
    ).toBeNull();
  });

  it('rejects a missing code / missing fields', () => {
    expect(classifySessionEnd({})).toBeNull();
    expect(classifySessionEnd({ code: 'server-shutdown' })).toBeNull(); // no scope/disposition
  });
});

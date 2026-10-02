import { describe, expect, it } from 'vitest';
import { deriveFormEditLocks } from './useCalloutFormEditLocks';

const base = {
  questionIds: ['q1', 'q2'],
  persisted: { visibility: 'ADMINS' as const, responseMode: 'MULTIPLE' as const, state: 'OPEN' as const },
  canReadAll: true,
  total: 0,
  respondentIds: [] as (string | undefined)[],
};

describe('deriveFormEditLocks', () => {
  it('locks nothing while the form has no responses', () => {
    expect(deriveFormEditLocks(base)).toEqual({
      typeLockedQuestionIds: [],
      canWidenVisibility: true,
      canSwitchToSingle: true,
    });
  });

  it('once responses exist: types are fixed and widening from admins is blocked', () => {
    expect(deriveFormEditLocks({ ...base, total: 3, respondentIds: ['a', 'b', 'c'] })).toEqual({
      typeLockedQuestionIds: ['q1', 'q2'],
      canWidenVisibility: false,
      canSwitchToSingle: true,
    });
  });

  it('a form already visible to members keeps that option selectable', () => {
    const locks = deriveFormEditLocks({
      ...base,
      persisted: { ...base.persisted, visibility: 'MEMBERS' },
      total: 1,
      respondentIds: ['a'],
    });
    expect(locks.canWidenVisibility).toBe(true);
  });

  it('blocks the switch to a single response while one member holds several', () => {
    const locks = deriveFormEditLocks({ ...base, total: 3, respondentIds: ['a', 'a', 'b'] });
    expect(locks.canSwitchToSingle).toBe(false);
  });

  it('an already single-response form never blocks the single option', () => {
    const locks = deriveFormEditLocks({
      ...base,
      persisted: { ...base.persisted, responseMode: 'SINGLE' },
      total: 3,
      respondentIds: ['a', 'a', 'b'],
    });
    expect(locks.canSwitchToSingle).toBe(true);
  });

  it('a viewer who cannot read every response locks nothing client-side (the server decides)', () => {
    expect(deriveFormEditLocks({ ...base, canReadAll: false, total: 5, respondentIds: ['a', 'a'] })).toEqual({
      typeLockedQuestionIds: [],
      canWidenVisibility: true,
      canSwitchToSingle: true,
    });
  });

  it('responses of deleted users never count as one member holding several', () => {
    const locks = deriveFormEditLocks({ ...base, total: 2, respondentIds: [undefined, undefined] });
    expect(locks.canSwitchToSingle).toBe(true);
  });
});

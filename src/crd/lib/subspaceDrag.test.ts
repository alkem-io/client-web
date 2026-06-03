import { describe, expect, test } from 'vitest';
import { isSubspaceDragDisabled } from './subspaceDrag';

describe('isSubspaceDragDisabled', () => {
  test('manual mode: every subspace is draggable (pinned or not)', () => {
    expect(isSubspaceDragDisabled('manual', true)).toBe(false);
    expect(isSubspaceDragDisabled('manual', false)).toBe(false);
  });

  test('alphabetical mode: only pinned subspaces are draggable', () => {
    expect(isSubspaceDragDisabled('alphabetical', true)).toBe(false);
    expect(isSubspaceDragDisabled('alphabetical', false)).toBe(true);
  });
});

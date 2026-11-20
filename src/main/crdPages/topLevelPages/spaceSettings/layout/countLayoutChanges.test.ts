import { describe, expect, it } from 'vitest';
import type { LayoutPoolColumn } from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import { countLayoutChanges } from './useLayoutTabData';

const column = (id: string, calloutIds: string[]): LayoutPoolColumn =>
  ({
    id,
    title: id,
    description: '',
    isCurrentPhase: false,
    callouts: calloutIds.map(calloutId => ({ id: calloutId })),
  }) as unknown as LayoutPoolColumn;

const snapshot = [column('a', ['p1', 'p2', 'p3']), column('b', ['p4'])];

describe('countLayoutChanges (spec 045 FR-025b)', () => {
  it('is zero for an unchanged board', () => {
    expect(countLayoutChanges(snapshot, [column('a', ['p1', 'p2', 'p3']), column('b', ['p4'])])).toBe(0);
  });

  it('counts a post moved to another column once — not also as an order change of either column', () => {
    expect(countLayoutChanges(snapshot, [column('a', ['p1', 'p3']), column('b', ['p4', 'p2'])])).toBe(1);
  });

  it('counts one per column whose post order changed, however many posts moved inside it', () => {
    expect(countLayoutChanges(snapshot, [column('a', ['p3', 'p1', 'p2']), column('b', ['p4'])])).toBe(1);
  });

  it('counts the column order once', () => {
    expect(countLayoutChanges(snapshot, [column('b', ['p4']), column('a', ['p1', 'p2', 'p3'])])).toBe(1);
  });

  it('adds the three kinds together', () => {
    expect(countLayoutChanges(snapshot, [column('b', ['p4', 'p1']), column('a', ['p3', 'p2'])])).toBe(3);
  });
});

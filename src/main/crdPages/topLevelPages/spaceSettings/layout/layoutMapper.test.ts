import { describe, expect, test } from 'vitest';
import { type LayoutCollaboration, mapCollaborationToLayoutColumns } from './layoutMapper';

/**
 * Minimal collaboration fixture. The real GraphQL type is large; we cast a
 * partial object that carries only the fields the mapper reads. Each callout
 * is grouped under a state via `classification.flowState.tags[0]` === state.displayName.
 */
const buildCollaboration = (overrides?: {
  currentStateId?: string | null;
  calloutUrl?: string | null;
}): LayoutCollaboration => {
  const currentStateId = overrides && 'currentStateId' in overrides ? overrides.currentStateId : 'state-1';
  const calloutUrl = overrides && 'calloutUrl' in overrides ? overrides.calloutUrl : '/space-x/collaboration/post-1';
  return {
    id: 'collab-1',
    authorization: { id: 'auth-1', myPrivileges: [] },
    innovationFlow: {
      id: 'flow-1',
      currentState: currentStateId ? { id: currentStateId } : null,
      states: [
        { id: 'state-1', displayName: 'Explore', description: 'Explore **phase**', sortOrder: 1 },
        { id: 'state-2', displayName: 'Define', description: '', sortOrder: 2 },
      ],
    },
    calloutsSet: {
      id: 'cset-1',
      callouts: [
        {
          id: 'callout-1',
          activity: 0,
          sortOrder: 1,
          classification: { id: 'cls-1', flowState: { id: 'tag-1', tags: ['Explore'] } },
          framing: {
            id: 'framing-1',
            type: 'NONE',
            profile: { id: 'p-1', displayName: 'Post 1', url: calloutUrl ?? '' },
          },
          settings: { visibility: 'PUBLISHED', contribution: { allowedTypes: [] } },
        },
      ],
    },
  } as unknown as LayoutCollaboration;
};

describe('mapCollaborationToLayoutColumns', () => {
  test('maps the callout profile.url to profileUrl', () => {
    const [exploreColumn] = mapCollaborationToLayoutColumns(buildCollaboration(), 'L1');
    expect(exploreColumn.callouts[0].profileUrl).toBe('/space-x/collaboration/post-1');
  });

  test('falls back to an empty profileUrl when the callout has no url', () => {
    const [exploreColumn] = mapCollaborationToLayoutColumns(buildCollaboration({ calloutUrl: '' }), 'L1');
    expect(exploreColumn.callouts[0].profileUrl).toBe('');
  });

  test('flags the current state column as the active phase', () => {
    const columns = mapCollaborationToLayoutColumns(buildCollaboration({ currentStateId: 'state-2' }), 'L1');
    const explore = columns.find(c => c.id === 'state-1');
    const define = columns.find(c => c.id === 'state-2');
    expect(explore?.isCurrentPhase).toBe(false);
    expect(define?.isCurrentPhase).toBe(true);
  });

  test('no column is active when currentState is null', () => {
    const columns = mapCollaborationToLayoutColumns(buildCollaboration({ currentStateId: null }), 'L1');
    expect(columns.every(c => !c.isCurrentPhase)).toBe(true);
  });

  describe('isHidden mapping (settings.visible → isHidden)', () => {
    const buildWithVisibility = (visibleByState: Record<string, boolean | undefined>): LayoutCollaboration =>
      ({
        id: 'collab-1',
        authorization: { id: 'auth-1', myPrivileges: [] },
        innovationFlow: {
          id: 'flow-1',
          currentState: { id: 'state-1' },
          states: [
            {
              id: 'state-1',
              displayName: 'Explore',
              description: '',
              sortOrder: 1,
              settings: {
                allowNewCallouts: true,
                ...('state-1' in visibleByState && { visible: visibleByState['state-1'] }),
              },
            },
            {
              id: 'state-2',
              displayName: 'Define',
              description: '',
              sortOrder: 2,
              settings: {
                allowNewCallouts: true,
                ...('state-2' in visibleByState && { visible: visibleByState['state-2'] }),
              },
            },
          ],
        },
        calloutsSet: { id: 'cset-1', callouts: [] },
      }) as unknown as LayoutCollaboration;

    test('visible:false → isHidden true; visible:true → isHidden false', () => {
      const columns = mapCollaborationToLayoutColumns(buildWithVisibility({ 'state-1': false, 'state-2': true }), 'L1');
      expect(columns.find(c => c.id === 'state-1')?.isHidden).toBe(true);
      expect(columns.find(c => c.id === 'state-2')?.isHidden).toBe(false);
    });

    test('absent visible flag → isHidden undefined (graceful degradation, affordance suppressed)', () => {
      const columns = mapCollaborationToLayoutColumns(buildWithVisibility({}), 'L1');
      expect(columns.find(c => c.id === 'state-1')?.isHidden).toBeUndefined();
      expect(columns.find(c => c.id === 'state-2')?.isHidden).toBeUndefined();
    });
  });

  describe('isDeletable mapping (L0 first four protected; subspaces all deletable)', () => {
    // Six ordered states so we cover the four built-in L0 tabs (indices 0–3) plus two additional
    // tabs (indices 4–5). sortOrder is intentionally out of order to assert the mapper sorts first.
    const buildSixStates = (): LayoutCollaboration =>
      ({
        id: 'collab-1',
        authorization: { id: 'auth-1', myPrivileges: [] },
        innovationFlow: {
          id: 'flow-1',
          currentState: { id: 's0' },
          states: [
            { id: 's2', displayName: 'Subspaces', description: '', sortOrder: 3 },
            { id: 's0', displayName: 'Dashboard', description: '', sortOrder: 1 },
            { id: 's4', displayName: 'Archive', description: '', sortOrder: 5 },
            { id: 's1', displayName: 'Community', description: '', sortOrder: 2 },
            { id: 's5', displayName: 'Brainstorm', description: '', sortOrder: 6 },
            { id: 's3', displayName: 'Knowledge Base', description: '', sortOrder: 4 },
          ],
        },
        calloutsSet: { id: 'cset-1', callouts: [] },
      }) as unknown as LayoutCollaboration;

    test('L0: first four tabs (by sort order) are not deletable; index ≥ 4 are deletable', () => {
      const columns = mapCollaborationToLayoutColumns(buildSixStates(), 'L0');
      // Order must be by sortOrder: Dashboard, Community, Subspaces, Knowledge Base, Archive, Brainstorm.
      expect(columns.map(c => c.id)).toEqual(['s0', 's1', 's2', 's3', 's4', 's5']);
      expect(columns.map(c => c.isDeletable)).toEqual([false, false, false, false, true, true]);
    });

    test('L1: every phase is deletable', () => {
      const columns = mapCollaborationToLayoutColumns(buildSixStates(), 'L1');
      expect(columns.every(c => c.isDeletable === true)).toBe(true);
    });

    test('L2: every phase is deletable', () => {
      const columns = mapCollaborationToLayoutColumns(buildSixStates(), 'L2');
      expect(columns.every(c => c.isDeletable === true)).toBe(true);
    });
  });
});

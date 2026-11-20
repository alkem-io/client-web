import { describe, expect, it } from 'vitest';
import { SidebarWidget } from '@/core/apollo/generated/graphql-schema';
import { SIDEBAR_WIDGET_IDS_BY_LEVEL } from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import {
  deriveWidgetSkips,
  extractUnknownSidebarEntries,
  resolveSidebarPlan,
  SIDEBAR_WIDGET_IDS,
  toWireSidebar,
} from './sidebarWidgetPlan';

describe('resolveSidebarPlan', () => {
  it('maps wire enum values to CRD widget ids, preserving order', () => {
    expect(resolveSidebarPlan([SidebarWidget.Events, SidebarWidget.Intent])).toEqual(['events', 'intent']);
  });

  it('maps the createSubspace widget both directions (A-03 — promoted from the action slot)', () => {
    expect(resolveSidebarPlan([SidebarWidget.CreateSubspace])).toEqual(['createSubspace']);
    expect(toWireSidebar(['createSubspace'])).toEqual([SidebarWidget.CreateSubspace]);
  });

  it('drops unrecognized wire values (forward compatibility, FR-013)', () => {
    expect(resolveSidebarPlan([SidebarWidget.Intent, 'NOT_A_WIDGET', SidebarWidget.Index])).toEqual([
      'intent',
      'index',
    ]);
  });

  it('dedupes, first occurrence wins', () => {
    expect(resolveSidebarPlan([SidebarWidget.Intent, SidebarWidget.Events, SidebarWidget.Intent])).toEqual([
      'intent',
      'events',
    ]);
  });

  it('resolves an empty list to an empty plan (FR-016)', () => {
    expect(resolveSidebarPlan([])).toEqual([]);
  });

  it('resolves null/undefined to an empty plan (defensive — server guarantees NonNull)', () => {
    expect(resolveSidebarPlan(null)).toEqual([]);
    expect(resolveSidebarPlan(undefined)).toEqual([]);
  });

  it('maps the search widget both directions (055)', () => {
    expect(resolveSidebarPlan([SidebarWidget.Search])).toEqual(['search']);
    expect(toWireSidebar(['search'])).toEqual([SidebarWidget.Search]);
    const skips = deriveWidgetSkips(['search']);
    expect(skips.search).toBe(false);
    expect(skips.index).toBe(true);
  });
});

describe('toWireSidebar', () => {
  it('maps CRD widget ids back to the generated wire enum, preserving order', () => {
    expect(toWireSidebar(['events', 'intent'])).toEqual([SidebarWidget.Events, SidebarWidget.Intent]);
  });

  it('round-trips every widget id in the vocabulary', () => {
    const wire = toWireSidebar(SIDEBAR_WIDGET_IDS);
    expect(resolveSidebarPlan(wire)).toEqual(SIDEBAR_WIDGET_IDS);
  });

  it('re-inserts unknown wire values at their original indices (non-destructive round trip)', () => {
    const stored = [SidebarWidget.Intent, 'FUTURE_WIDGET', SidebarWidget.Index];
    const plan = resolveSidebarPlan(stored);
    const unknown = extractUnknownSidebarEntries(stored);
    expect(toWireSidebar(plan, unknown)).toEqual(stored);
  });

  it('keeps multiple unknown values in relative order, clamping indices past the end', () => {
    const stored = ['ALPHA_WIDGET', SidebarWidget.Events, 'OMEGA_WIDGET'];
    const unknown = extractUnknownSidebarEntries(stored);
    // Round trip untouched → identical.
    expect(toWireSidebar(resolveSidebarPlan(stored), unknown)).toEqual(stored);
    // Admin removed the only known widget → unknown entries survive, order kept.
    expect(toWireSidebar([], unknown)).toEqual(['ALPHA_WIDGET', 'OMEGA_WIDGET']);
  });

  it('without unknown entries behaves as a plain mapping', () => {
    expect(toWireSidebar(['events'], [])).toEqual([SidebarWidget.Events]);
  });
});

describe('extractUnknownSidebarEntries', () => {
  it('captures only out-of-vocabulary values, with their original indices', () => {
    expect(extractUnknownSidebarEntries([SidebarWidget.Intent, 'FUTURE_WIDGET', SidebarWidget.Index])).toEqual([
      { index: 1, value: 'FUTURE_WIDGET' },
    ]);
  });

  it('returns an empty list for a fully-recognized or absent stored list', () => {
    expect(extractUnknownSidebarEntries([SidebarWidget.Intent])).toEqual([]);
    expect(extractUnknownSidebarEntries(null)).toEqual([]);
    expect(extractUnknownSidebarEntries(undefined)).toEqual([]);
  });
});

describe('deriveWidgetSkips', () => {
  it('sets skip=true for every widget absent from the plan', () => {
    const skips = deriveWidgetSkips(['intent', 'index']);
    expect(skips.intent).toBe(false);
    expect(skips.index).toBe(false);
    expect(skips.events).toBe(true);
    expect(skips.about).toBe(true);
  });

  it('an empty plan skips every widget', () => {
    const skips = deriveWidgetSkips([]);
    for (const widgetId of SIDEBAR_WIDGET_IDS) {
      expect(skips[widgetId]).toBe(true);
    }
  });

  it('the full vocabulary skips nothing', () => {
    const skips = deriveWidgetSkips(SIDEBAR_WIDGET_IDS);
    for (const widgetId of SIDEBAR_WIDGET_IDS) {
      expect(skips[widgetId]).toBe(false);
    }
  });
});

describe('per-level vocabulary', () => {
  // The server's subspace first-phase default and its top-level tab-1 default.
  const SUBSPACE_DEFAULT = [
    SidebarWidget.Intent,
    SidebarWidget.About,
    SidebarWidget.CreatePost,
    SidebarWidget.Community,
    SidebarWidget.Events,
    SidebarWidget.Activity,
    SidebarWidget.Index,
    SidebarWidget.SubspaceLinks,
    SidebarWidget.VirtualContributors,
    SidebarWidget.Updates,
  ];
  const L0_TAB_1 = [
    SidebarWidget.Intent,
    SidebarWidget.About,
    SidebarWidget.CreatePost,
    SidebarWidget.Search,
    SidebarWidget.ApplicationButton,
    SidebarWidget.SubspaceLinks,
    SidebarWidget.Events,
    SidebarWidget.Updates,
  ];

  it('both wire maps round-trip all sixteen widgets', () => {
    expect(SIDEBAR_WIDGET_IDS).toHaveLength(16);
    expect(new Set(toWireSidebar(SIDEBAR_WIDGET_IDS)).size).toBe(16);
    expect(resolveSidebarPlan(toWireSidebar(SIDEBAR_WIDGET_IDS))).toEqual(SIDEBAR_WIDGET_IDS);
    expect(toWireSidebar(['community', 'activity'])).toEqual([SidebarWidget.Community, SidebarWidget.Activity]);
  });

  it('L2 drops Create Subspace, Subspaces and unknown values, and carries all of them back on save', () => {
    const stored = [SidebarWidget.Intent, SidebarWidget.CreateSubspace, SidebarWidget.SubspaceLinks, 'ZZZ'];
    const vocabulary = SIDEBAR_WIDGET_IDS_BY_LEVEL.L2;
    expect(resolveSidebarPlan(stored, vocabulary)).toEqual(['intent']);
    const carried = extractUnknownSidebarEntries(stored, vocabulary);
    expect(carried).toEqual([
      { index: 1, value: SidebarWidget.CreateSubspace },
      { index: 2, value: SidebarWidget.SubspaceLinks },
      { index: 3, value: 'ZZZ' },
    ]);
    expect(toWireSidebar(['intent', 'search'], carried)).toEqual([
      SidebarWidget.Intent,
      SidebarWidget.CreateSubspace,
      SidebarWidget.SubspaceLinks,
      'ZZZ',
      SidebarWidget.Search,
    ]);
  });

  it('L1 given the top-level tab-1 list carries applicationButton at index 4', () => {
    const vocabulary = SIDEBAR_WIDGET_IDS_BY_LEVEL.L1;
    expect(resolveSidebarPlan(L0_TAB_1, vocabulary)).toEqual([
      'intent',
      'about',
      'createPost',
      'search',
      'subspaceLinks',
      'events',
      'updates',
    ]);
    expect(extractUnknownSidebarEntries(L0_TAB_1, vocabulary)).toEqual([
      { index: 4, value: SidebarWidget.ApplicationButton },
    ]);
  });

  it('L0 given the subspace default renders all ten widgets', () => {
    expect(resolveSidebarPlan(SUBSPACE_DEFAULT, SIDEBAR_WIDGET_IDS_BY_LEVEL.L0)).toHaveLength(10);
    expect(extractUnknownSidebarEntries(SUBSPACE_DEFAULT, SIDEBAR_WIDGET_IDS_BY_LEVEL.L0)).toEqual([]);
  });

  it('the default vocabulary is the full top-level list', () => {
    expect(SIDEBAR_WIDGET_IDS_BY_LEVEL.L0).toBe(SIDEBAR_WIDGET_IDS);
    expect(resolveSidebarPlan(L0_TAB_1)).toEqual(resolveSidebarPlan(L0_TAB_1, SIDEBAR_WIDGET_IDS));
  });

  it('the subspace vocabularies list the thirteen (L1) and eleven (L2) subspace widgets', () => {
    expect(SIDEBAR_WIDGET_IDS_BY_LEVEL.L1).toHaveLength(13);
    expect(SIDEBAR_WIDGET_IDS_BY_LEVEL.L2).toEqual(
      SIDEBAR_WIDGET_IDS_BY_LEVEL.L1.filter(id => id !== 'createSubspace' && id !== 'subspaceLinks')
    );
    for (const topLevelOnly of ['applicationButton', 'contactLeads', 'guidelines'] as const) {
      expect(SIDEBAR_WIDGET_IDS_BY_LEVEL.L1).not.toContain(topLevelOnly);
    }
  });
});

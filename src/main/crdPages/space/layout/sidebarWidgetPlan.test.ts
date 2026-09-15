import { describe, expect, it } from 'vitest';
import { SidebarWidget } from '@/core/apollo/generated/graphql-schema';
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

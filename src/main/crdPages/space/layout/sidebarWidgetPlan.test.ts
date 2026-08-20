import { describe, expect, it } from 'vitest';
import { SidebarWidget } from '@/core/apollo/generated/graphql-schema';
import { deriveWidgetSkips, resolveSidebarPlan, SIDEBAR_WIDGET_IDS, toWireSidebar } from './sidebarWidgetPlan';

describe('resolveSidebarPlan', () => {
  it('maps wire enum values to CRD widget ids, preserving order', () => {
    expect(resolveSidebarPlan([SidebarWidget.Events, SidebarWidget.Intent])).toEqual(['events', 'intent']);
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
});

describe('toWireSidebar', () => {
  it('maps CRD widget ids back to the generated wire enum, preserving order', () => {
    expect(toWireSidebar(['events', 'intent'])).toEqual([SidebarWidget.Events, SidebarWidget.Intent]);
  });

  it('round-trips every widget id in the vocabulary', () => {
    const wire = toWireSidebar(SIDEBAR_WIDGET_IDS);
    expect(resolveSidebarPlan(wire)).toEqual(SIDEBAR_WIDGET_IDS);
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

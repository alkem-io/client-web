import { SidebarWidget } from '@/core/apollo/generated/graphql-schema';
import {
  SIDEBAR_WIDGET_IDS,
  type SidebarWidgetId,
} from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';

/** Re-export the canonical CRD-safe sidebar widget vocabulary + ordering. */
export { SIDEBAR_WIDGET_IDS };
export type { SidebarWidgetId };

const WIRE_TO_WIDGET_ID: Record<string, SidebarWidgetId> = {
  [SidebarWidget.Intent]: 'intent',
  [SidebarWidget.About]: 'about',
  [SidebarWidget.CreatePost]: 'createPost',
  [SidebarWidget.SubspaceLinks]: 'subspaceLinks',
  [SidebarWidget.Events]: 'events',
  [SidebarWidget.Updates]: 'updates',
  [SidebarWidget.ContactLeads]: 'contactLeads',
  [SidebarWidget.AddUser]: 'addUser',
  [SidebarWidget.VirtualContributors]: 'virtualContributors',
  [SidebarWidget.Guidelines]: 'guidelines',
  [SidebarWidget.Index]: 'index',
};

const WIDGET_ID_TO_WIRE: Record<SidebarWidgetId, SidebarWidget> = {
  intent: SidebarWidget.Intent,
  about: SidebarWidget.About,
  createPost: SidebarWidget.CreatePost,
  subspaceLinks: SidebarWidget.SubspaceLinks,
  events: SidebarWidget.Events,
  updates: SidebarWidget.Updates,
  contactLeads: SidebarWidget.ContactLeads,
  addUser: SidebarWidget.AddUser,
  virtualContributors: SidebarWidget.VirtualContributors,
  guidelines: SidebarWidget.Guidelines,
  index: SidebarWidget.Index,
};

/**
 * Resolves a state's stored `sidebar` (wire enum values) into the ordered,
 * CRD-safe widget plan: unrecognized values are silently dropped (FR-013 —
 * forward compatibility with a newer server vocabulary) and duplicates are
 * removed, first occurrence wins (defensive; the server already dedupes on
 * read per FR-006). `null`/`undefined` resolves to an empty plan — the
 * server contract guarantees NonNull, so this is a defensive fallback only.
 */
export function resolveSidebarPlan(sidebar: readonly string[] | null | undefined): SidebarWidgetId[] {
  if (!sidebar) return [];

  const plan: SidebarWidgetId[] = [];
  const seen = new Set<SidebarWidgetId>();

  for (const wireValue of sidebar) {
    const widgetId = WIRE_TO_WIDGET_ID[wireValue];
    if (!widgetId || seen.has(widgetId)) continue;
    seen.add(widgetId);
    plan.push(widgetId);
  }

  return plan;
}

/** Maps a plain CRD widget-id plan back to the generated wire enum, for the
 *  Settings > Layout editor's save payload. */
export function toWireSidebar(plan: readonly SidebarWidgetId[]): SidebarWidget[] {
  return plan.map(widgetId => WIDGET_ID_TO_WIRE[widgetId]);
}

export type SidebarWidgetSkipFlags = Record<SidebarWidgetId, boolean>;

/**
 * Derives a `skip` flag per widget in the full vocabulary — `true` when the
 * widget is NOT in the resolved plan. The sidebar connector calls every
 * widget's data hook unconditionally (Rules of Hooks) and passes these flags
 * as `skip:`, so a query never fires for a widget absent from the active
 * tab's configuration (FR-019/SC-008 fetch parity).
 */
export function deriveWidgetSkips(plan: readonly SidebarWidgetId[]): SidebarWidgetSkipFlags {
  const configured = new Set(plan);
  const skips = {} as SidebarWidgetSkipFlags;
  for (const widgetId of SIDEBAR_WIDGET_IDS) {
    skips[widgetId] = !configured.has(widgetId);
  }
  return skips;
}

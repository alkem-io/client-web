import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Canonical tab ids in the order they render in the tab strip.
 * Mirrors contracts/shell.ts `TAB_ORDER`.
 */
export const SPACE_SETTINGS_TAB_IDS = [
  'about',
  'layout',
  'community',
  'updates',
  'subspaces',
  'templates',
  'storage',
  'settings',
  'account',
] as const;

export type SpaceSettingsTabId = (typeof SPACE_SETTINGS_TAB_IDS)[number];

const TAB_ID_SET = new Set<string>(SPACE_SETTINGS_TAB_IDS);
const DEFAULT_TAB: SpaceSettingsTabId = 'about';

/**
 * Extract the active tab id from a settings URL.
 * Expected shape: `.../settings` or `.../settings/<tab>` (trailing bits ignored).
 * Unknown values normalize to the default tab.
 */
export function parseSpaceSettingsTab(pathname: string): SpaceSettingsTabId {
  const segments = pathname.split('/').filter(Boolean);
  // Use the FIRST `settings` segment — that anchors the admin section;
  // the segment immediately after it is the active tab id.
  const settingsIdx = segments.indexOf('settings');
  if (settingsIdx === -1) {
    return DEFAULT_TAB;
  }
  const candidate = segments[settingsIdx + 1];
  if (candidate && TAB_ID_SET.has(candidate)) {
    return candidate as SpaceSettingsTabId;
  }
  return DEFAULT_TAB;
}

/**
 * Build the URL for a given tab, given a current pathname that already
 * contains the `settings` segment. Preserves everything up to and including
 * `settings`, then appends the tab id.
 */
export function buildSpaceSettingsTabPath(pathname: string, tab: SpaceSettingsTabId): string {
  const segments = pathname.split('/').filter(Boolean);
  // Mirror parseSpaceSettingsTab: anchor on the FIRST `settings` segment.
  const settingsIdx = segments.indexOf('settings');
  if (settingsIdx === -1) {
    return pathname;
  }
  const prefixSegments = segments.slice(0, settingsIdx + 1);
  const leadingSlash = pathname.startsWith('/') ? '/' : '';
  return `${leadingSlash}${prefixSegments.join('/')}/${tab}`;
}

/**
 * Reads the active tab from the URL and exposes a setter that navigates to
 * `.../settings/<tab>`. Unknown URL segments fall back to the About tab.
 *
 * Does NOT implement the dirty-tab guard — that is composed separately by
 * `useDirtyTabGuard` so the guard can veto switches and this hook stays a
 * pure URL↔state binding.
 */
export function useSpaceSettingsTab(): {
  activeTab: SpaceSettingsTabId;
  setActiveTab: (next: SpaceSettingsTabId) => void;
} {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = parseSpaceSettingsTab(pathname);

  const setActiveTab = (next: SpaceSettingsTabId) => {
    const target = buildSpaceSettingsTabPath(pathname, next);
    if (target !== pathname) {
      navigate(target);
    }
  };

  return { activeTab, setActiveTab };
}

import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';

export const ORG_SETTINGS_TAB_IDS = ['profile', 'account', 'community', 'authorization', 'settings'] as const;

export type OrgSettingsTabId = (typeof ORG_SETTINGS_TAB_IDS)[number];

const DEFAULT_TAB: OrgSettingsTabId = 'profile';

const isOrgSettingsTabId = (value: string): value is OrgSettingsTabId =>
  (ORG_SETTINGS_TAB_IDS as ReadonlyArray<string>).includes(value);

/**
 * Resolves the active Org Settings tab from the URL and exposes a navigation
 * handler that pushes the tab URL via `buildSettingsTabUrl` (from
 * `@/main/routing/urlBuilders`) — never an inline `/organization/...`
 * template, per the URL Construction rule in `docs/crd/migration-guide.md`.
 *
 * `profileUrl` is supplied by the caller (from `organization.profile.url`).
 */
export const useOrgSettingsTab = (params: { profileUrl: string | undefined }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const settingsIdx = segments.indexOf('settings');
  const tabSegment = settingsIdx >= 0 && settingsIdx < segments.length - 1 ? segments[settingsIdx + 1] : DEFAULT_TAB;

  const activeTabId: OrgSettingsTabId = isOrgSettingsTabId(tabSegment) ? tabSegment : DEFAULT_TAB;

  const onTabSelect = (next: OrgSettingsTabId) => {
    const target = buildSettingsTabUrl(params.profileUrl, next);
    if (!target) return;
    navigate(target);
  };

  return { activeTabId, onTabSelect };
};

export default useOrgSettingsTab;

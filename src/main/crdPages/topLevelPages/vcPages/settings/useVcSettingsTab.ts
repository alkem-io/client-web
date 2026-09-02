import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';

export const VC_SETTINGS_TAB_IDS = ['profile', 'membership', 'settings'] as const;

export type VcSettingsTabId = (typeof VC_SETTINGS_TAB_IDS)[number];

const DEFAULT_TAB: VcSettingsTabId = 'profile';

const isVcSettingsTabId = (value: string): value is VcSettingsTabId =>
  (VC_SETTINGS_TAB_IDS as ReadonlyArray<string>).includes(value);

/**
 * Resolves the active VC Settings tab from the URL and exposes a navigation
 * handler that pushes the tab URL via `buildSettingsTabUrl` (from
 * `@/main/routing/urlBuilders`) — never an inline `/vc/...` template, per
 * the URL Construction rule in `docs/crd/migration-guide.md`.
 *
 * `profileUrl` is supplied by the caller (from `virtualContributor.profile.url`).
 */
export const useVcSettingsTab = (params: { profileUrl: string | undefined }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const settingsIdx = segments.indexOf('settings');
  const tabSegment = settingsIdx >= 0 && settingsIdx < segments.length - 1 ? segments[settingsIdx + 1] : DEFAULT_TAB;

  const activeTabId: VcSettingsTabId = isVcSettingsTabId(tabSegment) ? tabSegment : DEFAULT_TAB;

  const onTabSelect = (next: VcSettingsTabId) => {
    const target = buildSettingsTabUrl(params.profileUrl, next);
    if (!target) return;
    navigate(target);
  };

  return { activeTabId, onTabSelect };
};

export default useVcSettingsTab;

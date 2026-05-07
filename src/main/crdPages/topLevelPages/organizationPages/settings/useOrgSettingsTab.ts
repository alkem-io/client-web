import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';

export const ORG_SETTINGS_TAB_IDS = ['profile', 'account', 'community', 'authorization', 'settings'] as const;

export type OrgSettingsTabId = (typeof ORG_SETTINGS_TAB_IDS)[number];

const DEFAULT_TAB: OrgSettingsTabId = 'profile';

const isOrgSettingsTabId = (value: string): value is OrgSettingsTabId =>
  (ORG_SETTINGS_TAB_IDS as ReadonlyArray<string>).includes(value);

/**
 * Resolves the active Org Settings tab from the URL and exposes a navigation
 * handler that pushes `/organization/<orgSlug>/settings/<id>`.
 */
export const useOrgSettingsTab = (params: { organizationSlug: string | undefined }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const settingsIdx = segments.indexOf('settings');
  const tabSegment = settingsIdx >= 0 && settingsIdx < segments.length - 1 ? segments[settingsIdx + 1] : DEFAULT_TAB;

  const activeTabId: OrgSettingsTabId = isOrgSettingsTabId(tabSegment) ? tabSegment : DEFAULT_TAB;

  const onTabSelect = (next: OrgSettingsTabId) => {
    if (!params.organizationSlug) return;
    navigate(`/organization/${params.organizationSlug}/settings/${next}`);
  };

  return { activeTabId, onTabSelect };
};

export default useOrgSettingsTab;

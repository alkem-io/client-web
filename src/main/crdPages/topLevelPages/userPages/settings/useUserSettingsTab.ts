import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';

export const USER_SETTINGS_TAB_IDS = [
  'profile',
  'account',
  'membership',
  'organizations',
  'notifications',
  'settings',
  'security',
] as const;

export type UserSettingsTabId = (typeof USER_SETTINGS_TAB_IDS)[number];

const DEFAULT_TAB: UserSettingsTabId = 'profile';

const isUserSettingsTabId = (value: string): value is UserSettingsTabId =>
  (USER_SETTINGS_TAB_IDS as ReadonlyArray<string>).includes(value);

/**
 * Resolves the active User Settings tab from the URL and exposes a navigation
 * handler that pushes `/user/<slug>/settings/<id>`. The slug is supplied by
 * the caller (from `useUserPageRouteContext().userSlug`) so the hook stays
 * agnostic to how the user is identified.
 */
export const useUserSettingsTab = (params: { userSlug: string | undefined }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const settingsIdx = segments.indexOf('settings');
  const tabSegment = settingsIdx >= 0 && settingsIdx < segments.length - 1 ? segments[settingsIdx + 1] : DEFAULT_TAB;

  const activeTabId: UserSettingsTabId = isUserSettingsTabId(tabSegment) ? tabSegment : DEFAULT_TAB;

  const onTabSelect = (next: UserSettingsTabId) => {
    if (!params.userSlug) return;
    navigate(`/user/${params.userSlug}/settings/${next}`);
  };

  return { activeTabId, onTabSelect };
};

export default useUserSettingsTab;

import { Bell, Briefcase, Cog, ShieldCheck, User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { SettingsShell } from '@/crd/components/contributor/settings/SettingsShell';
import type { SettingsTabDescriptor } from '@/crd/components/contributor/settings/SettingsTabStrip';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import useUserPageRouteContext from '../useUserPageRouteContext';
import useUserSettingsAccessGuard from './useUserSettingsAccessGuard';
import useUserSettingsTab, { type UserSettingsTabId } from './useUserSettingsTab';

const computeFallback = (displayName: string | undefined): string => {
  const name = displayName?.trim() ?? '';
  if (!name) return '??';
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Hosts the User Settings shell — renders the sticky header (avatar + name)
 * + 7-tab strip + outlet for the active tab body. Access is gated by
 * `useUserSettingsAccessGuard` (FR-010); the Security tab is hidden in the
 * strip for non-owner viewers (FR-012 / FR-083).
 */
const CrdUserSettingsPage = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { userId, userModel, userSlug } = useUserPageRouteContext();
  const { isOwner } = useUserSettingsAccessGuard({ profileUserId: userId, profileSlug: userSlug });
  const { activeTabId, onTabSelect } = useUserSettingsTab({ userSlug });

  usePageTitle(t('user.profile.pageTitle'));

  const displayName = userModel?.profile?.displayName ?? '';
  const avatarUrl = userModel?.profile?.avatar?.uri ?? undefined;
  const avatarColor = userId ? pickColorFromId(userId) : undefined;

  const tabs: ReadonlyArray<SettingsTabDescriptor<UserSettingsTabId>> = [
    { id: 'profile', label: t('shell.tabs.user.profile'), icon: User },
    { id: 'account', label: t('shell.tabs.user.account'), icon: Briefcase },
    { id: 'membership', label: t('shell.tabs.user.membership'), icon: Users },
    { id: 'organizations', label: t('shell.tabs.user.organizations'), icon: Briefcase },
    { id: 'notifications', label: t('shell.tabs.user.notifications'), icon: Bell },
    { id: 'settings', label: t('shell.tabs.user.settings'), icon: Cog },
    {
      id: 'security',
      label: t('shell.tabs.user.security'),
      icon: ShieldCheck,
      // Hidden for any viewer who is not the profile owner — including
      // platform admins editing another user's profile (FR-012 / FR-083).
      hidden: !isOwner,
    },
  ];

  return (
    <SettingsShell
      header={{
        avatarUrl,
        avatarFallback: computeFallback(displayName),
        avatarColor,
        displayName: displayName || t('shared.loading'),
      }}
      tabs={tabs}
      activeTab={activeTabId}
      onTabChange={onTabSelect}
    >
      <Outlet />
    </SettingsShell>
  );
};

export default CrdUserSettingsPage;

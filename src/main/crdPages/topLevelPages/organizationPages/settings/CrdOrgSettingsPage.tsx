import { Briefcase, Building2, Cog, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { SettingsShell } from '@/crd/components/contributor/settings/SettingsShell';
import type { SettingsTabDescriptor } from '@/crd/components/contributor/settings/SettingsTabStrip';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import useOrgSettingsAccessGuard from './useOrgSettingsAccessGuard';
import useOrgSettingsTab, { type OrgSettingsTabId } from './useOrgSettingsTab';

const computeFallback = (displayName: string | undefined): string => {
  const name = displayName?.trim() ?? '';
  if (!name) return '??';
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Hosts the Org Settings shell — sticky header + 5-tab strip + outlet.
 * Access is gated by `useOrgSettingsAccessGuard` (FR-011).
 */
const CrdOrgSettingsPage = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { organizationId, organization } = useOrganizationContext();
  const profileUrl = organization?.profile?.url;

  useOrgSettingsAccessGuard({ profileUrl });
  const { activeTabId, onTabSelect } = useOrgSettingsTab({ profileUrl });

  usePageTitle(t('org.profile.pageTitle'));

  const displayName = organization?.profile?.displayName ?? '';
  const avatarUrl = organization?.profile?.avatar?.uri ?? undefined;
  const avatarColor = organizationId ? pickColorFromId(organizationId) : undefined;

  const breadcrumbItems: BreadcrumbTrailItem[] =
    displayName && profileUrl
      ? [
          { label: displayName, href: profileUrl, icon: Building2 },
          { label: t('breadcrumbs.settings'), href: buildSettingsUrl(profileUrl) },
          { label: t(`shell.tabs.org.${activeTabId}`) },
        ]
      : [];
  useSetBreadcrumbs(breadcrumbItems);

  const tabs: ReadonlyArray<SettingsTabDescriptor<OrgSettingsTabId>> = [
    { id: 'profile', label: t('shell.tabs.org.profile'), icon: Briefcase },
    { id: 'account', label: t('shell.tabs.org.account'), icon: Briefcase },
    { id: 'community', label: t('shell.tabs.org.community'), icon: Users },
    { id: 'authorization', label: t('shell.tabs.org.authorization'), icon: Shield },
    { id: 'settings', label: t('shell.tabs.org.settings'), icon: Cog },
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

export default CrdOrgSettingsPage;

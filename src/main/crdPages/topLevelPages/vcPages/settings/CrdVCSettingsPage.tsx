import { Bot, Cog, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { SettingsShell } from '@/crd/components/contributor/settings/SettingsShell';
import type { SettingsTabDescriptor } from '@/crd/components/contributor/settings/SettingsTabStrip';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import useVcSettingsAccessGuard from './useVcSettingsAccessGuard';
import useVcSettingsTab, { type VcSettingsTabId } from './useVcSettingsTab';

const computeFallback = (displayName: string | undefined): string => {
  const name = displayName?.trim() ?? '';
  if (!name) return '??';
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Hosts the VC Settings shell — sticky header + 3-tab strip + outlet.
 * Access is gated by `useVcSettingsAccessGuard` (FR-013).
 */
const CrdVCSettingsPage = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { vcId } = useUrlResolver();

  const { data } = useVirtualContributorQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });
  const vc = data?.lookup.virtualContributor;
  const profileUrl = vc?.profile?.url;

  useVcSettingsAccessGuard({ vcId, profileUrl });
  const { activeTabId, onTabSelect } = useVcSettingsTab({ profileUrl });

  usePageTitle(t('vc.profile.pageTitle'));

  const displayName = vc?.profile?.displayName ?? '';
  const avatarUrl = vc?.profile?.avatar?.uri ?? undefined;
  const avatarColor = vcId ? pickColorFromId(vcId) : undefined;

  const breadcrumbItems: BreadcrumbTrailItem[] =
    displayName && profileUrl
      ? [
          { label: displayName, href: profileUrl, icon: Bot },
          { label: t('breadcrumbs.settings'), href: buildSettingsUrl(profileUrl) },
          { label: t(`shell.tabs.vc.${activeTabId}`) },
        ]
      : [];
  useSetBreadcrumbs(breadcrumbItems);

  const tabs: ReadonlyArray<SettingsTabDescriptor<VcSettingsTabId>> = [
    { id: 'profile', label: t('shell.tabs.vc.profile'), icon: Bot },
    { id: 'membership', label: t('shell.tabs.vc.membership'), icon: Globe },
    { id: 'settings', label: t('shell.tabs.vc.settings'), icon: Cog },
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

export default CrdVCSettingsPage;

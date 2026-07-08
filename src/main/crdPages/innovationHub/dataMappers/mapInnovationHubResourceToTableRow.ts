import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import type { HubPacksTableRow } from '@/crd/components/innovationHub/InnovationHubPacksTab';
import type { HubVirtualContributorsTableRow } from '@/crd/components/innovationHub/InnovationHubVirtualContributorsTab';
import { packTemplateCount } from '@/main/crdPages/innovationLibrary/innovationLibraryMapper';

type SettingsPack = NonNullable<InnovationHubSettingsFragment['innovationPackListFilter']>[number];
type SettingsVirtualContributor = NonNullable<InnovationHubSettingsFragment['virtualContributorListFilter']>[number];

/**
 * Pure GraphQL → plain-TS row mappers for the Packs / Virtual Contributors
 * settings tables, alongside `mapInnovationHubSpaceToTableRow` (same one-job
 * convention: no i18n here — labels are resolved by the tab-data hooks).
 */
export const mapInnovationHubPackToTableRow = (pack: SettingsPack): HubPacksTableRow => ({
  id: pack.id,
  name: pack.profile.displayName,
  templateCount: packTemplateCount(pack),
  provider: pack.provider?.profile?.displayName ?? '—',
  packUrl: pack.profile.url,
});

export const mapInnovationHubVirtualContributorToTableRow = (
  vc: SettingsVirtualContributor
): HubVirtualContributorsTableRow => ({
  id: vc.id,
  name: vc.profile?.displayName ?? '—',
  provider: vc.provider?.profile?.displayName ?? '—',
  virtualContributorUrl: vc.profile?.url ?? '',
});

import { Users } from 'lucide-react';
import { MembershipsSection } from '@/crd/components/contributor/settings/MembershipsSection';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { OrgMembershipTabViewProps } from './OrgMembershipTabView.types';

/**
 * Presentational view for the organization Membership tab: the shared
 * membership card grid inside one `SettingsCard`. No Home Space and no
 * pending-applications section — the organization's pending invitations
 * live on the Invitations tab. Pure — the connector resolves every label
 * and owns the Leave confirmation dialog.
 */
export function OrgMembershipTabView({
  loading,
  title,
  rows,
  totalShown,
  totalUnfiltered,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onLeave,
  labels,
}: OrgMembershipTabViewProps) {
  if (loading) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <SettingsCard icon={Users} title={title}>
      <MembershipsSection
        rows={rows}
        totalShown={totalShown}
        totalUnfiltered={totalUnfiltered}
        search={search}
        filter={filter}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        onLeave={onLeave}
        labels={labels}
      />
    </SettingsCard>
  );
}

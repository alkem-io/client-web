import type {
  MembershipFilter,
  MembershipRowData,
  MembershipsSectionLabels,
} from '@/crd/components/contributor/settings/MembershipsSection.types';

/**
 * Public types for `OrgMembershipTabView`. Plain TypeScript — no GraphQL
 * types, no Apollo imports. Every string is resolved by the connector.
 */
export type OrgMembershipTabViewProps = {
  loading: boolean;
  title: string;
  rows: MembershipRowData[];
  totalShown: number;
  totalUnfiltered: number;
  search: string;
  filter: MembershipFilter;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onClearFilters: () => void;
  onLeave: (row: MembershipRowData) => void;
  labels: MembershipsSectionLabels;
};

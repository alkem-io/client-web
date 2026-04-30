/**
 * CRD Organizations tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/tabs/OrganizationsView.tsx
 *   src/crd/components/user/settings/tabs/OrganizationsTable.tsx
 */

export type OrganizationRow = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  city: string | null;
  country: string | null;
  role: 'Admin' | 'Associate';
  associatesCount: number;
  verified: boolean;
  websiteUrl: string | null;
  avatarImageUrl: string | null;
};

export type OrganizationsViewProps = {
  rows: OrganizationRow[];
  search: string;
  onSearchChange: (next: string) => void;
  /** When false, hide the Create Organization button (FR-062). */
  canCreateOrganization: boolean;
  /** Triggers the existing creation flow via navigation. */
  onCreateOrganization: () => void;
  /** Opens the CRD ConfirmationDialog flow; mutation fires on Confirm. */
  onLeaveRow: (row: OrganizationRow) => void;
  /** i18n labels resolved by the integration layer. */
  labels: {
    searchPlaceholder: string;
    createButton: string;
    emptyState: string;
  };
};

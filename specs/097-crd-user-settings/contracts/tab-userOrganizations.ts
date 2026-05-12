/**
 * User Organizations tab — view contracts.
 * See data-model.md "User Story 4" for field-level details.
 */

export type OrganizationRow = {
  id: string;
  displayName: string;
  description?: string;
  location?: string;
  avatarUrl?: string;
  color: string; // pickColorFromId
  role: 'Admin' | 'Associate';
  associatesCount?: number;
  verified: boolean;
  /** Website URL on the row's profile. */
  url: string;
};

export type OrganizationsTableProps = {
  rows: OrganizationRow[];
  emptyStateLabel: string; // i18n
  /** Opens the Leave confirmation dialog. */
  onLeave: (organizationId: string) => void;
};

export type UserOrganizationsViewProps = {
  searchTerm: string;
  searchPlaceholder: string; // i18n
  onSearchChange: (term: string) => void;
  /** Visible only when the user has the CreateOrganization platform privilege. */
  canCreateOrganization: boolean;
  createOrganizationLabel: string; // i18n
  onCreateOrganization: () => void;
  table: OrganizationsTableProps;
  loading: boolean;
};

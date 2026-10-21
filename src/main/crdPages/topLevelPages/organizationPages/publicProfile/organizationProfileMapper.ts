import { RoleName } from '@/core/apollo/generated/graphql-schema';
import type { AssociateGridItem } from '@/crd/components/organization/OrganizationProfileSidebar';

/** i18n leaf under `org.associates.pending.offeredRole.*` / `pendingMemberships.orgAssociateCard.role.*`. */
export type OfferedRoleLabelKey = 'associate' | 'associateAdmin' | 'associateOwner';

/** Maps an invitation's extra roles to the offered-role label key (Associate is always implied). */
export const offeredRoleLabelKey = (extraRoles: readonly RoleName[]): OfferedRoleLabelKey => {
  if (extraRoles.includes(RoleName.Admin)) return 'associateAdmin';
  if (extraRoles.includes(RoleName.Owner)) return 'associateOwner';
  return 'associate';
};

export type AssociateInput = {
  id: string;
  displayName: string;
  avatar?: string | undefined;
  url: string;
};

export const mapAssociates = (associates: AssociateInput[]): AssociateGridItem[] =>
  associates.map(a => ({
    id: a.id,
    displayName: a.displayName,
    avatarImageUrl: a.avatar ?? null,
    url: a.url,
  }));

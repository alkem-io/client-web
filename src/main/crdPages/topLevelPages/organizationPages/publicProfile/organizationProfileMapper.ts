import type { AssociateGridItem } from '@/crd/components/organization/OrganizationProfileSidebar';
import {
  type AccountResourcesShape,
  mapAccountHostedResources,
} from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';

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

export type { AccountResourcesShape };

export const mapOrgHostedResources = mapAccountHostedResources;

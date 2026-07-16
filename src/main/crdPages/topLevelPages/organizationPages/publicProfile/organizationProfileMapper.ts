import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
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

// Spaces in these visibilities are hidden from the organization's public
// profile (issue #1938). Denylist rather than an ACTIVE/DEMO allowlist so a
// space with an unexpected or absent visibility still shows rather than
// silently disappearing.
const HIDDEN_PROFILE_VISIBILITIES: SpaceVisibility[] = [SpaceVisibility.Inactive, SpaceVisibility.Archived];

const isSpaceHiddenOnProfile = (visibility: SpaceVisibility | undefined): boolean =>
  visibility !== undefined && HIDDEN_PROFILE_VISIBILITIES.includes(visibility);

// Org-specific wrapper over the shared hosted-resources mapper: it drops
// inactive/archived hosted spaces. The user profile intentionally keeps the
// shared mapper's default (unfiltered) behaviour.
export const mapOrgHostedResources = (input: AccountResourcesShape, vcType: string) =>
  mapAccountHostedResources(
    input ? { ...input, spaces: input.spaces?.filter(s => !isSpaceHiddenOnProfile(s.visibility)) } : input,
    vcType
  );

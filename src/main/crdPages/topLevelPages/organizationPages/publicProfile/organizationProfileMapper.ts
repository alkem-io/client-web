import type { AssociateGridItem } from '@/crd/components/organization/OrganizationProfileSidebar';
import type { SimpleResourceCardItem } from '@/crd/components/organization/OrganizationResourceSections';
import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import type { VirtualContributorCardItem } from '@/crd/components/user/UserResourceSections';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

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

type AccountResourceProfileLike =
  | {
      id?: string | null;
      displayName: string;
      url: string;
      tagline?: string | null;
      avatar?: { uri: string } | null;
      cardBanner?: { uri: string } | null;
    }
  | null
  | undefined;

export type AccountResourcesShape =
  | {
      spaces?: Array<{
        id: string;
        about?: { profile?: AccountResourceProfileLike; isContentPublic?: boolean };
      }>;
      virtualContributors?: Array<{ id: string; profile?: AccountResourceProfileLike }>;
      innovationPacks?: Array<{ id: string; profile?: AccountResourceProfileLike }>;
      innovationHubs?: Array<{ id: string; profile?: AccountResourceProfileLike }>;
    }
  | null
  | undefined;

/**
 * Maps the raw `useAccountResources` payload into the four arrays the
 * Organization profile's Resources Hosted tab consumes — Spaces, Virtual
 * Contributors, Template Packs (`innovationPacks`), Custom Homepages
 * (`innovationHubs`). Mirrors the User profile's `mapHostedSpacesToCardData`
 * exactly; the input shape is identical regardless of account owner.
 *
 * Pre-Phase-10 the Org used a `mapAccountResources` helper that returned a
 * single `AccountResourcesGroup | null` for a stacked-blocks card layout. That
 * grouping was dropped along with the Card-bordered section; each sub-section
 * is now its own omittable slot under the Resources Hosted tab.
 */
export const mapOrgHostedResources = (
  input: AccountResourcesShape,
  vcType: string
): {
  hostedSpaces: SpaceGridCardData[];
  hostedVirtualContributors: VirtualContributorCardItem[];
  hostedInnovationPacks: SimpleResourceCardItem[];
  hostedInnovationHubs: SimpleResourceCardItem[];
} => {
  const hostedSpaces: SpaceGridCardData[] = (input?.spaces ?? [])
    .filter(s => Boolean(s.about?.profile))
    .map(s => {
      const profile = s.about!.profile!;
      return {
        id: s.id,
        title: profile.displayName,
        description: profile.tagline ?? null,
        href: profile.url,
        imageUrl: profile.cardBanner?.uri,
        color: pickColorFromId(s.id),
        isPrivate: s.about?.isContentPublic === false,
      };
    });

  const hostedVirtualContributors: VirtualContributorCardItem[] = (input?.virtualContributors ?? [])
    .filter(v => Boolean(v.profile))
    .map(v => ({
      id: v.id,
      displayName: v.profile!.displayName,
      description: v.profile!.tagline ?? null,
      type: vcType,
      href: v.profile!.url,
    }));

  const hostedInnovationPacks: SimpleResourceCardItem[] = (input?.innovationPacks ?? [])
    .filter(p => Boolean(p.profile))
    .map(p => ({
      id: p.id,
      displayName: p.profile!.displayName,
      description: p.profile!.tagline ?? null,
      href: p.profile!.url,
      avatarImageUrl: p.profile!.avatar?.uri ?? null,
    }));

  const hostedInnovationHubs: SimpleResourceCardItem[] = (input?.innovationHubs ?? [])
    .filter(h => Boolean(h.profile))
    .map(h => ({
      id: h.id,
      displayName: h.profile!.displayName,
      description: h.profile!.tagline ?? null,
      href: h.profile!.url,
      avatarImageUrl: h.profile!.avatar?.uri ?? null,
    }));

  return { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs };
};

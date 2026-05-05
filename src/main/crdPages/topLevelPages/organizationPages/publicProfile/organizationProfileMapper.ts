import type {
  AssociateGridItem,
  ReferenceLink,
  TagsetGroup,
} from '@/crd/components/organization/OrganizationProfileSidebar';
import type {
  AccountResourcesGroup,
  SimpleResourceCardItem,
} from '@/crd/components/organization/OrganizationResourceSections';
import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export type RawReference = {
  id: string;
  name: string;
  uri: string;
  description?: string | null;
};

/**
 * Pass-through normaliser for the references array. The social/non-social
 * split (and brand resolution for the social subset) lives entirely inside
 * the shared `SocialLinks` primitive at `@/crd/components/common/SocialLinks`
 * — this mapper just hands the raw refs through with `description: null`
 * defaulted so the consumer sees a stable shape.
 */
export const normaliseReferences = (references: RawReference[]): ReferenceLink[] =>
  references.map(ref => ({
    id: ref.id,
    name: ref.name,
    uri: ref.uri,
    description: ref.description ?? null,
  }));

export const buildTagsetGroups = (groups: Array<{ name: string; tags: string[] }>): TagsetGroup[] =>
  groups.filter(g => g.tags.length > 0);

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

export const mapAccountResources = (input: AccountResourcesShape): AccountResourcesGroup | null => {
  const spaces: SpaceGridCardData[] = (input?.spaces ?? [])
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

  const innovationPacks: SimpleResourceCardItem[] = (input?.innovationPacks ?? [])
    .filter(p => Boolean(p.profile))
    .map(p => ({
      id: p.id,
      displayName: p.profile!.displayName,
      description: p.profile!.tagline ?? null,
      href: p.profile!.url,
      avatarImageUrl: p.profile!.avatar?.uri ?? null,
    }));

  const innovationHubs: SimpleResourceCardItem[] = (input?.innovationHubs ?? [])
    .filter(h => Boolean(h.profile))
    .map(h => ({
      id: h.id,
      displayName: h.profile!.displayName,
      description: h.profile!.tagline ?? null,
      href: h.profile!.url,
      avatarImageUrl: h.profile!.avatar?.uri ?? null,
    }));

  const isEmpty = spaces.length === 0 && innovationPacks.length === 0 && innovationHubs.length === 0;
  if (isEmpty) return null;

  return { spaces, innovationPacks, innovationHubs };
};

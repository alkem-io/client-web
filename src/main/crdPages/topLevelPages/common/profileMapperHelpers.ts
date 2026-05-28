import type {
  ReferenceLink,
  SimpleResourceCardItem,
  TagsetGroup,
  VirtualContributorCardItem,
} from '@/crd/components/common/profileTypes';
import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export type RawReference = {
  id: string;
  name: string;
  uri: string;
  description?: string | null;
};

export const normaliseReferences = (references: RawReference[]): ReferenceLink[] =>
  references.map(ref => ({
    id: ref.id,
    name: ref.name,
    uri: ref.uri,
    description: ref.description ?? null,
  }));

export const buildTagsetGroups = (groups: Array<{ key: string; name: string; tags: string[] }>): TagsetGroup[] =>
  groups.filter(g => g.tags.length > 0);

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
      innovationHubs?: Array<{ id: string; profile?: AccountResourceProfileLike; subdomain?: string }>;
    }
  | null
  | undefined;

export type AccountHostedResources = {
  hostedSpaces: SpaceGridCardData[];
  hostedVirtualContributors: VirtualContributorCardItem[];
  hostedInnovationPacks: SimpleResourceCardItem[];
  hostedInnovationHubs: SimpleResourceCardItem[];
};

const toSimpleResourceCard = (item: {
  id: string;
  profile?: AccountResourceProfileLike;
}): SimpleResourceCardItem | null => {
  if (!item.profile) return null;
  return {
    id: item.id,
    displayName: item.profile.displayName,
    description: item.profile.tagline ?? null,
    href: item.profile.url,
    avatarImageUrl: item.profile.avatar?.uri ?? null,
  };
};

/**
 * Shared mapper for the User and Organization profile "Resources Hosted" tab.
 * The `useAccountResources` payload shape is identical regardless of account
 * owner, so the four sub-section arrays (Spaces, Virtual Contributors, Template
 * Packs, Custom Homepages) are produced from one helper.
 */
export const mapAccountHostedResources = (input: AccountResourcesShape, vcType: string): AccountHostedResources => {
  const hostedSpaces: SpaceGridCardData[] = (input?.spaces ?? []).flatMap(s => {
    const profile = s.about?.profile;
    if (!profile) return [];
    return [
      {
        id: s.id,
        title: profile.displayName,
        description: profile.tagline ?? null,
        href: profile.url,
        imageUrl: profile.cardBanner?.uri,
        color: pickColorFromId(s.id),
        isPrivate: s.about?.isContentPublic === false,
      },
    ];
  });

  const hostedVirtualContributors: VirtualContributorCardItem[] = (input?.virtualContributors ?? []).flatMap(v => {
    const profile = v.profile;
    if (!profile) return [];
    return [
      {
        id: v.id,
        displayName: profile.displayName,
        description: profile.tagline ?? null,
        type: vcType,
        href: profile.url,
        avatarImageUrl: profile.avatar?.uri ?? null,
      },
    ];
  });

  const hostedInnovationPacks = (input?.innovationPacks ?? [])
    .map(toSimpleResourceCard)
    .filter((card): card is SimpleResourceCardItem => card !== null);

  const hostedInnovationHubs = (input?.innovationHubs ?? [])
    .map(hub => {
      const card = toSimpleResourceCard(hub);
      if (!card) return null;
      // Override the server-provided `profile.url` (legacy `/innovation-hub/<slug>`)
      // with the canonical CRD `/hub/<subdomain>` path. Falls back to the profile
      // url when no subdomain is available (defensive — every hub has one).
      return hub.subdomain ? { ...card, href: `/hub/${hub.subdomain}` } : card;
    })
    .filter((card): card is SimpleResourceCardItem => card !== null);

  return { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs };
};

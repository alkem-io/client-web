import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import type {
  SimpleResourceCardItem,
  TagsetGroup,
  VirtualContributorCardItem,
} from '@/crd/components/common/profileTypes';
import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { buildTagsetGroups } from '../../common/profileMapperHelpers';

type ProfileTagsetLike = { name: string; tags: string[] };

export type UserTagsetLabels = {
  keywords: string;
  skills: string;
};

const findTagsetTags = (tagsets: ProfileTagsetLike[] | undefined, reservedName: string): string[] => {
  const target = reservedName.toLowerCase();
  return tagsets?.find(tagset => tagset.name.toLowerCase() === target)?.tags ?? [];
};

export const buildUserProfileTagsets = (
  tagsets: ProfileTagsetLike[] | undefined,
  labels: UserTagsetLabels
): TagsetGroup[] =>
  buildTagsetGroups([
    {
      key: TagsetReservedName.Keywords,
      name: labels.keywords,
      tags: findTagsetTags(tagsets, TagsetReservedName.Keywords),
    },
    { key: TagsetReservedName.Skills, name: labels.skills, tags: findTagsetTags(tagsets, TagsetReservedName.Skills) },
  ]);

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
      virtualContributors?: Array<{
        id: string;
        profile?: AccountResourceProfileLike;
      }>;
      innovationPacks?: Array<{
        id: string;
        profile?: AccountResourceProfileLike;
      }>;
      innovationHubs?: Array<{
        id: string;
        profile?: AccountResourceProfileLike;
      }>;
    }
  | null
  | undefined;

export type MapHostedSpacesResult = SpaceGridCardData[];

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

export const mapHostedSpacesToCardData = (
  accountResources: AccountResourcesShape,
  vcType: string
): {
  hostedSpaces: SpaceGridCardData[];
  hostedVirtualContributors: VirtualContributorCardItem[];
  hostedInnovationPacks: SimpleResourceCardItem[];
  hostedInnovationHubs: SimpleResourceCardItem[];
} => {
  const spacesIn = accountResources?.spaces ?? [];
  const vcsIn = accountResources?.virtualContributors ?? [];
  const packsIn = accountResources?.innovationPacks ?? [];
  const hubsIn = accountResources?.innovationHubs ?? [];

  const hostedSpaces: SpaceGridCardData[] = spacesIn.flatMap(s => {
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

  const hostedVirtualContributors: VirtualContributorCardItem[] = vcsIn.flatMap(v => {
    const profile = v.profile;
    if (!profile) return [];
    return [
      {
        id: v.id,
        displayName: profile.displayName,
        description: profile.tagline ?? null,
        type: vcType,
        href: profile.url,
      },
    ];
  });

  const hostedInnovationPacks = packsIn
    .map(toSimpleResourceCard)
    .filter((card): card is SimpleResourceCardItem => card !== null);

  const hostedInnovationHubs = hubsIn
    .map(toSimpleResourceCard)
    .filter((card): card is SimpleResourceCardItem => card !== null);

  return { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs };
};

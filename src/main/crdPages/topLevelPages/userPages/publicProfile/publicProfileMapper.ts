import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import type { TagsetGroup } from '@/crd/components/common/profileTypes';
import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import {
  type AccountResourcesShape,
  buildTagsetGroups,
  mapAccountHostedResources,
} from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';

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

export type { AccountResourcesShape };

export type MapHostedSpacesResult = SpaceGridCardData[];

export const mapHostedSpacesToCardData = mapAccountHostedResources;

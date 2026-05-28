import { TagsetReservedName, type VirtualContributorQuery } from '@/core/apollo/generated/graphql-schema';
import type {
  VcProfileFormValues,
  VcProfileReference,
  VcProfileTagset,
} from '@/crd/components/virtualContributor/settings/VCProfileTabView.types';

export type VirtualContributorQueryVc = NonNullable<VirtualContributorQuery['lookup']['virtualContributor']>;

const EMPTY_VISUAL = { id: '', uri: null, altText: null } as const;

/**
 * Map the GraphQL `VirtualContributor` payload to the plain CRD form-values
 * shape that `useVcProfileTabData` consumes. This is the only place GraphQL
 * types meet CRD prop types (FR-006).
 *
 * Compared to `mapUserToProfileFormValues`: VC has no `firstName` /
 * `lastName` / `email` / `phone` / `location` / `bio` / `skills` — single
 * Keywords tagset only. All references are arbitrary (no recognized social
 * rows on the VC profile).
 */
export const mapVirtualContributorToProfileFormValues = (vc: VirtualContributorQueryVc): VcProfileFormValues => {
  const profile = vc.profile;
  const references: VcProfileReference[] = (profile?.references ?? []).map(ref => ({
    id: ref.id,
    name: ref.name ?? '',
    uri: ref.uri ?? '',
    description: ref.description ?? '',
  }));

  const tagsets = profile?.tagsets ?? [];
  const keywords = findTagset(tagsets, TagsetReservedName.Keywords);

  return {
    profileId: profile?.id ?? '',
    displayName: profile?.displayName ?? '',
    tagline: profile?.tagline ?? '',
    description: profile?.description ?? '',
    keywords,
    avatar: profile?.avatar
      ? {
          id: profile.avatar.id,
          uri: profile.avatar.uri ?? null,
          altText: profile.avatar.alternativeText ?? null,
        }
      : { ...EMPTY_VISUAL },
    references,
  };
};

const findTagset = (
  tagsets: ReadonlyArray<{ id: string; name: string; tags: string[] }>,
  reservedName: TagsetReservedName
): VcProfileTagset => {
  const found = tagsets.find(t => (t.name ?? '').toLowerCase() === reservedName.toLowerCase());
  return found ? { id: found.id, tags: found.tags } : { id: undefined, tags: [] };
};

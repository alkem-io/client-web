import type { AdminInnovationPackQuery } from '@/core/apollo/generated/graphql-schema';

type GqlAdminInnovationPack = NonNullable<AdminInnovationPackQuery['lookup']['innovationPack']>;

/** Minimal view of an Innovation Pack for the CRD admin page. Extended in US7 (pack edit form). */
export type InnovationPackBasics = {
  id: string;
  templatesSetId: string | undefined;
  displayName: string;
  description: string;
  avatarUrl: string | undefined;
  tags: string[];
  /** The pack's public-profile URL (`<url>/settings` is this admin page). */
  url: string;
};

export function mapInnovationPackToBasics(pack: GqlAdminInnovationPack): InnovationPackBasics {
  const { profile } = pack;
  return {
    id: pack.id,
    templatesSetId: pack.templatesSet?.id,
    displayName: profile.displayName,
    description: profile.description ?? '',
    avatarUrl: profile.avatar?.uri || undefined,
    tags: profile.tagset?.tags ?? [],
    url: profile.url,
  };
}

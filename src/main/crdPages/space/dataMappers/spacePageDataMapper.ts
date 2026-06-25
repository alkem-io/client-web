import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { getInitials } from '@/crd/lib/getInitials';

export { getInitials };

export type SpaceVisibilityData = {
  status: 'active' | 'archived' | 'demo' | 'inactive';
  contactHref?: string;
};

export function mapSpaceVisibility(visibility: SpaceVisibility | undefined): SpaceVisibilityData {
  switch (visibility) {
    case SpaceVisibility.Archived:
      return { status: 'archived' };
    case SpaceVisibility.Demo:
      return { status: 'demo' };
    case SpaceVisibility.Inactive:
      return { status: 'inactive' };
    default:
      return { status: 'active' };
  }
}

type LeadContributorLike = {
  id: string;
  profile?: {
    displayName?: string | null;
    avatar?: { uri?: string | null } | null;
    url?: string | null;
    location?: { city?: string | null; country?: string | null } | null;
  } | null;
};

function mapLeadContributor(contributor: LeadContributorLike, type: 'person' | 'org'): LeadItem | undefined {
  if (!contributor.profile) return undefined;
  const name = contributor.profile.displayName ?? '';
  const cityCountry = [contributor.profile.location?.city, contributor.profile.location?.country]
    .filter(Boolean)
    .join(', ');
  return {
    id: contributor.id,
    name,
    avatarUrl: contributor.profile.avatar?.uri ?? undefined,
    initials: getInitials(name) || '??',
    location: cityCountry || undefined,
    href: contributor.profile.url ?? undefined,
    type,
  };
}

export function mapSidebarLeads(
  leadUsers: LeadContributorLike[] | undefined,
  leadOrganizations?: LeadContributorLike[] | undefined
): LeadItem[] {
  const users = (leadUsers ?? [])
    .map(u => mapLeadContributor(u, 'person'))
    .filter((l): l is LeadItem => l !== undefined);
  const orgs = (leadOrganizations ?? [])
    .map(o => mapLeadContributor(o, 'org'))
    .filter((l): l is LeadItem => l !== undefined);
  return [...users, ...orgs];
}

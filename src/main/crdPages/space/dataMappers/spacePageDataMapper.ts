import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { getInitials } from '@/crd/lib/getInitials';
import { mapContributorPreview, type PreviewProfileLike } from './contributorPreviewMapper';

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
  profile?: (Omit<PreviewProfileLike, 'keywords'> & { keywords?: { tags: string[] } | null }) | null;
};

function mapLeadContributor(
  contributor: LeadContributorLike,
  type: 'person' | 'org',
  currentUserId: string | undefined
): LeadItem | undefined {
  if (!contributor.profile) return undefined;
  const preview = mapContributorPreview(
    contributor.id,
    type === 'person' ? 'user' : 'organization',
    { ...contributor.profile, keywords: contributor.profile.keywords?.tags },
    currentUserId
  );
  return {
    id: preview.id,
    name: preview.name,
    avatarUrl: preview.avatarUrl,
    initials: getInitials(preview.name) || '??',
    location: preview.locationLabel,
    href: preview.href,
    type,
    preview,
  };
}

export function mapSidebarLeads(
  leadUsers: LeadContributorLike[] | undefined,
  leadOrganizations: LeadContributorLike[] | undefined,
  currentUserId: string | undefined
): LeadItem[] {
  const users = (leadUsers ?? [])
    .map(u => mapLeadContributor(u, 'person', currentUserId))
    .filter((l): l is LeadItem => l !== undefined);
  const orgs = (leadOrganizations ?? [])
    .map(o => mapLeadContributor(o, 'org', currentUserId))
    .filter((l): l is LeadItem => l !== undefined);
  return [...users, ...orgs];
}

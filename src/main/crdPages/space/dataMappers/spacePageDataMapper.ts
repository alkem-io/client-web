import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { SpaceAboutData, SpaceLeadData } from '@/crd/components/space/SpaceAboutView';
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

const leadPreview = (
  contributor: LeadContributorLike,
  kind: 'user' | 'organization',
  currentUserId: string | undefined
) =>
  contributor.profile
    ? mapContributorPreview(
        contributor.id,
        kind,
        { ...contributor.profile, keywords: contributor.profile.keywords?.tags },
        currentUserId
      )
    : undefined;

function mapLeadContributor(
  contributor: LeadContributorLike,
  type: 'person' | 'org',
  currentUserId: string | undefined
): LeadItem | undefined {
  const preview = leadPreview(contributor, type === 'person' ? 'user' : 'organization', currentUserId);
  if (!preview) return undefined;
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

function mapAboutLead(
  contributor: LeadContributorLike,
  type: SpaceLeadData['type'],
  currentUserId: string | undefined
): SpaceLeadData | undefined {
  const preview = leadPreview(contributor, type === 'person' ? 'user' : 'organization', currentUserId);
  if (!preview) return undefined;
  return {
    name: preview.name,
    avatarUrl: preview.avatarUrl,
    type,
    location: preview.locationLabel,
    href: preview.href ?? '',
    preview,
  };
}

/** The About dialog's lead lists, from the same preview the sidebar leads use. */
export function mapAboutLeads(
  leadUsers: LeadContributorLike[] | undefined,
  leadOrganizations: LeadContributorLike[] | undefined,
  currentUserId: string | undefined
): Pick<SpaceAboutData, 'leadUsers' | 'leadOrganizations'> {
  const isLead = (lead: SpaceLeadData | undefined): lead is SpaceLeadData => lead !== undefined;
  return {
    leadUsers: (leadUsers ?? []).map(u => mapAboutLead(u, 'person', currentUserId)).filter(isLead),
    leadOrganizations: (leadOrganizations ?? [])
      .map(o => mapAboutLead(o, 'organization', currentUserId))
      .filter(isLead),
  };
}

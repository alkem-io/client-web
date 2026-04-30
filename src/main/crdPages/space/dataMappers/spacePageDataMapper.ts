import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { getInitials } from '@/crd/lib/getInitials';

export { getInitials };

type MemberAvatar = {
  id: string;
  url?: string;
  initials: string;
};

export type SpaceBannerData = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  homeSpaceSettingsHref?: string;
};

export type SpaceVisibilityData = {
  status: 'active' | 'archived' | 'demo' | 'inactive';
  contactHref?: string;
};

export type SpaceTabActionConfig = {
  showActivity: boolean;
  showVideoCall: boolean;
  showShare: boolean;
  showSettings: boolean;
  shareUrl: string;
  settingsHref?: string;
};

export type SpaceLeadData = {
  name: string;
  avatarUrl?: string;
  type: 'person' | 'organization';
  location?: string;
  href: string;
};

export type SpaceDashboardNavItem = {
  name: string;
  href: string;
  level: number;
};

export type CalendarEventData = {
  id: string;
  title: string;
  startDate: string;
  durationDays?: number;
  durationMinutes?: number;
  isWholeDay: boolean;
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

export function mapMemberAvatars(
  leadUsers: Array<{ id: string; profile?: { displayName: string; avatar?: { uri: string } } }> | undefined
): MemberAvatar[] {
  if (!leadUsers) return [];
  return leadUsers
    .filter((user): user is typeof user & { profile: NonNullable<typeof user.profile> } => !!user.profile)
    .map(user => ({
      id: user.id,
      url: user.profile.avatar?.uri,
      initials: getInitials(user.profile.displayName),
    }));
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

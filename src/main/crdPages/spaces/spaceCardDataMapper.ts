import { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { SpaceCardData, SpaceLead } from '@/crd/components/space/SpaceCard';
import type { Lead, LeadOrganization } from '@/domain/space/components/cards/components/SpaceLeads';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import type { SpaceWithParent } from './SpaceExplorerPage';

const AVATAR_COLORS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#9333ea', // purple
  '#dc2626', // red
  '#ea580c', // orange
  '#0891b2', // cyan
  '#4f46e5', // indigo
  '#c026d3', // fuchsia
  '#0d9488', // teal
  '#ca8a04', // yellow
];

export function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');
}

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function mapSpaceToCardData(space: SpaceWithParent, authenticated: boolean): SpaceCardData {
  const { about } = space;
  const { profile, isContentPublic, membership } = about;
  const displayName = profile.displayName;

  // TypeScript doesn't know that membership has leadUsers/leadOrganizations
  // but the actual GraphQL fragment SpaceExplorerSpace includes them
  const membershipWithLeads = membership as typeof membership & {
    leadUsers?: Lead[];
    leadOrganizations?: LeadOrganization[];
  };

  const leads: SpaceLead[] = [];
  if (authenticated) {
    const leadUsers = membershipWithLeads?.leadUsers ?? [];
    const leadOrgs = membershipWithLeads?.leadOrganizations ?? [];

    for (const user of leadUsers) {
      leads.push({
        name: user.profile?.displayName ?? '',
        avatarUrl: user.profile?.avatar?.uri ?? '',
        type: 'person',
      });
    }
    for (const org of leadOrgs) {
      leads.push({
        name: org.profile?.displayName ?? '',
        avatarUrl: org.profile?.avatar?.uri ?? '',
        type: 'org',
      });
    }
  }

  const parent = space.parent
    ? {
        name: space.parent.about.profile.displayName,
        href: space.parent.about.profile.url,
        avatarUrl: space.parent.about.profile.avatar?.uri,
        initials: getInitials(space.parent.about.profile.displayName),
        avatarColor: getAvatarColor(space.parent.id),
      }
    : undefined;

  return {
    id: space.id,
    name: displayName,
    description: profile.tagline ?? '',
    bannerImageUrl: profile.cardBanner?.uri || getDefaultSpaceVisualUrl(VisualType.Card, space.id),
    initials: getInitials(displayName),
    avatarColor: getAvatarColor(space.id),
    isPrivate: !isContentPublic,
    tags: profile.tagset?.tags ?? [],
    leads,
    href: profile.url,
    matchedTerms: !!space.matchedTerms?.length,
    parent,
  };
}

export function mapSpacesToCardDataList(
  spaces: SpaceWithParent[] | undefined,
  authenticated: boolean
): SpaceCardData[] {
  if (!spaces) return [];
  return spaces.map(space => mapSpaceToCardData(space, authenticated));
}

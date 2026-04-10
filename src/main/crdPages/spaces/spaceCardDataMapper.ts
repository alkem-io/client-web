import type { SpaceCardData, SpaceLead } from '@/crd/components/space/SpaceCard';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { SpaceWithParent } from './SpaceExplorerPage';

export function mapSpaceToCardData(space: SpaceWithParent, authenticated: boolean): SpaceCardData {
  const { about } = space;
  const { profile, isContentPublic, membership } = about;
  const displayName = profile.displayName;

  const leads: SpaceLead[] = [];
  if (authenticated) {
    const leadUsers = membership?.leadUsers ?? [];
    const leadOrgs = membership?.leadOrganizations ?? [];

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
        avatarColor: pickColorFromId(space.parent.id),
      }
    : undefined;

  return {
    id: space.id,
    name: displayName,
    // Leave undefined when the space has no real card banner — the component will
    // render the deterministic gradient from `avatarColor` instead of a stock default.
    description: profile.tagline ?? '',
    bannerImageUrl: profile.cardBanner?.uri || undefined,
    initials: getInitials(displayName),
    avatarColor: pickColorFromId(space.id),
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

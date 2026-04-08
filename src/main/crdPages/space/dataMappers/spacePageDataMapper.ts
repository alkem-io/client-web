import type { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

type MemberAvatar = {
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
    case 'ARCHIVED':
      return { status: 'archived' };
    case 'DEMO':
      return { status: 'demo' };
    default:
      return { status: 'active' };
  }
}

export function mapMemberAvatars(
  leadUsers: Array<{ profile?: { displayName: string; avatar?: { uri: string } } }> | undefined
): MemberAvatar[] {
  if (!leadUsers) return [];
  return leadUsers
    .filter((user): user is typeof user & { profile: NonNullable<typeof user.profile> } => !!user.profile)
    .map(user => ({
      url: user.profile.avatar?.uri,
      initials: getInitials(user.profile.displayName),
    }));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

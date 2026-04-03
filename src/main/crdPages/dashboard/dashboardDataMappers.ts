export type CompactSpaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
  isHomeSpace: boolean;
};

export type ActivityItemData = {
  id: string;
  avatarUrl?: string;
  avatarInitials: string;
  userName: string;
  actionText: string;
  targetName: string;
  targetHref?: string;
  timestamp: string;
};

export type ActivityFilterOption = {
  value: string;
  label: string;
};

export type SidebarResourceData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
};

export type SpaceHierarchyCardData = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  subspaces: Array<{
    id: string;
    name: string;
    href: string;
  }>;
};

export type MembershipTreeNodeData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
  roles: string[];
  children: MembershipTreeNodeData[];
};

export type InvitationCardData = {
  id: string;
  spaceName: string;
  spaceHref: string;
  senderName: string;
  senderAvatarUrl?: string;
  role: string;
};

// Extracts up to 2 initials from a display name (first letter of first two words).
const getInitials = (name: string): string => {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

type RecentSpaceEntry = {
  space: {
    id: string;
    about: {
      profile: {
        displayName: string;
        url: string;
        cardBanner?: { uri: string };
      };
      isContentPublic?: boolean;
    };
  };
};

export const mapRecentSpacesToCompactCards = (
  spaces: RecentSpaceEntry[],
  homeSpaceId?: string
): CompactSpaceCardData[] => {
  return spaces.map(({ space }) => ({
    id: space.id,
    name: space.about.profile.displayName,
    href: space.about.profile.url,
    bannerUrl: space.about.profile.cardBanner?.uri,
    isPrivate: !space.about.isContentPublic,
    isHomeSpace: space.id === homeSpaceId,
  }));
};

type ActivityEntry = {
  id: string;
  triggeredBy?: {
    profile?: {
      displayName?: string;
      avatar?: { uri: string };
    };
  };
  description?: string;
  spaceDisplayName?: string;
  createdDate?: string | Date;
};

export const mapActivityToFeedItems = (activities: ActivityEntry[]): ActivityItemData[] => {
  return activities.map(activity => {
    const displayName = activity.triggeredBy?.profile?.displayName ?? '';

    return {
      id: activity.id,
      avatarUrl: activity.triggeredBy?.profile?.avatar?.uri,
      avatarInitials: displayName ? getInitials(displayName) : '?',
      userName: displayName,
      actionText: activity.description ?? '',
      targetName: activity.spaceDisplayName ?? '',
      targetHref: undefined,
      timestamp:
        activity.createdDate instanceof Date ? activity.createdDate.toISOString() : (activity.createdDate ?? ''),
    };
  });
};

type ProfileShape = {
  displayName: string;
  url: string;
  avatar?: { uri: string };
};

type SpaceResourceEntry = {
  id: string;
  about: {
    profile: ProfileShape;
  };
};

type ProfileResourceEntry = {
  id: string;
  profile?: ProfileShape;
};

type SidebarResources = {
  spaces: SidebarResourceData[];
  virtualContributors: SidebarResourceData[];
  innovationHubs: SidebarResourceData[];
  innovationPacks: SidebarResourceData[];
};

const mapProfileToSidebarItem = (id: string, profile: ProfileShape): SidebarResourceData => ({
  id,
  name: profile.displayName,
  href: profile.url,
  avatarUrl: profile.avatar?.uri,
  initials: getInitials(profile.displayName),
});

export const mapResourcesToSidebarItems = (resources: {
  spaces?: SpaceResourceEntry[];
  virtualContributors?: ProfileResourceEntry[];
  innovationHubs?: ProfileResourceEntry[];
  innovationPacks?: ProfileResourceEntry[];
}): SidebarResources => ({
  spaces: (resources.spaces ?? []).map(s => mapProfileToSidebarItem(s.id, s.about.profile)),
  virtualContributors: (resources.virtualContributors ?? [])
    .filter(vc => vc.profile)
    .map(vc => mapProfileToSidebarItem(vc.id, vc.profile!)),
  innovationHubs: (resources.innovationHubs ?? [])
    .filter(hub => hub.profile)
    .map(hub => mapProfileToSidebarItem(hub.id, hub.profile!)),
  innovationPacks: (resources.innovationPacks ?? [])
    .filter(pack => pack.profile)
    .map(pack => mapProfileToSidebarItem(pack.id, pack.profile!)),
});

type MembershipEntry = {
  space: {
    id: string;
    about: {
      profile: {
        displayName: string;
        url: string;
        avatar?: { uri: string };
      };
    };
    community?: {
      roleSet?: {
        myRoles?: string[];
      };
    };
  };
  childMemberships?: MembershipEntry[];
};

export const mapMembershipsToTree = (memberships: MembershipEntry[]): MembershipTreeNodeData[] => {
  return memberships.map(membership => {
    const { space } = membership;
    const profile = space.about.profile;

    return {
      id: space.id,
      name: profile.displayName,
      href: profile.url,
      avatarUrl: profile.avatar?.uri,
      initials: getInitials(profile.displayName),
      avatarColor: undefined,
      roles: space.community?.roleSet?.myRoles ?? [],
      children: mapMembershipsToTree(membership.childMemberships ?? []),
    };
  });
};

type InvitationEntry = {
  id: string;
  spacePendingMembershipInfo: {
    about: {
      profile: {
        displayName: string;
        url: string;
      };
    };
  };
  contributorType?: string;
};

export const mapInvitationsToCards = (invitations: InvitationEntry[]): InvitationCardData[] => {
  return invitations.map(invitation => ({
    id: invitation.id,
    spaceName: invitation.spacePendingMembershipInfo.about.profile.displayName,
    spaceHref: invitation.spacePendingMembershipInfo.about.profile.url,
    senderName: '',
    senderAvatarUrl: undefined,
    role: invitation.contributorType ?? '',
  }));
};

type DashboardSpaceMembership = {
  space: {
    id: string;
    about: {
      profile: {
        displayName: string;
        url: string;
        tagline?: string;
        spaceBanner?: { uri: string };
      };
    };
  };
  childMemberships?: Array<{
    space: {
      id: string;
      about: {
        profile: {
          displayName: string;
          url: string;
        };
      };
    };
  }>;
};

export const mapDashboardSpaces = (
  memberships: DashboardSpaceMembership[],
  homeSpaceId?: string
): SpaceHierarchyCardData[] => {
  return memberships.map(membership => {
    const { space } = membership;
    const profile = space.about.profile;

    return {
      id: space.id,
      name: profile.displayName,
      href: profile.url,
      tagline: profile.tagline,
      bannerUrl: profile.spaceBanner?.uri,
      isHomeSpace: space.id === homeSpaceId,
      subspaces: (membership.childMemberships ?? []).map(child => ({
        id: child.space.id,
        name: child.space.about.profile.displayName,
        href: child.space.about.profile.url,
      })),
    };
  });
};

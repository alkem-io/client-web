import type { TFunction } from 'i18next';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { MembershipItem } from '@/crd/components/dashboard/MyMembershipsPanel';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';

export type CompactSpaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
  isHomeSpace: boolean;
  initials: string;
  color: string;
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
  rawDate?: string;
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

export type SubspaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
};

export type SpaceHierarchyCardData = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  subspaces: SubspaceCardData[];
};

export type InvitationCardData = {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceHref: string;
  spaceAvatarUrl?: string;
  role: string;
  color: string;
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
    // Leave undefined when the space has no real card banner — the component will
    // render the deterministic gradient from `color` instead of a stock default.
    bannerUrl: space.about.profile.cardBanner?.uri || undefined,
    isPrivate: space.about.isContentPublic === false,
    isHomeSpace: space.id === homeSpaceId,
    initials: getInitials(space.about.profile.displayName),
    color: pickColorFromId(space.id),
  }));
};

type ActivityEntry = {
  id: string;
  type?: string;
  triggeredBy?: {
    profile?: {
      displayName?: string;
      avatar?: { uri: string };
    };
  };
  description?: string;
  spaceDisplayName?: string;
  createdDate?: string | Date;
  // Type-specific fields for URL extraction
  post?: { profile: { url?: string; displayName: string } };
  callout?: { framing: { profile: { url?: string; displayName: string } } };
  whiteboard?: { profile: { url?: string; displayName: string } };
  subspace?: { about: { profile: { url?: string; displayName: string } } };
  calendarEvent?: { profile: { url?: string; displayName: string } };
  actor?: { profile?: { url?: string; displayName: string } };
  link?: { profile: { url?: string; displayName: string } };
  memo?: { profile: { url?: string; displayName: string } };
};

function extractActivityUrl(activity: ActivityEntry): string | undefined {
  // Post-related activities link to the post
  if (activity.post?.profile?.url) return activity.post.profile.url;
  // Whiteboard activities link to the whiteboard
  if (activity.whiteboard?.profile?.url) return activity.whiteboard.profile.url;
  // Subspace created links to the subspace
  if (activity.subspace?.about?.profile?.url) return activity.subspace.about.profile.url;
  // Calendar event links to the event
  if (activity.calendarEvent?.profile?.url) return activity.calendarEvent.profile.url;
  // Member joined links to the actor
  if (activity.actor?.profile?.url) return activity.actor.profile.url;
  // Link created links to the link
  if (activity.link?.profile?.url) return activity.link.profile.url;
  // Memo created links to the memo
  if (activity.memo?.profile?.url) return activity.memo.profile.url;
  // Callout published links to the callout
  if (activity.callout?.framing?.profile?.url) return activity.callout.framing.profile.url;
  return undefined;
}

function extractActivityTargetName(activity: ActivityEntry): string {
  if (activity.post?.profile?.displayName) return activity.post.profile.displayName;
  if (activity.whiteboard?.profile?.displayName) return activity.whiteboard.profile.displayName;
  if (activity.subspace?.about?.profile?.displayName) return activity.subspace.about.profile.displayName;
  if (activity.calendarEvent?.profile?.displayName) return activity.calendarEvent.profile.displayName;
  if (activity.actor?.profile?.displayName) return activity.actor.profile.displayName;
  if (activity.link?.profile?.displayName) return activity.link.profile.displayName;
  if (activity.memo?.profile?.displayName) return activity.memo.profile.displayName;
  if (activity.callout?.framing?.profile?.displayName) return activity.callout.framing.profile.displayName;
  return activity.spaceDisplayName ?? '';
}

export const mapActivityToFeedItems = (activities: ActivityEntry[], t: TFunction): ActivityItemData[] => {
  return activities.map(activity => {
    const displayName = activity.triggeredBy?.profile?.displayName ?? '';
    const rawDate =
      activity.createdDate instanceof Date ? activity.createdDate.toISOString() : (activity.createdDate ?? '');

    return {
      id: activity.id,
      avatarUrl: activity.triggeredBy?.profile?.avatar?.uri,
      avatarInitials: displayName ? getInitials(displayName) : '?',
      userName: displayName,
      actionText: activity.description ?? '',
      targetName: extractActivityTargetName(activity),
      targetHref: extractActivityUrl(activity),
      timestamp: activity.createdDate ? formatTimeElapsed(activity.createdDate, t) : '',
      rawDate,
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

// Sidebar items use the muted/prototype palette — they're small list rows where
// per-space rainbow colours feel noisy. Spaces / hubs / packs fall back to the
// default grey AvatarFallback; virtual contributors get the prototype's chart-2
// accent so they remain visually distinct from spaces.
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
    .map(vc => ({
      // biome-ignore lint/style/noNonNullAssertion: Filtered before
      ...mapProfileToSidebarItem(vc.id, vc.profile!),
      avatarColor: 'var(--chart-2)',
    })),
  innovationHubs: (resources.innovationHubs ?? [])
    .filter(hub => hub.profile)
    // biome-ignore lint/style/noNonNullAssertion: Filtered before
    .map(hub => mapProfileToSidebarItem(hub.id, hub.profile!)),
  innovationPacks: (resources.innovationPacks ?? [])
    .filter(pack => pack.profile)
    // biome-ignore lint/style/noNonNullAssertion: Filtered before
    .map(pack => mapProfileToSidebarItem(pack.id, pack.profile!)),
});

type MembershipEntry = {
  space: {
    id: string;
    about: {
      isContentPublic?: boolean;
      profile: {
        displayName: string;
        tagline?: string;
        url: string;
        avatar?: { uri: string };
        cardBanner?: { uri: string };
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

// Normalize raw GraphQL role strings (e.g. `'ADMIN'`, `'LEAD'`, `'MEMBER'` from the
// `RoleName` enum) down to the subset the panel renders, preserving priority order
// so the badges read consistently.
const ROLE_ORDER = ['admin', 'lead', 'member'] as const;
type PanelRole = (typeof ROLE_ORDER)[number];

const extractPanelRoles = (rawRoles: string[]): PanelRole[] => {
  const seen = new Set(rawRoles.map(r => r.toLowerCase()));
  return ROLE_ORDER.filter(r => seen.has(r));
};

const mapEntryToPanelItem = (entry: MembershipEntry, depth = 0): MembershipItem => {
  const { space } = entry;
  const profile = space.about.profile;
  // Default to public when `isContentPublic` is absent (e.g. before codegen picks up
  // the new field). Spaces are public by default on the platform.
  const isPrivate = space.about.isContentPublic === false;
  const childEntries = entry.childMemberships ?? [];

  // Root spaces (L0) show a banner thumbnail → prefer cardBanner, default to card visual.
  // Child spaces (L1/L2) show an avatar → prefer avatar URI, default to avatar visual.
  const isRoot = depth === 0;
  const realImage = isRoot ? profile.cardBanner?.uri || undefined : profile.avatar?.uri || undefined;
  const image = realImage ?? getDefaultSpaceVisualUrl(isRoot ? VisualType.Card : VisualType.Avatar, space.id);

  return {
    id: space.id,
    name: profile.displayName,
    href: profile.url,
    tagline: profile.tagline,
    isPrivate,
    roles: extractPanelRoles(space.community?.roleSet?.myRoles ?? []),
    initials: getInitials(profile.displayName),
    color: pickColorFromId(space.id),
    image,
    children: childEntries.length > 0 ? childEntries.map(c => mapEntryToPanelItem(c, depth + 1)) : undefined,
  };
};

export const mapMembershipsToPanelItems = (memberships: MembershipEntry[]): MembershipItem[] => {
  return memberships.map(mapEntryToPanelItem);
};

type InvitationEntry = {
  id: string;
  spacePendingMembershipInfo: {
    id: string;
    about: {
      profile: {
        displayName: string;
        url: string;
        avatar?: { uri: string };
      };
    };
  };
  contributorType?: string;
};

export const mapInvitationsToCards = (invitations: InvitationEntry[]): InvitationCardData[] => {
  return invitations.map(invitation => ({
    id: invitation.id,
    spaceId: invitation.spacePendingMembershipInfo.id,
    spaceName: invitation.spacePendingMembershipInfo.about.profile.displayName,
    spaceHref: invitation.spacePendingMembershipInfo.about.profile.url,
    spaceAvatarUrl: invitation.spacePendingMembershipInfo.about.profile.avatar?.uri,
    role: invitation.contributorType ?? '',
    color: pickColorFromId(invitation.spacePendingMembershipInfo.id),
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
        cardBanner?: { uri: string };
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
          cardBanner?: { uri: string };
        };
        isContentPublic?: boolean;
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
      // Leave undefined when the space has no real card banner — the component will
      // render the deterministic gradient from `color` instead of a stock default.
      bannerUrl: profile.cardBanner?.uri || undefined,
      isHomeSpace: space.id === homeSpaceId,
      color: pickColorFromId(space.id),
      subspaces: (membership.childMemberships ?? []).map(child => ({
        id: child.space.id,
        name: child.space.about.profile.displayName,
        href: child.space.about.profile.url,
        bannerUrl: child.space.about.profile.cardBanner?.uri || undefined,
        isPrivate: child.space.about.isContentPublic === false,
        color: pickColorFromId(child.space.id),
      })),
    };
  });
};

import type { TFunction } from 'i18next';
import {
  CalendarDays,
  FileText,
  LayoutGrid,
  Link2,
  Megaphone,
  MessageSquare,
  Mic,
  Presentation,
  StickyNote,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ActivityEventType, VisualType } from '@/core/apollo/generated/graphql-schema';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import type { MembershipItem } from '@/crd/components/dashboard/MyMemberships/types';
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
  activityIcon: ReactNode;
  activityIconLabel: string;
  title: ReactNode;
  titlePlain?: string;
  titleHref?: string;
  contextName?: string;
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
    isPrivate: !space.about.isContentPublic,
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
  /** Present on comment-type entries (CalloutPostComment, DiscussionComment) as raw markdown. */
  description?: string;
  /** Present on UpdateSent as raw markdown. */
  message?: string;
  spaceDisplayName?: string;
  createdDate?: string | Date;
  space?: { about?: { profile?: { url?: string } } };
  post?: { profile: { url?: string; displayName: string } };
  callout?: { framing: { profile: { url?: string; displayName: string } } };
  whiteboard?: { profile: { url?: string; displayName: string } };
  subspace?: { about: { profile: { url?: string; displayName: string } } };
  calendarEvent?: { profile: { url?: string; displayName: string } };
  actor?: { profile?: { url?: string; displayName: string } };
  link?: { profile: { url?: string; displayName: string } };
  memo?: { profile: { url?: string; displayName: string } };
};

const ICON_CLASS = 'size-2.5';

/**
 * English defaults for per-activity-type accessible labels used on the icon badge
 * and in the row's `aria-label`. Screen readers announce these so the row is
 * intelligible without relying on visual context.
 *
 * TODO: Wire through a `crd-dashboard` i18n key (e.g. `activityIconLabel.<TYPE>`)
 * when the dashboard namespace is extended — use these as `defaultValue` fallbacks.
 */
const ACTIVITY_ICON_LABELS: Record<string, string> = {
  [ActivityEventType.CalloutPublished]: 'New callout',
  [ActivityEventType.CalloutPostCreated]: 'New post',
  [ActivityEventType.CalloutPostComment]: 'New comment',
  [ActivityEventType.DiscussionComment]: 'New comment',
  [ActivityEventType.CalloutWhiteboardCreated]: 'New whiteboard',
  [ActivityEventType.CalloutWhiteboardContentModified]: 'Whiteboard updated',
  [ActivityEventType.CalloutMemoCreated]: 'New memo',
  [ActivityEventType.CalloutLinkCreated]: 'New link',
  [ActivityEventType.MemberJoined]: 'New member',
  [ActivityEventType.SubspaceCreated]: 'New subspace',
  [ActivityEventType.CalendarEventCreated]: 'New event',
  [ActivityEventType.UpdateSent]: 'New update',
};

/**
 * Per-activity-type visual & content mapping. Mirrors the legacy per-view layer
 * (`src/domain/collaboration/activity/ActivityLog/views/*`): picks the badge icon,
 * primary title content (entity name or markdown), parent context, and click target.
 *
 * For comment-type activities (`CalloutPostComment`, `DiscussionComment`, `UpdateSent`)
 * the title is user-authored markdown — rendered via `InlineMarkdown` so markdown/HTML
 * displays formatted instead of escaped (CRD markdown-preview rule, `src/crd/CLAUDE.md` §9).
 */
type ResolvedActivity = {
  icon: ReactNode;
  iconLabel: string;
  title: ReactNode;
  titlePlain: string;
  contextName?: string;
  href?: string;
};

function resolveActivity(activity: ActivityEntry, t: TFunction): ResolvedActivity {
  const typeKey = activity.type ?? '';
  const iconLabel = ACTIVITY_ICON_LABELS[typeKey] ?? typeKey;

  const spaceContext = activity.spaceDisplayName;
  const calloutContext = activity.callout?.framing?.profile?.displayName;

  switch (activity.type) {
    case ActivityEventType.CalloutPublished: {
      const name = activity.callout?.framing?.profile?.displayName ?? '';
      return {
        icon: <Megaphone aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: spaceContext,
        href: activity.callout?.framing?.profile?.url,
      };
    }
    case ActivityEventType.CalloutPostCreated: {
      const name = activity.post?.profile?.displayName ?? '';
      return {
        icon: <FileText aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: calloutContext,
        href: activity.post?.profile?.url,
      };
    }
    case ActivityEventType.CalloutPostComment: {
      const markdown = activity.description ?? '';
      return {
        icon: <MessageSquare aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: markdown ? <InlineMarkdown content={markdown} clampLines={2} /> : '',
        titlePlain: markdown,
        // Legacy shows the post displayName for post-comment context.
        contextName: activity.post?.profile?.displayName,
        href: activity.post?.profile?.url,
      };
    }
    case ActivityEventType.DiscussionComment: {
      const markdown = activity.description ?? '';
      return {
        icon: <MessageSquare aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: markdown ? <InlineMarkdown content={markdown} clampLines={2} /> : '',
        titlePlain: markdown,
        contextName: calloutContext,
        href: activity.callout?.framing?.profile?.url,
      };
    }
    case ActivityEventType.CalloutWhiteboardCreated:
    case ActivityEventType.CalloutWhiteboardContentModified: {
      const name = activity.whiteboard?.profile?.displayName ?? '';
      return {
        icon: <Presentation aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: calloutContext,
        href: activity.whiteboard?.profile?.url,
      };
    }
    case ActivityEventType.CalloutMemoCreated: {
      const name = activity.memo?.profile?.displayName ?? '';
      return {
        icon: <StickyNote aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: calloutContext,
        href: activity.memo?.profile?.url,
      };
    }
    case ActivityEventType.CalloutLinkCreated: {
      const name = activity.link?.profile?.displayName ?? '';
      return {
        icon: <Link2 aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: calloutContext,
        // Legacy links the whole row to the parent callout (links have no profile URL of their own).
        href: activity.callout?.framing?.profile?.url,
      };
    }
    case ActivityEventType.MemberJoined: {
      const name = activity.actor?.profile?.displayName ?? '';
      // Legacy title is "{{subject}} joined" — the only type with a built-in verb.
      const titleText = t('components.activityLogView.description.MEMBER_JOINED', { subject: name }) as string;
      return {
        icon: <User aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: titleText,
        titlePlain: titleText,
        contextName: spaceContext,
        href: activity.actor?.profile?.url,
      };
    }
    case ActivityEventType.SubspaceCreated: {
      const name = activity.subspace?.about?.profile?.displayName ?? '';
      return {
        icon: <LayoutGrid aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: spaceContext,
        href: activity.subspace?.about?.profile?.url,
      };
    }
    case ActivityEventType.CalendarEventCreated: {
      const name = activity.calendarEvent?.profile?.displayName ?? '';
      return {
        icon: <CalendarDays aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: name,
        titlePlain: name,
        contextName: spaceContext,
        href: activity.calendarEvent?.profile?.url,
      };
    }
    case ActivityEventType.UpdateSent: {
      const markdown = activity.message ?? activity.description ?? '';
      return {
        icon: <Mic aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: markdown ? <InlineMarkdown content={markdown} clampLines={2} /> : '',
        titlePlain: markdown,
        contextName: spaceContext,
        // Updates don't have their own URL; link to the space (legacy uses buildUpdatesUrl).
        href: activity.space?.about?.profile?.url,
      };
    }
    default: {
      // Unknown/future activity type — best-effort fallback using whatever fields are present.
      const name = activity.description ?? '';
      return {
        icon: <Megaphone aria-hidden="true" className={ICON_CLASS} />,
        iconLabel: typeKey,
        title: name,
        titlePlain: name,
        contextName: spaceContext,
        href: activity.callout?.framing?.profile?.url,
      };
    }
  }
}

export const mapActivityToFeedItems = (activities: ActivityEntry[], t: TFunction): ActivityItemData[] => {
  return activities.map(activity => {
    const displayName = activity.triggeredBy?.profile?.displayName ?? '';
    const rawDate =
      activity.createdDate instanceof Date ? activity.createdDate.toISOString() : (activity.createdDate ?? '');
    const resolved = resolveActivity(activity, t);

    return {
      id: activity.id,
      avatarUrl: activity.triggeredBy?.profile?.avatar?.uri,
      avatarInitials: displayName ? getInitials(displayName) : '?',
      userName: displayName,
      activityIcon: resolved.icon,
      activityIconLabel: resolved.iconLabel,
      title: resolved.title,
      titlePlain: resolved.titlePlain,
      titleHref: resolved.href,
      contextName: resolved.contextName,
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
  const isPrivate = !space.about.isContentPublic;
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
        isPrivate: !child.space.about.isContentPublic,
        color: pickColorFromId(child.space.id),
      })),
    };
  });
};

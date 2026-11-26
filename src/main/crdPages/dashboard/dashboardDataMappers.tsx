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
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import type {
  V2DashboardActivityQuery,
  V2DashboardHostedResourcesQuery,
  V2DashboardSpaceCardFragment,
  V2PendingMembershipRequestFragment,
} from '@/core/apollo/generated-v2/graphql-schema';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { markdownToPlainText } from '@/core/ui/markdown/utils/markdownToPlainText';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import type { ApplicationCardData } from '@/crd/components/dashboard/ApplicationsBlock';
import type { MembershipItem } from '@/crd/components/dashboard/MyMemberships/types';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';

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

export type InvitationCardData = {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceHref: string;
  spaceAvatarUrl?: string;
  inviterName?: string;
  color: string;
};

/** The native space card read by every dashboard space section (V2DashboardSpaceCard). */
export type DashboardSpace = V2DashboardSpaceCardFragment;

/** A space card needs a route; a space the viewer may see only without one is a server answer, not a dashboard link. */
const requireUrl = (space: { id: string; url?: string | null }): string => {
  if (!space.url) throw new Error(`Dashboard space ${space.id} has no canonical destination`);
  return space.url;
};

export const mapRecentSpacesToCompactCards = (spaces: DashboardSpace[], homeSpaceId?: string): CompactSpaceCardData[] =>
  spaces.map(space => spaceToCompactCard(space, homeSpaceId));

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
 * Per-activity-type visual & content mapping. Mirrors the legacy per-view layer
 * (`src/domain/collaboration/activity/ActivityLog/views/*`): picks the badge icon,
 * primary title content (entity name or markdown), parent context, and click target.
 *
 * For comment-type activities (`CalloutPostComment`, `DiscussionComment`, `UpdateSent`)
 * the title is user-authored markdown — rendered via `InlineMarkdown` so markdown/HTML
 * displays formatted instead of escaped (CRD markdown-preview rule, `src/crd/CLAUDE.md` §9).
 * `titlePlain` is always plain-text (markdown stripped via `markdownToPlainText`) so
 * screen readers don't announce markup syntax.
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
  // Icon labels live in the crd-dashboard namespace (manually managed in src/crd/i18n/dashboard/,
  // not Crowdin). The caller's `useTranslation('crd-dashboard')` ensures the namespace is loaded
  // so passing `{ ns: 'crd-dashboard' }` here works even though `t` came from the default namespace.
  const iconLabel = typeKey
    ? (t(`activity.iconLabel.${typeKey}` as never, {
        ns: 'crd-dashboard',
        defaultValue: typeKey,
      }) as string)
    : '';

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
        title: markdown ? (
          <InlineMarkdown content={markdown} clampLines={2} disableLinks={true} className="text-body" />
        ) : (
          ''
        ),
        titlePlain: markdownToPlainText(markdown),
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
        title: markdown ? (
          <InlineMarkdown content={markdown} clampLines={2} disableLinks={true} className="text-body" />
        ) : (
          ''
        ),
        titlePlain: markdownToPlainText(markdown),
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
        title: markdown ? (
          <InlineMarkdown content={markdown} clampLines={2} disableLinks={true} className="text-body" />
        ) : (
          ''
        ),
        titlePlain: markdownToPlainText(markdown),
        contextName: spaceContext,
        // Updates don't have their own URL; link to the space (legacy uses buildUpdatesUrl).
        href: activity.space?.about?.profile?.url,
      };
    }
    default: {
      // Unknown/future activity type — best-effort fallback. Render description through
      // InlineMarkdown to stay markdown-safe (CLAUDE.md §9) in case a new backend type
      // carries markdown/HTML, and strip it for the plain-text a11y fallback.
      const markdown = activity.description ?? '';
      return {
        icon: <Megaphone aria-hidden="true" className={ICON_CLASS} />,
        iconLabel,
        title: markdown ? (
          <InlineMarkdown content={markdown} clampLines={2} disableLinks={true} className="text-body" />
        ) : (
          ''
        ),
        titlePlain: markdownToPlainText(markdown),
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

type NativeActivity = V2DashboardActivityQuery['activity']['edges'][number]['node'];

/** Structural view of the activity subject union (Post | Document | Space | Actor faces of V2DashboardActivity). */
type NativeActivitySubject = {
  id: string;
  entityType: string;
  url?: string | null;
  about?: { displayName: string } | null;
  documentAbout?: { displayName: string } | null;
  actorAbout?: { displayName: string } | null;
  parentPost?: { url?: string | null; about: { displayName: string } } | null;
};

// The native activity type is the legacy kebab kind (activity_projection returns options.activity.legacy_kind);
// map.legacy-enums.tsv:10-21 pairs each with the legacy ActivityEventType the feed rendering is keyed on.
const NATIVE_ACTIVITY_TYPES: Record<string, ActivityEventType> = {
  'callout-published': ActivityEventType.CalloutPublished,
  'post-created': ActivityEventType.CalloutPostCreated,
  'post-comment': ActivityEventType.CalloutPostComment,
  'whiteboard-created': ActivityEventType.CalloutWhiteboardCreated,
  'whiteboard-content-modified': ActivityEventType.CalloutWhiteboardContentModified,
  'callout-link-added': ActivityEventType.CalloutLinkCreated,
  'memo-created': ActivityEventType.CalloutMemoCreated,
  'discussion-comment': ActivityEventType.DiscussionComment,
  'update-sent': ActivityEventType.UpdateSent,
  'member-joined': ActivityEventType.MemberJoined,
  'subspace-created': ActivityEventType.SubspaceCreated,
  'calendar-event-created': ActivityEventType.CalendarEventCreated,
};

/** The native kind excluded from both home feeds (screens-dispositions.tsv:5206-5207). */
export const WHITEBOARD_CONTENT_MODIFIED_ACTIVITY = 'whiteboard-content-modified';

const toProfile = (displayName: string | undefined, url: string | null | undefined) =>
  displayName === undefined ? undefined : { displayName, url: url ?? undefined };

/**
 * One native Activity in the feed entry shape. The subject per kind is its declared subject
 * (migrations activity options.activity.subject): the post / document / space / joined actor; the parent callout of a
 * response or link comes from Post.parentPost. Comment and update text (H-activity-2) and the parent of a document
 * (H-activity-4) have no GraphQL carrier, so those entries carry no description and no callout context.
 */
const toActivityEntry = (activity: NativeActivity): ActivityEntry => {
  const subject = activity.subject as NativeActivitySubject | null | undefined;
  const type = NATIVE_ACTIVITY_TYPES[activity.type] ?? activity.type;
  const name = subject?.about?.displayName ?? subject?.documentAbout?.displayName ?? subject?.actorAbout?.displayName;
  const profile = toProfile(name, subject?.url);
  const parent = subject?.parentPost
    ? toProfile(subject.parentPost.about.displayName, subject.parentPost.url)
    : undefined;
  const entry: ActivityEntry = {
    id: activity.id,
    type,
    triggeredBy: activity.actor?.about
      ? {
          profile: {
            displayName: activity.actor.about.displayName,
            avatar: activity.actor.about.avatar ? { uri: activity.actor.about.avatar.file.url } : undefined,
          },
        }
      : undefined,
    spaceDisplayName: activity.space?.about.displayName,
    createdDate: activity.createdAt,
    space: activity.space ? { about: { profile: { url: activity.space.url ?? undefined } } } : undefined,
  };
  switch (type) {
    case ActivityEventType.CalloutPublished:
      return { ...entry, callout: profile && { framing: { profile } } };
    case ActivityEventType.DiscussionComment:
      return { ...entry, callout: profile && { framing: { profile } } };
    case ActivityEventType.CalloutPostCreated:
    case ActivityEventType.CalloutPostComment:
      return { ...entry, post: profile && { profile }, callout: parent && { framing: { profile: parent } } };
    case ActivityEventType.CalloutLinkCreated:
      return { ...entry, link: profile && { profile }, callout: parent && { framing: { profile: parent } } };
    case ActivityEventType.CalloutWhiteboardCreated:
    case ActivityEventType.CalloutWhiteboardContentModified:
      return { ...entry, whiteboard: profile && { profile } };
    case ActivityEventType.CalloutMemoCreated:
      return { ...entry, memo: profile && { profile } };
    case ActivityEventType.MemberJoined:
      return { ...entry, actor: profile && { profile } };
    case ActivityEventType.SubspaceCreated:
      return { ...entry, subspace: profile && { about: { profile } } };
    case ActivityEventType.CalendarEventCreated:
      return { ...entry, calendarEvent: profile && { profile } };
    default:
      return entry;
  }
};

export const mapNativeActivityToFeedItems = (activities: NativeActivity[], t: TFunction): ActivityItemData[] =>
  mapActivityToFeedItems(activities.map(toActivityEntry), t);

type ProfileShape = {
  displayName: string;
  url: string;
  avatar?: { uri: string };
};

type HostedResources = NonNullable<V2DashboardHostedResourcesQuery['viewer']['account']>['hosted'];
type HostedResource = HostedResources['agents'][number] | HostedResources['packs'][number];

type SidebarResources = {
  spaces: SidebarResourceData[];
  virtualContributors: SidebarResourceData[];
  innovationHubs: SidebarResourceData[];
  innovationPacks: SidebarResourceData[];
};

// Sidebar items use the muted/prototype palette — they're small list rows where
// per-space rainbow colours feel noisy. Spaces fall back from AVATAR → CARD banner
// → grey AvatarFallback (L0 spaces rarely have an AVATAR visual but usually have a
// card banner); hubs / packs fall back to the default grey AvatarFallback; virtual
// contributors get the prototype's chart-2 accent so they stay distinct from spaces.
const mapProfileToSidebarItem = (id: string, profile: ProfileShape): SidebarResourceData => ({
  id,
  name: profile.displayName,
  href: profile.url,
  avatarUrl: profile.avatar?.uri,
  initials: getInitials(profile.displayName),
});

const mapResourceToSidebarItem = (resource: HostedResource): SidebarResourceData =>
  mapProfileToSidebarItem(resource.id, {
    displayName: resource.about.displayName,
    url: requireUrl(resource),
    avatar: resource.about.avatar ? { uri: resource.about.avatar.file.url } : undefined,
  });

// screens-dispositions.tsv:4917 / :15710 / :16042: the viewer account's hosted spaces, agents (VCs), homepages (hubs)
// and packs; every item routes to its server url.
export const mapResourcesToSidebarItems = (resources: HostedResources | undefined): SidebarResources => ({
  spaces: (resources?.spaces ?? []).map(space => ({
    ...mapProfileToSidebarItem(space.id, { displayName: space.about.displayName, url: requireUrl(space) }),
    // L0 spaces rarely have an AVATAR but usually a card banner; no visual → grey fallback.
    avatarUrl: (space.about.avatar ?? space.about.card)?.file.url || undefined,
  })),
  virtualContributors: (resources?.agents ?? []).map(agent => ({
    ...mapResourceToSidebarItem(agent),
    avatarColor: 'var(--chart-2)',
  })),
  innovationHubs: (resources?.homepages ?? []).map(mapResourceToSidebarItem),
  innovationPacks: (resources?.packs ?? []).map(mapResourceToSidebarItem),
});

type MembershipEntry = {
  space: {
    id: string;
    about: {
      isContentPublic?: boolean;
      profile: {
        displayName: string;
        tagline?: string;
        url?: string;
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

  // Root spaces (L0) show a banner thumbnail → prefer cardBanner; if missing, the
  // component renders the deterministic gradient from `color`.
  // Child spaces (L1/L2) show an avatar → prefer avatar URI; same gradient fallback.
  const isRoot = depth === 0;
  const image = isRoot ? profile.cardBanner?.uri || undefined : profile.avatar?.uri || undefined;

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

type PendingRequest = V2PendingMembershipRequestFragment;
type PendingSpace = NonNullable<PendingRequest['space']>;

/**
 * The single square-tile image of a space: an L0 space's identity image is its card, a subspace's its avatar; one
 * never substitutes for the other (spaceTileImageUrl rule).
 */
export const pendingSpaceTileImageUrl = (space: PendingSpace): string | undefined =>
  (space.depth === 0 ? space.about.card : space.about.avatar)?.file.url || undefined;

/** A pending space request without its space is not a space card (resource is another kind). */
const requireSpace = (request: PendingRequest): PendingSpace => {
  if (!request.space) throw new Error(`Membership request ${request.id} names no space`);
  return request.space;
};

export const mapInvitationsToCards = (invitations: PendingRequest[]): InvitationCardData[] =>
  invitations.map(invitation => {
    const space = requireSpace(invitation);
    return {
      id: invitation.id,
      spaceId: space.id,
      spaceName: space.about.displayName,
      spaceHref: requireUrl(space),
      spaceAvatarUrl: pendingSpaceTileImageUrl(space),
      inviterName: invitation.createdBy?.about?.displayName,
      color: pickColorFromId(space.id),
    };
  });

export const mapApplicationsToCards = (applications: PendingRequest[]): ApplicationCardData[] =>
  applications.map(application => {
    const space = requireSpace(application);
    return {
      id: application.id,
      spaceName: space.about.displayName,
      spaceHref: requireUrl(space),
      spaceImageUrl: pendingSpaceTileImageUrl(space),
      color: pickColorFromId(space.id),
    };
  });

// ── Non-activity home sections (024) ────────────────────────────────────────

const spaceToCompactCard = (space: DashboardSpace, homeSpaceId?: string): CompactSpaceCardData => ({
  id: space.id,
  name: space.about.displayName,
  href: requireUrl(space),
  // Leave undefined when the space has no card — the component renders the deterministic gradient from `color`.
  bannerUrl: space.about.card?.file.url || undefined,
  isPrivate: !space.isContentPublic,
  isHomeSpace: space.id === homeSpaceId,
  initials: getInitials(space.about.displayName),
  color: pickColorFromId(space.id),
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type RecentSpaceEntry = { space: DashboardSpace; lastParticipatedAt: string };

/**
 * Section 1 — Pinned & Last Active. The home Space is pinned first, followed by the Spaces the member has been
 * personally active in within the last 30 days (Viewer.recentSpaces, L011: the client applies the recency window),
 * ordered most-recent-first. The home Space is never duplicated among the recent items. The caller caps the visible
 * count (the pin slot counts toward the cap).
 */
export const mapLastActiveSection = (
  recentSpaces: RecentSpaceEntry[],
  homeSpace: DashboardSpace | undefined,
  homeSpaceId: string | undefined,
  now: Date = new Date()
): CompactSpaceCardData[] => {
  const cutoff = now.getTime() - 30 * MS_PER_DAY;

  const recent = recentSpaces
    .filter(entry => entry.space.id !== homeSpaceId)
    .map(entry => ({ space: entry.space, time: new Date(entry.lastParticipatedAt).getTime() }))
    .filter(entry => !Number.isNaN(entry.time) && entry.time >= cutoff)
    .sort((a, b) => b.time - a.time)
    .map(entry => spaceToCompactCard(entry.space, homeSpaceId));

  const homeCard = homeSpace ? [spaceToCompactCard(homeSpace, homeSpaceId)] : [];
  return [...homeCard, ...recent];
};

/**
 * Section 2 — Most Activity. The server's most-active ranking (spaces filter mostActiveDays, depths 0/1, ACTIVE,
 * H-activity-8), already ordered.
 */
export const mapMostActivitySection = (spaces: DashboardSpace[]): CompactSpaceCardData[] =>
  spaces.map(space => spaceToCompactCard(space));

type ActivityScoredSpace = DashboardSpace & { activityScore?: number | null };

type SpaceMembershipEntry = { roles: string[]; space: ActivityScoredSpace };

// Sections include depth 0 (top-level) and depth 1 (first-level subspaces) only — not deeper.
const isL0OrL1 = (space: { depth: number }): boolean => space.depth === 0 || space.depth === 1;

const isLeadOrAdmin = (membership: SpaceMembershipEntry): boolean =>
  membership.roles.includes(RoleName.Lead) || membership.roles.includes(RoleName.Admin);

// Highest activity first; zero-activity Spaces therefore sort last (0 is the lowest score). A null score is the
// server's answer without READ (surface.graphql Space.activityScore) and sorts with zero.
const byActivityScoreDesc = (a: ActivityScoredSpace, b: ActivityScoredSpace): number =>
  (b.activityScore ?? 0) - (a.activityScore ?? 0);

// Account (hosted) Spaces restricted to L0/L1 and ordered by activity — the shared basis for
// both the Section 4 cards and its "show more" panel items.
const sortedHostedSpaces = (spaces: ActivityScoredSpace[]): ActivityScoredSpace[] =>
  [...spaces].filter(isL0OrL1).sort(byActivityScoreDesc);

/**
 * Section 3 — I Lead & Administer. The flat memberships (User.memberships) at depth 0/1 where the member's role
 * includes Lead or Admin, ordered by all-actor activity score (highest first, zero-activity last).
 */
export const mapLeadAdminSection = (memberships: SpaceMembershipEntry[]): CompactSpaceCardData[] =>
  memberships
    .filter(membership => isL0OrL1(membership.space) && isLeadOrAdmin(membership))
    .map(membership => membership.space)
    .sort(byActivityScoreDesc)
    .map(space => spaceToCompactCard(space));

/**
 * Section 4 — I Host. The Spaces on the member's personal account, ordered by all-actor
 * activity score (highest first, zero-activity last).
 */
export const mapHostSection = (spaces: ActivityScoredSpace[]): CompactSpaceCardData[] =>
  sortedHostedSpaces(spaces).map(space => spaceToCompactCard(space));

/**
 * Hosted account Spaces mapped to flat memberships-panel items (no membership role), ordered
 * by activity score — used by the Section 4 "show more" panel. Account Spaces are not
 * memberships, so the panel is given a pre-scoped flat list rather than a role filter.
 */
export const mapHostedSpacesToPanelItems = (spaces: ActivityScoredSpace[]): MembershipItem[] =>
  sortedHostedSpaces(spaces).map(space => ({
    id: space.id,
    name: space.about.displayName,
    href: requireUrl(space),
    isPrivate: !space.isContentPublic,
    roles: [],
    initials: getInitials(space.about.displayName),
    color: pickColorFromId(space.id),
    image: space.about.card?.file.url || undefined,
  }));

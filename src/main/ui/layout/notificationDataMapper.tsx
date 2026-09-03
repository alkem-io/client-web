/**
 * Maps InAppNotificationModel → CrdNotificationItemData for the CRD NotificationsPanel.
 *
 * Translation keys: notification type strings (subject/description templates) live in the
 * default 'crd-common' namespace at `components.inAppNotifications.type.<TYPE>` in
 * src/crd/i18n/common/common.<lang>.json.
 *
 * Rich-text rendering:
 * - subject/description templates contain HTML tags (`<b>`, `<br />`, `<i>`, `<pre>`) that
 *   must render as real React elements — rendering them as plain strings would display
 *   the literal markup to the user. We wrap them in `<Trans>` with a `components` map.
 * - comment/message payloads are user-generated markdown. We wrap them in `InlineMarkdown`
 *   so they render formatted instead of as escaped text.
 */
import type { TFunction } from 'i18next';
import { Trans } from 'react-i18next';
import {
  type ForumDiscussionCategory,
  NotificationEvent,
  type NotificationEventInAppState,
  RoleName,
} from '@/core/apollo/generated/graphql-schema';
import { kebabToConstantCase } from '@/core/utils/string';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { glyphForSlug } from '@/crd/components/reactions/reactionEmoji';
import type { CrdNotificationItemData } from '@/crd/layouts/types';
import { getInitials } from '@/crd/lib/getInitials';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import type { InAppNotificationModel } from '@/main/inAppNotifications/model/InAppNotificationModel';
import type { InAppNotificationPayloadModel } from '@/main/inAppNotifications/model/InAppNotificationPayloadModel';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';

const TRANS_COMPONENTS = {
  b: <strong />,
  br: <br />,
  pre: <pre />,
  i: <em />,
};

/**
 * Builds the interpolation values for notification i18n keys.
 * Each notification type uses a subset of these values in its translation template.
 *
 * Values must match the placeholders in src/crd/i18n/common/common.<lang>.json
 * under `components.inAppNotifications.type.<TYPE>.{subject,description}`.
 */
function buildTranslationValues(
  notification: InAppNotificationModel,
  t: TFunction
): Record<string, string | undefined> {
  const { payload, triggeredBy } = notification;

  return {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: payload.space?.about?.profile?.displayName,
    calloutName: payload.callout?.framing?.profile?.displayName,
    organizationName: payload.organization?.profile?.displayName,
    userName: payload.user?.profile?.displayName ?? payload.actor?.profile?.displayName,
    comment:
      payload.comment ??
      payload.messageDetails?.message ??
      payload.userMessage ??
      payload.spaceCommunicationMessage ??
      payload.organizationMessage,
    discussionName: payload.discussion?.displayName,
    role: payload.role,
    // memberName: used by SPACE_ADMIN_COMMUNITY_NEW_MEMBER — the new member is the actor
    memberName: payload.actor?.profile?.displayName,
    // parentName: used by USER_COMMENT_REPLY — the parent message/thread name
    parentName: payload.messageDetails?.parent?.displayName,
    // receiverName: used by USER_MESSAGE_SENDER — the person who received the DM
    receiverName: payload.user?.profile?.displayName ?? payload.actor?.profile?.displayName,
    // contributorName: used by VC invitation notifications — the virtual contributor
    contributorName: payload.actor?.profile?.displayName,
    // contributionName: used by SPACE_COLLABORATION_CALLOUT_POST_CONTRIBUTION_COMMENT
    contributionName: payload.messageDetails?.parent?.displayName,
    // message: used by ORGANIZATION_ADMIN_MENTIONED description
    message:
      payload.comment ??
      payload.messageDetails?.message ??
      payload.userMessage ??
      payload.spaceCommunicationMessage ??
      payload.organizationMessage,
    // spaceLevel: pre-translated via t() — used by SPACE_COLLABORATION_CALLOUT_PUBLISHED
    spaceLevel: payload.space?.level ? t(`common.space-level.${payload.space.level}`) : undefined,
    // calendarEvent fields
    eventTitle: payload.calendarEvent?.profile?.displayName,
    type: payload.calendarEvent?.type,
    // category: pre-translated — used by PLATFORM_FORUM_DISCUSSION_CREATED
    category: payload.discussion?.category
      ? t(
          `common.enums.discussion-category.${kebabToConstantCase(payload.discussion.category) as ForumDiscussionCategory}`
        )
      : undefined,
    // emoji: used by SPACE_COLLABORATION_CALLOUT_REACTION — slug resolved to glyph;
    // unknown slug yields undefined so the placeholder renders empty, never crashes
    emoji: payload.emoji ? glyphForSlug(payload.emoji) : undefined,
    // invitationRole: used by ORGANIZATION_ADMIN_SPACE_COMMUNITY_INVITATION — "Member" or
    // "Member + Lead", resolved from the offered extraRoles. Distinct from `role` above
    // (a raw platform-role string) to avoid colliding with PLATFORM_ADMIN_GLOBAL_ROLE_CHANGED.
    invitationRole: payload.invitation
      ? payload.invitation.extraRoles.includes(RoleName.Lead)
        ? `${t('member')} + ${t('lead')}`
        : t('member')
      : undefined,
    // spacesToJoin: used by ORGANIZATION_ADMIN_SPACE_COMMUNITY_INVITATION — an extra "also
    // joins: …" clause, only when accepting joins more than the target Space itself.
    spacesToJoin:
      payload.invitation && payload.invitation.spacesToJoinOnAccept.length > 1
        ? ` ${t('components.inAppNotifications.spacesToJoin', {
            spaces: payload.invitation.spacesToJoinOnAccept.map(s => s.profile.displayName).join(', '),
          })}`
        : '',
  };
}

/**
 * Per-type destination overrides, applied before the generic payload fallback below.
 *
 * The fallback takes the first URL the payload happens to carry, and almost every
 * space-scoped payload carries its space — so anything without a callout or a message
 * lands on the space home page. That is the wrong destination whenever the notification
 * is about an action to take elsewhere, or about an entity whose own URL the space
 * would shadow.
 *
 * A type absent from this map keeps the generic fallback; only add an entry when the
 * destination is unambiguous.
 */
const URL_OVERRIDES_BY_TYPE: Partial<
  Record<NotificationEvent, (payload: InAppNotificationPayloadModel) => string | undefined>
> = {
  // Applications are reviewed (approved/rejected) on the Community tab of the space
  // settings, so the space home page leaves the admin with nowhere to act.
  [NotificationEvent.SpaceAdminCommunityApplication]: payload =>
    buildSettingsTabUrl(payload.space?.about?.profile?.url, 'community'),
  // The subject of the notification is the contributor who joined, not the space.
  [NotificationEvent.SpaceAdminCommunityNewMember]: payload => payload.actor?.profile?.url,
  // Calendar payloads carry both the event and its space; the space must not win.
  [NotificationEvent.SpaceCommunityCalendarEventCreated]: payload => payload.calendarEvent?.profile?.url,
  [NotificationEvent.SpaceCommunityCalendarEventComment]: payload => payload.calendarEvent?.profile?.url,
  // The org admin acts from the org's own Invitations tab, not the space (061, contract §4).
  [NotificationEvent.OrganizationAdminSpaceCommunityInvitation]: payload =>
    buildSettingsTabUrl(payload.organization?.profile?.url, 'invitations'),
  // Accepted/declined land the inviting space admin on the Community tab, same as a new application.
  [NotificationEvent.SpaceAdminOrganizationCommunityInvitationAccepted]: payload =>
    buildSettingsTabUrl(payload.space?.about?.profile?.url, 'community'),
  [NotificationEvent.SpaceAdminOrganizationCommunityInvitationDeclined]: payload =>
    buildSettingsTabUrl(payload.space?.about?.profile?.url, 'community'),
};

/**
 * Resolves the URL that clicking a notification should navigate to.
 * Returns a pathname (not an absolute URL) for React Router compatibility.
 */
function resolveNotificationUrl(notification: InAppNotificationModel): string | undefined {
  const { payload } = notification;

  // An override that cannot build its URL (missing payload fields) falls through to the
  // generic chain rather than leaving the notification unclickable.
  const overrideUrl = URL_OVERRIDES_BY_TYPE[notification.type]?.(payload);
  if (overrideUrl) {
    return overrideUrl;
  }

  return (
    payload.messageDetails?.parent?.url ??
    payload.callout?.framing?.profile?.url ??
    payload.space?.about?.profile?.url ??
    payload.discussion?.url ??
    payload.calendarEvent?.profile?.url ??
    payload.user?.profile?.url ??
    payload.organization?.profile?.url
  );
}

/**
 * The profile shape the item's avatar needs. Both `triggeredBy.profile` and the optional
 * contributor profiles carried on the payload satisfy it.
 */
type NotificationAvatarProfile = {
  displayName: string;
  visual?: { uri?: string } | undefined;
};

/**
 * Per-type overrides for whose avatar the item shows.
 *
 * The avatar defaults to the user who triggered the notification, which is right for every
 * template that opens with `{{triggeredByName}}`. A few templates are worded about someone
 * else entirely, and for those the triggering user is not the subject — their avatar beside
 * another person's name reads as if the wrong person acted.
 *
 * A type absent from this map keeps `triggeredBy`, and so does an entry whose profile the
 * payload does not carry. Only add an entry where the template unambiguously names someone
 * other than the triggering user as its subject.
 */
const AVATAR_SUBJECT_BY_TYPE: Partial<
  Record<NotificationEvent, (payload: InAppNotificationPayloadModel) => NotificationAvatarProfile | undefined>
> = {
  // "<member> joined <space>" — the member is the payload actor, whereas the trigger is
  // whoever performed the join: on the invitation and admin-adds-a-member paths that is a
  // lead, not the new member.
  [NotificationEvent.SpaceAdminCommunityNewMember]: payload => payload.actor?.profile,
};

/** Resolves the profile whose avatar and initials the item renders. */
function resolveAvatarProfile(notification: InAppNotificationModel): NotificationAvatarProfile {
  return AVATAR_SUBJECT_BY_TYPE[notification.type]?.(notification.payload) ?? notification.triggeredBy.profile;
}

export function mapNotificationToItemData(
  notification: InAppNotificationModel,
  t: TFunction,
  unreadState: NotificationEventInAppState
): CrdNotificationItemData {
  const values = buildTranslationValues(notification, t);
  const avatarProfile = resolveAvatarProfile(notification);
  const typeKey = `components.inAppNotifications.type.${notification.type}`;
  const subjectKey = `${typeKey}.subject`;
  const descriptionKey = `${typeKey}.description`;

  const rawDescription = t(descriptionKey, '', values as Record<string, string>) as string;

  const { payload } = notification;
  const rawComment =
    payload.comment ??
    payload.messageDetails?.message ??
    payload.userMessage ??
    payload.spaceCommunicationMessage ??
    payload.organizationMessage;

  return {
    id: notification.id,
    // biome-ignore lint/suspicious/noExplicitAny: i18n key is built dynamically from notification type
    title: <Trans i18nKey={subjectKey as any} values={values} components={TRANS_COMPONENTS} />,
    description: rawDescription ? (
      // biome-ignore lint/suspicious/noExplicitAny: i18n key is built dynamically from notification type
      <Trans i18nKey={descriptionKey as any} values={values} components={TRANS_COMPONENTS} />
    ) : undefined,
    comment: rawComment ? <InlineMarkdown content={rawComment} clampLines={2} className="text-body" /> : undefined,
    avatarUrl: avatarProfile.visual?.uri,
    avatarFallback: getInitials(avatarProfile.displayName),
    timestamp: formatTimeElapsed(notification.triggeredAt, t),
    isUnread: notification.state === unreadState,
    href: resolveNotificationUrl(notification),
  };
}

export function mapNotificationsToItemDataList(
  notifications: InAppNotificationModel[],
  t: TFunction,
  unreadState: NotificationEventInAppState
): CrdNotificationItemData[] {
  return notifications.map(n => mapNotificationToItemData(n, t, unreadState));
}

/**
 * Maps InAppNotificationModel → CrdNotificationItemData for the CRD NotificationsPanel.
 *
 * Translation keys: notification type strings (subject/description templates) live in the
 * main 'translation' namespace at `components.inAppNotifications.type.<TYPE>` in
 * src/core/i18n/en/translation.en.json. They are shared with the MUI InAppNotificationsDialog.
 * TODO: Move to 'crd-notifications' namespace once the MUI dialog is removed.
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
import type { ForumDiscussionCategory, NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import { kebabToConstantCase } from '@/core/utils/string';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import type { CrdNotificationItemData } from '@/crd/layouts/types';
import { getInitials } from '@/crd/lib/getInitials';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import type { InAppNotificationModel } from '@/main/inAppNotifications/model/InAppNotificationModel';

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
 * Values must match the placeholders in src/core/i18n/en/translation.en.json
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
    userEmail: payload.userEmail,
    userDisplayName: payload.userDisplayName,
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
  };
}

/**
 * Resolves the URL that clicking a notification should navigate to.
 * Returns a pathname (not an absolute URL) for React Router compatibility.
 */
function resolveNotificationUrl(notification: InAppNotificationModel): string | undefined {
  const { payload } = notification;

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

export function mapNotificationToItemData(
  notification: InAppNotificationModel,
  t: TFunction,
  unreadState: NotificationEventInAppState
): CrdNotificationItemData {
  const values = buildTranslationValues(notification, t);
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
    comment: rawComment ? <InlineMarkdown content={rawComment} clampLines={2} /> : undefined,
    avatarUrl: notification.triggeredBy.profile.visual?.uri,
    avatarFallback: getInitials(notification.triggeredBy.profile.displayName),
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

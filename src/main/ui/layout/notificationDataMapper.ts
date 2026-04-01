import type { TFunction } from 'i18next';
import type { NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import type { CrdNotificationItemData } from '@/crd/layouts/types';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import type { InAppNotificationModel } from '@/main/inAppNotifications/model/InAppNotificationModel';

function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0]?.[0] ?? '').toUpperCase();
}

/**
 * Builds the interpolation values for notification i18n keys.
 * Each notification type uses a subset of these values in its translation template.
 */
function buildTranslationValues(notification: InAppNotificationModel): Record<string, string | undefined> {
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
    calendarEventName: payload.calendarEvent?.profile?.displayName,
    role: payload.role,
    userEmail: payload.userEmail,
    userDisplayName: payload.userDisplayName,
  };
}

/**
 * Resolves the URL that clicking a notification should navigate to.
 */
function resolveNotificationUrl(notification: InAppNotificationModel): string | undefined {
  const { payload } = notification;

  // Message details have a parent URL (the room/thread)
  if (payload.messageDetails?.parent?.url) {
    return payload.messageDetails.parent.url;
  }
  // Callout URL
  if (payload.callout?.framing?.profile?.url) {
    return payload.callout.framing.profile.url;
  }
  // Space URL
  if (payload.space?.about?.profile?.url) {
    return payload.space.about.profile.url;
  }
  // Discussion URL
  if (payload.discussion?.url) {
    return payload.discussion.url;
  }
  // Calendar event URL
  if (payload.calendarEvent?.profile?.url) {
    return payload.calendarEvent.profile.url;
  }
  // User/actor profile URL
  if (payload.user?.profile?.url) {
    return payload.user.profile.url;
  }
  // Organization URL
  if (payload.organization?.profile?.url) {
    return payload.organization.profile.url;
  }

  return undefined;
}

export function mapNotificationToItemData(
  notification: InAppNotificationModel,
  t: TFunction,
  unreadState: NotificationEventInAppState
): CrdNotificationItemData {
  const values = buildTranslationValues(notification);
  const typeKey = `components.inAppNotifications.type.${notification.type}`;

  return {
    id: notification.id,
    title: t(`${typeKey}.subject` as unknown as TemplateStringsArray, values as Record<string, string>),
    description: t(`${typeKey}.description` as unknown as TemplateStringsArray, values as Record<string, string>),
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

/**
 * User Notifications tab — view contracts.
 * See data-model.md "User Story 5" for field-level details.
 */

import type { LucideIcon } from 'lucide-react';

/** A single channel toggle (inApp / email / push). `null` when push is hidden for this row. */
export type NotificationChannel = {
  value: boolean;
  saving: boolean;
} | null;

export type NotificationRow = {
  /** Stable key for diffing. Composed of `${groupId}.${propertyId}`. */
  key: string;
  propertyLabel: string; // i18n-resolved
  /** Three switches; push is `null` when push is unavailable for this row. */
  channels: {
    inApp: NotificationChannel;
    email: NotificationChannel;
    push: NotificationChannel;
  };
  onToggle: (channel: 'inApp' | 'email' | 'push', next: boolean) => void;
};

export type NotificationGroupCardProps = {
  groupId:
    | 'space'
    | 'space.admin'
    | 'user'
    | 'platform'
    | 'platform.admin'
    | 'organization'
    | 'virtualContributor';
  title: string; // i18n
  icon: LucideIcon;
  rows: NotificationRow[];
};

export type PushAvailability =
  | { available: true; onSubscribe: () => Promise<void>; onUnsubscribe: () => Promise<void>; subscribed: boolean }
  | { available: false; reasonI18nKey: string };

export type PushSubscriptionItem = {
  id: string;
  displayName: string;
  lastUsedAt: string; // formatted
  isCurrentDevice: boolean;
  onRemove: () => void;
};

export type PushSubscriptionsListCardProps = {
  title: string; // i18n
  items: PushSubscriptionItem[];
  emptyStateLabel: string; // i18n
};

export type UserNotificationsViewProps = {
  pushAvailability: PushAvailability;
  /** Only rendered when push is available. */
  pushSubscriptionsList?: PushSubscriptionsListCardProps;
  /** Privilege-gated groups are simply omitted from this list. */
  groups: NotificationGroupCardProps[];
  loading: boolean;
};

/**
 * CRD Notifications tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/tabs/NotificationsView.tsx
 *   src/crd/components/user/settings/tabs/NotificationGroupCard.tsx
 *   src/crd/components/user/settings/tabs/NotificationRow.tsx
 *   src/crd/components/user/settings/tabs/PushSubscriptionsListCard.tsx
 *   src/crd/components/user/settings/tabs/PushAvailabilityBanner.tsx
 *
 * Optimistic-overrides pattern (research §8) is implemented by the integration
 * layer; the views see only the resolved `value` and a `saving` flag per
 * toggle.
 */

export type PushUnavailableReason =
  | 'unsupported'
  | 'requiresPWA'
  | 'privateBrowsing'
  | 'serverDisabled';

export type PushAvailability =
  | { available: true;  master: NotificationToggle }
  | { available: false; reason: PushUnavailableReason };

export type NotificationToggle = {
  value: boolean;
  saving: boolean;
  onToggle: (next: boolean) => Promise<void>;
};

export type PushSubscriptionItem = {
  id: string;
  /** Device / browser display name. */
  displayName: string;
  /** ISO date string; null when unknown. */
  lastUsedAt: string | null;
  isCurrentDevice: boolean;
  removing: boolean;
  onRemove: () => Promise<void>;
};

export type NotificationGroupKey =
  | 'space'
  | 'spaceAdmin'
  | 'user'
  | 'platform'
  | 'platformAdmin'
  | 'organization'
  | 'virtualContributor';

export type NotificationRow = {
  /** i18n key for the row label, e.g., `notifications.user.commentReply`. */
  propertyI18nKey: string;
  inApp: NotificationToggle;
  email: NotificationToggle;
  /** null when the push column is hidden because push is unavailable. */
  push: NotificationToggle | null;
};

export type NotificationGroup = {
  key: NotificationGroupKey;
  /** i18n key for the group title. */
  titleI18nKey: string;
  rows: NotificationRow[];
};

export type NotificationsViewProps = {
  pushAvailability: PushAvailability;
  pushSubscriptions: PushSubscriptionItem[];
  /** Privilege-gated; hidden groups simply omit from the array. */
  groups: NotificationGroup[];
  /** i18n labels for column headers ("In-App" / "Email" / "Push"). */
  labels: {
    columnInApp: string;
    columnEmail: string;
    columnPush: string;
    pushUnavailableTitle: string;
    pushUnavailableBody: Record<PushUnavailableReason, string>;
  };
};

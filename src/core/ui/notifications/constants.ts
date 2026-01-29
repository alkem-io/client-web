import type { Severity } from '@/core/state/global/notifications/notificationMachine';

const NOTIFICATION_AUTO_HIDE_DURATIONS: Record<Severity, number> = {
  error: 15000,
  success: 3000,
  info: 3000,
  warning: 3000,
};

export const getNotificationAutoHideDuration = (severity: Severity): number => {
  return NOTIFICATION_AUTO_HIDE_DURATIONS[severity];
};

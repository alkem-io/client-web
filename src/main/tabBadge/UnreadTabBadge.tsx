import { useUnreadTabBadge } from './useUnreadTabBadge';

/**
 * Always-mounted, render-null host for the tab unread indicator (US5).
 * Mounted in `root.tsx` under the messaging provider so the unread count is
 * available session-wide, panel open or closed.
 */
export const UnreadTabBadge = () => {
  useUnreadTabBadge();
  return null;
};

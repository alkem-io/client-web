/**
 * Pure predicate for the non-chat notification sound (US2 / FR-002).
 *
 * Plays only on a strict increase of the unread-notifications count, and never
 * on the first observed value. The count is not monotonic — it drops when
 * notifications are read — so a plain "changed" check would sound on decreases;
 * and skipping the first value (no previous count) avoids a spurious sound on
 * page load.
 */
export const shouldPlayNotificationSound = (
  previousCount: number | null,
  nextCount: number,
  enabled: boolean
): boolean => enabled && previousCount !== null && nextCount > previousCount;

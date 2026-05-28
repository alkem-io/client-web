import { useLatestUserEmailChangeAuditEntryQuery } from '@/core/apollo/generated/apollo-hooks';

export type DriftStateView = {
  isDrifted: boolean;
  oldEmail: string | undefined;
  newEmail: string | undefined;
};

type LatestEmailChangeEntry =
  | {
      outcome: string;
      oldEmail?: string | undefined;
      newEmail?: string | undefined;
    }
  | null
  | undefined;

const DRIFTED_OUTCOMES = ['DRIFT_DETECTED', 'DRIFT_RESOLUTION_FAILED'];

/**
 * A user is "in drift" when their most recent audit entry is a detected drift or a
 * failed resolution attempt — a failed resolution leaves the account drifted.
 */
export const deriveDriftState = (latestEntry: LatestEmailChangeEntry): DriftStateView => {
  if (latestEntry && DRIFTED_OUTCOMES.includes(latestEntry.outcome)) {
    return { isDrifted: true, oldEmail: latestEntry.oldEmail, newEmail: latestEntry.newEmail };
  }
  return { isDrifted: false, oldEmail: undefined, newEmail: undefined };
};

const useLatestUserEmailChangeOutcome = (userId: string, options?: { skip?: boolean }): DriftStateView => {
  const { data } = useLatestUserEmailChangeAuditEntryQuery({
    variables: { userID: userId },
    skip: options?.skip,
  });

  return deriveDriftState(data?.platformAdmin.latestUserEmailChangeAuditEntry);
};

export default useLatestUserEmailChangeOutcome;

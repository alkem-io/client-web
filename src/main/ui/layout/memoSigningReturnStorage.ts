export const MEMO_SIGNING_RETURN_STORAGE_PREFIX = 'alkemio.memo-signing-return.v1:';

const MEMO_SIGNING_RETURN_VERSION = 1;
const MEMO_SIGNING_RETURN_TTL_MS = 30 * 60 * 1000;

export type MemoSigningOrigin = {
  userId: string;
  memoId: string;
  kind: 'framing' | 'contribution';
  calloutId: string;
  contributionId?: string;
};

export type MemoSigningReturnRecord = MemoSigningOrigin & {
  version: 1;
  expiresAt: number;
  attemptId: string;
};

const storageKey = (attemptId: string) => `${MEMO_SIGNING_RETURN_STORAGE_PREFIX}${attemptId}`;

export function writeMemoSigningReturnRecord(attemptId: string, origin: MemoSigningOrigin): void {
  const record: MemoSigningReturnRecord = {
    version: MEMO_SIGNING_RETURN_VERSION,
    expiresAt: Date.now() + MEMO_SIGNING_RETURN_TTL_MS,
    attemptId,
    ...origin,
  };

  try {
    window.sessionStorage.setItem(storageKey(attemptId), JSON.stringify(record));
  } catch {
    // Signing must still continue when tab storage is unavailable.
  }
}

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const isMemoSigningReturnRecord = (
  value: unknown,
  attemptId: string,
  now: number
): value is MemoSigningReturnRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<MemoSigningReturnRecord>;

  return (
    record.version === MEMO_SIGNING_RETURN_VERSION &&
    record.attemptId === attemptId &&
    typeof record.expiresAt === 'number' &&
    record.expiresAt > now &&
    record.expiresAt <= now + MEMO_SIGNING_RETURN_TTL_MS &&
    isNonEmptyString(record.userId) &&
    isNonEmptyString(record.memoId) &&
    (record.kind === 'framing' || record.kind === 'contribution') &&
    isNonEmptyString(record.calloutId) &&
    (record.kind === 'contribution' ? isNonEmptyString(record.contributionId) : record.contributionId === undefined)
  );
};

export function takeMemoSigningReturnRecord(attemptId: string, now = Date.now()): MemoSigningReturnRecord | undefined {
  try {
    const key = storageKey(attemptId);
    const serialized = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    if (!serialized) return undefined;

    const parsed: unknown = JSON.parse(serialized);
    return isMemoSigningReturnRecord(parsed, attemptId, now) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

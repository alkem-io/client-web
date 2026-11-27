import { stopActiveSession } from './activeSession';
import { announceSignedOut, localpartOf, withCredentialLock } from './sharedDevice';
import { type CredentialRecord, clearNamespace, listStoredUserIds, loadCredentials } from './storage';

const LOGOUT_TIMEOUT_MS = 3000;

const serverSideLogout = async (record: CredentialRecord): Promise<void> => {
  const attempt = new AbortController();
  const expire = setTimeout(() => attempt.abort(), LOGOUT_TIMEOUT_MS);
  try {
    await fetch(`${record.homeserverUrl}/_matrix/client/v3/logout`, {
      method: 'POST',
      signal: attempt.signal,
      credentials: 'omit',
      headers: { Authorization: `Bearer ${record.accessToken}` },
    });
  } catch {
    // Best effort: an unreachable homeserver must not block sign-out.
  } finally {
    clearTimeout(expire);
  }
};

/**
 * The full Alkemio sign-out hook: stop this tab's session, if any, tell every
 * other tab to stop theirs, then clear every stored Matrix namespace and log
 * each cleared device out on the homeserver, best effort and capped at
 * LOGOUT_TIMEOUT_MS. Runs before the logout navigation proceeds, and also when
 * the Alkemio session is found gone. The clearing does not depend on a live
 * session: a sign-out page loaded directly runs before any session has
 * registered, yet the credentials an earlier page load stored are still on disk.
 *
 * Each stored namespace is cleared under its credential lock, so a tab
 * renewing or replacing that user's credential at that moment finishes first
 * and its write is cleared too. A credential stored for a user with nothing
 * stored when the sign-out began is not covered. The other tabs are told
 * first, which ends their acquisitions and so releases the lock; one not
 * granted within LOGOUT_TIMEOUT_MS is not waited for.
 */
const runMatrixLogoutCleanup = async (): Promise<void> => {
  stopActiveSession();
  const userIds = await listStoredUserIds();
  const stored = await Promise.all(userIds.map(loadCredentials));
  announceSignedOut(stored.flatMap(record => (record ? [record.deviceId] : [])));
  const records: CredentialRecord[] = [];
  for (const userId of userIds) {
    await withCredentialLock(
      localpartOf(userId),
      async () => {
        const record = await loadCredentials(userId);
        // A storage failure must not block sign-out.
        await clearNamespace(userId).catch(() => undefined);
        if (record) {
          records.push(record);
        }
      },
      LOGOUT_TIMEOUT_MS
    );
  }
  await Promise.all(records.map(serverSideLogout));
};

export { runMatrixLogoutCleanup, serverSideLogout };

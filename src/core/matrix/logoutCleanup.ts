import { stopActiveSession } from './activeSession';
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
 * The full Alkemio sign-out hook: stop this tab's session, if any, then clear
 * every stored Matrix namespace and log each cleared device out on the
 * homeserver, best effort and capped at LOGOUT_TIMEOUT_MS. Runs before the
 * logout navigation proceeds, and also when the Alkemio session is found gone.
 * The clearing does not depend on a live session: a sign-out page loaded
 * directly runs before any session has registered, yet the credentials an
 * earlier page load stored are still on disk.
 */
const runMatrixLogoutCleanup = async (): Promise<void> => {
  stopActiveSession();
  const records: CredentialRecord[] = [];
  for (const userId of await listStoredUserIds()) {
    const record = await loadCredentials(userId);
    // A storage failure must not block sign-out.
    await clearNamespace(userId).catch(() => undefined);
    if (record) {
      records.push(record);
    }
  }
  await Promise.all(records.map(serverSideLogout));
};

export { runMatrixLogoutCleanup };

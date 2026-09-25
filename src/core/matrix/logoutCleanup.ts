import { resetMessagingActivation, stopActiveSession } from './activeSession';
import { broadcastProfileSignOut } from './multiTab';
import { clearNamespace, listStoredUserIds, loadCredentials } from './storage';

/**
 * The single bound shared with the server side: server-side invalidation is best-effort for this long, then abandoned.
 * Local credential removal is not subject to it — it always completes.
 */
const LOGOUT_TIMEOUT_MS = 3000;

type CleanupOptions = {
  readonly timeoutMs?: number;
};

const serverSideLogout = async (homeserverUrl: string, accessToken: string, timeoutMs: number): Promise<void> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetch(`${homeserverUrl}/_matrix/client/v3/logout`, {
        method: 'POST',
        credentials: 'omit',
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    // Best-effort: an unreachable Synapse never blocks sign-out. The orphaned
    // device dies at its server-side expiry bound (documented residual).
  }
};

const broadcastLogout = (userId: string): void => {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  try {
    const channel = new BroadcastChannel(`alkemio-matrix-${userId}`);
    channel.postMessage({ type: 'logout' });
    channel.close();
  } catch {
    // Fan-out is opportunistic; a follower tab also fails closed on its own.
  }
};

/**
 * Sign-out for one Matrix user: bounded server-side device invalidation,
 * unconditional local namespace removal, cross-tab logout fan-out — in that
 * order. Never throws. Also the user-switch cleanup.
 */
const cleanupMatrixUser = async (userId: string, options: CleanupOptions = {}): Promise<void> => {
  const timeoutMs = options.timeoutMs ?? LOGOUT_TIMEOUT_MS;
  try {
    const { record } = await loadCredentials(userId);
    if (record) {
      await serverSideLogout(record.homeserverUrl, record.accessToken, timeoutMs);
    }
    await clearNamespace(userId);
  } catch {
    // Unconditional-removal promise: storage failure must not block sign-out.
  }
  broadcastLogout(userId);
};

/**
 * The full Alkemio sign-out hook: stop every tab's session, then clean every
 * stored Matrix identity in this profile. Runs before the logout navigation
 * proceeds. Deliberately not gated by the flag: credentials stored while it
 * was on must not survive a sign-out after it is switched off. With nothing
 * stored it only lists the databases — no network, no writes.
 */
const runMatrixLogoutCleanup = async (options: CleanupOptions = {}): Promise<void> => {
  broadcastProfileSignOut();
  const releaseSyncLock = stopActiveSession();
  resetMessagingActivation();
  try {
    const userIds = await listStoredUserIds();
    for (const userId of userIds) {
      await cleanupMatrixUser(userId, options);
    }
  } finally {
    // Only now may a follower tab be promoted: the logout fan-out has already
    // stopped it, and the credentials it would have resumed from are gone.
    releaseSyncLock();
  }
};

export { cleanupMatrixUser, runMatrixLogoutCleanup, LOGOUT_TIMEOUT_MS };

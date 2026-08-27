import { stopActiveSession } from './activeSession';
import { getConfig } from './matrixConfig';
import { clearNamespace, listStoredUserIds, loadCredentials } from './storage';

/**
 * The single bound both the contract (auth-session §4) and spec FR-005 fix:
 * server-side invalidation is best-effort for this long, then abandoned.
 * Local credential removal is not subject to it — it always completes.
 */
const LOGOUT_TIMEOUT_MS = 3000;

interface CleanupOptions {
  readonly timeoutMs?: number;
}

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
 * Contract §4 for one Matrix user: bounded server-side device invalidation,
 * unconditional local namespace removal, cross-tab logout fan-out — in that
 * order. Never throws. Also the user-switch cleanup (FR-006).
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
 * The full Alkemio sign-out hook (contract §4): stop the running client, then
 * clean every stored Matrix identity in this profile. Runs before the logout
 * navigation proceeds; flag off ⇒ complete no-op (storage untouched).
 */
const runMatrixLogoutCleanup = async (options: CleanupOptions = {}): Promise<void> => {
  if (!getConfig().enabled) {
    return;
  }
  stopActiveSession();
  const userIds = await listStoredUserIds();
  for (const userId of userIds) {
    await cleanupMatrixUser(userId, options);
  }
};

export { cleanupMatrixUser, runMatrixLogoutCleanup, LOGOUT_TIMEOUT_MS };

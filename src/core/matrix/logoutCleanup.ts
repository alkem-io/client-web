import { stopActiveSession } from './activeSession';
import { clearNamespace, listStoredUserIds } from './storage';

/**
 * Sign-out for one Matrix user: unconditional local namespace removal. Never
 * throws. Also the user-switch cleanup.
 */
const cleanupMatrixUser = async (userId: string): Promise<void> => {
  try {
    await clearNamespace(userId);
  } catch {
    // Unconditional-removal promise: storage failure must not block sign-out.
  }
};

/**
 * The full Alkemio sign-out hook: stop this tab's session, then clean its
 * stored Matrix identity. Runs before the logout navigation proceeds. Skips
 * all storage work when no session was ever established in this tab, so a
 * user who never opened messaging pays no IndexedDB cost on sign-out.
 */
const runMatrixLogoutCleanup = async (): Promise<void> => {
  if (!stopActiveSession()) {
    return;
  }
  const userIds = await listStoredUserIds();
  for (const userId of userIds) {
    await cleanupMatrixUser(userId);
  }
};

export { cleanupMatrixUser, runMatrixLogoutCleanup };

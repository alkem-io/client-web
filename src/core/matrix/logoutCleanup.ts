import { stopActiveSession } from './activeSession';
import { clearNamespace, listStoredUserIds } from './storage';

/**
 * The full Alkemio sign-out hook: stop this tab's session, then clear every
 * stored Matrix namespace. Runs before the logout navigation proceeds. Skips
 * all storage work when no session was ever established in this tab, so a
 * user who never opened messaging pays no IndexedDB cost on sign-out.
 */
const runMatrixLogoutCleanup = async (): Promise<void> => {
  if (!stopActiveSession()) {
    return;
  }
  for (const userId of await listStoredUserIds()) {
    // Unconditional-removal promise: storage failure must not block sign-out.
    await clearNamespace(userId).catch(() => undefined);
  }
};

export { runMatrixLogoutCleanup };

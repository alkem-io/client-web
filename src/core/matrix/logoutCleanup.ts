import { stopActiveSession } from './activeSession';
import { clearNamespace, listStoredUserIds } from './storage';

/**
 * The full Alkemio sign-out hook: stop this tab's session, if any, then clear
 * every stored Matrix namespace. Runs before the logout navigation proceeds.
 * The clearing does not depend on a live session: a sign-out page loaded
 * directly runs before any session has registered, yet the credentials an
 * earlier page load stored are still on disk.
 */
const runMatrixLogoutCleanup = async (): Promise<void> => {
  stopActiveSession();
  for (const userId of await listStoredUserIds()) {
    // A storage failure must not block sign-out.
    await clearNamespace(userId).catch(() => undefined);
  }
};

export { runMatrixLogoutCleanup };

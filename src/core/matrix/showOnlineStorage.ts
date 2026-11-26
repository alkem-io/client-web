/**
 * Browser-side copy of the user's "Show when I'm online" chat setting.
 *
 * The Matrix account data `io.alkemio.chat.presence` is the source of truth. The
 * copy exists only because the first sync of a session starts before account
 * data has arrived: the session controller starts that sync offline unless the
 * copy says on, so a browser that does not know the setting never shows a
 * hidden user as online.
 *
 * Namespaced per Matrix user because localStorage is shared by everyone using
 * the browser profile. Never throws: a missing or unreadable copy reads as not on.
 */
const storageKey = (matrixUserId: string) => `chatShowOnline:${matrixUserId}`;

export const readStoredShowOnline = (matrixUserId: string): boolean => {
  try {
    return localStorage.getItem(storageKey(matrixUserId)) === 'true';
  } catch {
    return false;
  }
};

export const writeStoredShowOnline = (matrixUserId: string, showOnline: boolean) => {
  try {
    localStorage.setItem(storageKey(matrixUserId), String(showOnline));
  } catch {
    // Private mode or a full quota: the next start syncs offline until the first sync is done.
  }
};

/**
 * Browser-side copy of the user's "Show when I'm online" chat setting.
 *
 * The Matrix account data `io.alkemio.chat.presence` is the source of truth. The
 * copy exists only because the first sync of a session starts before account
 * data has arrived: the session controller reads it to start that sync offline.
 *
 * Namespaced per Matrix user because localStorage is shared by everyone using
 * the browser profile. Never throws: unreadable storage reads as on.
 */
const storageKey = (matrixUserId: string) => `chatShowOnline:${matrixUserId}`;

export const readStoredShowOnline = (matrixUserId: string): boolean => {
  try {
    return localStorage.getItem(storageKey(matrixUserId)) !== 'false';
  } catch {
    return true;
  }
};

export const writeStoredShowOnline = (matrixUserId: string, showOnline: boolean) => {
  try {
    localStorage.setItem(storageKey(matrixUserId), String(showOnline));
  } catch {
    // Private mode or a full quota: the next start syncs online until account data arrives.
  }
};

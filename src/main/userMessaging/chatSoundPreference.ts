/**
 * Browser-side copy of the user's "play a sound when a chat message is
 * received" setting, shared by every open tab of the same browser profile.
 *
 * The saved user setting stays the source of truth: each tab copies it here
 * when it loads and whenever it sees it change. The copy exists so a change
 * made in one tab reaches the others at once, through the `storage` event,
 * without a reload or a refetch.
 *
 * Namespaced per user because localStorage is shared by everyone using the
 * browser profile.
 */
export const chatSoundStorageKey = (userId: string) => `chatSoundEnabled:${userId}`;

const listeners = new Set<() => void>();

/** Never throws: unreadable, disabled or unexpected storage reads as "nothing stored". */
export const readStoredChatSound = (userId: string): boolean | undefined => {
  try {
    const raw = localStorage.getItem(chatSoundStorageKey(userId));
    return raw === 'true' ? true : raw === 'false' ? false : undefined;
  } catch {
    return undefined;
  }
};

/** Never throws: with storage unavailable the saved user setting alone decides. */
export const writeStoredChatSound = (userId: string, enabled: boolean) => {
  try {
    localStorage.setItem(chatSoundStorageKey(userId), String(enabled));
  } catch {
    // Private mode or a full quota.
  }
  // The `storage` event only reaches the other tabs, so this tab is told here.
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeToStoredChatSound = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

// The saved setting this tab last copied to storage, per user. Kept outside React so a
// remounting reader does not copy a value it already copied: a tab whose cached setting is
// older than another tab's change would otherwise overwrite that change on every remount.
const lastCopiedSetting = new Map<string, boolean>();

/** Copies the saved user setting to storage when this tab first sees it, and whenever it changes. */
export const copySavedChatSoundToStorage = (userId: string, savedEnabled: boolean) => {
  if (lastCopiedSetting.get(userId) === savedEnabled) {
    return;
  }
  lastCopiedSetting.set(userId, savedEnabled);
  writeStoredChatSound(userId, savedEnabled);
};

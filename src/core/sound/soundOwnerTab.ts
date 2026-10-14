/**
 * Picks the one tab of this origin that plays a sound for an event every tab
 * receives: the tab the user saw last (shown or focused most recently). It
 * stays the owner while the user is in another application, so the cue still
 * alerts them, and the other tabs stay silent.
 *
 * Without this, every open tab plays the cue. Browsers hold back playback in a
 * tab that has never been shown and start it when the user switches to that
 * tab, so a cue from a background tab is heard again on every tab switch.
 *
 * The owner is recorded in localStorage, shared by all tabs of the origin and
 * read synchronously when the cue is due. When storage is unavailable, or no
 * owner is recorded (the owner closed), a tab plays only if it has been shown
 * at least once: possibly more than one tab then, but never a held-back play.
 */

const OWNER_KEY = 'alkemio.sound.ownerTab';

type SoundOwnerTabEnvironment = {
  doc: EventTarget & { readonly visibilityState: DocumentVisibilityState };
  win: EventTarget;
  storage: () => Storage;
};

export type SoundOwnerTab = {
  isOwner: () => boolean;
  stop: () => void;
};

const newTabId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const createSoundOwnerTab = ({ doc, win, storage }: SoundOwnerTabEnvironment): SoundOwnerTab => {
  const tabId = newTabId();
  let hasBeenShown = false;

  const claim = () => {
    hasBeenShown = true;
    try {
      storage().setItem(OWNER_KEY, tabId);
    } catch {
      // Storage unavailable: isOwner falls back to hasBeenShown.
    }
  };

  const release = () => {
    try {
      // Only this tab's own claim: a tab shown after it may already own.
      if (storage().getItem(OWNER_KEY) === tabId) {
        storage().removeItem(OWNER_KEY);
      }
    } catch {
      // Nothing recorded to release.
    }
  };

  const onVisibilityChange = () => {
    if (doc.visibilityState === 'visible') {
      claim();
    }
  };

  doc.addEventListener('visibilitychange', onVisibilityChange);
  win.addEventListener('focus', claim);
  win.addEventListener('pagehide', release);
  onVisibilityChange();

  return {
    isOwner: () => {
      try {
        const owner = storage().getItem(OWNER_KEY);
        if (owner !== null) {
          return owner === tabId;
        }
      } catch {
        // Fall through to the local signal.
      }
      return hasBeenShown;
    },
    stop: () => {
      doc.removeEventListener('visibilitychange', onVisibilityChange);
      win.removeEventListener('focus', claim);
      win.removeEventListener('pagehide', release);
      release();
    },
  };
};

/** The sound owner for this browser tab. */
export const createBrowserSoundOwnerTab = (): SoundOwnerTab =>
  createSoundOwnerTab({ doc: document, win: window, storage: () => window.localStorage });

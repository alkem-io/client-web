/**
 * Persistence for unsent chat message drafts (issue #9988).
 *
 * Drafts are written as the user types rather than on unmount: navigating away
 * from a CRD page is a real document navigation, so React unmount effects never
 * run and anything held only in memory is gone before it can be saved.
 *
 * One localStorage entry holds every draft:
 *   messagingDrafts = { [userId]: { [conversationId]: draft } }
 *
 * Namespaced per user because localStorage is shared by everyone using the
 * browser profile, and dropped wholesale on logout — drafts are private message
 * content and must not outlive the session.
 */
export const MESSAGING_DRAFTS_STORAGE_KEY = 'messagingDrafts';

export type MessagingDraftsByUser = Record<string, Record<string, string>>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Never throws: unreadable, disabled or malformed storage reads as "no drafts".
 * Whitespace-only entries are dropped on the way in, so a stored blank can never
 * surface as a draft in the conversation list.
 */
export const readMessagingDrafts = (): MessagingDraftsByUser => {
  try {
    const raw = localStorage.getItem(MESSAGING_DRAFTS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) {
      return {};
    }

    const result: MessagingDraftsByUser = {};
    for (const [userId, userDrafts] of Object.entries(parsed)) {
      if (!isPlainObject(userDrafts)) {
        continue;
      }

      const kept: Record<string, string> = {};
      for (const [conversationId, draft] of Object.entries(userDrafts)) {
        if (typeof draft === 'string' && draft.trim().length > 0) {
          kept[conversationId] = draft;
        }
      }

      if (Object.keys(kept).length > 0) {
        result[userId] = kept;
      }
    }
    return result;
  } catch {
    return {};
  }
};

/**
 * Throws when storage rejects the write (QuotaExceededError, storage disabled)
 * so the caller can report it — the draft is then simply not persisted.
 */
export const writeMessagingDrafts = (drafts: MessagingDraftsByUser) => {
  if (Object.keys(drafts).length === 0) {
    localStorage.removeItem(MESSAGING_DRAFTS_STORAGE_KEY);
    return;
  }

  localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
};

/** Drops every user's drafts. Called on logout. */
export const clearMessagingDrafts = () => {
  try {
    localStorage.removeItem(MESSAGING_DRAFTS_STORAGE_KEY);
  } catch {
    // Storage unavailable — then nothing was persisted to begin with.
  }
};

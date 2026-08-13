import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useApm } from '@/core/analytics/apm/context/useApm';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { readMessagingDrafts, writeMessagingDrafts } from './messagingDrafts';

/** Typing writes through to localStorage this long after the last keystroke. */
const PERSIST_DEBOUNCE_MS = 500;

type ConversationDraftsContextProps = {
  /** Conversation id → draft text. Feeds the "Draft:" preview in the list. */
  drafts: Record<string, string>;
  /** The draft for one conversation, `''` when there is none. */
  getDraft: (conversationId: string) => string;
  setDraft: (conversationId: string, value: string) => void;
  /** Called once a message actually reached the server — never on a failed send. */
  clearDraft: (conversationId: string) => void;
};

const ConversationDraftsContext = createContext<ConversationDraftsContextProps>({
  drafts: {},
  getDraft: () => '',
  setDraft: () => {},
  clearDraft: () => {},
});

/**
 * Keeps unsent chat drafts for the current user (issue #9988). State lives here
 * rather than in the composer so the draft survives the composer unmounting
 * (panel closed, back to the conversation list) and so the conversation list can
 * render a "Draft:" preview; localStorage behind it carries the draft across the
 * full page load that CRD in-app navigation performs.
 */
export const ConversationDraftsProvider = ({ children }: { children: ReactNode }) => {
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;
  const apm = useApm();

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const hydratedUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId || hydratedUserIdRef.current === userId) {
      return;
    }
    hydratedUserIdRef.current = userId;
    setDrafts(readMessagingDrafts()[userId] ?? {});
  }, [userId]);

  const pendingRef = useRef<Record<string, string> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = () => {
    const pending = pendingRef.current;
    if (!pending || !userId) {
      return;
    }

    pendingRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Re-read before writing so a second tab (or another user of this browser
      // profile) doesn't get its entry clobbered by our stale snapshot.
      const stored = readMessagingDrafts();
      if (Object.keys(pending).length === 0) {
        delete stored[userId];
      } else {
        stored[userId] = pending;
      }
      writeMessagingDrafts(stored);
    } catch (error) {
      // Quota exhausted or storage disabled: the draft stays in memory for this
      // session and is simply not persisted. Report it rather than fail silently.
      apm?.captureError(error as Error);
    }
  };

  // The unload listeners are registered once, so they reach the current `flush`
  // (which closes over `userId` and `apm`) through a ref.
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    const handlePageHide = () => flushRef.current();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushRef.current();
      }
    };

    // `pagehide` covers navigating away and closing the tab; `visibilitychange`
    // covers mobile backgrounding, where `pagehide` is not guaranteed. Between
    // them the last debounced keystrokes are never lost.
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushRef.current();
    };
  }, []);

  const schedulePersist = (next: Record<string, string>) => {
    pendingRef.current = next;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      flushRef.current();
    }, PERSIST_DEBOUNCE_MS);
  };

  const setDraft = (conversationId: string, value: string) => {
    if (!userId) {
      return;
    }

    const next = { ...drafts };
    // A whitespace-only composer is not a draft — drop the entry entirely so it
    // never shows up as an empty "Draft:" row.
    if (value.trim().length === 0) {
      delete next[conversationId];
    } else {
      next[conversationId] = value;
    }

    setDrafts(next);
    schedulePersist(next);
  };

  const clearDraft = (conversationId: string) => {
    if (!userId || !(conversationId in drafts)) {
      return;
    }

    const next = { ...drafts };
    delete next[conversationId];
    setDrafts(next);

    // Persist immediately: a pending debounce from the last keystroke would
    // otherwise write the just-sent text back.
    pendingRef.current = next;
    flush();
  };

  const getDraft = (conversationId: string) => drafts[conversationId] ?? '';

  return (
    <ConversationDraftsContext value={{ drafts, getDraft, setDraft, clearDraft }}>{children}</ConversationDraftsContext>
  );
};

export const useConversationDrafts = () => useContext(ConversationDraftsContext);

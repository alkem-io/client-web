import { useEffect, useState } from 'react';

const readIsDocumentActive = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.visibilityState === 'visible' && document.hasFocus();
};

/**
 * Reactive "the user is genuinely present in this tab" signal — the document is
 * both VISIBLE and FOCUSED.
 *
 * Both halves are load-bearing. `visibilitychange` alone does not fire when the
 * window merely loses focus to another application, which is precisely the
 * walked-away-from-the-desk case this exists to catch; `focus`/`blur` alone
 * miss backgrounded/minimised tabs. Tracking the pair is the only way to tell
 * "reading" apart from "left open".
 *
 * This lives next to `useConversationView` rather than in `@/crd/hooks/`
 * deliberately: it is not UI polish, it gates a MUTATION (the read receipt,
 * FR-018b).
 */
export const useIsDocumentActive = (): boolean => {
  const [isActive, setIsActive] = useState(readIsDocumentActive);

  useEffect(() => {
    const sync = () => setIsActive(readIsDocumentActive());

    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('blur', sync);

    // Re-read on mount: focus or visibility may have changed between the
    // initial render and this effect. Idempotent — an identical value bails out
    // of the re-render.
    sync();

    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('blur', sync);
    };
  }, []);

  return isActive;
};

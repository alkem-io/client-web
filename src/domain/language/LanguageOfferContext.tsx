/**
 * T004 — Anonymous language-offer state (session-only, in-memory).
 *
 * Invariants (from spec DL-10 / FR-013b / FR-013d):
 *  - The in-memory state is the source of truth for unauthenticated sessions.
 *  - No browser storage is written for anonymous visitors — the choice lives in React
 *    context for the current session only and is re-offered on the next visit.
 *  - Authenticated: discard in-memory choice immediately (FR-013d / SC-005b).
 *  - A fresh provider mount always starts at {language: null, answered: false}.
 */
import { createContext, type ReactNode, useContext, useState } from 'react';

export type AnonymousLanguageChoice = {
  /** The language chosen (or null if declined without choosing one). */
  language: string | null;
  /** Whether the offer has been answered (accept or decline). */
  answered: boolean;
};

type LanguageOfferContextValue = {
  anonymousChoice: AnonymousLanguageChoice;
  setAnonymousChoice: (choice: AnonymousLanguageChoice) => void;
  /**
   * Clears the in-memory choice (session-only — no storage to purge).
   * Must be called on BOTH carry-consumed and kiosk-discard branches.
   */
  clearAnonymousChoice: () => void;
};

const INITIAL_CHOICE: AnonymousLanguageChoice = { language: null, answered: false };

const LanguageOfferContext = createContext<LanguageOfferContextValue>({
  anonymousChoice: INITIAL_CHOICE,
  setAnonymousChoice: () => {},
  clearAnonymousChoice: () => {},
});

export function LanguageOfferProvider({ children }: { children: ReactNode }) {
  const [anonymousChoice, setAnonymousChoiceState] = useState<AnonymousLanguageChoice>(INITIAL_CHOICE);

  const setAnonymousChoice = (choice: AnonymousLanguageChoice) => {
    setAnonymousChoiceState(choice);
  };

  const clearAnonymousChoice = () => {
    setAnonymousChoiceState(INITIAL_CHOICE);
  };

  return (
    <LanguageOfferContext value={{ anonymousChoice, setAnonymousChoice, clearAnonymousChoice }}>
      {children}
    </LanguageOfferContext>
  );
}

export function useLanguageOfferContext(): LanguageOfferContextValue {
  return useContext(LanguageOfferContext);
}

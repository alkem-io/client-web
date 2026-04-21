/**
 * SearchContext Contracts
 *
 * Lightweight context for managing search overlay open/close state.
 * Lives in the integration layer (src/main/search/), NOT in src/crd/.
 */

export type SearchContextValue = {
  /** Whether the search overlay is currently open */
  isOpen: boolean;
  /** Open the search overlay, optionally with an initial query and scope */
  openSearch: (initialQuery?: string, initialScope?: 'all' | string) => void;
  /** Close the search overlay */
  closeSearch: () => void;
  /** Toggle search open/close */
  toggleSearch: () => void;
  /** Initial query passed when opening (consumed once, then cleared) */
  initialQuery: string | null;
  /** Initial scope passed when opening */
  initialScope: 'all' | string | null;
  /** Clear the initial query after it has been consumed */
  clearInitialQuery: () => void;
};

import React, { createContext, useContext, useState, useCallback } from "react";

export type SearchScope = "all" | string; // "all" = whole platform, or a space slug

interface SearchContextValue {
  isOpen: boolean;
  /** The query term passed from the Header input when opening */
  initialQuery: string;
  /** The scope passed from the Header when opening ("all" or a space slug) TODO: Not used yet */
  initialScope: SearchScope;
  /** Open with an initial search term and optional scope */
  openSearch: (query?: string, scope?: SearchScope) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  /** Clear the initial query/scope after the overlay has consumed them */
  clearInitialQuery: () => void;
}

const SearchContext = createContext<SearchContextValue>({
  isOpen: false,
  initialQuery: "",
  initialScope: "all",
  openSearch: () => {},
  closeSearch: () => {},
  toggleSearch: () => {},
  clearInitialQuery: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [initialScope, setInitialScope] = useState<SearchScope>("all");

  const openSearch = useCallback((query?: string, scope?: SearchScope) => {
    if (query) setInitialQuery(query);
    if (scope) setInitialScope(scope);
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setInitialQuery("");
    setInitialScope("all");
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setInitialQuery("");
        setInitialScope("all");
      }
      return !prev;
    });
  }, []);

  const clearInitialQuery = useCallback(() => {
    setInitialQuery("");
    setInitialScope("all");
  }, []);

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        initialQuery,
        initialScope,
        openSearch,
        closeSearch,
        toggleSearch,
        clearInitialQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}

import { createContext, type PropsWithChildren, useContext, useState } from 'react';

type SearchContextValue = {
  isOpen: boolean;
  openSearch: (initialQuery?: string, initialScope?: 'all' | string) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  initialQuery: string | null;
  initialScope: 'all' | string | null;
  clearInitialQuery: () => void;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  const [initialScope, setInitialScope] = useState<'all' | string | null>(null);

  const openSearch = (query?: string, scope?: 'all' | string) => {
    if (query) {
      setInitialQuery(query);
    }
    if (scope) {
      setInitialScope(scope);
    }
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setInitialQuery(null);
    setInitialScope(null);
  };

  const toggleSearch = () => {
    if (isOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  const clearInitialQuery = () => {
    setInitialQuery(null);
    setInitialScope(null);
  };

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        initialQuery,
        initialScope,
        clearInitialQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

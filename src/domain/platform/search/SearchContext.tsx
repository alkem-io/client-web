import { createContext, Dispatch, PropsWithChildren, useContext, useMemo, useState } from 'react';

interface SearchContextValue {
  isSearchOpen: boolean;
  setIsSearchOpen: Dispatch<boolean>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const contextValue = useMemo<SearchContextValue>(
    () => ({
      isSearchOpen,
      setIsSearchOpen,
    }),
    [isSearchOpen, setIsSearchOpen]
  );

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};

export const useSearchContext = () => {
  const searchContext = useContext(SearchContext);
  if (!searchContext) {
    throw new Error('Must be a descendant of SearchContextProvider');
  }
  return useMemo(
    () => ({
      isSearchOpen: searchContext.isSearchOpen,
      openSearch: () => searchContext.setIsSearchOpen(true),
      closeSearch: () => searchContext.setIsSearchOpen(false),
    }),
    [searchContext]
  );
};

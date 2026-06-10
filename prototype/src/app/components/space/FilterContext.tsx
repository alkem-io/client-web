import { createContext, useContext, ReactNode, useState } from "react";

interface FilterContextType {
  searchValue: string;
  activeTags: string[];
  setSearchValue: (value: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  /** @deprecated Use activeTags instead */
  activeTag: string | null;
  /** @deprecated Use toggleTag instead */
  setActiveTag: (tag: string | null) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [searchValue, setSearchValue] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setActiveTags([]);

  // Backwards-compatible shims
  const activeTag = activeTags.length === 1 ? activeTags[0] : activeTags.length > 0 ? activeTags[0] : null;
  const setActiveTag = (tag: string | null) => {
    if (tag === null) {
      clearTags();
    } else {
      toggleTag(tag);
    }
  };

  return (
    <FilterContext.Provider value={{ searchValue, activeTags, setSearchValue, toggleTag, clearTags, activeTag, setActiveTag }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useSpaceFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useSpaceFilters must be used within a FilterProvider");
  }
  return context;
}

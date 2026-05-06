import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  X,
  Filter,
  Globe,
  Building2,
  FileText,
  MessageSquare,
  Users,
  Presentation,
  StickyNote,
  ChevronDown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { SpaceCard, SpaceCardSkeleton } from "@/app/components/space/SpaceCard";
import { useSearch } from "@/app/contexts/SearchContext";
import {
  performSearch,
  CATEGORY_LABELS,
  type SearchCategory,
  type SearchResults,
  type SearchPostResult,
  type SearchResponseResult,
  type SearchUserResult,
  type SearchOrgResult,
} from "./searchData";

// ── Category order ──
const CATEGORY_ORDER: SearchCategory[] = [
  "spaces",
  "posts",
  "responses",
  "users",
  "organizations",
];

// ── Category icons ──
const CATEGORY_ICONS: Record<SearchCategory, React.ReactNode> = {
  spaces: <Globe style={{ width: 16, height: 16 }} />,
  posts: <FileText style={{ width: 16, height: 16 }} />,
  responses: <MessageSquare style={{ width: 16, height: 16 }} />,
  users: <Users style={{ width: 16, height: 16 }} />,
  organizations: <Building2 style={{ width: 16, height: 16 }} />,
};

// ── Filter options ──
const SECTION_FILTERS: Partial<Record<SearchCategory, { value: string; label: string }[]>> = {
  spaces: [
    { value: "all", label: "All" },
    { value: "spaces", label: "Spaces only" },
    { value: "subspaces", label: "Subspaces only" },
  ],
  posts: [
    { value: "all", label: "All" },
    { value: "whiteboard", label: "Whiteboards" },
    { value: "memo", label: "Memos" },
  ],
  responses: [
    { value: "all", label: "All" },
    { value: "post", label: "Posts" },
    { value: "whiteboard", label: "Whiteboards" },
    { value: "memo", label: "Memos" },
  ],
};

// Initial results per section
const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;

// ── Helper: detect if user is inside a space ──
function useCurrentSpace(): { name: string; slug: string } | null {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/space\/([^/]+)/);
  if (!match) return null;
  const slug = match[1];
  // Map some known slugs to names
  const nameMap: Record<string, string> = {
    "green-energy": "Green Energy Space",
    "sustainability-lab": "Sustainability Lab",
    "urban-mobility": "Urban Mobility Lab",
    "ocean-health": "Ocean Health Initiative",
  };
  return { slug, name: nameMap[slug] || slug };
}

// ── Post type icon ──
function PostTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "whiteboard":
      return <Presentation style={{ width: 12, height: 12 }} />;
    case "memo":
      return <StickyNote style={{ width: 12, height: 12 }} />;
    default:
      return <FileText style={{ width: 12, height: 12 }} />;
  }
}

function postTypeLabel(type: string) {
  switch (type) {
    case "whiteboard":
      return "Whiteboard";
    case "memo":
      return "Memo";
    default:
      return "Post";
  }
}

// ── Main component ──
export function SearchOverlay() {
  const { isOpen, closeSearch, initialQuery, initialScope, clearInitialQuery } = useSearch();
  const navigate = useNavigate();
  const currentSpace = useCurrentSpace();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // State
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [scope, setScope] = useState<"all" | string>("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [activeCategory, setActiveCategory] = useState<SearchCategory | null>(null);
  const [sectionFilters, setSectionFilters] = useState<Record<string, string>>({});
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  // When the overlay opens, check for an initial query from the Header
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        // Use the scope passed from the Header (may be a space slug or "all")
        const scopeToUse = initialScope || "all";
        setScope(scopeToUse);
        // Immediately create a tag and run the search
        const tags = [initialQuery];
        setSearchTags(tags);
        setInputValue("");
        clearInitialQuery();
        setLoading(true);
        setTimeout(() => {
          const res = performSearch(tags, scopeToUse);
          setResults(res);
          setLoading(false);
          const counts: Record<string, number> = {};
          CATEGORY_ORDER.forEach((c) => {
            counts[c] = INITIAL_VISIBLE;
          });
          setVisibleCounts(counts);
        }, 400);
      } else {
        // Opened without a query (e.g. mobile search icon) — focus input
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      // Reset on close
      setSearchTags([]);
      setInputValue("");
      setResults(null);
      setActiveCategory(null);
      setSectionFilters({});
      setVisibleCounts({});
      setScope("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeSearch();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeSearch]);

  // Run search
  const runSearch = useCallback(
    (tags: string[]) => {
      if (tags.length === 0) {
        setResults(null);
        return;
      }
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        const res = performSearch(tags, scope);
        setResults(res);
        setLoading(false);
        // Reset visible counts
        const counts: Record<string, number> = {};
        CATEGORY_ORDER.forEach((c) => {
          counts[c] = INITIAL_VISIBLE;
        });
        setVisibleCounts(counts);
      }, 400);
    },
    [scope],
  );

  // Add tag on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTags = [...searchTags, inputValue.trim()];
      setSearchTags(newTags);
      setInputValue("");
      runSearch(newTags);
    }
  };

  // Remove tag
  const removeTag = (idx: number) => {
    const newTags = searchTags.filter((_, i) => i !== idx);
    setSearchTags(newTags);
    runSearch(newTags);
  };

  // Scope change
  const handleScopeChange = (newScope: "all" | string) => {
    setScope(newScope);
    if (searchTags.length > 0) {
      setLoading(true);
      setTimeout(() => {
        setResults(performSearch(searchTags, newScope));
        setLoading(false);
      }, 300);
    }
  };

  // Scroll to section
  const scrollToSection = (category: SearchCategory) => {
    const el = sectionRefs.current[category];
    if (el && resultsRef.current) {
      const container = resultsRef.current;
      const top = el.offsetTop - container.offsetTop;
      container.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Track active section on scroll
  const handleScroll = useCallback(() => {
    if (!resultsRef.current) return;
    const container = resultsRef.current;
    const scrollTop = container.scrollTop + 120;
    let found: SearchCategory | null = null;

    for (const cat of CATEGORY_ORDER) {
      const el = sectionRefs.current[cat];
      if (el) {
        const top = el.offsetTop - container.offsetTop;
        if (scrollTop >= top) found = cat;
      }
    }
    if (found) setActiveCategory(found);
  }, []);

  // Categories with results
  const categoriesWithResults = useMemo(() => {
    if (!results) return [];
    return CATEGORY_ORDER.filter((c) => {
      const items = results[c];
      return Array.isArray(items) && items.length > 0;
    });
  }, [results]);

  // Filter items for a section
  const getFilteredItems = useCallback(
    <T extends { type?: string; parent?: any }>(
      category: SearchCategory,
      items: T[],
    ): T[] => {
      const filter = sectionFilters[category] || "all";
      if (filter === "all") return items;
      if (category === "spaces") {
        if (filter === "spaces") return items.filter((i: any) => !i.parent);
        if (filter === "subspaces") return items.filter((i: any) => !!i.parent);
      }
      return items.filter((i: any) => i.type === filter);
    },
    [sectionFilters],
  );

  // Load more
  const loadMore = (category: SearchCategory) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [category]: (prev[category] || INITIAL_VISIBLE) + LOAD_MORE_COUNT,
    }));
  };

  // Navigate to result
  const navigateTo = (path: string) => {
    closeSearch();
    navigate(path);
  };

  // ── Render ──
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ background: "color-mix(in srgb, var(--foreground) 50%, transparent)", backdropFilter: "blur(2px)" }}
            onClick={closeSearch}
            aria-hidden
          />

          {/* Overlay container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Platform Search"
            className="fixed inset-0 z-[101] grid grid-cols-12 gap-6 px-6 md:px-8 py-[5vh] max-md:p-0 pointer-events-none"
          >
            <div
            className={cn(
              "col-span-12 lg:col-start-3 lg:col-span-8 max-md:col-start-1 max-md:col-span-12",
              "flex flex-col overflow-hidden pointer-events-auto",
            )}
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            {/* ── Top: Search input bar ── */}
            <div
              className="shrink-0 flex flex-col gap-3 px-5 py-4 md:px-6"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <Search
                  className="shrink-0"
                  style={{ width: 20, height: 20, color: "var(--muted-foreground)" }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search…"
                  className="flex-1 bg-transparent outline-none"
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--foreground)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  aria-label="Search input"
                />

                {/* Scope dropdown — only visible when inside a space */}
                {currentSpace && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0"
                        style={{
                          fontSize: "var(--text-sm)",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: "var(--font-weight-medium)" as any,
                          background: scope !== "all" ? "var(--primary)" : "var(--secondary)",
                          color: scope !== "all" ? "var(--primary-foreground)" : "var(--secondary-foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <Globe style={{ width: 14, height: 14 }} />
                        {scope === "all" ? "All Spaces" : currentSpace.name}
                        <ChevronDown style={{ width: 14, height: 14 }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleScopeChange("all")}>
                        All Spaces
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleScopeChange(currentSpace.slug)}>
                        {currentSpace.name}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Close button */}
                <button
                  onClick={closeSearch}
                  className="shrink-0 p-1.5 rounded-full transition-colors"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  aria-label="Close search"
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* Search tags */}
              {searchTags.length > 0 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Active search terms">
                  {searchTags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      role="listitem"
                      className="inline-flex items-center gap-1.5 rounded-full"
                      style={{
                        padding: "3px 10px 3px 12px",
                        fontSize: "var(--text-sm)",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(idx)}
                        className="rounded-full p-0.5 transition-opacity hover:opacity-70"
                        aria-label={`Remove search term: ${tag}`}
                      >
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Body ── */}
            <div className="flex-1 grid grid-cols-10 gap-6 min-h-0 overflow-hidden">
              {/* No search yet */}
              {!results && !loading && (
                <div className="flex-1 flex items-center justify-center p-8 col-span-10">
                  <div className="text-center" style={{ maxWidth: 360 }}>
                    <div
                      className="mx-auto mb-4 flex items-center justify-center rounded-full"
                      style={{
                        width: 48,
                        height: 48,
                        background: "var(--secondary)",
                      }}
                    >
                      <Search style={{ width: 22, height: 22, color: "var(--muted-foreground)" }} />
                    </div>
                    <p
                      style={{
                        fontSize: "var(--text-base)",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        color: "var(--foreground)",
                        marginBottom: 6,
                      }}
                    >
                      Type a search term and press Enter
                    </p>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        fontFamily: "'Inter', sans-serif",
                        color: "var(--muted-foreground)",
                        lineHeight: 1.5,
                      }}
                    >
                      Search across Spaces, Posts, Responses, Users, and Organizations.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="flex-1 flex items-center justify-center p-8 col-span-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2
                      className="animate-spin"
                      style={{ width: 28, height: 28, color: "var(--primary)" }}
                    />
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        fontFamily: "'Inter', sans-serif",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Searching…
                    </p>
                  </div>
                </div>
              )}

              {/* Results with 0 matches */}
              {results && !loading && categoriesWithResults.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8 col-span-10">
                  <div className="text-center" style={{ maxWidth: 400 }}>
                    <div
                      className="mx-auto mb-4 flex items-center justify-center rounded-full"
                      style={{ width: 48, height: 48, background: "var(--secondary)" }}
                    >
                      <Search style={{ width: 22, height: 22, color: "var(--muted-foreground)" }} />
                    </div>
                    <p
                      style={{
                        fontSize: "var(--text-base)",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        color: "var(--foreground)",
                        marginBottom: 6,
                      }}
                    >
                      No results found for{" "}
                      {searchTags.map((t) => `"${t}"`).join(", ")}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        fontFamily: "'Inter', sans-serif",
                        color: "var(--muted-foreground)",
                        lineHeight: 1.5,
                      }}
                    >
                      Try different keywords or broaden your search.
                    </p>
                    {scope !== "all" && currentSpace && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => handleScopeChange("all")}
                      >
                        Search all Spaces instead
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Results */}
              {results && !loading && categoriesWithResults.length > 0 && (
                <>
                  {/* Category sidebar — desktop */}
                  <nav
                    className="hidden md:flex flex-col col-span-2 py-4 overflow-y-auto"
                    style={{
                      borderRight: "1px solid var(--border)",
                    }}
                    aria-label="Result categories"
                  >
                    {categoriesWithResults.map((cat) => {
                      const count = getFilteredItems(cat, results[cat] as any[]).length;
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => scrollToSection(cat)}
                          className="flex items-center gap-2.5 px-5 py-2.5 text-left transition-colors"
                          style={{
                            fontSize: "var(--text-sm)",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                            background: isActive ? "var(--accent)" : "transparent",
                            borderLeft: isActive
                              ? "2px solid var(--primary)"
                              : "2px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive)
                              e.currentTarget.style.background = "var(--accent)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span className="shrink-0" style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}>
                            {CATEGORY_ICONS[cat]}
                          </span>
                          <span className="flex-1 truncate">
                            {CATEGORY_LABELS[cat]}
                          </span>
                          <span
                            className="shrink-0 rounded-full flex items-center justify-center"
                            style={{
                              minWidth: 22,
                              height: 22,
                              padding: "0 6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              fontFamily: "'Inter', sans-serif",
                              background: isActive ? "var(--primary)" : "var(--muted)",
                              color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                            }}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Category tabs — mobile/tablet (horizontal scroll) */}
                  <div
                    className="md:hidden shrink-0 flex overflow-x-auto gap-1 px-4 py-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {categoriesWithResults.map((cat) => {
                      const count = getFilteredItems(cat, results[cat] as any[]).length;
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => scrollToSection(cat)}
                          className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-full transition-colors shrink-0"
                          style={{
                            fontSize: "var(--text-sm)",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: isActive ? 600 : 400,
                            background: isActive ? "var(--primary)" : "var(--secondary)",
                            color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                          }}
                        >
                          {CATEGORY_LABELS[cat]}
                          <span
                            className="rounded-full"
                            style={{
                              padding: "0 5px",
                              fontSize: "10px",
                              fontWeight: 600,
                              fontFamily: "'Inter', sans-serif",
                              background: isActive ? "var(--primary-foreground)" : "var(--muted)",
                              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                            }}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Results pane */}
                  <div
                    ref={resultsRef}
                    className="col-span-10 md:col-span-8 overflow-y-auto"
                    onScroll={handleScroll}
                    role="region"
                    aria-label="Search results"
                  >
                    {/* Disclaimer */}
                    <div className="px-5 md:px-6 pt-4">
                      <p
                        className="rounded-lg px-3 py-2"
                        style={{
                          fontSize: "var(--text-sm)",
                          fontFamily: "'Inter', sans-serif",
                          color: "var(--muted-foreground)",
                          background: "var(--secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        These results may not represent the up to date state of the platform. Search results are updated on an interval.
                      </p>
                    </div>

                    {/* Sections */}
                    {categoriesWithResults.map((cat) => {
                      const allItems = results[cat] as any[];
                      const filtered = getFilteredItems(cat, allItems);
                      const visible = visibleCounts[cat] || INITIAL_VISIBLE;
                      const shownItems = filtered.slice(0, visible);
                      const hasMore = filtered.length > visible;
                      const filters = SECTION_FILTERS[cat];
                      const currentFilter = sectionFilters[cat] || "all";

                      return (
                        <section
                          key={cat}
                          ref={(el) => {
                            sectionRefs.current[cat] = el;
                          }}
                          className="px-5 md:px-6 py-5"
                          style={{ borderBottom: "1px solid var(--border)" }}
                          aria-label={`${CATEGORY_LABELS[cat]} results`}
                        >
                          {/* Section header */}
                          <div className="flex items-center justify-between mb-4 gap-3">
                            <div className="flex items-center gap-2">
                              <span style={{ color: "var(--muted-foreground)" }}>{CATEGORY_ICONS[cat]}</span>
                              <h3
                                style={{
                                  fontSize: "var(--text-base)",
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: 600,
                                  color: "var(--foreground)",
                                }}
                              >
                                {CATEGORY_LABELS[cat]}
                              </h3>
                              <span
                                className="rounded-full"
                                style={{
                                  padding: "1px 8px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  fontFamily: "'Inter', sans-serif",
                                  background: "var(--muted)",
                                  color: "var(--muted-foreground)",
                                }}
                              >
                                {filtered.length}
                              </span>
                            </div>

                            {/* Filter dropdown */}
                            {filters && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                                    style={{
                                      fontSize: "var(--text-sm)",
                                      fontFamily: "'Inter', sans-serif",
                                      fontWeight: 500,
                                      color: currentFilter !== "all" ? "var(--primary)" : "var(--muted-foreground)",
                                      background: currentFilter !== "all" ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    <Filter style={{ width: 13, height: 13 }} />
                                    {filters.find((f) => f.value === currentFilter)?.label || "All"}
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  {filters.map((f) => (
                                    <DropdownMenuItem
                                      key={f.value}
                                      onClick={() =>
                                        setSectionFilters((prev) => ({
                                          ...prev,
                                          [cat]: f.value,
                                        }))
                                      }
                                      className={cn(
                                        currentFilter === f.value && "bg-accent font-medium",
                                      )}
                                    >
                                      {f.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {/* Results grid */}
                          {cat === "spaces" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {shownItems.map((space: any) => (
                                <SpaceCard key={space.id} space={space} />
                              ))}
                            </div>
                          )}

                          {cat === "posts" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {shownItems.map((post: SearchPostResult) => (
                                <PostResultCard
                                  key={post.id}
                                  post={post}
                                  onClick={() => navigateTo(`/space/${post.spaceSlug}`)}
                                />
                              ))}
                            </div>
                          )}

                          {cat === "responses" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {shownItems.map((resp: SearchResponseResult) => (
                                <ResponseResultCard
                                  key={resp.id}
                                  response={resp}
                                  onClick={() => navigateTo(`/space/${resp.spaceSlug}`)}
                                />
                              ))}
                            </div>
                          )}

                          {cat === "users" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {shownItems.map((user: SearchUserResult) => (
                                <UserResultCard
                                  key={user.id}
                                  user={user}
                                  onClick={() => navigateTo(`/user/${user.name.toLowerCase().replace(/ /g, "-")}`)}
                                />
                              ))}
                            </div>
                          )}

                          {cat === "organizations" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {shownItems.map((org: SearchOrgResult) => (
                                <OrgResultCard key={org.id} org={org} onClick={() => {}} />
                              ))}
                            </div>
                          )}

                          {/* Load more */}
                          {hasMore && (
                            <div className="flex justify-center mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadMore(cat)}
                                className="gap-1.5"
                                style={{
                                  fontSize: "var(--text-sm)",
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                Load more
                                <ArrowRight style={{ width: 14, height: 14 }} />
                              </Button>
                            </div>
                          )}
                        </section>
                      );
                    })}

                    {/* Bottom spacing */}
                    <div style={{ height: 40 }} />
                  </div>
                </>
              )}
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Card sub-components ──

function PostResultCard({
  post,
  onClick,
}: {
  post: SearchPostResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl text-left transition-all duration-200 overflow-hidden outline-none"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--elevation-sm)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 30%, var(--border))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Banner */}
      {post.bannerImage ? (
        <div className="overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <img
            src={post.bannerImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{
            aspectRatio: "16 / 9",
            background: "var(--muted)",
          }}
        >
          <PostTypeIcon type={post.type} />
        </div>
      )}

      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar style={{ width: 22, height: 22 }}>
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback
              style={{
                fontSize: "8px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
            >
              {post.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            {post.author.name}
          </span>
        </div>

        {/* Title */}
        <h4
          className="line-clamp-2 transition-colors duration-200 group-hover:text-primary"
          style={{
            fontSize: "var(--text-sm)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            color: "var(--card-foreground)",
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </h4>

        {/* Snippet */}
        <p
          className="line-clamp-2 flex-1"
          style={{
            fontSize: "12px",
            fontFamily: "'Inter', sans-serif",
            color: "var(--muted-foreground)",
            lineHeight: 1.4,
          }}
        >
          {post.snippet}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-1.5">
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                fontSize: "10px",
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
            >
              <PostTypeIcon type={post.type} />
              {postTypeLabel(post.type)}
            </span>
          </div>
          <span
            style={{
              fontSize: "10px",
              fontFamily: "'Inter', sans-serif",
              color: "var(--muted-foreground)",
            }}
          >
            {post.date}
          </span>
        </div>

        {/* Space context */}
        <p
          className="truncate"
          style={{
            fontSize: "11px",
            fontFamily: "'Inter', sans-serif",
            color: "var(--muted-foreground)",
          }}
        >
          in: {post.spaceName}
        </p>
      </div>
    </button>
  );
}

function ResponseResultCard({
  response,
  onClick,
}: {
  response: SearchResponseResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl text-left transition-all duration-200 overflow-hidden outline-none"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--elevation-sm)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 30%, var(--border))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar style={{ width: 24, height: 24 }}>
            <AvatarImage src={response.author.avatar} />
            <AvatarFallback
              style={{
                fontSize: "9px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
            >
              {response.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            {response.author.name}
          </span>
          <span
            className="ml-auto"
            style={{
              fontSize: "10px",
              fontFamily: "'Inter', sans-serif",
              color: "var(--muted-foreground)",
            }}
          >
            {response.date}
          </span>
        </div>

        {/* Title */}
        <h4
          className="line-clamp-2 transition-colors duration-200 group-hover:text-primary"
          style={{
            fontSize: "var(--text-sm)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            color: "var(--card-foreground)",
            lineHeight: 1.3,
          }}
        >
          {response.title}
        </h4>

        {/* Snippet */}
        <p
          className="line-clamp-2 flex-1"
          style={{
            fontSize: "12px",
            fontFamily: "'Inter', sans-serif",
            color: "var(--muted-foreground)",
            lineHeight: 1.4,
          }}
        >
          {response.snippet}
        </p>

        {/* Parent context */}
        <div
          className="flex items-center gap-1.5 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <MessageSquare style={{ width: 11, height: 11, color: "var(--muted-foreground)" }} />
          <span
            className="truncate"
            style={{
              fontSize: "11px",
              fontFamily: "'Inter', sans-serif",
              color: "var(--muted-foreground)",
            }}
          >
            Response to: {response.parentPostTitle}
          </span>
        </div>

        {/* Type + Space */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              fontSize: "10px",
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
            }}
          >
            <PostTypeIcon type={response.type} />
            {postTypeLabel(response.type)}
          </span>
          <span
            className="truncate"
            style={{
              fontSize: "11px",
              fontFamily: "'Inter', sans-serif",
              color: "var(--muted-foreground)",
            }}
          >
            in: {response.spaceName}
          </span>
        </div>
      </div>
    </button>
  );
}

function UserResultCard({
  user,
  onClick,
}: {
  user: SearchUserResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center rounded-xl text-center transition-all duration-200 p-5 outline-none"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--elevation-sm)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 30%, var(--border))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <Avatar
        className="mb-3"
        style={{
          width: 56,
          height: 56,
          border: "2px solid var(--border)",
        }}
      >
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h4
        className="transition-colors duration-200 group-hover:text-primary"
        style={{
          fontSize: "var(--text-sm)",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          color: "var(--card-foreground)",
          lineHeight: 1.3,
        }}
      >
        {user.name}
      </h4>
      <p
        className="mt-1 truncate w-full"
        style={{
          fontSize: "12px",
          fontFamily: "'Inter', sans-serif",
          color: "var(--muted-foreground)",
        }}
      >
        {user.role}
      </p>
      <p
        className="mt-0.5 truncate w-full"
        style={{
          fontSize: "11px",
          fontFamily: "'Inter', sans-serif",
          color: "var(--muted-foreground)",
        }}
      >
        {user.email}
      </p>
    </button>
  );
}

function OrgResultCard({
  org,
  onClick,
}: {
  org: SearchOrgResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center rounded-xl text-center transition-all duration-200 p-5 outline-none"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--elevation-sm)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 30%, var(--border))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        className="mb-3 flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-lg)",
          background: "var(--secondary)",
          border: "2px solid var(--border)",
        }}
      >
        {org.avatar ? (
          <img
            src={org.avatar}
            alt={org.name}
            className="w-full h-full object-cover"
            style={{ borderRadius: "var(--radius-lg)" }}
          />
        ) : (
          <Building2
            style={{
              width: 24,
              height: 24,
              color: "var(--muted-foreground)",
            }}
          />
        )}
      </div>
      <h4
        className="transition-colors duration-200 group-hover:text-primary"
        style={{
          fontSize: "var(--text-sm)",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          color: "var(--card-foreground)",
          lineHeight: 1.3,
        }}
      >
        {org.name}
      </h4>
      <span
        className="mt-1"
        style={{
          fontSize: "10px",
          fontWeight: 500,
          fontFamily: "'Inter', sans-serif",
          padding: "1px 8px",
          borderRadius: "999px",
          background: "var(--secondary)",
          color: "var(--secondary-foreground)",
        }}
      >
        {org.type}
      </span>
      <p
        className="mt-2 line-clamp-2 w-full"
        style={{
          fontSize: "12px",
          fontFamily: "'Inter', sans-serif",
          color: "var(--muted-foreground)",
          lineHeight: 1.4,
        }}
      >
        {org.tagline}
      </p>
    </button>
  );
}
import { Loader2, Search } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { type SearchCategoryId, SearchCategorySidebar, type SidebarCategory } from './SearchCategorySidebar';
import type { SearchFilterOption } from './SearchResultSection';
import { SearchResultSection } from './SearchResultSection';
import { type SearchScopeData, SearchTagInput } from './SearchTagInput';

export type SearchOverlayState = 'empty' | 'loading' | 'results' | 'no-results';

export type SearchOverlayCategory = {
  id: SearchCategoryId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count: number;
  filterOptions?: SearchFilterOption[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
};

export type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  state: SearchOverlayState;
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onTagAdd: (term: string) => void;
  onTagRemove: (index: number) => void;
  maxTags: number;
  scope?: SearchScopeData;
  onScopeChange?: (scope: 'all' | string) => void;
  categories: SearchOverlayCategory[];
  /** All categories including those with 0 results, shown in the sidebar */
  allSidebarCategories?: SidebarCategory[];
  disclaimer: string;
  noResultsTerms: string;
  onSearchAll?: () => void;
};

export function SearchOverlay({
  isOpen,
  onClose,
  state,
  tags,
  inputValue,
  onInputChange,
  onTagAdd,
  onTagRemove,
  maxTags,
  scope,
  onScopeChange,
  categories,
  allSidebarCategories,
  disclaimer,
  noResultsTerms,
  onSearchAll,
}: SearchOverlayProps) {
  const { t } = useTranslation('crd-search');
  const [visible, setVisible] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<SearchCategoryId | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Capture the element that had focus before the dialog opened, restore on close
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);

  // Animate in on mount
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Set first category as active when results appear
  useEffect(() => {
    if (state === 'results' && categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [state, categories, activeCategoryId]);

  // Escape key + focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults = categories.reduce((sum, c) => sum + c.count, 0);
  const statusMessage =
    state === 'loading'
      ? t('search.loading')
      : state === 'no-results'
        ? t('search.a11y.noResultsFound')
        : state === 'results'
          ? t('search.a11y.resultsFound', { count: totalResults })
          : '';

  const sidebarCategories: SidebarCategory[] =
    allSidebarCategories ??
    categories.map(c => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
      count: c.count,
    }));

  const handleScroll = () => {
    const container = resultsRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop + 120;
    let currentId: SearchCategoryId | null = null;

    for (const category of categories) {
      const section = sectionRefs.current[category.id];
      if (section && section.offsetTop <= scrollTop) {
        currentId = category.id;
      }
    }

    if (currentId) {
      setActiveCategoryId(currentId);
    }
  };

  const handleCategoryClick = (id: SearchCategoryId) => {
    setActiveCategoryId(id);
    const section = sectionRefs.current[id];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Overlay container */}
      <div className="fixed inset-0 z-[101] grid grid-cols-12 gap-6 px-6 md:px-8 py-[5vh] max-md:p-0 pointer-events-none">
        {/* Content panel */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('search.a11y.platformSearch')}
          className={cn(
            'col-span-12 lg:col-start-2 lg:col-span-10 max-md:col-span-12',
            'flex flex-col overflow-hidden pointer-events-auto',
            'bg-background border border-border rounded-xl shadow-lg',
            'transition-all duration-200 ease-out',
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.97] translate-y-2.5'
          )}
        >
          {/* Top bar */}
          <SearchTagInput
            tags={tags}
            inputValue={inputValue}
            onInputChange={onInputChange}
            onTagAdd={onTagAdd}
            onTagRemove={onTagRemove}
            maxTags={maxTags}
            minLength={2}
            scope={scope}
            onScopeChange={onScopeChange}
            onClose={onClose}
          />

          {/* Screen-reader status announcement */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {statusMessage}
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {state === 'empty' && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-secondary size-12 mb-3">
                    <Search aria-hidden="true" className="size-[22px] text-muted-foreground" />
                  </div>
                  <p className="text-subsection-title mb-1.5 text-foreground">{t('search.emptyTitle')}</p>
                  <p className="text-body text-muted-foreground">{t('search.emptyDescription')}</p>
                </div>
              </div>
            )}

            {state === 'loading' && (
              <output aria-label={t('search.loading')} className="flex flex-col items-center justify-center p-8 gap-3">
                <Loader2 aria-hidden="true" className="size-7 text-primary animate-spin" />
                <p className="text-body text-muted-foreground">{t('search.loading')}</p>
              </output>
            )}

            {state === 'no-results' && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-secondary size-12 mb-3">
                    <Search aria-hidden="true" className="size-[22px] text-muted-foreground" />
                  </div>
                  <p className="text-subsection-title mb-1.5 text-foreground">
                    {t('search.noResultsTitle', { terms: noResultsTerms })}
                  </p>
                  <p className="text-body text-muted-foreground mb-4">{t('search.noResultsSuggestion')}</p>
                  {onSearchAll && (
                    <Button variant="outline" size="sm" onClick={onSearchAll}>
                      {t('search.searchAllSpaces')}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {state === 'results' && (
              <div className="grid grid-cols-10 gap-0 min-h-0 overflow-hidden h-full">
                {/* Desktop sidebar */}
                <div className="hidden md:block col-span-2">
                  <SearchCategorySidebar
                    categories={sidebarCategories}
                    activeCategoryId={activeCategoryId}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>

                {/* Mobile category tabs */}
                <div className="md:hidden col-span-10">
                  <SearchCategorySidebar
                    categories={sidebarCategories}
                    activeCategoryId={activeCategoryId}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>

                {/* Results pane */}
                <section
                  ref={resultsRef}
                  className="col-span-10 md:col-span-8 overflow-y-auto"
                  onScroll={handleScroll}
                  aria-label={t('search.a11y.searchResults')}
                >
                  {/* Disclaimer banner */}
                  <div className="px-5 md:px-6 pt-4">
                    <p className="rounded-lg px-3 py-2 text-body text-muted-foreground bg-secondary">{disclaimer}</p>
                  </div>

                  {/* Category sections */}
                  {categories.map(category => (
                    <SearchResultSection
                      key={category.id}
                      ref={el => {
                        sectionRefs.current[category.id] = el;
                      }}
                      id={`search-section-${category.id}`}
                      icon={category.icon}
                      label={category.label}
                      count={category.count}
                      filterOptions={category.filterOptions}
                      activeFilter={category.activeFilter}
                      onFilterChange={category.onFilterChange}
                      hasMore={category.hasMore}
                      onLoadMore={category.onLoadMore}
                    >
                      {category.children}
                    </SearchResultSection>
                  ))}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

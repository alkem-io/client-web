import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type SearchCategoryId = 'spaces' | 'posts' | 'responses' | 'users' | 'organizations';

export type SidebarCategory = {
  id: SearchCategoryId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count: number;
};

export type SearchCategorySidebarProps = {
  categories: SidebarCategory[];
  activeCategoryId: SearchCategoryId | null;
  onCategoryClick: (id: SearchCategoryId) => void;
};

export function SearchCategorySidebar({ categories, activeCategoryId, onCategoryClick }: SearchCategorySidebarProps) {
  const { t } = useTranslation('crd-search');

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label={t('search.a11y.resultCategories')}
        className="hidden md:flex flex-col py-4 border-r border-border"
      >
        {categories.map(category => {
          const isActive = category.id === activeCategoryId;
          const isDisabled = category.count === 0;
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              type="button"
              disabled={isDisabled}
              title={isDisabled ? category.label : undefined}
              onClick={() => onCategoryClick(category.id)}
              className={cn(
                'flex items-center gap-2.5 px-5 py-2.5 text-left text-sm transition-colors border-l-2',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                isDisabled
                  ? 'text-muted-foreground/50 cursor-not-allowed border-transparent'
                  : isActive
                    ? 'font-semibold text-foreground bg-accent border-primary'
                    : 'font-normal text-muted-foreground border-transparent hover:bg-accent'
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  'shrink-0 size-4',
                  isDisabled ? 'text-muted-foreground/50' : isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="flex-1 truncate">{category.label}</span>
              <span
                className={cn(
                  'shrink-0 rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center text-label',
                  isDisabled
                    ? 'bg-muted/50 text-muted-foreground/50'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile horizontal tabs */}
      <nav
        aria-label={t('search.a11y.resultCategories')}
        className="md:hidden shrink-0 flex overflow-x-auto gap-1 px-4 py-2 border-b border-border"
      >
        {categories.map(category => {
          const isActive = category.id === activeCategoryId;
          const isDisabled = category.count === 0;

          return (
            <button
              key={category.id}
              type="button"
              disabled={isDisabled}
              title={isDisabled ? category.label : undefined}
              onClick={() => onCategoryClick(category.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-full text-sm shrink-0 transition-colors',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isDisabled
                  ? 'text-muted-foreground/50 bg-secondary/50 cursor-not-allowed'
                  : isActive
                    ? 'font-semibold bg-primary text-primary-foreground'
                    : 'font-normal text-muted-foreground bg-secondary'
              )}
            >
              {category.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-badge',
                  isDisabled
                    ? 'bg-muted/50 text-muted-foreground/50'
                    : isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

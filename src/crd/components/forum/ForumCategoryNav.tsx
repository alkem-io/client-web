import type { ForumCategoryEntry } from '@/crd/components/forum/forumTypes';
import { cn } from '@/crd/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

type ForumCategoryNavProps = {
  entries: ForumCategoryEntry[];
  activeSlug: string;
  onCategoryChange: (slug: string) => void;
  sectionLabel: string;
  selectAriaLabel: string;
  className?: string;
};

export function ForumCategoryNav({
  entries,
  activeSlug,
  onCategoryChange,
  sectionLabel,
  selectAriaLabel,
  className,
}: ForumCategoryNavProps) {
  return (
    <>
      {/* Mobile dropdown — visible below md */}
      <div className={cn('w-full md:hidden', className)}>
        <Select value={activeSlug} onValueChange={onCategoryChange}>
          <SelectTrigger aria-label={selectAriaLabel} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {entries.map(entry => (
              <SelectItem key={entry.slug} value={entry.slug}>
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex size-4 items-center justify-center">
                    {entry.iconNode}
                  </span>
                  <span>{entry.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop sidebar — md+ */}
      <nav className={cn('sticky top-20 hidden space-y-0.5 md:block', className)} aria-label={sectionLabel}>
        <div className="mb-2 px-2 text-label uppercase opacity-60">{sectionLabel}</div>
        {entries.map(entry => {
          const isActive = entry.slug === activeSlug;
          return (
            <button
              key={entry.slug}
              type="button"
              onClick={() => onCategoryChange(entry.slug)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-control transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                {entry.iconNode}
              </span>
              <span className="truncate">{entry.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

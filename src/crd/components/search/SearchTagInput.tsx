import { ChevronDown, Globe, Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

export type SearchScopeData = {
  currentSpaceName: string;
  activeScope: 'all' | string;
};

export type SearchTagInputProps = {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onTagAdd: (term: string) => void;
  onTagRemove: (index: number) => void;
  maxTags: number;
  minLength: number;
  scope?: SearchScopeData;
  onScopeChange?: (scope: 'all' | string) => void;
  onClose: () => void;
};

export function SearchTagInput({
  tags,
  inputValue,
  onInputChange,
  onTagAdd,
  onTagRemove,
  maxTags,
  minLength,
  scope,
  onScopeChange,
  onClose,
}: SearchTagInputProps) {
  const { t } = useTranslation('crd-search');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed.length >= minLength && tags.length < maxTags) {
        onTagAdd(trimmed);
        onInputChange('');
      }
    }
  };

  const isScoped = scope && scope.activeScope !== 'all';

  return (
    <div className="shrink-0 flex flex-col gap-3 px-5 py-4 md:px-6 border-b border-border">
      {/* Row 1: Input row */}
      <div className="flex items-center gap-3">
        <Search aria-hidden="true" className="size-5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          aria-label={t('search.a11y.searchInput')}
          className="flex-1 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground"
        />

        {/* Scope dropdown */}
        {scope && onScopeChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border border-border',
                  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isScoped ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                )}
              >
                <Globe aria-hidden="true" className="size-3.5" />
                <span>{scope.activeScope === 'all' ? t('search.scopeAll') : scope.currentSpaceName}</span>
                <ChevronDown aria-hidden="true" className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onScopeChange('all')}>{t('search.scopeAll')}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onScopeChange(scope.currentSpaceName)}>
                {scope.currentSpaceName}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('search.a11y.closeSearch')}
          className="shrink-0 p-1.5 rounded-full hover:bg-accent text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X aria-hidden="true" className="size-[18px]" />
        </button>
      </div>

      {/* Row 2: Active tags */}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 list-none p-0 m-0" aria-label={t('search.a11y.activeTags')}>
          {tags.map((tag, index) => (
            <li
              key={`tag-${tag}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium bg-primary text-primary-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => onTagRemove(index)}
                aria-label={t('search.a11y.removeTag', { term: tag })}
                className="rounded-full p-0.5 hover:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

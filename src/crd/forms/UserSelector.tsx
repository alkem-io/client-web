import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Input } from '@/crd/primitives/input';

export type ShareUser = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
};

type UserSelectorProps = {
  selectedUsers: ShareUser[];
  searchResults: ShareUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (user: ShareUser) => void;
  onRemove: (userId: string) => void;
  loading?: boolean;
  placeholder?: string;
  searchAriaLabel?: string;
  noResultsLabel?: ReactNode;
  loadingLabel?: ReactNode;
  removeAriaLabel?: (displayName: string) => string;
  className?: string;
};

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatLocation(user: ShareUser): string | null {
  if (user.city && user.country) return `${user.city}, ${user.country}`;
  return user.city ?? user.country ?? null;
}

export function UserSelector({
  selectedUsers,
  searchResults,
  searchQuery,
  onSearchChange,
  onSelect,
  onRemove,
  loading = false,
  placeholder,
  searchAriaLabel,
  noResultsLabel,
  loadingLabel,
  removeAriaLabel,
  className,
}: UserSelectorProps) {
  const trimmedQuery = searchQuery.trim();
  const showResults = trimmedQuery.length > 0;
  const visibleResults = searchResults.filter(user => !selectedUsers.some(s => s.id === user.id));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
          aria-label={searchAriaLabel ?? placeholder}
          className="pl-9"
          autoComplete="off"
        />

        {showResults && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-border bg-popover shadow-md">
            {loading ? (
              <output
                className="block p-3 text-control text-muted-foreground"
                aria-label={typeof loadingLabel === 'string' ? loadingLabel : undefined}
              >
                {loadingLabel}
              </output>
            ) : visibleResults.length === 0 ? (
              <p className="p-3 text-control text-muted-foreground">{noResultsLabel}</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto py-1">
                {visibleResults.map(user => {
                  const location = formatLocation(user);
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(user)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                      >
                        <Avatar className="size-8">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                          <AvatarFallback className="text-badge">{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-control truncate">{user.displayName}</span>
                          {location && <span className="text-caption text-muted-foreground truncate">{location}</span>}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <li key={user.id}>
              <span className="inline-flex items-center gap-2 pr-1 pl-1 py-1 rounded-full border border-border bg-background">
                <Avatar className="size-6">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                  <AvatarFallback className="text-badge">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <span className="text-control">{user.displayName}</span>
                <button
                  type="button"
                  onClick={() => onRemove(user.id)}
                  className="rounded-full p-0.5 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  aria-label={removeAriaLabel ? removeAriaLabel(user.displayName) : undefined}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { ChevronRight, Globe, Layers, Lock, Search, SearchX, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';

// ── Types ──

type MembershipRole = 'Admin' | 'Lead' | 'Member';

type MembershipItem = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  isPrivate: boolean;
  role: MembershipRole;
  initials: string;
  color: string;
  type: 'space' | 'subspace';
  parentId?: string;
  image?: string;
};

type SpaceGroup = {
  parent: MembershipItem;
  subspaces: MembershipItem[];
};

type MyMembershipsPanelProps = {
  open: boolean;
  onClose: () => void;
  items: MembershipItem[];
  loading?: boolean;
  onNavigate?: (href: string) => void;
  browseAllHref?: string;
};

// ── Helpers ──

const ROLE_VARIANT: Record<MembershipRole, 'destructive' | 'default' | 'secondary'> = {
  Admin: 'destructive',
  Lead: 'default',
  Member: 'secondary',
};

function groupByParent(items: MembershipItem[]): SpaceGroup[] {
  const parents = items.filter(i => i.type === 'space');
  const subspacesByParent = new Map<string, MembershipItem[]>();

  for (const item of items) {
    if (item.type === 'subspace' && item.parentId) {
      const existing = subspacesByParent.get(item.parentId) ?? [];
      existing.push(item);
      subspacesByParent.set(item.parentId, existing);
    }
  }

  return parents.map(parent => ({
    parent,
    subspaces: subspacesByParent.get(parent.id) ?? [],
  }));
}

function matchesSearch(item: MembershipItem, query: string): boolean {
  const lower = query.toLowerCase();
  return item.name.toLowerCase().includes(lower) || (item.tagline?.toLowerCase().includes(lower) ?? false);
}

function filterItems(
  items: MembershipItem[],
  search: string,
  roleFilter: string,
  visibilityFilter: string
): MembershipItem[] {
  return items.filter(item => {
    if (search && !matchesSearch(item, search)) return false;
    if (roleFilter !== 'all' && item.role !== roleFilter) return false;
    if (visibilityFilter === 'public' && item.isPrivate) return false;
    if (visibilityFilter === 'private' && !item.isPrivate) return false;
    return true;
  });
}

function filterGroups(groups: SpaceGroup[], filteredItems: MembershipItem[]): SpaceGroup[] {
  const filteredIds = new Set(filteredItems.map(i => i.id));

  return groups
    .map(group => ({
      parent: group.parent,
      subspaces: group.subspaces.filter(s => filteredIds.has(s.id)),
    }))
    .filter(group => filteredIds.has(group.parent.id) || group.subspaces.length > 0);
}

// ── Sub-components ──

function RoleIndicator({ role }: { role: MembershipRole }) {
  return (
    <Badge variant={ROLE_VARIANT[role]} className="text-[11px] font-normal shrink-0">
      {role}
    </Badge>
  );
}

function PrivacyIcon({ isPrivate }: { isPrivate: boolean }) {
  return isPrivate ? (
    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-label="Private" />
  ) : (
    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-label="Public" />
  );
}

function BannerThumbnail({ image, color }: { image?: string; color: string }) {
  if (image) {
    return <img src={image} alt="" className="w-16 h-10 rounded-md object-cover shrink-0" />;
  }

  const darkerColor = `color-mix(in srgb, ${color} 70%, black)`;
  return (
    <div
      className="w-16 h-10 rounded-md shrink-0"
      style={{ background: `linear-gradient(135deg, ${color}, ${darkerColor})` }}
      aria-hidden="true"
    />
  );
}

function ParentSpaceRow({
  group,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  group: SpaceGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: (href: string) => void;
}) {
  const { parent, subspaces } = group;
  const hasSubspaces = subspaces.length > 0;

  return (
    <a
      href={parent.href}
      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 cursor-pointer transition-colors no-underline text-inherit"
      onClick={e => {
        e.preventDefault();
        onNavigate(parent.href);
      }}
    >
      {/* Chevron toggle */}
      {hasSubspaces ? (
        <button
          type="button"
          className="w-5 h-5 flex items-center justify-center shrink-0 rounded hover:bg-accent transition-colors"
          onClick={e => {
            e.stopPropagation();
            onToggle();
          }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${parent.name}` : `Expand ${parent.name}`}
        >
          <ChevronRight
            className={cn('w-4 h-4 transition-transform duration-150', isExpanded && 'rotate-90')}
            aria-hidden="true"
          />
        </button>
      ) : (
        <span className="w-5 shrink-0" />
      )}

      {/* Privacy icon */}
      <PrivacyIcon isPrivate={parent.isPrivate} />

      {/* Banner thumbnail */}
      <BannerThumbnail image={parent.image} color={parent.color} />

      {/* Name + tagline */}
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm font-medium truncate">{parent.name}</div>
        {parent.tagline && <div className="text-xs text-muted-foreground truncate">{parent.tagline}</div>}
      </div>

      {/* Subspace count badge */}
      {hasSubspaces && (
        <Badge variant="outline" className="text-[11px] font-normal shrink-0">
          {subspaces.length} subspace{subspaces.length !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Role indicator */}
      <RoleIndicator role={parent.role} />
    </a>
  );
}

function SubspaceRow({ item, onNavigate }: { item: MembershipItem; onNavigate: (href: string) => void }) {
  return (
    <a
      href={item.href}
      className="flex items-center gap-3 py-2.5 pr-5 hover:bg-muted/40 cursor-pointer transition-colors no-underline text-inherit"
      style={{ paddingLeft: '5rem' }}
      onClick={e => {
        e.preventDefault();
        onNavigate(item.href);
      }}
    >
      {/* Privacy icon */}
      <PrivacyIcon isPrivate={item.isPrivate} />

      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0 rounded-md">
        {item.image ? <AvatarImage src={item.image} alt="" className="rounded-md" /> : null}
        <AvatarFallback className="rounded-md text-[10px]" style={{ backgroundColor: item.color, color: 'white' }}>
          {item.initials}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block">{item.name}</span>
      </div>

      {/* Role indicator */}
      <RoleIndicator role={item.role} />
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col">
      {/* biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 px-5 py-3">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="w-16 h-10 rounded-md" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          {i < 4 && <Separator />}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, message, action }: { icon: ReactNode; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

// ── Main Component ──

export function MyMembershipsPanel({
  open,
  onClose,
  items,
  loading = false,
  onNavigate,
  browseAllHref = '/spaces',
}: MyMembershipsPanelProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Expand all groups by default when panel opens
  useEffect(() => {
    if (open) {
      const parentIds = new Set(items.filter(i => i.type === 'space').map(i => i.id));
      setExpandedIds(parentIds);
      setSearch('');
      setRoleFilter('all');
      setVisibilityFilter('all');
    }
  }, [open, items]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const filteredItems = filterItems(items, search, roleFilter, visibilityFilter);
  const allGroups = groupByParent(items);
  const filteredGroups = filterGroups(allGroups, filteredItems);
  const filteredCount =
    new Set(filteredItems.filter(i => i.type === 'space').map(i => i.id)).size +
    filteredItems.filter(i => i.type === 'subspace').length;

  const hasFilters = search !== '' || roleFilter !== 'all' || visibilityFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setVisibilityFilter('all');
  };

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNavigate = (href: string) => {
    onClose();
    onNavigate?.(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--foreground) 50%, transparent)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Overlay grid */}
      <div className="fixed inset-0 z-[101] grid grid-cols-12 gap-6 px-6 md:px-8 py-[5vh] max-md:p-0 pointer-events-none">
        {/* Content panel */}
        <div
          className={cn(
            'col-span-12 lg:col-start-2 lg:col-span-10',
            'max-md:col-start-1 max-md:col-span-12',
            'pointer-events-auto flex flex-col overflow-hidden'
          )}
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--elevation-sm)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="My Spaces"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-xl font-semibold">My Spaces</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? '\u00A0' : `${filteredCount} space(s) you're part of`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search + Filter row */}
          <div className="flex items-center gap-3 px-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            {/* Search input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search your spaces..."
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>

            {/* Visibility filter */}
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[120px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scrollable list body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <LoadingSkeleton />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Layers className="w-10 h-10" />}
                message="You're not part of any spaces yet."
                action={
                  <Button variant="outline" onClick={() => handleNavigate(browseAllHref)}>
                    Browse all spaces
                  </Button>
                }
              />
            ) : filteredGroups.length === 0 && hasFilters ? (
              <EmptyState
                icon={<SearchX className="w-10 h-10" />}
                message="No spaces match your search."
                action={
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <div>
                {filteredGroups.map((group, index) => (
                  <div key={group.parent.id}>
                    <ParentSpaceRow
                      group={group}
                      isExpanded={expandedIds.has(group.parent.id)}
                      onToggle={() => handleToggle(group.parent.id)}
                      onNavigate={handleNavigate}
                    />
                    {expandedIds.has(group.parent.id) &&
                      group.subspaces.map(subspace => (
                        <SubspaceRow key={subspace.id} item={subspace} onNavigate={handleNavigate} />
                      ))}
                    {index < filteredGroups.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export type { MembershipItem, MembershipRole, MyMembershipsPanelProps };

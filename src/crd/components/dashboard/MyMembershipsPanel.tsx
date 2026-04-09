import type { TFunction } from 'i18next';
import { ChevronRight, Globe, Layers, Lock, Search, SearchX, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';

// ── Types ──

type MembershipRole = 'admin' | 'lead' | 'member';

type MembershipItem = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  isPrivate: boolean;
  roles: MembershipRole[];
  initials: string;
  color: string;
  image?: string;
  children?: MembershipItem[];
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
  admin: 'destructive',
  lead: 'default',
  member: 'secondary',
};

function matchesSearch(item: MembershipItem, query: string): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  return item.name.toLowerCase().includes(lower) || (item.tagline?.toLowerCase().includes(lower) ?? false);
}

function passesHardFilter(item: MembershipItem, roleFilter: string, visibilityFilter: string): boolean {
  if (roleFilter !== 'all' && !item.roles.includes(roleFilter as MembershipRole)) return false;
  if (visibilityFilter === 'public' && item.isPrivate) return false;
  if (visibilityFilter === 'private' && !item.isPrivate) return false;
  return true;
}

// Recursively filter the tree:
// - An item is kept only if it passes the hard filter (role + visibility). A failing
//   item is dropped along with its descendants, which matches the strict "show me only
//   admin / only public" mental model.
// - Among items that pass the hard filter, we keep the item if it matches the search
//   itself OR has any descendant that matches the search (the ancestor is shown as
//   context so the tree structure is preserved).
function filterTree(
  items: MembershipItem[],
  search: string,
  roleFilter: string,
  visibilityFilter: string
): MembershipItem[] {
  const result: MembershipItem[] = [];

  for (const item of items) {
    if (!passesHardFilter(item, roleFilter, visibilityFilter)) continue;

    const filteredChildren = filterTree(item.children ?? [], search, roleFilter, visibilityFilter);
    const selfMatchesSearch = matchesSearch(item, search);

    if (!search || selfMatchesSearch || filteredChildren.length > 0) {
      result.push({ ...item, children: filteredChildren });
    }
  }

  return result;
}

function countTreeItems(items: MembershipItem[]): number {
  let total = 0;
  for (const item of items) {
    total += 1 + countTreeItems(item.children ?? []);
  }
  return total;
}

function collectAllIds(items: MembershipItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.id);
    ids.push(...collectAllIds(item.children ?? []));
  }
  return ids;
}

// Tailwind indent classes per depth — depth 0 is the base padding, deeper levels
// step in further so the tree structure is visually obvious.
const DEPTH_PADDING = ['pl-5', 'pl-14', 'pl-24'] as const;
function depthPadding(depth: number): string {
  return DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)];
}

// ── Sub-components ──

function RoleBadges({ roles, t }: { roles: MembershipRole[]; t: TFunction<'crd-dashboard'> }) {
  // `member` is implicit — every space in this panel is a membership, so a "Member"
  // badge would be redundant. Only highlight elevated roles (admin / lead).
  const visibleRoles = roles.filter(role => role !== 'member');
  if (visibleRoles.length === 0) return null;
  return (
    <div className="flex gap-1 shrink-0">
      {visibleRoles.map(role => (
        <Badge key={role} variant={ROLE_VARIANT[role]} className="text-[11px] font-normal">
          {t(`myMembershipsPanel.role.${role}`)}
        </Badge>
      ))}
    </div>
  );
}

function PrivacyIcon({ isPrivate, t }: { isPrivate: boolean; t: TFunction<'crd-dashboard'> }) {
  return isPrivate ? (
    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-label={t('myMembershipsPanel.privacy.private')} />
  ) : (
    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-label={t('myMembershipsPanel.privacy.public')} />
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

function NodeAvatar({ item }: { item: MembershipItem }) {
  return (
    <Avatar className="w-8 h-8 shrink-0 rounded-md">
      {item.image ? <AvatarImage src={item.image} alt="" className="rounded-md" /> : null}
      <AvatarFallback className="rounded-md text-[10px] text-white" style={{ backgroundColor: item.color }}>
        {item.initials}
      </AvatarFallback>
    </Avatar>
  );
}

function TreeNode({
  item,
  depth,
  expandedIds,
  onToggle,
  onNavigate,
  t,
}: {
  item: MembershipItem;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: (href: string) => void;
  t: TFunction<'crd-dashboard'>;
}) {
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const isRoot = depth === 0;

  return (
    <>
      {/* Row container — chevron is a sibling of the <a> so clicking it does not
          bubble to the link's click handler or trigger the browser's default
          navigation. */}
      <div
        className={cn(
          'flex items-center gap-3 pr-5 hover:bg-muted/40 transition-colors',
          depthPadding(depth),
          isRoot ? 'py-3' : 'py-2.5'
        )}
      >
        {/* Chevron toggle or spacer */}
        {hasChildren ? (
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center shrink-0 rounded hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => onToggle(item.id)}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? t('myMembershipsPanel.collapse', { name: item.name })
                : t('myMembershipsPanel.expand', { name: item.name })
            }
          >
            <ChevronRight
              className={cn('w-4 h-4 transition-transform duration-150', isExpanded && 'rotate-90')}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" aria-hidden="true" />
        )}

        {/* Clickable link area — everything to the right of the chevron */}
        <a
          href={item.href}
          className="flex-1 flex items-center gap-3 min-w-0 no-underline text-inherit focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
          onClick={e => {
            e.preventDefault();
            onNavigate(item.href);
          }}
        >
          <PrivacyIcon isPrivate={item.isPrivate} t={t} />

          {isRoot ? <BannerThumbnail image={item.image} color={item.color} /> : <NodeAvatar item={item} />}

          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium truncate">{item.name}</div>
            {isRoot && item.tagline && <div className="text-xs text-muted-foreground truncate">{item.tagline}</div>}
          </div>

          {hasChildren && (
            <Badge variant="outline" className="text-[11px] font-normal shrink-0">
              {t('myMembershipsPanel.subspaces', { count: children.length })}
            </Badge>
          )}

          <RoleBadges roles={item.roles} t={t} />
        </a>
      </div>

      {/* Recursive children */}
      {hasChildren &&
        isExpanded &&
        children.map(child => (
          <TreeNode
            key={child.id}
            item={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onNavigate={onNavigate}
            t={t}
          />
        ))}
    </>
  );
}

function LoadingSkeleton({ label }: { label: string }) {
  return (
    <output className="flex flex-col" aria-busy={true} aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
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
    </output>
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
  const { t } = useTranslation('crd-dashboard');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Expand all nodes by default when panel opens so the full tree is visible.
  useEffect(() => {
    if (open) {
      setExpandedIds(new Set(collectAllIds(items)));
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

  const filteredTree = filterTree(items, search, roleFilter, visibilityFilter);
  const filteredCount = countTreeItems(filteredTree);

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
            'pointer-events-auto flex flex-col overflow-hidden',
            'bg-background border border-border rounded-xl'
          )}
          style={{ boxShadow: 'var(--elevation-sm)' }}
          role="dialog"
          aria-modal="true"
          aria-label={t('myMembershipsPanel.title')}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-xl font-semibold">{t('myMembershipsPanel.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? '\u00A0' : t('myMembershipsPanel.subtitle', { count: filteredCount })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none p-1"
              aria-label={t('myMembershipsPanel.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search + Filter row */}
          <div className="flex items-center gap-3 px-6 pb-4 border-b border-border">
            {/* Search input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder={t('myMembershipsPanel.searchPlaceholder')}
                aria-label={t('myMembershipsPanel.searchPlaceholder')}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={t('myMembershipsPanel.clearSearch')}
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
                <SelectItem value="all">{t('myMembershipsPanel.filter.role.all')}</SelectItem>
                <SelectItem value="admin">{t('myMembershipsPanel.role.admin')}</SelectItem>
                <SelectItem value="lead">{t('myMembershipsPanel.role.lead')}</SelectItem>
                <SelectItem value="member">{t('myMembershipsPanel.role.member')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Visibility filter */}
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[120px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">{t('myMembershipsPanel.filter.visibility.all')}</SelectItem>
                <SelectItem value="public">{t('myMembershipsPanel.filter.visibility.public')}</SelectItem>
                <SelectItem value="private">{t('myMembershipsPanel.filter.visibility.private')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scrollable list body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <LoadingSkeleton label={t('myMembershipsPanel.loading')} />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Layers className="w-10 h-10" />}
                message={t('myMembershipsPanel.empty.noSpaces')}
                action={
                  <Button variant="outline" onClick={() => handleNavigate(browseAllHref)}>
                    {t('myMembershipsPanel.empty.browseAll')}
                  </Button>
                }
              />
            ) : filteredTree.length === 0 && hasFilters ? (
              <EmptyState
                icon={<SearchX className="w-10 h-10" />}
                message={t('myMembershipsPanel.empty.noMatches')}
                action={
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                  >
                    {t('myMembershipsPanel.empty.clearFilters')}
                  </button>
                }
              />
            ) : (
              <div>
                {filteredTree.map((rootItem, index) => (
                  <div key={rootItem.id}>
                    <TreeNode
                      item={rootItem}
                      depth={0}
                      expandedIds={expandedIds}
                      onToggle={handleToggle}
                      onNavigate={handleNavigate}
                      t={t}
                    />
                    {index < filteredTree.length - 1 && <Separator />}
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

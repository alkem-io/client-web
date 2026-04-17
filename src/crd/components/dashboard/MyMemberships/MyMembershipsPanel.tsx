import { Layers, Search, SearchX, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';
import { collectAllIds, countTreeItems, filterTree } from './filterHelpers';
import { TreeNode } from './TreeNode';
import type { MyMembershipsPanelProps } from './types';

// ── Sub-components ──

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
      <p className="text-body text-muted-foreground">{message}</p>
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
  browseAllHref,
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

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          'w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] sm:max-w-[calc(100%-3rem)]',
          'lg:w-[calc(100%-6rem)] lg:max-w-[calc(100%-6rem)] xl:max-w-[72rem]',
          'h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden',
          'bg-background border border-border rounded-xl shadow-[var(--elevation-sm)]'
        )}
        aria-describedby="memberships-panel-subtitle"
        closeLabel={t('myMembershipsPanel.close')}
      >
        <DialogDescription id="memberships-panel-subtitle" className="sr-only">
          {loading ? t('myMembershipsPanel.loading') : t('myMembershipsPanel.subtitle', { count: filteredCount })}
        </DialogDescription>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-section-title">{t('myMembershipsPanel.title')}</DialogTitle>
          <p className="text-body text-muted-foreground mt-1">
            {loading ? '\u00A0' : t('myMembershipsPanel.subtitle', { count: filteredCount })}
          </p>
        </div>

        {/* Search + Filter row */}
        <div className="flex items-center gap-3 px-6 pb-4 border-b border-border">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                aria-label={t('myMembershipsPanel.clearSearch')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Role filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px] shrink-0" aria-label={t('myMembershipsPanel.filter.role.label')}>
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
            <SelectTrigger className="w-[120px] shrink-0" aria-label={t('myMembershipsPanel.filter.visibility.label')}>
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
              icon={<Layers className="w-10 h-10" aria-hidden="true" />}
              message={t('myMembershipsPanel.empty.noSpaces')}
              action={
                <Button variant="outline" onClick={() => onNavigate(browseAllHref)}>
                  {t('myMembershipsPanel.empty.browseAll')}
                </Button>
              }
            />
          ) : filteredTree.length === 0 && hasFilters ? (
            <EmptyState
              icon={<SearchX className="w-10 h-10" aria-hidden="true" />}
              message={t('myMembershipsPanel.empty.noMatches')}
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-body text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
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
                    onNavigate={onNavigate}
                    t={t}
                  />
                  {index < filteredTree.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

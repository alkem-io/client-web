import {
  Filter,
  Grid,
  LayoutTemplate,
  List as ListIcon,
  MoreVertical,
  Pin,
  PinOff,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { Separator } from '@/crd/primitives/separator';

export type SubspaceFilter = 'all' | 'active' | 'archived';
export type SubspaceViewMode = 'grid' | 'list';

export type SubspaceTile = {
  id: string;
  name: string;
  description: string;
  href: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  color: string;
  initials: string;
  visibility: 'active' | 'archived';
  isPinned: boolean;
};

export type SubspaceKebabAction = 'pinToggle' | 'saveAsTemplate' | 'delete';

export type SpaceSettingsSubspacesViewProps = {
  subspaces: SubspaceTile[];
  canCreate: boolean;
  canSaveAsTemplate: boolean;
  loading?: boolean;
  onCreate: () => void;
  /**
   * Optional — only provided at L0 where subspace templates are managed.
   * Subspaces (L1) hide both the "Default subspace template" block and the
   * "Save as template" kebab action; the page passes `undefined` there.
   */
  onChangeDefaultTemplate?: () => void;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  className?: string;
};

export function SpaceSettingsSubspacesView({
  subspaces,
  canCreate,
  canSaveAsTemplate,
  loading,
  onCreate,
  onChangeDefaultTemplate,
  onKebabAction,
  className,
}: SpaceSettingsSubspacesViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SubspaceFilter>('all');
  const [viewMode, setViewMode] = useState<SubspaceViewMode>('grid');

  const filtered = subspaces.filter(s => {
    if (filter !== 'all' && s.visibility !== filter) return false;
    if (
      searchQuery &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div>
        <h2 className="text-page-title">{t('subspaces.pageHeader.title')}</h2>
        <p className="text-muted-foreground mt-2">{t('subspaces.pageHeader.subtitle')}</p>
      </div>

      <Separator />

      {/* Default Subspace Template — L0 only (subspace templates are managed at the top-level space). */}
      {onChangeDefaultTemplate && (
        <>
          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2 flex-1">
                <h3 className="text-subsection-title flex items-center gap-2">
                  <LayoutTemplate className="size-5 text-primary" />
                  {t('subspaces.defaultTemplate.title')}
                </h3>
                <p className="text-muted-foreground text-sm">{t('subspaces.defaultTemplate.description')}</p>
              </div>
              <Button type="button" onClick={onChangeDefaultTemplate}>
                {t('subspaces.defaultTemplate.change')}
              </Button>
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Subspaces List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-subsection-title flex items-center gap-2">
            {t('subspaces.listTitle')}
            <Badge variant="secondary" className="rounded-full">
              {filtered.length}
            </Badge>
          </h3>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={t('subspaces.search')}
                className="pl-9 h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter className="size-4" />
                  {t('subspaces.filterLabel')}{' '}
                  {filter === 'all'
                    ? t('subspaces.filter.all')
                    : filter === 'active'
                      ? t('subspaces.filter.active')
                      : t('subspaces.filter.archived')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>{t('subspaces.filter.all')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('active')}>
                  {t('subspaces.filter.activeOnly')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('archived')}>
                  {t('subspaces.filter.archivedOnly')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="border rounded-md flex items-center h-9 p-0.5 bg-muted/20">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-sm"
                onClick={() => setViewMode('grid')}
                aria-label={t('subspaces.viewMode.grid')}
                aria-pressed={viewMode === 'grid'}
              >
                <Grid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-sm"
                onClick={() => setViewMode('list')}
                aria-label={t('subspaces.viewMode.list')}
                aria-pressed={viewMode === 'list'}
              >
                <ListIcon className="size-4" />
              </Button>
            </div>

            {canCreate && (
              <Button size="sm" className="h-9 gap-2" onClick={onCreate}>
                <Plus className="size-4" />
                {t('subspaces.create')}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <SubspacesSkeletons viewMode={viewMode} />
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10">
            <div className="size-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="size-6 opacity-50" />
            </div>
            <h3 className="font-medium text-lg text-foreground">{t('subspaces.noResults')}</h3>
            <p className="text-sm mt-1">{t('subspaces.noResultsHint')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(subspace => (
              <SubspaceGridCard
                key={subspace.id}
                subspace={subspace}
                canSaveAsTemplate={canSaveAsTemplate}
                onKebabAction={onKebabAction}
              />
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            {filtered.map((subspace, i) => (
              <SubspaceListItem
                key={subspace.id}
                subspace={subspace}
                canSaveAsTemplate={canSaveAsTemplate}
                onKebabAction={onKebabAction}
                isLast={i === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubspaceGridCard({
  subspace,
  canSaveAsTemplate,
  onKebabAction,
}: {
  subspace: SubspaceTile;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
}) {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
      <div className="h-32 bg-muted relative overflow-hidden">
        {subspace.bannerUrl ? (
          <img
            src={subspace.bannerUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            style={{
              background: `linear-gradient(135deg, ${subspace.color}, color-mix(in srgb, ${subspace.color} 70%, black))`,
            }}
            aria-hidden="true"
          />
        )}
        {subspace.isPinned && (
          <div
            className="absolute top-2 left-2 rounded-full bg-background/85 backdrop-blur-sm p-1 shadow-sm"
            role="img"
            aria-label="Pinned"
            title="Pinned"
          >
            <Pin aria-hidden="true" className="size-3.5 text-amber-500" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <SubspaceKebab
            subspace={subspace}
            canSaveAsTemplate={canSaveAsTemplate}
            onKebabAction={onKebabAction}
            triggerClassName="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-black/5 hover:bg-background"
          />
        </div>
        {subspace.visibility === 'archived' && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <Badge variant="secondary" className="gap-1">
              Archived
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <a
            href={subspace.href}
            className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
          >
            {subspace.name}
          </a>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">{subspace.description}</p>
        </div>
      </div>
    </div>
  );
}

function SubspaceListItem({
  subspace,
  canSaveAsTemplate,
  onKebabAction,
  isLast,
}: {
  subspace: SubspaceTile;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors',
        !isLast && 'border-b border-border'
      )}
    >
      <div className="w-16 h-12 rounded bg-muted overflow-hidden shrink-0">
        {subspace.bannerUrl ? (
          <img src={subspace.bannerUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${subspace.color}, color-mix(in srgb, ${subspace.color} 70%, black))`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {subspace.isPinned && (
            <Pin aria-hidden="true" className="size-3.5 text-amber-500 shrink-0" aria-label="Pinned" />
          )}
          <a href={subspace.href} className="font-medium text-sm text-foreground truncate hover:underline">
            {subspace.name}
          </a>
          {subspace.visibility === 'archived' && (
            <Badge variant="secondary" className="text-[10px] py-0 h-5">
              Archived
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-md">{subspace.description}</p>
      </div>
      <div className="shrink-0">
        <SubspaceKebab subspace={subspace} canSaveAsTemplate={canSaveAsTemplate} onKebabAction={onKebabAction} />
      </div>
    </div>
  );
}

function SubspaceKebab({
  subspace,
  canSaveAsTemplate,
  onKebabAction,
  triggerClassName,
}: {
  subspace: SubspaceTile;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  triggerClassName?: string;
}) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={triggerClassName ?? 'h-8 w-8'}
          aria-label={t('subspaces.actions')}
        >
          <MoreVertical aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onKebabAction(subspace.id, 'pinToggle')}>
          {subspace.isPinned ? (
            <>
              <PinOff aria-hidden="true" className="size-4 mr-2" />
              {t('subspaces.kebab.unpin')}
            </>
          ) : (
            <>
              <Pin aria-hidden="true" className="size-4 mr-2" />
              {t('subspaces.kebab.pin')}
            </>
          )}
        </DropdownMenuItem>
        {canSaveAsTemplate && (
          <DropdownMenuItem onClick={() => onKebabAction(subspace.id, 'saveAsTemplate')}>
            <Save aria-hidden="true" className="size-4 mr-2" />
            {t('subspaces.kebab.saveAsTemplate')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onKebabAction(subspace.id, 'delete')}
        >
          <Trash2 aria-hidden="true" className="size-4 mr-2" />
          {t('subspaces.kebab.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SubspacesSkeletons({ viewMode }: { viewMode: SubspaceViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={cn('flex items-center gap-4 p-4 animate-pulse', i < 3 && 'border-b border-border')}>
            <div className="w-16 h-12 rounded bg-muted shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-[60%] rounded bg-muted mb-1" />
              <div className="h-3 w-[40%] rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-xl border overflow-hidden animate-pulse">
          <div className="h-32 bg-muted" />
          <div className="p-4">
            <div className="h-4 w-[70%] rounded bg-muted mb-2" />
            <div className="h-3 w-full rounded bg-muted mb-1" />
            <div className="h-3 w-[60%] rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

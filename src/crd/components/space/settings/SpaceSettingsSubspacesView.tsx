import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DraggableAttributes,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowDownAZ,
  Filter,
  Grid,
  GripVertical,
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
import { type CSSProperties, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSubspaceDragDisabled, type SubspaceSortMode } from '@/crd/lib/subspaceDrag';
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

/** Drag-handle wiring passed from a sortable wrapper down into a card/row. */
type SortableHandle = {
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  attributes: DraggableAttributes;
  listeners: ReturnType<typeof useSortable>['listeners'];
  isDragging: boolean;
  disabled: boolean;
  dragLabel: string;
};

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
  /** Current ordering mode. 'manual' = custom drag order; 'alphabetical' = name order (pinned lead). */
  sortMode: SubspaceSortMode;
  onSortModeChange: (mode: SubspaceSortMode) => void;
  /** Persist a new manual order (full id list, top-to-bottom). */
  onReorder: (orderedIds: string[]) => void;
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
  sortMode,
  onSortModeChange,
  onReorder,
  className,
}: SpaceSettingsSubspacesViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SubspaceFilter>('all');
  const [viewMode, setViewMode] = useState<SubspaceViewMode>('grid');

  // Optimistic manual order. Resync to the server order when the membership set
  // changes (add/remove) OR the sort mode changes (e.g. Custom→Alphabetical,
  // which reorders the SAME set — pinned float to the top). A pure post-drag
  // order change within the same mode is NOT resynced, so the row doesn't snap
  // back while the reorder mutation + refetch are in flight.
  const serverIds = subspaces.map(s => s.id);
  const resyncKey = `${sortMode}|${[...serverIds].sort().join('|')}`;
  const [orderedIds, setOrderedIds] = useState<string[]>(serverIds);
  const [syncedKey, setSyncedKey] = useState(resyncKey);
  if (resyncKey !== syncedKey) {
    setSyncedKey(resyncKey);
    setOrderedIds(serverIds);
  }
  const byId = new Map(subspaces.map(s => [s.id, s] as const));
  const orderedSubspaces = orderedIds.map(id => byId.get(id)).filter((s): s is SubspaceTile => Boolean(s));

  const filtered = orderedSubspaces.filter(s => {
    if (filter !== 'all' && s.visibility !== filter) return false;
    if (
      searchQuery &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  // Drag-reorder is only coherent over the full, unfiltered list — reordering a
  // searched/filtered subset can't map cleanly onto a full-order mutation.
  const reorderable = searchQuery === '' && filter === 'all';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next);
    onReorder(next);
  };

  const renderGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map(subspace =>
        reorderable ? (
          <SortableSubspaceGridCard
            key={subspace.id}
            subspace={subspace}
            sortMode={sortMode}
            canSaveAsTemplate={canSaveAsTemplate}
            onKebabAction={onKebabAction}
            dragLabel={t('subspaces.dragAriaLabel', { name: subspace.name })}
          />
        ) : (
          <SubspaceGridCard
            key={subspace.id}
            subspace={subspace}
            canSaveAsTemplate={canSaveAsTemplate}
            onKebabAction={onKebabAction}
          />
        )
      )}
    </div>
  );

  const renderList = (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {filtered.map((subspace, i) =>
        reorderable ? (
          <SortableSubspaceListItem
            key={subspace.id}
            subspace={subspace}
            sortMode={sortMode}
            canSaveAsTemplate={canSaveAsTemplate}
            onKebabAction={onKebabAction}
            isLast={i === filtered.length - 1}
            dragLabel={t('subspaces.dragAriaLabel', { name: subspace.name })}
          />
        ) : (
          <SubspaceListItem
            key={subspace.id}
            subspace={subspace}
            canSaveAsTemplate={canSaveAsTemplate}
            onKebabAction={onKebabAction}
            isLast={i === filtered.length - 1}
          />
        )
      )}
    </div>
  );

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
                  <LayoutTemplate aria-hidden="true" className="size-5 text-primary" />
                  {t('subspaces.defaultTemplate.title')}
                </h3>
                <p className="text-muted-foreground text-body">{t('subspaces.defaultTemplate.description')}</p>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h3 className="text-subsection-title flex shrink-0 items-center gap-2">
            {t('subspaces.listTitle')}
            <Badge variant="secondary" className="rounded-full">
              {filtered.length}
            </Badge>
          </h3>

          {/* Wrapping, width-bounded controls — buttons flow onto extra rows on
              narrow widths instead of overflowing the panel. */}
          <div className="flex w-full flex-wrap items-center gap-2 md:flex-1 md:justify-end">
            <div className="relative w-full sm:w-64">
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
                  <ArrowDownAZ className="size-4" />
                  {t('subspaces.sortMode.label')}{' '}
                  {sortMode === 'manual' ? t('subspaces.sortMode.custom') : t('subspaces.sortMode.alphabetical')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSortModeChange('alphabetical')}>
                  {t('subspaces.sortMode.alphabetical')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortModeChange('manual')}>
                  {t('subspaces.sortMode.custom')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            <h3 className="text-subsection-title text-foreground">{t('subspaces.noResults')}</h3>
            <p className="text-body mt-1">{t('subspaces.noResultsHint')}</p>
          </div>
        ) : reorderable ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={filtered.map(s => s.id)}
              strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {viewMode === 'grid' ? renderGrid : renderList}
            </SortableContext>
          </DndContext>
        ) : viewMode === 'grid' ? (
          renderGrid
        ) : (
          renderList
        )}
      </div>
    </div>
  );
}

/* ──────────────── Sortable wrappers ──────────────── */

function SortableSubspaceGridCard({
  subspace,
  sortMode,
  canSaveAsTemplate,
  onKebabAction,
  dragLabel,
}: {
  subspace: SubspaceTile;
  sortMode: SubspaceSortMode;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  dragLabel: string;
}) {
  const disabled = isSubspaceDragDisabled(sortMode, subspace.isPinned);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: subspace.id,
    disabled,
  });
  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  return (
    <SubspaceGridCard
      subspace={subspace}
      canSaveAsTemplate={canSaveAsTemplate}
      onKebabAction={onKebabAction}
      sortable={{ setNodeRef, style, attributes, listeners, isDragging, disabled, dragLabel }}
    />
  );
}

function SortableSubspaceListItem({
  subspace,
  sortMode,
  canSaveAsTemplate,
  onKebabAction,
  isLast,
  dragLabel,
}: {
  subspace: SubspaceTile;
  sortMode: SubspaceSortMode;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  isLast: boolean;
  dragLabel: string;
}) {
  const disabled = isSubspaceDragDisabled(sortMode, subspace.isPinned);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: subspace.id,
    disabled,
  });
  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  return (
    <SubspaceListItem
      subspace={subspace}
      canSaveAsTemplate={canSaveAsTemplate}
      onKebabAction={onKebabAction}
      isLast={isLast}
      sortable={{ setNodeRef, style, attributes, listeners, isDragging, disabled, dragLabel }}
    />
  );
}

function DragHandle({ sortable }: { sortable: SortableHandle }) {
  if (sortable.disabled) return null;
  return (
    <button
      type="button"
      aria-label={sortable.dragLabel}
      className="cursor-grab touch-none rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
      {...sortable.attributes}
      {...sortable.listeners}
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  );
}

function SubspaceGridCard({
  subspace,
  canSaveAsTemplate,
  onKebabAction,
  sortable,
}: {
  subspace: SubspaceTile;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  sortable?: SortableHandle;
}) {
  return (
    <div
      ref={sortable?.setNodeRef}
      style={sortable?.style}
      className={cn(
        'group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col',
        sortable?.isDragging && 'opacity-50'
      )}
    >
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
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {sortable && (
            <div className="rounded-full bg-background/85 backdrop-blur-sm p-1 shadow-sm">
              <DragHandle sortable={sortable} />
            </div>
          )}
          {subspace.isPinned && (
            <div
              className="rounded-full bg-background/85 backdrop-blur-sm p-1 shadow-sm"
              role="img"
              aria-label="Pinned"
              title="Pinned"
            >
              <Pin aria-hidden="true" className="size-3.5 text-amber-500" />
            </div>
          )}
        </div>
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
            className="text-subsection-title line-clamp-1 group-hover:text-primary transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {subspace.name}
          </a>
          <p className="text-body text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">{subspace.description}</p>
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
  sortable,
}: {
  subspace: SubspaceTile;
  canSaveAsTemplate: boolean;
  onKebabAction: (id: string, action: SubspaceKebabAction) => void;
  isLast: boolean;
  sortable?: SortableHandle;
}) {
  return (
    <div
      ref={sortable?.setNodeRef}
      style={sortable?.style}
      className={cn(
        'flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors',
        sortable?.isDragging && 'opacity-50',
        !isLast && 'border-b border-border'
      )}
    >
      {sortable && <DragHandle sortable={sortable} />}
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
          <a
            href={subspace.href}
            className="text-body-emphasis text-foreground truncate hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {subspace.name}
          </a>
          {subspace.visibility === 'archived' && (
            <Badge variant="secondary" className="text-badge py-0 h-5">
              Archived
            </Badge>
          )}
        </div>
        <p className="text-caption text-muted-foreground truncate max-w-md">{subspace.description}</p>
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

import { FolderOpen, Lock, Pin, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

export type SubspaceListCardData = {
  id: string;
  name: string;
  tagline?: string;
  bannerUrl?: string;
  tags: string[];
  isPrivate: boolean;
  isMember: boolean;
  isPinned: boolean;
  leads: Array<{ name: string; avatarUrl?: string }>;
  href: string;
};

type SubspaceFilter = 'all' | 'active' | 'archived';

type SpaceSubspacesListProps = {
  subspaces: SubspaceListCardData[];
  canCreate?: boolean;
  onCreateClick?: () => void;
  onSubspaceClick?: (href: string) => void;
  selectedTags?: string[];
  onTagSelect?: (tag: string) => void;
  className?: string;
};

export function SpaceSubspacesList({
  subspaces,
  canCreate,
  onCreateClick,
  onSubspaceClick,
  selectedTags = [],
  onTagSelect,
  className,
}: SpaceSubspacesListProps) {
  const { t } = useTranslation('crd-space');
  const [activeFilter, setActiveFilter] = useState<SubspaceFilter>('all');

  const filters: SubspaceFilter[] = ['all', 'active', 'archived'];
  const filterKeys: Record<SubspaceFilter, string> = {
    all: 'subspaces.filterAll',
    active: 'subspaces.filterActive',
    archived: 'subspaces.filterArchived',
  };

  // Filter by selected tags
  let filtered = subspaces;
  if (selectedTags.length > 0) {
    filtered = filtered.filter(s => selectedTags.some(tag => s.tags.includes(tag)));
  }

  return (
    <section className={cn('space-y-4', className)} aria-label={t('a11y.subspacesGrid')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t('subspaces.title')}</h2>
        {canCreate && (
          <Button size="sm" className="gap-2" onClick={onCreateClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('subspaces.createSubspace')}
          </Button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setActiveFilter(filter)}
          >
            {t(filterKeys[filter] as 'subspaces.filterAll')}
          </Button>
        ))}
      </div>

      {/* Subspace grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
          <FolderOpen className="w-10 h-10 text-muted-foreground mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">{t('subspaces.noSubspaces')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('subspaces.noSubspacesDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(subspace => (
            <a
              key={subspace.id}
              href={subspace.href}
              onClick={e => {
                if (onSubspaceClick) {
                  e.preventDefault();
                  onSubspaceClick(subspace.href);
                }
              }}
              className="group block border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Banner */}
              <div className="h-32 bg-muted relative">
                {subspace.bannerUrl ? (
                  <img src={subspace.bannerUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-accent" />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {subspace.isPrivate && (
                    <span className="bg-background/80 backdrop-blur-sm rounded p-1">
                      <Lock className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                    </span>
                  )}
                  {subspace.isPinned && (
                    <span className="bg-background/80 backdrop-blur-sm rounded p-1">
                      <Pin className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {subspace.name}
                </h3>
                {subspace.tagline && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{subspace.tagline}</p>
                )}

                {/* Tags */}
                {subspace.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {subspace.tags.slice(0, 3).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] px-1.5 cursor-pointer"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTagSelect?.(tag);
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Lead avatars */}
                {subspace.leads.length > 0 && (
                  <div className="flex -space-x-1 mt-3">
                    {subspace.leads.slice(0, 3).map(lead => (
                      <Avatar key={lead.name} className="w-6 h-6 border border-background">
                        {lead.avatarUrl && <AvatarImage src={lead.avatarUrl} alt={lead.name} />}
                        <AvatarFallback className="text-[8px]">{lead.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

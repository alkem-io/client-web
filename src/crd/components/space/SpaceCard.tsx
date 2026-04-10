import { Globe, Lock, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StackedAvatars } from '@/crd/components/common/StackedAvatars';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

export type SpaceLead = {
  name: string;
  avatarUrl: string;
  type: 'person' | 'org';
};

export type SpaceCardParent = {
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor: string;
};

export type SpaceCardData = {
  id: string;
  name: string;
  description: string;
  bannerImageUrl?: string;
  initials: string;
  avatarColor: string;
  isPrivate: boolean;
  isMember?: boolean;
  tags: string[];
  leads: SpaceLead[];
  href: string;
  matchedTerms?: boolean;
  parent?: SpaceCardParent;
};

export type SpaceCardProps = {
  space: SpaceCardData;
  onClick?: (space: SpaceCardData) => void;
  onParentClick?: (parent: SpaceCardParent) => void;
  className?: string;
};

const MAX_VISIBLE_LEADS = 4;

export function SpaceCard({ space, onClick, onParentClick, className }: SpaceCardProps) {
  const { t } = useTranslation(['crd-exploreSpaces', 'crd-common']);

  const visibleLeads = space.leads.slice(0, MAX_VISIBLE_LEADS);
  const overflowCount = space.leads.length - MAX_VISIBLE_LEADS;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(space);
    }
  };

  return (
    <a
      href={space.href}
      onClick={handleClick}
      className={cn(
        'group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl',
        className
      )}
    >
      <article className="h-full flex flex-col rounded-xl bg-card border border-border shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30 transition-all duration-300">
        {/* Banner Image */}
        <div className="relative z-0">
          <div className="overflow-hidden rounded-t-xl aspect-video">
            {space.bannerImageUrl ? (
              <img
                src={space.bannerImageUrl}
                alt={space.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full" style={backgroundGradient(space.avatarColor)} aria-hidden="true" />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, color-mix(in srgb, var(--foreground) 25%, transparent) 0%, transparent 50%)',
              }}
            />
          </div>

          {/* Member badge */}
          {space.isMember && (
            <div className="absolute top-3 left-4 z-[3]">
              <output className="flex items-center gap-1 px-2 py-1 rounded-full bg-white text-primary text-[10px] font-semibold">
                <UserCheck aria-hidden="true" className="size-2.5" />
                <span>{t('crd-common:member')}</span>
              </output>
            </div>
          )}

          {/* Privacy badge */}
          <div className="absolute top-3 right-3 z-[3]">
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm text-[10px] font-semibold',
                space.isPrivate ? 'bg-foreground/50 text-primary-foreground' : 'bg-background/85 text-foreground'
              )}
            >
              {space.isPrivate ? (
                <Lock aria-hidden="true" className="size-2.5" />
              ) : (
                <Globe aria-hidden="true" className="size-2.5" />
              )}
              <span>{space.isPrivate ? t('crd-common:private') : t('crd-common:public')}</span>
            </div>
          </div>

          {/* Space avatar — overlaps banner and card body */}
          <div className="absolute left-4 -bottom-[18px] z-10">
            <StackedAvatars
              primary={{ initials: space.initials, avatarColor: space.avatarColor }}
              secondary={
                space.parent
                  ? {
                      initials: space.parent.initials,
                      avatarUrl: space.parent.avatarUrl,
                      avatarColor: space.parent.avatarColor,
                      name: space.parent.name,
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 px-4 pt-6">
          {/* Name */}
          <h3 className="truncate text-sm font-semibold text-card-foreground leading-[1.3] transition-colors duration-200">
            {space.name}
          </h3>

          {/* Parent indicator for subspaces */}
          {space.parent && (
            <p className="truncate text-[11px] text-muted-foreground mt-0.5">
              {t('spaces.in')}:{' '}
              <button
                type="button"
                className="text-muted-foreground hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit text-[11px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (space.parent) onParentClick?.(space.parent);
                }}
              >
                {space.parent.name}
              </button>
            </p>
          )}

          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground mt-2 leading-normal">{space.description}</p>

          {/* Tags */}
          {space.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {space.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] font-medium px-2 py-0 rounded-full">
                  {tag}
                </Badge>
              ))}
              {space.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-2 py-0 rounded-full text-muted-foreground"
                >
                  +{space.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Card Footer — Leads only */}
        {space.leads.length > 0 && (
          <div className="flex items-center mt-3 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.04em]">
                {t('crd-common:leads')}
              </span>
              <div className="flex -space-x-2">
                {visibleLeads.map(lead => (
                  <Avatar
                    key={lead.name}
                    className="size-[26px] border-2 border-card"
                    aria-label={`${lead.name} (${t(`crd-common:leadType.${lead.type}`)})`}
                  >
                    <AvatarImage src={lead.avatarUrl} alt="" />
                    <AvatarFallback
                      className={cn(
                        'text-[9px] font-semibold',
                        lead.type === 'org'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {lead.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {overflowCount > 0 && (
                  <span className="flex items-center justify-center size-[26px] border-2 border-card rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                    <span aria-hidden="true">+{overflowCount}</span>
                    <span className="sr-only">{t('spaces.moreLeads', { count: overflowCount })}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </article>
    </a>
  );
}

export function SpaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl animate-pulse bg-card border border-border">
      <div className="aspect-video bg-muted" />
      <div className="px-4 pt-6">
        <div className="rounded w-[70%] h-3.5 bg-muted mb-2" />
        <div className="rounded w-full h-3 bg-muted mb-1" />
        <div className="rounded w-[60%] h-3 bg-muted mb-3" />
        <div className="flex gap-1.5">
          <div className="rounded-full w-12 h-[18px] bg-muted" />
          <div className="rounded-full w-14 h-[18px] bg-muted" />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 mt-3 border-t border-border">
        <div className="flex -space-x-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-full border-2 size-[26px] bg-muted border-card" />
          ))}
        </div>
        <div className="rounded w-10 h-3 bg-muted" />
      </div>
    </div>
  );
}

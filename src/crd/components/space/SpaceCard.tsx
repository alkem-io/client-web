import { Globe, Lock, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  className?: string;
};

const MAX_VISIBLE_LEADS = 4;

export function SpaceCard({ space, onClick, className }: SpaceCardProps) {
  const { t } = useTranslation();

  const visibleLeads = space.leads.slice(0, MAX_VISIBLE_LEADS);
  const overflowCount = space.leads.length - MAX_VISIBLE_LEADS;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(space);
    }
  };

  return (
    <a href={space.href} onClick={handleClick} className={cn('group block h-full outline-none', className)}>
      <div
        className="h-full flex flex-col rounded-xl transition-all duration-300"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--elevation-sm)';
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 30%, var(--border))';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        {/* Banner Image */}
        <div className="relative" style={{ zIndex: 0 }}>
          <div className="overflow-hidden rounded-t-xl" style={{ aspectRatio: '16 / 9' }}>
            {space.bannerImageUrl ? (
              <img
                src={space.bannerImageUrl}
                alt={space.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)',
                }}
              />
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
            <div className="absolute top-3 left-4" style={{ zIndex: 3 }}>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  background: 'white',
                  color: '#1d384a',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                <UserCheck style={{ width: 10, height: 10 }} />
                <span>{t('crd.spaces.member')}</span>
              </div>
            </div>
          )}

          {/* Privacy badge */}
          <div className="absolute top-3 right-3" style={{ zIndex: 3 }}>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{
                background: space.isPrivate ? '#1d384a' : 'white',
                color: space.isPrivate ? 'white' : '#1d384a',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              {space.isPrivate ? (
                <Lock style={{ width: 10, height: 10 }} />
              ) : (
                <Globe style={{ width: 10, height: 10 }} />
              )}
              <span>{space.isPrivate ? t('crd.spaces.private') : t('crd.spaces.public')}</span>
            </div>
          </div>

          {/* Space avatar — overlaps banner and card body */}
          <div className="absolute left-4" style={{ bottom: -18, zIndex: 10 }}>
            {space.parent ? (
              /* Stacked avatars for subspace: parent behind, subspace in front */
              <div className="relative" style={{ width: 44, height: 44 }}>
                {/* Parent avatar (behind) */}
                <div
                  className="absolute top-0 left-0 overflow-hidden flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius)',
                    border: '2px solid var(--card)',
                    background: space.parent.avatarColor,
                    zIndex: 1,
                  }}
                >
                  {space.parent.avatarUrl ? (
                    <img src={space.parent.avatarUrl} alt={space.parent.name} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary-foreground)' }}>
                      {space.parent.initials}
                    </span>
                  )}
                </div>
                {/* Subspace avatar (in front) */}
                <div
                  className="absolute bottom-0 right-0 overflow-hidden flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius)',
                    border: '2.5px solid var(--card)',
                    background: space.avatarColor,
                    zIndex: 2,
                    boxShadow: 'var(--elevation-sm)',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-foreground)' }}>
                    {space.initials}
                  </span>
                </div>
              </div>
            ) : (
              /* Single avatar for top-level space */
              <div
                className="overflow-hidden flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius)',
                  border: '2.5px solid var(--card)',
                  background: space.avatarColor,
                  boxShadow: 'var(--elevation-sm)',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-foreground)' }}>
                  {space.initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1" style={{ padding: '24px 16px 0' }}>
          {/* Name */}
          <h3
            className="truncate transition-colors duration-200"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--card-foreground)',
              lineHeight: 1.3,
            }}
          >
            {space.name}
          </h3>

          {/* Parent indicator for subspaces */}
          {space.parent && (
            <p
              className="truncate"
              style={{
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                marginTop: 2,
              }}
            >
              {t('crd.spaces.in')}:{' '}
              <span
                className="hover:underline"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = space.parent!.href;
                }}
              >
                {space.parent.name}
              </span>
            </p>
          )}

          {/* Description */}
          <p
            className="line-clamp-2"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {space.description}
          </p>

          {/* Tags */}
          {space.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
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
          <div
            className="flex items-center mt-auto"
            style={{
              padding: '12px 16px',
              marginTop: 12,
              borderTop: '1px solid var(--border)',
            }}
          >
            {/* Lead Avatars */}
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t('crd.spaces.leads')}
              </span>
              <div className="flex -space-x-2">
                {visibleLeads.map((lead, i) => (
                  <Avatar
                    key={i}
                    className="border-2"
                    style={{
                      width: 26,
                      height: 26,
                      borderColor: 'var(--card)',
                    }}
                    title={`${lead.name} (${lead.type})`}
                  >
                    <AvatarImage src={lead.avatarUrl} alt={lead.name} />
                    <AvatarFallback
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        background: lead.type === 'org' ? 'var(--accent)' : 'var(--secondary)',
                        color: lead.type === 'org' ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
                      }}
                    >
                      {lead.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {overflowCount > 0 && (
                  <div
                    className="flex items-center justify-center border-2 rounded-full"
                    style={{
                      width: 26,
                      height: 26,
                      borderColor: 'var(--card)',
                      background: 'var(--muted)',
                      fontSize: '9px',
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    +{overflowCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </a>
  );
}

export function SpaceCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl animate-pulse"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Banner skeleton */}
      <div style={{ aspectRatio: '16 / 9', background: 'var(--muted)' }} />

      {/* Body skeleton */}
      <div style={{ padding: '24px 16px 0' }}>
        <div className="rounded" style={{ width: '70%', height: 14, background: 'var(--muted)', marginBottom: 8 }} />
        <div className="rounded" style={{ width: '100%', height: 12, background: 'var(--muted)', marginBottom: 4 }} />
        <div className="rounded" style={{ width: '60%', height: 12, background: 'var(--muted)', marginBottom: 12 }} />
        <div className="flex gap-1.5">
          <div className="rounded-full" style={{ width: 48, height: 18, background: 'var(--muted)' }} />
          <div className="rounded-full" style={{ width: 56, height: 18, background: 'var(--muted)' }} />
        </div>
      </div>

      {/* Footer skeleton */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '12px 16px', marginTop: 12, borderTop: '1px solid var(--border)' }}
      >
        <div className="flex -space-x-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full border-2"
              style={{ width: 26, height: 26, background: 'var(--muted)', borderColor: 'var(--card)' }}
            />
          ))}
        </div>
        <div className="rounded" style={{ width: 40, height: 12, background: 'var(--muted)' }} />
      </div>
    </div>
  );
}

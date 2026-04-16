import type { TFunction } from 'i18next';
import { ChevronRight, Globe, Lock } from 'lucide-react';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import type { MembershipItem, MembershipRole } from './types';

const ROLE_VARIANT: Record<MembershipRole, 'destructive' | 'default' | 'secondary'> = {
  admin: 'destructive',
  lead: 'default',
  member: 'secondary',
};

// Tailwind indent classes per depth — depth 0 is the base padding, deeper levels
// step in further so the tree structure is visually obvious.
const DEPTH_PADDING = ['pl-5', 'pl-14', 'pl-24'] as const;
function depthPadding(depth: number): string {
  return DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)];
}

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

  return <div className="w-16 h-10 rounded-md shrink-0" style={backgroundGradient(color)} aria-hidden="true" />;
}

function NodeAvatar({ item }: { item: MembershipItem }) {
  return (
    <Avatar className="w-8 h-8 shrink-0 rounded-md">
      {item.image ? <AvatarImage src={item.image} alt="" className="rounded-md" /> : null}
      <AvatarFallback className={cn('rounded-md text-badge', item.color && 'text-white')} color={item.color}>
        {item.initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function TreeNode({
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
    <div>
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
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
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
        </div>
      )}
    </div>
  );
}

import { Building2, ChevronLeft, ChevronRight, Search, Shield, User, UserCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent } from '@/crd/primitives/card';

export type MemberRoleType = 'admin' | 'moderator' | 'member';
export type MemberRoleKey = 'admin' | 'lead' | 'member' | 'organization';

export type MemberCardData = {
  id: string;
  name: string;
  avatarUrl?: string;
  type: 'user' | 'organization';
  /**
   * Primary role used for the displayed badge label. Derived via
   * precedence Admin > Lead > Member. For organizations this is
   * always `'organization'`.
   */
  role?: MemberRoleKey;
  /**
   * Full list of roles the member holds. Used by the filter pills so a
   * user who is both Admin and Lead appears under both filters. For
   * organizations this is always `['organization']`.
   */
  roles?: MemberRoleKey[];
  /** Drives the badge colour — only set for users. */
  roleType?: MemberRoleType;
  location?: string;
  tagline?: string;
  tags: string[];
  href: string;
};

type MemberFilter = 'all' | 'admin' | 'lead' | 'member' | 'organization';

type SpaceMembersProps = {
  members: MemberCardData[];
  /** Counts for the section subtitle. If omitted, derived from `members`. */
  usersCount?: number;
  organizationsCount?: number;
  /** Optional title override — defaults to t('members.title'). */
  title?: string;
  /** Optional subtitle override — defaults to t('members.subtitle') with counts. */
  subtitle?: string;
  /** Pagination size (default: 9, matches prototype). */
  pageSize?: number;
  /** Invite action — button only renders when both `canInvite` and `onInvite` are set. */
  canInvite?: boolean;
  onInvite?: () => void;
  onMemberClick?: (href: string) => void;
  className?: string;
};

const DEFAULT_PAGE_SIZE = 9;
const FILTERS: MemberFilter[] = ['all', 'admin', 'lead', 'member', 'organization'];

const ROLE_BADGE_CLASSES: Record<MemberRoleType, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  moderator: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  member: 'bg-muted text-muted-foreground border-border',
};

export function SpaceMembers({
  members,
  usersCount,
  organizationsCount,
  title,
  subtitle,
  pageSize = DEFAULT_PAGE_SIZE,
  canInvite,
  onInvite,
  onMemberClick,
  className,
}: SpaceMembersProps) {
  const { t } = useTranslation('crd-space');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MemberFilter>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const totalUsers = usersCount ?? members.filter(m => m.type === 'user').length;
  const totalOrgs = organizationsCount ?? members.filter(m => m.type === 'organization').length;

  const filterLabels: Record<MemberFilter, string> = {
    all: t('members.filterAll'),
    admin: t('members.filterAdmin'),
    lead: t('members.filterLead'),
    member: t('members.filterMember'),
    organization: t('members.filterOrganization'),
  };

  const roleLabels: Record<MemberRoleKey, string> = {
    admin: t('members.role.admin'),
    lead: t('members.role.lead'),
    member: t('members.role.member'),
    organization: t('members.role.organization'),
  };

  // Apply search + filter
  let filtered = members;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(m => m.name.toLowerCase().includes(query) || m.tagline?.toLowerCase().includes(query));
  }
  if (activeFilter === 'organization') {
    filtered = filtered.filter(m => m.type === 'organization');
  } else if (activeFilter !== 'all') {
    // Admin + Lead are not mutually exclusive — a user who holds both roles
    // appears under both filters. Match against the full `roles` list, not
    // just the derived primary `role` used for the display badge.
    filtered = filtered.filter(m => m.type === 'user' && (m.roles?.includes(activeFilter) ?? m.role === activeFilter));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageMembers = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setCurrentPage(0);
  };

  const hasActiveFilter = searchQuery.length > 0 || activeFilter !== 'all';

  return (
    <section className={cn('space-y-6', className)} aria-label={t('a11y.membersGrid')}>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-page-title text-foreground">{title ?? t('members.title')}</h2>
          <p className="mt-1 text-body text-muted-foreground">
            {subtitle ?? t('members.subtitle', { users: totalUsers, organizations: totalOrgs })}
          </p>
        </div>
        {canInvite && onInvite && (
          <Button className="shrink-0 gap-2" onClick={onInvite}>
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            {t('members.inviteMember')}
          </Button>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t('members.search')}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            aria-label={t('members.search')}
            className="w-full h-10 pl-9 pr-4 border border-border bg-background rounded-lg text-body text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(0);
                }}
                aria-pressed={isActive}
                className={cn(
                  'px-3 py-2 text-body-emphasis rounded-lg border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                )}
              >
                {filterLabels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasActiveFilter={hasActiveFilter} onClear={resetFilters} />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pageMembers.map(member => (
            <li key={member.id}>
              {member.type === 'user' ? (
                <UserCard member={member} roleLabels={roleLabels} onMemberClick={onMemberClick} />
              ) : (
                <OrganizationCard org={member} orgLabel={roleLabels.organization} onMemberClick={onMemberClick} />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label={t('members.previousPage')}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <span className="mx-2 text-body text-muted-foreground">
            {t('members.pageOf', { current: safePage + 1, total: totalPages })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            aria-label={t('members.nextPage')}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  );
}

function EmptyState({ hasActiveFilter, onClear }: { hasActiveFilter: boolean; onClear: () => void }) {
  const { t } = useTranslation('crd-space');
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted">
        <User className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-subsection-title text-foreground">{t('members.empty.title')}</h3>
      <p className="mt-1 text-body text-muted-foreground">{t('members.empty.description')}</p>
      {hasActiveFilter && (
        <Button variant="link" className="mt-2 text-primary" onClick={onClear}>
          {t('members.empty.clearFilters')}
        </Button>
      )}
    </div>
  );
}

function getRoleBadgeClasses(roleType: MemberRoleType | undefined): string {
  if (!roleType) return ROLE_BADGE_CLASSES.member;
  return ROLE_BADGE_CLASSES[roleType];
}

function getRoleIcon(roleType: MemberRoleType | undefined) {
  switch (roleType) {
    case 'admin':
      return <Shield className="w-3 h-3 mr-1" aria-hidden="true" />;
    case 'moderator':
      return <UserCheck className="w-3 h-3 mr-1" aria-hidden="true" />;
    default:
      return <User className="w-3 h-3 mr-1" aria-hidden="true" />;
  }
}

type UserCardProps = {
  member: MemberCardData;
  roleLabels: Record<MemberRoleKey, string>;
  onMemberClick?: (href: string) => void;
};

function UserCard({ member, roleLabels, onMemberClick }: UserCardProps) {
  const roleLabel = member.role ? roleLabels[member.role] : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (onMemberClick) {
      e.preventDefault();
      onMemberClick(member.href);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-3">
          <a
            href={member.href}
            onClick={handleClick}
            className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="w-12 h-12 border border-border">
              {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
              <AvatarFallback className="text-card-title">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </a>
          <div className="min-w-0 flex-1">
            <a
              href={member.href}
              onClick={handleClick}
              className="block text-card-title text-foreground truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {member.name}
            </a>
            {roleLabel && (
              <span
                className={cn(
                  'inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-caption font-medium border',
                  getRoleBadgeClasses(member.roleType)
                )}
              >
                {getRoleIcon(member.roleType)}
                {roleLabel}
              </span>
            )}
            {member.tagline && <p className="mt-2 text-body text-muted-foreground line-clamp-2">{member.tagline}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type OrgCardProps = {
  org: MemberCardData;
  orgLabel: string;
  onMemberClick?: (href: string) => void;
};

function OrganizationCard({ org, orgLabel, onMemberClick }: OrgCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onMemberClick) {
      e.preventDefault();
      onMemberClick(org.href);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-3">
          <a
            href={org.href}
            onClick={handleClick}
            className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="w-12 h-12 rounded-md border border-border">
              {org.avatarUrl && <AvatarImage src={org.avatarUrl} alt={org.name} className="rounded-md" />}
              <AvatarFallback className="rounded-md text-card-title">{org.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </a>
          <div className="min-w-0 flex-1">
            <a
              href={org.href}
              onClick={handleClick}
              className="block text-card-title text-foreground truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {org.name}
            </a>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-label border border-border bg-muted text-muted-foreground">
              <Building2 className="w-3 h-3" aria-hidden="true" />
              {orgLabel}
            </span>
            {org.tagline && <p className="mt-2 text-body text-muted-foreground line-clamp-2">{org.tagline}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

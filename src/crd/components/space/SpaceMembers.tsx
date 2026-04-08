import { ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

export type MemberCardData = {
  id: string;
  name: string;
  avatarUrl?: string;
  type: 'user' | 'organization';
  location?: string;
  tagline?: string;
  tags: string[];
  href: string;
};

type MemberFilter = 'all' | 'host' | 'admin' | 'lead' | 'member' | 'organization';

type SpaceMembersProps = {
  members: MemberCardData[];
  filters?: MemberFilter[];
  pageSize?: number;
  onMemberClick?: (href: string) => void;
  className?: string;
};

const DEFAULT_FILTERS: MemberFilter[] = ['all', 'host', 'admin', 'lead', 'member', 'organization'];
const DEFAULT_PAGE_SIZE = 12;

export function SpaceMembers({
  members,
  filters = DEFAULT_FILTERS,
  pageSize = DEFAULT_PAGE_SIZE,
  onMemberClick,
  className,
}: SpaceMembersProps) {
  const { t } = useTranslation('crd-space');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MemberFilter>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const filterKeys: Record<MemberFilter, string> = {
    all: 'members.filterAll',
    host: 'members.filterHost',
    admin: 'members.filterAdmin',
    lead: 'members.filterLead',
    member: 'members.filterMember',
    organization: 'members.filterOrganization',
  };

  // Filter members
  let filtered = members;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(m => m.name.toLowerCase().includes(query) || m.tagline?.toLowerCase().includes(query));
  }
  if (activeFilter === 'organization') {
    filtered = filtered.filter(m => m.type === 'organization');
  } else if (activeFilter !== 'all') {
    filtered = filtered.filter(m => m.type === 'user');
  }

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageMembers = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <section className={cn('space-y-4', className)} aria-label={t('a11y.membersGrid')}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          placeholder={t('members.search')}
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setCurrentPage(0);
          }}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={t('members.search')}
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => {
              setActiveFilter(filter);
              setCurrentPage(0);
            }}
          >
            {t(filterKeys[filter] as 'members.filterAll')}
          </Button>
        ))}
      </div>

      {/* Member grid */}
      {pageMembers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('members.noMembers')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageMembers.map(member => (
            <a
              key={member.id}
              href={member.href}
              onClick={e => {
                if (onMemberClick) {
                  e.preventDefault();
                  onMemberClick(member.href);
                }
              }}
              className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-10 h-10 shrink-0">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                {member.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {member.location}
                  </p>
                )}
                {member.tagline && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{member.tagline}</p>}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
            {t('members.previousPage')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('members.pageOf', { current: currentPage + 1, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            {t('members.nextPage')}
            <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  );
}

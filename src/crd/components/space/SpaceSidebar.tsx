import { Info, Mail, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { CommunityGuidelinesSection } from './sidebar/CommunityGuidelinesSection';
import { EventsSection } from './sidebar/EventsSection';
import { InfoBlock } from './sidebar/InfoBlock';
import { KnowledgeIndexSection } from './sidebar/KnowledgeIndexSection';
import { LeadBlock, type LeadItem } from './sidebar/LeadBlock';
import { SubspacesSection } from './sidebar/SubspacesSection';
import { VirtualContributorsSection } from './sidebar/VirtualContributorsSection';

type SubspaceItem = {
  name: string;
  initials: string;
  color: string;
  href: string;
};

type VirtualContributorItem = {
  name: string;
  description?: string;
  avatarUrl?: string;
  initials: string;
  href?: string;
};

type EventItem = {
  title: string;
  date: string;
};

type KnowledgeEntry = {
  id: string;
  title: string;
  type: 'text' | 'collection';
};

type SpaceSidebarProps = {
  variant: 'home' | 'community' | 'subspaces' | 'knowledge';
  description: string;
  // Home & Knowledge
  onAboutClick?: () => void;
  subspaces?: SubspaceItem[];
  subspacesHref?: string;
  onSubspaceClick?: (href: string) => void;
  events?: EventItem[];
  onShowCalendar?: () => void;
  onAddEvent?: () => void;
  // Knowledge
  knowledgeEntries?: KnowledgeEntry[];
  onKnowledgeEntryClick?: (id: string) => void;
  // Community
  leads?: LeadItem[];
  onContactLead?: () => void;
  onInvite?: () => void;
  canInvite?: boolean;
  canContactLeads?: boolean;
  virtualContributors?: VirtualContributorItem[];
  onVirtualContributorClick?: (href: string) => void;
  /** When false, the entire VC section is hidden even if `virtualContributors` is non-empty. */
  showVirtualContributors?: boolean;
  guidelines?: string[];
  // Extra
  children?: ReactNode;
  className?: string;
};

export function SpaceSidebar({
  variant,
  description,
  onAboutClick,
  subspaces = [],
  subspacesHref,
  onSubspaceClick,
  events = [],
  onShowCalendar,
  onAddEvent,
  knowledgeEntries = [],
  onKnowledgeEntryClick,
  leads = [],
  onContactLead,
  onInvite,
  canInvite,
  canContactLeads = true,
  virtualContributors = [],
  onVirtualContributorClick,
  showVirtualContributors = true,
  guidelines = [],
  children,
  className,
}: SpaceSidebarProps) {
  const { t } = useTranslation('crd-space');

  return (
    <nav className={cn('space-y-6 w-full', className)} aria-label={t('a11y.sidebarNavigation')}>
      {/* Info Block — shared across all variants */}
      <InfoBlock description={description} onReadMore={onAboutClick} />

      {/* Variant-specific content */}
      {(variant === 'home' || variant === 'knowledge') && (
        <>
          {onAboutClick && (
            <Button
              variant="outline"
              className="w-full uppercase tracking-wider gap-2 text-sm font-medium"
              onClick={onAboutClick}
            >
              <Info className="w-4 h-4" aria-hidden="true" />
              {t('sidebar.aboutSpace')}
            </Button>
          )}

          {variant === 'home' && subspaces.length > 0 && (
            <SubspacesSection subspaces={subspaces} showAllHref={subspacesHref} onSubspaceClick={onSubspaceClick} />
          )}

          {variant === 'knowledge' && knowledgeEntries.length > 0 && (
            <KnowledgeIndexSection entries={knowledgeEntries} onEntryClick={onKnowledgeEntryClick} />
          )}

          <EventsSection events={events} onShowCalendar={onShowCalendar} onAddEvent={onAddEvent} />
        </>
      )}

      {variant === 'community' && (
        <>
          {leads.length > 0 && <LeadBlock leads={leads} />}

          {(canContactLeads || (canInvite && onInvite)) && (
            <div className="flex gap-2">
              {canContactLeads && onContactLead && (
                <Button variant="outline" className="flex-1 gap-2 text-sm font-medium" onClick={onContactLead}>
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  {t('sidebar.contactLead')}
                </Button>
              )}
              {canInvite && onInvite && (
                <Button className="flex-1 gap-2 text-sm font-medium" onClick={onInvite}>
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  {t('sidebar.invite')}
                </Button>
              )}
            </div>
          )}

          {showVirtualContributors && virtualContributors.length > 0 && (
            <VirtualContributorsSection
              contributors={virtualContributors}
              onContributorClick={onVirtualContributorClick}
            />
          )}

          {guidelines.length > 0 && <CommunityGuidelinesSection guidelines={guidelines} />}
        </>
      )}

      {variant === 'subspaces' && (
        <SubspacesSection subspaces={subspaces} showAll={true} onSubspaceClick={onSubspaceClick} />
      )}

      {children}
    </nav>
  );
}

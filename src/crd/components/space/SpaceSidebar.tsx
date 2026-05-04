import type { Locale } from 'date-fns';
import { Info, Mail, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { CommunityGuidelinesSection } from './sidebar/CommunityGuidelinesSection';
import { EventsSection } from './sidebar/EventsSection';
import { InfoBlock, type LeadItem } from './sidebar/InfoBlock';
import { KnowledgeIndexSection } from './sidebar/KnowledgeIndexSection';
import { SubspacesSection } from './sidebar/SubspacesSection';
import { VirtualContributorsSection } from './sidebar/VirtualContributorsSection';

type SubspaceItem = {
  name: string;
  initials: string;
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
  id: string;
  title: string;
  startDate: Date | undefined;
  url?: string;
};

type KnowledgeEntry = {
  id: string;
  title: string;
  type: 'text' | 'collection';
  description?: string;
  tags?: string[];
};

type SpaceSidebarProps = {
  variant: 'home' | 'community' | 'subspaces' | 'knowledge';
  description: string;
  /** Pencil overlay on the InfoBlock — opens the settings/about page (edit mode). */
  onEditClick?: () => void;
  /** "About this Space" button on the home tab — opens the read-only about dialog. */
  onAboutClick?: () => void;
  subspaces?: SubspaceItem[];
  subspacesHref?: string;
  onSubspaceClick?: (href: string) => void;
  events?: EventItem[];
  onShowCalendar?: () => void;
  onAddEvent?: () => void;
  onEventClick?: (event: EventItem) => void;
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
  /** date-fns Locale forwarded to nested EventsSection. Resolved by the
   *  consumer via `useCrdSpaceLocale()`. Defaults to enUS inside EventsSection. */
  locale?: Locale;
};

export function SpaceSidebar({
  variant,
  description,
  onEditClick,
  onAboutClick,
  subspaces = [],
  subspacesHref,
  onSubspaceClick,
  events = [],
  onShowCalendar,
  onAddEvent,
  onEventClick,
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
  locale,
}: SpaceSidebarProps) {
  const { t } = useTranslation('crd-space');

  return (
    <nav className={cn('space-y-6 w-full', className)} aria-label={t('a11y.sidebarNavigation')}>
      {/* Info Block — shared across all variants */}
      <InfoBlock description={description} leads={leads} onEditClick={onEditClick} />

      {variant === 'home' && onAboutClick && (
        <Button variant="outline" className="w-full uppercase gap-2 font-medium px-2" onClick={onAboutClick}>
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate text-[clamp(0.5rem,1.05vw,0.875rem)] leading-tight">{t('sidebar.aboutSpace')}</span>
        </Button>
      )}

      {/* Variant-specific content */}
      {(variant === 'home' || variant === 'knowledge') && (
        <>
          {variant === 'home' && subspaces.length > 0 && (
            <SubspacesSection subspaces={subspaces} showAllHref={subspacesHref} onSubspaceClick={onSubspaceClick} />
          )}

          {variant === 'knowledge' && knowledgeEntries.length > 0 && (
            <KnowledgeIndexSection entries={knowledgeEntries} onEntryClick={onKnowledgeEntryClick} />
          )}

          {variant === 'home' && (
            <EventsSection
              events={events}
              onShowCalendar={onShowCalendar}
              onAddEvent={onAddEvent}
              onEventClick={onEventClick}
              locale={locale}
            />
          )}
        </>
      )}

      {variant === 'community' && (
        <>
          {(canContactLeads || (canInvite && onInvite)) && (
            <div className="flex gap-2">
              {canContactLeads && onContactLead && (
                <Button variant="outline" className="flex-1 gap-2 text-body-emphasis" onClick={onContactLead}>
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  {t('sidebar.contactLead')}
                </Button>
              )}
              {canInvite && onInvite && (
                // Force explicit colors — the default `bg-primary text-primary-foreground`
                // pair was rendering as dark-on-dark in the community sidebar (see issue
                // screenshot). Setting `bg-primary` and `!text-white` with a `!` to win
                // any cascade keeps the label legible regardless of ancestor `.dark`
                // contexts or token redefinitions.
                <Button
                  className="flex-1 gap-2 text-body-emphasis bg-primary !text-white hover:bg-primary/90"
                  onClick={onInvite}
                >
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

import { Activity, Bot, CalendarDays, Info, List, PanelLeftClose, PanelLeftOpen, Users } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { InfoBlock, type LeadItem } from './sidebar/InfoBlock';
import { SubspacesSection } from './sidebar/SubspacesSection';

type SubspaceWidgetItem = {
  name: string;
  initials: string;
  href: string;
  avatarUrl?: string;
};

export type SubspaceLeadData = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  href: string;
  location?: string;
  type: LeadItem['type'];
};

export type SubspaceVirtualContributorData = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  description?: string;
  href: string;
};

export type SubspaceQuickActionId = 'community' | 'events' | 'activity' | 'index' | 'subspaces';

export type SubspaceSidebarData = {
  description: string;
  leads: SubspaceLeadData[];
  virtualContributor?: SubspaceVirtualContributorData;
};

export type SubspaceSidebarProps = SubspaceSidebarData & {
  /** Pencil overlay on the InfoBlock — opens the settings/about page (edit mode). */
  onEditClick: () => void;
  /** "About this Subspace" button — opens the read-only about dialog. */
  onAboutClick: () => void;
  onQuickActionClick: (id: SubspaceQuickActionId) => void;
  /** Nested subspaces of the current subspace (used by the widget under the nav). */
  subspaces?: SubspaceWidgetItem[];
  /** Opens the Subspaces dialog with the full list. */
  onShowAllSubspaces?: () => void;
  /** Navigate to a nested subspace from the widget row. */
  onSubspaceClick?: (href: string) => void;
  /** Opens the Create Subspace dialog. Surfaced as a "Create" link in the
   *  widget header when there are no nested subspaces yet. */
  onCreateSubspace?: () => void;
  /**
   * Desktop collapse state. When `onToggleCollapse` is provided, a "Collapse"
   * button is rendered; when `collapsed` is also true the sidebar shrinks to a
   * thin icon rail (expand affordance + quick-action icons). Persistence lives
   * in the consumer. When `onToggleCollapse` is omitted (e.g. the mobile
   * drawer) the sidebar is always full and not collapsible.
   */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
};

type QuickActionDef = { id: SubspaceQuickActionId; icon: ComponentType<SVGProps<SVGSVGElement>> };

const QUICK_ACTIONS: QuickActionDef[] = [
  { id: 'community', icon: Users },
  { id: 'events', icon: CalendarDays },
  { id: 'activity', icon: Activity },
  { id: 'index', icon: List },
];

export function SubspaceSidebar({
  description,
  leads,
  virtualContributor,
  onEditClick,
  onAboutClick,
  onQuickActionClick,
  subspaces,
  onShowAllSubspaces,
  onSubspaceClick,
  onCreateSubspace,
  collapsed,
  onToggleCollapse,
  className,
}: SubspaceSidebarProps) {
  const { t } = useTranslation('crd-subspace');
  const quickActionLabels: Record<SubspaceQuickActionId, string> = {
    community: t('sidebar.quickActions.community'),
    events: t('sidebar.quickActions.events'),
    activity: t('sidebar.quickActions.activity'),
    index: t('sidebar.quickActions.index'),
    subspaces: t('sidebar.quickActions.subspaces'),
  };

  if (collapsed && onToggleCollapse) {
    return (
      <aside className={cn('flex flex-col items-center gap-2', className)} aria-label={t('a11y.sidebarNavigation')}>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleCollapse}
          aria-label={t('sidebar.expand')}
          title={t('sidebar.expand')}
        >
          <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
        </Button>
        {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
        {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
        <ul role="list" className="flex flex-col items-center gap-1">
          {QUICK_ACTIONS.map(({ id, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onQuickActionClick(id)}
                aria-label={quickActionLabels[id]}
                title={quickActionLabels[id]}
                className="flex items-center justify-center size-9 rounded-md text-primary transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: 'color-mix(in srgb, var(--secondary) 30%, transparent)' }}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  const leadItems: LeadItem[] = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    avatarUrl: lead.avatarUrl,
    initials: lead.initials,
    location: lead.location,
    href: lead.href,
    type: lead.type,
  }));

  return (
    <aside className={cn('flex flex-col gap-6', className)} aria-label={t('a11y.sidebarNavigation')}>
      <InfoBlock description={description} leads={leadItems} onEditClick={onEditClick} />

      <Button variant="outline" className="w-full uppercase gap-2 font-medium px-2" onClick={onAboutClick}>
        <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="truncate text-body-emphasis">{t('sidebar.about')}</span>
      </Button>

      {onToggleCollapse && (
        <Button className="w-full uppercase gap-2 font-medium px-2" onClick={onToggleCollapse}>
          <PanelLeftClose className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate text-body-emphasis">{t('sidebar.collapse')}</span>
        </Button>
      )}

      <nav aria-label={t('sidebar.quickActions.heading')}>
        <p className="text-label uppercase mb-3 px-1 text-muted-foreground">{t('sidebar.quickActions.heading')}</p>
        {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
        {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
        <ul role="list" className="space-y-1">
          {QUICK_ACTIONS.map(({ id, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onQuickActionClick(id)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: 'color-mix(in srgb, var(--secondary) 30%, transparent)' }}
              >
                <Icon className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-control text-foreground">{quickActionLabels[id]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {subspaces && (subspaces.length > 0 || onCreateSubspace) && (
        <SubspacesSection
          subspaces={subspaces}
          onShowAllClick={onShowAllSubspaces}
          onSubspaceClick={onSubspaceClick}
          onCreateClick={onCreateSubspace}
        />
      )}

      {virtualContributor && (
        <section className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-1.5 mb-3">
            <Bot className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <p className="text-label uppercase text-muted-foreground">{t('sidebar.virtualContributor.heading')}</p>
          </div>
          <a
            href={virtualContributor.href}
            className="flex items-start gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="w-8 h-8 shrink-0">
              {virtualContributor.avatarUrl && (
                <AvatarImage src={virtualContributor.avatarUrl} alt={virtualContributor.name} />
              )}
              <AvatarFallback
                className="text-badge"
                style={{
                  background: 'color-mix(in srgb, var(--info) 15%, transparent)',
                  color: 'var(--info)',
                }}
              >
                {virtualContributor.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-control text-foreground">{virtualContributor.name}</p>
              {virtualContributor.description && (
                <p className="line-clamp-2 mt-0.5 text-caption text-muted-foreground leading-snug">
                  {virtualContributor.description}
                </p>
              )}
            </div>
          </a>
        </section>
      )}
    </aside>
  );
}

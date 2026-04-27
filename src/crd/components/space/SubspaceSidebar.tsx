import { Activity, Bot, CalendarDays, Info, Layers, List, Users } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { InfoBlock, type LeadItem } from './sidebar/InfoBlock';

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
  className?: string;
};

type QuickActionDef = { id: SubspaceQuickActionId; icon: ComponentType<SVGProps<SVGSVGElement>> };

const QUICK_ACTIONS: QuickActionDef[] = [
  { id: 'community', icon: Users },
  { id: 'events', icon: CalendarDays },
  { id: 'activity', icon: Activity },
  { id: 'index', icon: List },
  { id: 'subspaces', icon: Layers },
];

export function SubspaceSidebar({
  description,
  leads,
  virtualContributor,
  onEditClick,
  onAboutClick,
  onQuickActionClick,
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

      <Button
        variant="outline"
        className="w-full uppercase tracking-wider gap-2 text-body-emphasis"
        onClick={onAboutClick}
      >
        <Info className="w-4 h-4" aria-hidden="true" />
        {t('sidebar.about')}
      </Button>

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
                <span className="text-control font-medium text-foreground">{quickActionLabels[id]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

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
                className="text-badge font-bold"
                style={{
                  background: 'color-mix(in srgb, var(--info) 15%, transparent)',
                  color: 'var(--info)',
                }}
              >
                {virtualContributor.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-control font-medium text-foreground">{virtualContributor.name}</p>
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

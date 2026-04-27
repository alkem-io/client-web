import { Activity, Bot, CalendarDays, Layers, List, MapPin, Users } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

export type SubspaceLeadData = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  href: string;
  location?: string;
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
  whyMarkdown?: string;
  tagline?: string;
  leads: SubspaceLeadData[];
  virtualContributor?: SubspaceVirtualContributorData;
};

export type SubspaceSidebarProps = SubspaceSidebarData & {
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
  whyMarkdown,
  tagline,
  leads,
  virtualContributor,
  onAboutClick,
  onQuickActionClick,
  className,
}: SubspaceSidebarProps) {
  const { t } = useTranslation('crd-subspace');
  const leadHeading = leads.length > 1 ? t('sidebar.leads') : t('sidebar.lead');
  const quickActionLabels: Record<SubspaceQuickActionId, string> = {
    community: t('sidebar.quickActions.community'),
    events: t('sidebar.quickActions.events'),
    activity: t('sidebar.quickActions.activity'),
    index: t('sidebar.quickActions.index'),
    subspaces: t('sidebar.quickActions.subspaces'),
  };

  return (
    <aside className={cn('flex flex-col gap-6', className)} aria-label={t('a11y.sidebarNavigation')}>
      {/* Info card — blue panel, no Challenge Statement title */}
      <div className="p-5 rounded-lg bg-primary text-primary-foreground">
        {whyMarkdown ? (
          // Override MarkdownContent's default muted body colour so text reads as white on the blue panel (WCAG AA).
          <MarkdownContent
            content={whyMarkdown}
            className="text-primary-foreground [&_p]:text-primary-foreground [&_p]:leading-relaxed [&_li]:text-primary-foreground [&_strong]:text-primary-foreground [&_em]:text-primary-foreground [&_a]:text-primary-foreground [&_a]:underline"
          />
        ) : tagline ? (
          <p className="text-body leading-relaxed">{tagline}</p>
        ) : null}

        {leads.length > 0 && (
          <div className="pt-3 mt-3 border-t border-white/15">
            <p className="text-label uppercase opacity-60 mb-2">{leadHeading}</p>
            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
            {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
            <ul role="list" className="flex flex-col gap-2">
              {leads.map(lead => (
                <li key={lead.id}>
                  <a
                    href={lead.href}
                    className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <Avatar className="w-8 h-8 border-2 border-white/25">
                      {lead.avatarUrl && <AvatarImage src={lead.avatarUrl} alt={lead.name} />}
                      <AvatarFallback className="bg-white/15 text-white text-badge font-bold">
                        {lead.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-body-emphasis truncate">{lead.name}</p>
                      {lead.location && (
                        <p className="flex items-center gap-1 text-caption opacity-70">
                          <MapPin className="w-3 h-3" aria-hidden="true" />
                          {lead.location}
                        </p>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* About this Subspace — outside and below the info card */}
      <Button variant="outline" className="w-full justify-center" onClick={onAboutClick}>
        {t('sidebar.about')}
      </Button>

      {/* Quick Actions */}
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

      {/* Virtual Contributor — hidden when none */}
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

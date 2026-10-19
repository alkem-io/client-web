import { Activity, Bot, CalendarDays, Info, List, PanelLeftClose, PanelLeftOpen, Users } from 'lucide-react';
import { type ComponentType, Fragment, type ReactNode, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { ParentSpaceStack, type ParentSpaceStackItem } from './ParentSpaceStack';
import type { SidebarWidgetId } from './settings/SpaceSettingsLayoutView.types';
import { CreateSubspaceButton } from './sidebar/CreateSubspaceButton';
import { InfoBlock, type LeadItem } from './sidebar/InfoBlock';
import { InviteButton } from './sidebar/InviteButton';
import { SearchSection, type SearchSectionProps } from './sidebar/SearchSection';
import { SubspacesSection } from './sidebar/SubspacesSection';

type SubspaceWidgetItem = {
  name: string;
  initials: string;
  href: string;
  avatarUrl?: string;
  isPrivate?: boolean;
  isPinned?: boolean;
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
  /**
   * The configured widgets, rendered in this order. Consecutive Community / Events / Recent
   * Activity / Post Index entries form one "Quick Actions" group. Each widget keeps its own
   * gate: a widget whose data or handler is absent (no Add Post slot, no invite handler, no
   * search props, …) renders nothing, so configuration never grants an action.
   */
  widgets: readonly SidebarWidgetId[];
  /** Sidebar search widget props — the consumer owns the state and fetching. */
  search?: SearchSectionProps;
  /** Opens the invite dialog. Omit when the viewer may not invite (the Invite button is hidden). */
  onInviteClick?: () => void;
  /** Whether the Recent Activity quick action may render (signed-in viewers only). */
  activityEnabled?: boolean;
  /** Pencil overlay on the InfoBlock — opens the settings/about page (edit mode).
   *  Omit when the user lacks edit permission; the InfoBlock then hides the pencil. */
  onEditClick?: () => void;
  /** "About this Subspace" button — opens the read-only about dialog. */
  onAboutClick: () => void;
  onQuickActionClick: (id: SubspaceQuickActionId) => void;
  /** Primary page actions (Add Post, …) rendered below the About button in the
   *  expanded sidebar (and the mobile drawer). The consumer gates each button
   *  on its own permission. Not shown in the collapsed rail — pass compact
   *  icon-button equivalents via `collapsedActionsSlot` for that. */
  actionsSlot?: ReactNode;
  /** Compact (icon-only) versions of the primary actions for the collapsed
   *  rail, rendered between the expand toggle and the quick-action icons. */
  collapsedActionsSlot?: ReactNode;
  /** Ancestor spaces (outermost first) stacked behind the info block as
   *  clickable mini-cards — the prototype's parent stack. Not shown collapsed. */
  parentSpaces?: ParentSpaceStackItem[];
  /** Nested subspaces of the current subspace (used by the widget under the nav). */
  subspaces?: SubspaceWidgetItem[];
  /** Opens the Subspaces dialog with the full list. */
  onShowAllSubspaces?: () => void;
  /** Navigate to a nested subspace from the widget row. */
  onSubspaceClick?: (href: string) => void;
  /** Opens the Create Subspace dialog. Surfaced as a "Create" link in the
   *  Subspaces widget header when there are no nested subspaces yet, and as the
   *  Create Subspace button widget. Omit when the viewer may not create subspaces. */
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
  /** Expanded view only: the consumer renders <UpdatesSection> here (latest community update). */
  updatesSlot?: ReactNode;
  className?: string;
};

type QuickActionWidgetId = Extract<SubspaceQuickActionId, 'community' | 'events' | 'activity' | 'index'>;

const QUICK_ACTION_ICONS: Record<QuickActionWidgetId, ComponentType<SVGProps<SVGSVGElement>>> = {
  community: Users,
  events: CalendarDays,
  activity: Activity,
  index: List,
};

const isQuickActionWidget = (id: SidebarWidgetId): id is QuickActionWidgetId => id in QUICK_ACTION_ICONS;

/** Widgets rendered above the Collapse control; it sits right before the first widget not in this set. */
const ABOVE_COLLAPSE: ReadonlySet<SidebarWidgetId> = new Set<SidebarWidgetId>(['intent', 'about', 'createPost']);

export function SubspaceSidebar({
  widgets,
  search,
  onInviteClick,
  activityEnabled = false,
  description,
  leads,
  virtualContributor,
  onEditClick,
  onAboutClick,
  onQuickActionClick,
  actionsSlot,
  collapsedActionsSlot,
  parentSpaces,
  subspaces,
  onShowAllSubspaces,
  onSubspaceClick,
  onCreateSubspace,
  collapsed,
  onToggleCollapse,
  updatesSlot,
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
  // Recent Activity is shown only to signed-in viewers — the activity query is gated on
  // the platform read-users right, so it would be a dead affordance otherwise.
  const renderedWidgets = widgets.filter(id => id !== 'activity' || activityEnabled);
  const railQuickActions = renderedWidgets.filter(isQuickActionWidget);
  const showSubspaceLinks = renderedWidgets.includes('subspaceLinks');

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
        {collapsedActionsSlot && renderedWidgets.includes('createPost') && (
          <div className="flex flex-col items-center gap-1">{collapsedActionsSlot}</div>
        )}
        {railQuickActions.length > 0 && (
          // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
          // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
          <ul role="list" className="flex flex-col items-center gap-1">
            {railQuickActions.map(id => {
              const Icon = QUICK_ACTION_ICONS[id];
              return (
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
              );
            })}
          </ul>
        )}

        {/* Nested subspaces stay reachable while collapsed — rendered as avatar
            tiles below the quick-action rail (L2s on an L1 page). Every other
            widget is expanded-only. */}
        {showSubspaceLinks && subspaces && subspaces.length > 0 && (
          <>
            <div className="w-6 border-t border-border my-1" aria-hidden="true" />
            <p className="sr-only">{t('sidebar.quickActions.subspaces')}</p>
            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
            {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
            <ul role="list" className="flex flex-col items-center gap-1">
              {subspaces.map(subspace => (
                <li key={subspace.href}>
                  <a
                    href={subspace.href}
                    onClick={e => {
                      if (onSubspaceClick) {
                        e.preventDefault();
                        onSubspaceClick(subspace.href);
                      }
                    }}
                    aria-label={subspace.name}
                    title={subspace.name}
                    className="flex items-center justify-center size-9 rounded-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="size-7 rounded-md">
                      {subspace.avatarUrl && (
                        <AvatarImage src={subspace.avatarUrl} alt="" className="rounded-md object-cover" />
                      )}
                      <AvatarFallback className="rounded-md text-badge">{subspace.initials}</AvatarFallback>
                    </Avatar>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
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

  const renderQuickActionGroup = (ids: QuickActionWidgetId[]) => (
    <nav key={`quickActions-${ids[0]}`} aria-label={t('sidebar.quickActions.heading')}>
      <p className="text-label uppercase mb-3 px-1 text-muted-foreground">{t('sidebar.quickActions.heading')}</p>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" className="space-y-1">
        {ids.map(id => {
          const Icon = QUICK_ACTION_ICONS[id];
          return (
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
          );
        })}
      </ul>
    </nav>
  );

  const renderWidget = (id: SidebarWidgetId): ReactNode => {
    switch (id) {
      case 'intent':
        return parentSpaces && parentSpaces.length > 0 ? (
          <ParentSpaceStack key="intent" parents={parentSpaces}>
            <InfoBlock description={description} leads={leadItems} onEditClick={onEditClick} />
          </ParentSpaceStack>
        ) : (
          <InfoBlock key="intent" description={description} leads={leadItems} onEditClick={onEditClick} />
        );
      case 'about':
        return (
          <Button
            key="about"
            variant="outline"
            className="w-full uppercase gap-2 font-medium px-2"
            onClick={onAboutClick}
          >
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate text-body-emphasis">{t('sidebar.about')}</span>
          </Button>
        );
      case 'createPost':
        return (
          actionsSlot && (
            <div key="createPost" className="flex flex-col gap-2">
              {actionsSlot}
            </div>
          )
        );
      case 'subspaceLinks':
        return (
          subspaces &&
          (subspaces.length > 0 || onCreateSubspace) && (
            <SubspacesSection
              key="subspaceLinks"
              subspaces={subspaces}
              onShowAllClick={onShowAllSubspaces}
              onSubspaceClick={onSubspaceClick}
              onCreateClick={onCreateSubspace}
            />
          )
        );
      case 'virtualContributors':
        return virtualContributor && <VirtualContributorCard key="virtualContributors" {...virtualContributor} />;
      case 'updates':
        return updatesSlot && <Fragment key="updates">{updatesSlot}</Fragment>;
      case 'search':
        return search && <SearchSection key="search" {...search} />;
      case 'addUser':
        return onInviteClick && <InviteButton key="addUser" onClick={onInviteClick} />;
      case 'createSubspace':
        return onCreateSubspace && <CreateSubspaceButton key="createSubspace" onClick={onCreateSubspace} />;
      default:
        return null;
    }
  };

  // Walk the configured order once: consecutive quick actions collapse into one group, and
  // the Collapse control lands right before the first widget below the identity block
  // (intent / about / createPost) — today's position for the default list.
  const content: ReactNode[] = [];
  let quickActionRun: QuickActionWidgetId[] = [];
  let collapsePlaced = false;
  const collapseButton = onToggleCollapse && (
    <Button key="collapse" className="w-full uppercase gap-2 font-medium px-2" onClick={onToggleCollapse}>
      <PanelLeftClose className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate text-body-emphasis">{t('sidebar.collapse')}</span>
    </Button>
  );
  const flushQuickActions = () => {
    if (quickActionRun.length > 0) {
      content.push(renderQuickActionGroup(quickActionRun));
      quickActionRun = [];
    }
  };
  for (const id of renderedWidgets) {
    if (!collapsePlaced && !ABOVE_COLLAPSE.has(id)) {
      flushQuickActions();
      content.push(collapseButton);
      collapsePlaced = true;
    }
    if (isQuickActionWidget(id)) {
      quickActionRun.push(id);
      continue;
    }
    flushQuickActions();
    content.push(renderWidget(id));
  }
  flushQuickActions();
  if (!collapsePlaced) content.push(collapseButton);

  return (
    <aside className={cn('flex flex-col gap-6', className)} aria-label={t('a11y.sidebarNavigation')}>
      {content}
    </aside>
  );
}

function VirtualContributorCard({ name, avatarUrl, initials, description, href }: SubspaceVirtualContributorData) {
  const { t } = useTranslation('crd-subspace');
  return (
    <section className="p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-1.5 mb-3">
        <Bot className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <p className="text-label uppercase text-muted-foreground">{t('sidebar.virtualContributor.heading')}</p>
      </div>
      <a
        href={href}
        className="flex items-start gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="w-8 h-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback
            className="text-badge"
            style={{
              background: 'color-mix(in srgb, var(--info) 15%, transparent)',
              color: 'var(--info)',
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-control text-foreground">{name}</p>
          {description && (
            <p className="line-clamp-2 mt-0.5 text-caption text-muted-foreground leading-snug">{description}</p>
          )}
        </div>
      </a>
    </section>
  );
}

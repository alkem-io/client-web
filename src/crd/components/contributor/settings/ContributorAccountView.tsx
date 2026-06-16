import { Bot, FileBox, Layout, type LucideIcon, MoreVertical, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';
import type {
  AccountCapacity,
  AccountResourceCardItem,
  AccountResourceGroup,
  ContributorAccountViewProps,
} from './ContributorAccountView.types';

type CardVariant = 'space' | 'vc' | 'pack' | 'hub';

const NS = 'crd-contributorSettings';

/**
 * Shared 4-card-group view consumed by User Account (US2) and Org Account
 * (US9). All four groups now render as a 3-up card grid with a dashed
 * "Create New" inline tile as the last cell when `canCreate`:
 *
 * - **Hosted Spaces**: banner cards (image with deterministic-color gradient
 *   fallback) + tall "+" tile with heading and blurb.
 * - **Virtual Contributors / Template Packs / Custom Homepages**: compact
 *   icon-in-box cards + compact "+" tile.
 *
 * All `onCreate*` / per-row kebab actions are received as callback props;
 * the view never imports `react-router-dom` (FR-007). Pure presentational —
 * owns no fetch/mutation/state beyond visual concerns.
 */
export function ContributorAccountView({ helpBannerLabel, groups, loading }: ContributorAccountViewProps) {
  if (loading) {
    return <AccountLoadingSkeleton />;
  }

  return (
    <div className="space-y-12">
      <HelpBanner label={helpBannerLabel} />
      {groups.map(group => (
        <AccountGroupSection key={group.groupId} group={group} />
      ))}
    </div>
  );
}

// ─── Help Banner ──────────────────────────────────────────────────────────

function HelpBanner({ label }: { label: string }) {
  return (
    <div className="flex max-w-3xl items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-body text-primary/80">
      <Layout aria-hidden="true" className="size-4 shrink-0" />
      <p>{label}</p>
    </div>
  );
}

// ─── Per-group dispatch ───────────────────────────────────────────────────

// Hosted Spaces is the only group whose top-right Create button uses the
// primary-filled variant; VCs / Packs / Hubs use outline.
const CREATE_BUTTON_VARIANT: Record<CardVariant, 'default' | 'outline'> = {
  space: 'default',
  vc: 'outline',
  pack: 'outline',
  hub: 'outline',
};

// Icon used by the compact card variants (pack/hub/vc). Spaces use a banner image instead.
const ICON_BY_VARIANT: Record<Exclude<CardVariant, 'space'>, LucideIcon> = {
  vc: Bot,
  pack: FileBox,
  hub: Layout,
};

// Icon-wrapper tint per compact variant — matches the prototype's existing
// colour identity for each resource type.
const ICON_WRAPPER_CLASS: Record<Exclude<CardVariant, 'space'>, string> = {
  vc: 'bg-primary/10 text-primary',
  pack: 'bg-secondary text-secondary-foreground',
  hub: 'bg-secondary text-secondary-foreground',
};

function AccountGroupSection({ group }: { group: AccountResourceGroup }) {
  switch (group.groupId) {
    case 'spaces':
      return <ResourceCardGroup group={group} variant="space" />;
    case 'virtualContributors':
      return <ResourceCardGroup group={group} variant="vc" />;
    case 'innovationPacks':
      return <ResourceCardGroup group={group} variant="pack" />;
    case 'innovationHubs':
      return <ResourceCardGroup group={group} variant="hub" />;
  }
}

function ResourceCardGroup({ group, variant }: { group: AccountResourceGroup; variant: CardVariant }) {
  return (
    <section>
      <SectionHeader
        title={group.title}
        groupId={group.groupId}
        capacity={group.capacity}
        canCreate={group.canCreate}
        createButtonLabel={group.createButtonLabel}
        onCreate={group.onCreate}
        createVariant={CREATE_BUTTON_VARIANT[variant]}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {group.items.map(item =>
          variant === 'space' ? (
            <SpaceResourceCard key={item.id} item={item} />
          ) : (
            <IconResourceCard
              key={item.id}
              item={item}
              icon={ICON_BY_VARIANT[variant]}
              iconWrapperClass={ICON_WRAPPER_CLASS[variant]}
            />
          )
        )}
        {group.canCreate ? <InlineCreateCard variant={variant} onClick={group.onCreate} /> : null}
      </div>
    </section>
  );
}

function SpaceResourceCard({ item }: { item: AccountResourceCardItem }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border transition-colors hover:border-primary/50">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <a
          href={item.href}
          className="block size-full"
          style={
            item.avatarUrl
              ? undefined
              : { background: `linear-gradient(135deg, ${item.color}, color-mix(in srgb, ${item.color} 70%, black))` }
          }
        >
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt={item.displayName}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </a>
        <ResourceCardKebab actions={item.actions} />
      </div>
      <CardHeader className="p-4 pb-2">
        <a
          href={item.href}
          className="text-subsection-title leading-tight transition-colors hover:text-primary group-hover:text-primary"
        >
          {item.displayName}
        </a>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-2">
        {item.description ? <p className="line-clamp-2 text-body text-muted-foreground">{item.description}</p> : null}
      </CardContent>
    </Card>
  );
}

function IconResourceCard({
  item,
  icon: Icon,
  iconWrapperClass,
}: {
  item: AccountResourceCardItem;
  icon: LucideIcon;
  iconWrapperClass: string;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
      <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', iconWrapperClass)}>
          {item.avatarUrl ? (
            <Avatar className="size-10 rounded-lg">
              <AvatarImage src={item.avatarUrl} alt={item.displayName} />
              <AvatarFallback color={item.color} className="rounded-lg text-white">
                <Icon aria-hidden="true" className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Icon aria-hidden="true" className="size-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={item.href}
            className="block truncate text-card-title leading-tight transition-colors hover:text-primary group-hover:text-primary"
          >
            {item.displayName}
          </a>
        </div>
        <ResourceCardKebab actions={item.actions} inline={true} />
      </CardHeader>
      <CardContent className="flex-grow p-5 pt-2">
        {item.description ? <CroppedMarkdown content={item.description} maxHeight="6rem" /> : null}
      </CardContent>
    </Card>
  );
}

function InlineCreateCard({ variant, onClick }: { variant: CardVariant; onClick: () => void }) {
  const { t } = useTranslation(NS);
  // Translation keys are spelled out per branch (instead of looked up from a
  // record or via a helper that receives `t`) so i18next's strict
  // literal-string typing of `t()` is preserved.
  const copy = (() => {
    switch (variant) {
      case 'space':
        return {
          ariaLabel: t('shared.account.createNewSpace.ariaLabel'),
          heading: t('shared.account.createNewSpace.heading'),
          blurb: t('shared.account.createNewSpace.description') as string | undefined,
        };
      case 'vc':
        return {
          ariaLabel: t('shared.account.createNewVc.ariaLabel'),
          heading: t('shared.account.createNewVc.heading'),
          blurb: undefined,
        };
      case 'pack':
        return {
          ariaLabel: t('shared.account.createNewPack.ariaLabel'),
          heading: t('shared.account.createNewPack.heading'),
          blurb: undefined,
        };
      case 'hub':
        return {
          ariaLabel: t('shared.account.createNewHub.ariaLabel'),
          heading: t('shared.account.createNewHub.heading'),
          blurb: undefined,
        };
    }
  })();
  const isLarge = variant === 'space';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copy.ariaLabel}
      className={cn(
        'group/create flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isLarge ? 'h-full min-h-[280px]' : 'h-full min-h-[160px]'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted shadow-sm transition-colors group-hover/create:bg-background',
          isLarge ? 'mb-4 size-12' : 'mb-3 size-10'
        )}
      >
        <Plus
          aria-hidden="true"
          className={cn('text-muted-foreground group-hover/create:text-primary', isLarge ? 'size-6' : 'size-5')}
        />
      </div>
      {isLarge ? (
        <h3 className="text-subsection-title text-foreground transition-colors group-hover/create:text-primary">
          {copy.heading}
        </h3>
      ) : (
        <span className="text-body-emphasis text-muted-foreground transition-colors group-hover/create:text-primary">
          {copy.heading}
        </span>
      )}
      {copy.blurb ? (
        <p className="mt-2 max-w-[200px] text-center text-body text-muted-foreground">{copy.blurb}</p>
      ) : null}
    </button>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────

function SectionHeader({
  title,
  groupId,
  capacity,
  canCreate,
  createButtonLabel,
  onCreate,
  createVariant = 'outline',
}: {
  title: string;
  groupId: AccountResourceGroup['groupId'];
  capacity?: AccountCapacity;
  canCreate: boolean;
  createButtonLabel: string;
  onCreate: () => void;
  createVariant?: 'default' | 'outline';
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-section-title">
        {title}
        <CapacityBadge groupId={groupId} capacity={capacity} />
      </h2>
      {canCreate ? (
        <Button size="sm" variant={createVariant} onClick={onCreate}>
          <Plus aria-hidden="true" className="mr-2 size-4" />
          {createButtonLabel}
        </Button>
      ) : null}
    </div>
  );
}

function CapacityBadge({
  groupId,
  capacity,
}: {
  groupId: AccountResourceGroup['groupId'];
  capacity?: AccountCapacity;
}) {
  const { t } = useTranslation(NS);
  if (!capacity) return null;

  // "Not available" branch — entitlement absent and nothing created. Mirrors
  // the MUI `BlockHeader` `isAvailable` branch in
  // src/domain/community/contributor/Account/ContributorAccountView.tsx.
  if (!capacity.isAvailable && capacity.usage === 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <Badge variant="secondary" className="ml-2 cursor-help font-normal text-caption">
              {t('shared.account.capacity.notAvailable')}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs whitespace-pre-line">
            {t('shared.account.capacity.notAvailableTooltip')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const tooltipText = capacity.perPlan
    ? t('shared.account.capacity.spacesTooltip', {
        freeUsage: capacity.perPlan.free.usage,
        freeLimit: capacity.perPlan.free.limit,
        plusUsage: capacity.perPlan.plus.usage,
        plusLimit: capacity.perPlan.plus.limit,
        premiumUsage: capacity.perPlan.premium.usage,
        premiumLimit: capacity.perPlan.premium.limit,
      })
    : t(`shared.account.capacity.${groupId}Tooltip`, { usage: capacity.usage, limit: capacity.limit });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <Badge variant="secondary" className="ml-2 cursor-help font-normal text-caption">
            {t('shared.account.capacity.label', { usage: capacity.usage, limit: capacity.limit })}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs whitespace-pre-line">{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ResourceCardKebab({
  actions,
  inline = false,
}: {
  actions: AccountResourceCardItem['actions'];
  inline?: boolean;
}) {
  const { t } = useTranslation(NS);
  if (actions.length === 0) return null;
  return (
    <div className={inline ? '-mt-1 -mr-2' : 'absolute right-3 top-3'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button
            variant={inline ? 'ghost' : 'secondary'}
            size="icon"
            aria-label={t('shared.account.kebabAriaLabel')}
            className={
              inline ? 'size-8 text-muted-foreground' : 'size-8 rounded-full bg-background/90 backdrop-blur-sm'
            }
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, idx) => (
            <DropdownMenuItem
              // biome-ignore lint/suspicious/noArrayIndexKey: kebab actions are static per row; idx fallback covers the rare case the same `kind` is duplicated
              key={`${action.kind}-${idx}`}
              onClick={action.onClick}
              variant={action.kind === 'delete' ? 'destructive' : 'default'}
            >
              <action.icon aria-hidden="true" className="mr-2 size-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AccountLoadingSkeleton() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-12 w-full max-w-3xl" />
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are interchangeable
        <section key={sectionIdx}>
          <Skeleton className="mb-6 h-8 w-1/3" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, cardIdx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are interchangeable
              <Skeleton key={cardIdx} className="h-[280px] rounded-xl" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

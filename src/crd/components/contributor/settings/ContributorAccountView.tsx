import { Bot, FileBox, Layout, MoreVertical, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
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

const TEMPLATE_PACK_VISIBLE_SLOTS = 3;
const NS = 'crd-contributorSettings';

/**
 * Shared 4-card-group view consumed by User Account (US2) and Org Account
 * (US9). Renders prototype-faithful empty states per FR-033 / FR-103:
 *
 * - **Hosted Spaces** + **Virtual Contributors**: existing items followed by
 *   a dashed "Create New" inline tile (always present when `canCreate`).
 * - **Template Packs**: existing items + up to 3 "Empty Slot" placeholders.
 * - **Custom Homepages**: card grid when non-empty; full centered empty
 *   state with icon + heading + descriptive copy + CTA + capacity indicator
 *   when empty.
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

function AccountGroupSection({ group }: { group: AccountResourceGroup }) {
  switch (group.groupId) {
    // Hosted Spaces is the only group whose Create button uses the
    // primary-filled variant; VCs / Packs / Hubs use outline.
    case 'spaces':
      return <BannerCardGroup group={group} variant="space" createVariant="default" />;
    case 'virtualContributors':
      return <BannerCardGroup group={group} variant="vc" createVariant="outline" />;
    case 'innovationPacks':
      return <TemplatePackList group={group} />;
    case 'innovationHubs':
      return <CustomHomepagesGroup group={group} />;
  }
}

// ─── Banner-card variant (Hosted Spaces + Virtual Contributors) ──────────

function BannerCardGroup({
  group,
  variant,
  createVariant,
}: {
  group: AccountResourceGroup;
  variant: 'space' | 'vc';
  createVariant: 'default' | 'outline';
}) {
  return (
    <section>
      <SectionHeader
        title={group.title}
        groupId={group.groupId}
        capacity={group.capacity}
        canCreate={group.canCreate}
        createButtonLabel={group.createButtonLabel}
        onCreate={group.onCreate}
        createVariant={createVariant}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {group.items.map(item =>
          variant === 'space' ? (
            <SpaceResourceCard key={item.id} item={item} />
          ) : (
            <VcResourceCard key={item.id} item={item} />
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
      <a
        href={item.href}
        className="block aspect-video overflow-hidden bg-muted"
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

function VcResourceCard({ item }: { item: AccountResourceCardItem }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
      <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {item.avatarUrl ? (
            <Avatar className="size-10 rounded-lg">
              <AvatarImage src={item.avatarUrl} alt={item.displayName} />
              <AvatarFallback color={item.color} className="rounded-lg text-white">
                <Bot aria-hidden="true" className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Bot aria-hidden="true" className="size-5" />
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
        {item.description ? <p className="text-body text-muted-foreground">{item.description}</p> : null}
      </CardContent>
    </Card>
  );
}

function InlineCreateCard({ variant, onClick }: { variant: 'space' | 'vc'; onClick: () => void }) {
  const { t } = useTranslation(NS);
  const ariaLabel =
    variant === 'space' ? t('shared.account.createNewSpace.ariaLabel') : t('shared.account.createNewVc.ariaLabel');
  const heading =
    variant === 'space' ? t('shared.account.createNewSpace.heading') : t('shared.account.createNewVc.heading');
  const blurb = variant === 'space' ? t('shared.account.createNewSpace.description') : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'group/create flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        variant === 'space' ? 'h-full min-h-[280px]' : 'h-full min-h-[160px]'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted shadow-sm transition-colors group-hover/create:bg-background',
          variant === 'space' ? 'mb-4 size-12' : 'mb-3 size-10'
        )}
      >
        <Plus
          aria-hidden="true"
          className={cn(
            'text-muted-foreground group-hover/create:text-primary',
            variant === 'space' ? 'size-6' : 'size-5'
          )}
        />
      </div>
      {variant === 'space' ? (
        <h3 className="text-subsection-title text-foreground transition-colors group-hover/create:text-primary">
          {heading}
        </h3>
      ) : (
        <span className="text-body-emphasis text-muted-foreground transition-colors group-hover/create:text-primary">
          {heading}
        </span>
      )}
      {blurb ? <p className="mt-2 max-w-[200px] text-center text-body text-muted-foreground">{blurb}</p> : null}
    </button>
  );
}

// ─── Template Packs (list + Empty Slots) ──────────────────────────────────

function TemplatePackList({ group }: { group: AccountResourceGroup }) {
  const { t } = useTranslation(NS);
  const emptySlotCount = Math.max(0, TEMPLATE_PACK_VISIBLE_SLOTS - group.items.length);

  return (
    <section>
      <SectionHeader
        title={group.title}
        groupId={group.groupId}
        capacity={group.capacity}
        canCreate={group.canCreate}
        createButtonLabel={group.createButtonLabel}
        onCreate={group.onCreate}
      />
      <div className="space-y-4">
        {group.items.map(item => (
          <Card key={item.id} className="group flex items-center gap-4 p-4 transition-colors hover:border-primary/50">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <FileBox aria-hidden="true" className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <a
                href={item.href}
                className="block text-card-title transition-colors hover:text-primary group-hover:text-primary"
              >
                {item.displayName}
              </a>
              {item.description ? (
                <p className="truncate text-caption text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
            <ResourceCardKebab actions={item.actions} inline={true} />
          </Card>
        ))}
        {Array.from({ length: emptySlotCount }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: empty-slot placeholders are interchangeable; index IS the natural key
          <div key={`empty-${i}`} className="flex items-center gap-4 rounded-xl border border-dashed p-4 opacity-60">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Plus aria-hidden="true" className="size-5" />
            </div>
            <p className="flex-1 text-body-emphasis text-muted-foreground">{t('shared.account.emptySlot')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Custom Homepages (cards or full empty-state) ─────────────────────────

function CustomHomepagesGroup({ group }: { group: AccountResourceGroup }) {
  const { t } = useTranslation(NS);
  const isEmpty = group.items.length === 0;

  return (
    <section>
      <SectionHeader
        title={group.title}
        groupId={group.groupId}
        capacity={group.capacity}
        // Top section button stays visible regardless of items count — the
        // empty-state CTA inside the dashed tile is additional, mirroring
        // the prototype's layout exactly.
        canCreate={group.canCreate}
        createButtonLabel={group.createButtonLabel}
        onCreate={group.onCreate}
      />
      {isEmpty ? (
        <div className="flex h-[240px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/5 p-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Layout aria-hidden="true" className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-card-title">{t('shared.account.customHomepages.emptyHeading')}</h3>
          <p className="mb-4 max-w-[200px] text-caption text-muted-foreground">
            {t('shared.account.customHomepages.emptyDescription')}
          </p>
          {group.canCreate ? (
            <Button variant="outline" size="sm" onClick={group.onCreate}>
              <Plus aria-hidden="true" className="mr-2 size-3.5" />
              {t('shared.account.customHomepages.createCta')}
            </Button>
          ) : null}
          <p className="mt-4 text-badge text-muted-foreground">
            {t('shared.account.customHomepages.capacity', {
              usage: group.capacity?.usage ?? 0,
              limit: group.capacity?.limit ?? 0,
            })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {group.items.map(item => (
            <Card key={item.id} className="group flex items-center gap-4 p-4 transition-colors hover:border-primary/50">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Layout aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={item.href}
                  className="block text-card-title transition-colors hover:text-primary group-hover:text-primary"
                >
                  {item.displayName}
                </a>
                {item.description ? (
                  <p className="truncate text-caption text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
              <ResourceCardKebab actions={item.actions} inline={true} />
            </Card>
          ))}
        </div>
      )}
    </section>
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

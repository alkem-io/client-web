import { ExternalLink, Folder, Home, LogOut, MoreVertical, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StackedPersonAvatars } from '@/crd/components/common/StackedPersonAvatars';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/crd/primitives/card';
import { Checkbox } from '@/crd/primitives/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type MembershipLeadUserData = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type MembershipRowData = {
  id: string;
  displayName: string;
  /** Optional tagline rendered as the card body description. */
  tagline?: string;
  /** Banner image URL when available; falls back to a gradient from `color`. */
  bannerUrl?: string;
  color: string;
  type: 'Space' | 'Subspace';
  role: 'Admin' | 'Lead' | 'Member';
  /** Public space URL — used by the row name link and "View {{type}}" menu item (when non-empty). */
  spaceUrl: string;
  /** Users who lead this space — rendered in the card footer. Empty array hides the footer. */
  leadUsers: MembershipLeadUserData[];
};

export type MembershipFilter = 'all' | 'spaces' | 'subspaces';

export type PendingApplicationRowData = {
  id: string;
  displayName: string;
  spaceUrl: string;
};

export type UserMembershipTabViewProps = {
  loading: boolean;
  // Home Space
  homeSpaceOptions: Array<{ value: string; label: string }>;
  selectedHomeSpaceId: string | null;
  autoRedirect: boolean;
  homeSpaceSaving: boolean;
  onSelectHomeSpace: (spaceId: string | null) => void;
  onToggleAutoRedirect: (next: boolean) => void;

  // Memberships grid
  memberships: MembershipRowData[];
  totalMemberships: number;
  totalUnfiltered: number;
  search: string;
  filter: MembershipFilter;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onClearFilters: () => void;
  onLeave: (row: MembershipRowData) => void;

  // Pending applications
  pendingApplications: PendingApplicationRowData[];
};

/**
 * User Membership tab — presentational view. Three stacked sections:
 * 1. **Home Space** — single-select + Auto-redirect checkbox.
 * 2. **My Memberships** — search input + Spaces/Subspaces filter +
 *    responsive card grid (matches `client-web-prototype/src/app/pages/UserMembershipPage.tsx`).
 *    Per-card kebab: View Details + Leave (parent owns the dialog).
 * 3. **Pending Applications** — read-only compact card list.
 *
 * Empty state for the memberships grid uses the prototype's centered
 * dashed-border block with "Clear Filters" CTA. Per FR-018 the
 * untouched-list empty state (no memberships at all) renders a muted
 * caption.
 */
export function UserMembershipTabView(props: UserMembershipTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Home}
        title={t('user.membership.homeSpace.title')}
        description={t('user.membership.homeSpace.description')}
      >
        <HomeSpaceSection
          options={props.homeSpaceOptions}
          selected={props.selectedHomeSpaceId}
          autoRedirect={props.autoRedirect}
          saving={props.homeSpaceSaving}
          onSelect={props.onSelectHomeSpace}
          onToggleAutoRedirect={props.onToggleAutoRedirect}
        />
      </SettingsCard>

      <SettingsCard icon={Users} title={t('user.membership.myMemberships.title')}>
        <MembershipsSection
          rows={props.memberships}
          totalShown={props.totalMemberships}
          totalUnfiltered={props.totalUnfiltered}
          search={props.search}
          filter={props.filter}
          onSearchChange={props.onSearchChange}
          onFilterChange={props.onFilterChange}
          onClearFilters={props.onClearFilters}
          onLeave={props.onLeave}
        />
      </SettingsCard>

      <SettingsCard icon={Users} title={t('user.membership.pendingApplications.title')}>
        <PendingApplicationsSection rows={props.pendingApplications} />
      </SettingsCard>
    </div>
  );
}

// ─── Home Space ───────────────────────────────────────────────────────────

function HomeSpaceSection({
  options,
  selected,
  autoRedirect,
  saving,
  onSelect,
  onToggleAutoRedirect,
}: {
  options: Array<{ value: string; label: string }>;
  selected: string | null;
  autoRedirect: boolean;
  saving: boolean;
  onSelect: (spaceId: string | null) => void;
  onToggleAutoRedirect: (next: boolean) => void;
}) {
  const { t } = useTranslation(NS);
  const noMemberships = options.length === 0;
  const canEnableAutoRedirect = Boolean(selected);

  // Select primitive can't take an empty-string value — use a discrete
  // sentinel for "None" and translate it back to `null` upstream.
  const NONE_VALUE = '__none__';
  const value = selected ?? NONE_VALUE;

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1.5 block text-caption text-muted-foreground">
          {t('user.membership.homeSpace.selectLabel')}
        </Label>
        <Select
          value={value}
          onValueChange={next => onSelect(next === NONE_VALUE ? null : next)}
          disabled={noMemberships || saving}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('user.membership.homeSpace.selectLabel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>
              <em>{t('user.membership.homeSpace.noSelection')}</em>
            </SelectItem>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="auto-redirect"
          checked={autoRedirect}
          disabled={!canEnableAutoRedirect || saving}
          onCheckedChange={checked => onToggleAutoRedirect(checked === true)}
        />
        <div>
          <Label htmlFor="auto-redirect" className="text-body-emphasis">
            {t('user.membership.homeSpace.autoRedirectLabel')}
          </Label>
          {!canEnableAutoRedirect ? (
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('user.membership.homeSpace.autoRedirectDisabledHint')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Memberships grid ────────────────────────────────────────────────────

function MembershipsSection({
  rows,
  totalShown,
  totalUnfiltered,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onLeave,
}: {
  rows: MembershipRowData[];
  totalShown: number;
  totalUnfiltered: number;
  search: string;
  filter: MembershipFilter;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onClearFilters: () => void;
  onLeave: (row: MembershipRowData) => void;
}) {
  const { t } = useTranslation(NS);
  const hasNoneAtAll = totalUnfiltered === 0;

  if (hasNoneAtAll) {
    // FR-018: untouched-list empty state — single muted caption.
    return (
      <p className="py-6 text-center text-body text-muted-foreground">{t('user.membership.myMemberships.empty')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('user.membership.myMemberships.searchPlaceholder')}
            aria-label={t('user.membership.myMemberships.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <SegmentedFilter value={filter} onChange={onFilterChange} />
      </div>

      <p className="text-caption text-muted-foreground">
        {t('user.membership.myMemberships.summary', { shown: totalShown, total: totalUnfiltered })}
      </p>

      {rows.length === 0 ? (
        <FilteredEmptyState onClear={onClearFilters} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(row => (
            <MembershipCard key={row.id} row={row} onLeave={() => onLeave(row)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SegmentedFilter({ value, onChange }: { value: MembershipFilter; onChange: (next: MembershipFilter) => void }) {
  const { t } = useTranslation(NS);
  const options: Array<{ key: MembershipFilter; label: string }> = [
    { key: 'all', label: t('user.membership.filter.all') },
    { key: 'spaces', label: t('user.membership.filter.spaces') },
    { key: 'subspaces', label: t('user.membership.filter.subspaces') },
  ];
  return (
    <div className="flex items-center rounded-md border bg-muted/20 p-1">
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          aria-pressed={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'rounded-sm px-3 py-1.5 text-control transition-all',
            value === opt.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MembershipCard({ row, onLeave }: { row: MembershipRowData; onLeave: () => void }) {
  const { t } = useTranslation(NS);
  const typeLabel = t(row.type === 'Space' ? 'user.membership.type.space' : 'user.membership.type.subspace');
  const viewLabel = t('user.membership.menu.viewByType', { type: typeLabel });
  const leaveLabel = t('user.membership.leave.menuItemLabeled', { type: typeLabel });
  const showRowLink = row.spaceUrl.length > 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border transition-colors hover:border-primary/50">
      {/* Banner area is a plain div (no whole-card link) — navigation is via the kebab's "View Details" item, matching the prototype. */}
      <div
        className="relative aspect-video overflow-hidden bg-muted"
        style={
          row.bannerUrl
            ? undefined
            : { background: `linear-gradient(135deg, ${row.color}, color-mix(in srgb, ${row.color} 70%, black))` }
        }
      >
        {row.bannerUrl ? (
          <img
            src={row.bannerUrl}
            alt={row.displayName}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="border-0 bg-background/80 text-foreground backdrop-blur-md">
            {typeLabel}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button
                variant="secondary"
                size="icon"
                className="size-8 rounded-full bg-background/90 shadow-sm backdrop-blur-sm"
                aria-label={t('shared.account.kebabAriaLabel')}
              >
                <MoreVertical aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showRowLink ? (
                <DropdownMenuItem asChild={true}>
                  <a href={row.spaceUrl}>
                    <ExternalLink aria-hidden="true" className="mr-2 size-4" />
                    {viewLabel}
                  </a>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem variant="destructive" onClick={onLeave}>
                <LogOut aria-hidden="true" className="mr-2 size-4" />
                {leaveLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          {showRowLink ? (
            <a
              href={row.spaceUrl}
              className="line-clamp-1 text-subsection-title leading-tight transition-colors hover:text-primary group-hover:text-primary"
            >
              {row.displayName}
            </a>
          ) : (
            <h3 className="line-clamp-1 text-subsection-title leading-tight">{row.displayName}</h3>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className="h-5 border-primary/20 bg-primary/5 px-1.5 py-0 font-normal text-badge text-primary"
          >
            {t(`user.membership.role.${row.role.toLowerCase()}` as 'user.membership.role.admin')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-2">
        {row.tagline ? <p className="line-clamp-2 text-body text-muted-foreground">{row.tagline}</p> : null}
      </CardContent>
      {row.leadUsers.length > 0 ? (
        <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t bg-muted/30 p-4 text-caption text-muted-foreground">
          <span>{t('user.membership.ledBy')}</span>
          <StackedPersonAvatars
            people={row.leadUsers.map(lead => ({
              id: lead.id,
              name: lead.displayName,
              avatarUrl: lead.avatarUrl,
            }))}
            maxVisible={MAX_VISIBLE_LEADS}
            sizeClass="6"
            groupAriaLabel={t('user.membership.ledByAria', { count: row.leadUsers.length })}
            overflowTooltipLabel={
              row.leadUsers.length > MAX_VISIBLE_LEADS
                ? t('user.membership.leadsMore', { count: row.leadUsers.length - MAX_VISIBLE_LEADS })
                : undefined
            }
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}

const MAX_VISIBLE_LEADS = 3;

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation(NS);
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 py-16 text-center">
      <Folder aria-hidden="true" className="mb-3 size-10 text-muted-foreground/50" />
      <h3 className="text-subsection-title">{t('user.membership.myMemberships.filteredEmptyTitle')}</h3>
      <p className="mb-4 text-body text-muted-foreground">
        {t('user.membership.myMemberships.filteredEmptyDescription')}
      </p>
      <Button variant="outline" onClick={onClear}>
        {t('user.membership.myMemberships.clearFilters')}
      </Button>
    </div>
  );
}

// ─── Pending applications ────────────────────────────────────────────────

function PendingApplicationsSection({ rows }: { rows: PendingApplicationRowData[] }) {
  const { t } = useTranslation(NS);

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-body text-muted-foreground">
        {t('user.membership.pendingApplications.empty')}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map(row => (
        <li key={row.id}>
          <Card className="flex items-center justify-between gap-4 px-4 py-3">
            {row.spaceUrl ? (
              <a href={row.spaceUrl} className="text-body-emphasis hover:text-primary">
                {row.displayName}
              </a>
            ) : (
              <span className="text-body-emphasis">{row.displayName}</span>
            )}
            <Badge variant="secondary" className="font-normal text-caption">
              {t('user.membership.pendingApplications.statusPending')}
            </Badge>
          </Card>
        </li>
      ))}
    </ul>
  );
}

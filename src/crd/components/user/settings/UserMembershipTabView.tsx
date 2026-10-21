import { Home, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MembershipsSection } from '@/crd/components/contributor/settings/MembershipsSection';
import type {
  MembershipFilter,
  MembershipRowData,
  MembershipsSectionLabels,
} from '@/crd/components/contributor/settings/MembershipsSection.types';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Badge } from '@/crd/primitives/badge';
import { Card } from '@/crd/primitives/card';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Skeleton } from '@/crd/primitives/skeleton';

export type {
  MembershipFilter,
  MembershipLeadUserData,
  MembershipRowData,
} from '@/crd/components/contributor/settings/MembershipsSection.types';

const NS = 'crd-contributorSettings';

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

  const membershipLabels: MembershipsSectionLabels = {
    searchPlaceholder: t('user.membership.myMemberships.searchPlaceholder'),
    filterAll: t('user.membership.filter.all'),
    filterSpaces: t('user.membership.filter.spaces'),
    filterSubspaces: t('user.membership.filter.subspaces'),
    summary: (shown, total) => t('user.membership.myMemberships.summary', { shown, total }),
    filteredEmptyTitle: t('user.membership.myMemberships.filteredEmptyTitle'),
    filteredEmptyDescription: t('user.membership.myMemberships.filteredEmptyDescription'),
    clearFilters: t('user.membership.myMemberships.clearFilters'),
    emptyCaption: t('user.membership.myMemberships.empty'),
    typeSpace: t('user.membership.type.space'),
    typeSubspace: t('user.membership.type.subspace'),
    roleLabel: role => t(`user.membership.role.${role.toLowerCase()}` as 'user.membership.role.admin'),
    viewLabel: type => t('user.membership.menu.viewByType', { type }),
    leaveLabel: type => t('user.membership.leave.menuItemLabeled', { type }),
    menuTriggerAriaLabel: name => t('shared.account.kebabAriaLabelFor', { name }),
    ledBy: t('user.membership.ledBy'),
    ledByAria: count => t('user.membership.ledByAria', { count }),
    leadsMore: count => t('user.membership.leadsMore', { count }),
  };

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
          labels={membershipLabels}
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

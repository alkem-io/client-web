import { Clock, Home, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { MembershipsSection } from '@/crd/components/contributor/settings/MembershipsSection';
import type {
  MembershipFilter,
  MembershipRowData,
  MembershipsSectionLabels,
} from '@/crd/components/contributor/settings/MembershipsSection.types';
import { Badge } from '@/crd/primitives/badge';
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
 * User Membership tab — presentational view. Three collapsible
 * `SettingsSection`s (spec 097 Session 2026-10-23):
 * 1. **Home Space** (open) — single-select + Auto-redirect checkbox.
 * 2. **My Memberships** (open) — full-width search, Spaces/Subspaces filter +
 *    summary, then one row per membership with a Leave button (parent owns the dialog).
 * 3. **Pending Applications** (collapsed) — read-only compact rows.
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
    roleLabel: role => t(`user.membership.role.${role.toLowerCase()}` as 'user.membership.role.admin'),
    leave: t('user.membership.leave.button'),
    leaveAriaLabel: name => t('user.membership.leave.buttonAria', { name }),
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
      <SettingsSection
        title={t('user.membership.homeSpace.title')}
        description={t('user.membership.homeSpace.description')}
        icon={<Home className="size-4" />}
        iconColor="purple"
      >
        <HomeSpaceSection
          options={props.homeSpaceOptions}
          selected={props.selectedHomeSpaceId}
          autoRedirect={props.autoRedirect}
          saving={props.homeSpaceSaving}
          onSelect={props.onSelectHomeSpace}
          onToggleAutoRedirect={props.onToggleAutoRedirect}
        />
      </SettingsSection>

      <SettingsSection
        title={t('user.membership.myMemberships.title')}
        icon={<Users className="size-4" />}
        iconColor="blue"
      >
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
      </SettingsSection>

      <SettingsSection
        title={t('user.membership.pendingApplications.title')}
        icon={<Clock className="size-4" />}
        iconColor="amber"
        defaultOpen={false}
      >
        <PendingApplicationsSection rows={props.pendingApplications} />
      </SettingsSection>
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
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 p-3">
            {row.spaceUrl ? (
              <a href={row.spaceUrl} className="text-body-emphasis hover:text-primary">
                {row.displayName}
              </a>
            ) : (
              <span className="text-body-emphasis">{row.displayName}</span>
            )}
            <Badge variant="outline">{t('user.membership.pendingApplications.statusPending')}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

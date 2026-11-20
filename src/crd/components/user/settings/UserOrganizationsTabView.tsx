import { Building2, CheckCircle2, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type OrgRowRole = 'Admin' | 'Associate';

export type OrgRowData = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  location?: string;
  /** Deterministic accent colour — the avatar fallback background. */
  color: string;
  role: OrgRowRole;
  verified: boolean;
  /** Public organization profile URL. Empty when enrichment hasn't resolved yet. */
  profileUrl: string;
  /** Associates (members) count. `undefined` until enriched. */
  associatesCount?: number;
};

export type UserOrganizationsTabViewProps = {
  loading: boolean;
  rows: OrgRowData[];
  totalShown: number;
  totalUnfiltered: number;
  search: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  /** Visible only when the viewer has the `CreateOrganization` platform privilege. */
  showCreateButton: boolean;
  onCreateOrganization: () => void;
  onDisassociate: (row: OrgRowData) => void;
};

/**
 * User Organizations tab — presentational view (spec 097 Session 2026-10-23).
 * "My Organizations" section: full-width search, a "Showing X of Y" line and
 * one row per organization — avatar, linked name + verified check,
 * "N Associates · location", role badge and a Disassociate button (the page
 * owns the confirmation). Below it, a collapsed "Create Organization" section
 * when the viewer may create one. With no organizations at all the list is a
 * single muted caption (FR-018); a search that matches nothing shows the
 * dashed "Clear Search" block.
 */
export function UserOrganizationsTabView(props: UserOrganizationsTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72 w-full rounded-lg" />
        <Skeleton className="h-[76px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title={t('user.organizations.myOrganizations')}
        icon={<Building2 className="size-4" />}
        iconColor="purple"
      >
        {props.totalUnfiltered === 0 ? (
          <p className="py-6 text-center text-body text-muted-foreground">{t('user.organizations.empty')}</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative w-full">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={props.search}
                  onChange={e => props.onSearchChange(e.target.value)}
                  placeholder={t('user.organizations.searchPlaceholder')}
                  aria-label={t('user.organizations.searchPlaceholder')}
                  className="pl-9"
                />
              </div>
              <p className="text-right text-caption text-muted-foreground">
                {t('user.organizations.summary', { shown: props.totalShown, total: props.totalUnfiltered })}
              </p>
            </div>
            {props.rows.length === 0 ? (
              <FilteredEmptyState onClear={props.onClearFilters} />
            ) : (
              <ul className="space-y-2">
                {props.rows.map(row => (
                  <OrganizationRow key={row.id} row={row} onDisassociate={() => props.onDisassociate(row)} />
                ))}
              </ul>
            )}
          </div>
        )}
      </SettingsSection>

      {props.showCreateButton ? (
        <SettingsSection
          title={t('user.organizations.createButton')}
          icon={<Plus className="size-4" />}
          iconColor="green"
          defaultOpen={false}
        >
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/10 px-4 py-8 text-center">
            <Building2 aria-hidden="true" className="mb-3 size-8 text-muted-foreground" />
            <p className="mb-4 text-body text-muted-foreground">{t('user.organizations.createDescription')}</p>
            <Button onClick={props.onCreateOrganization}>
              <Plus aria-hidden="true" className="mr-1.5 size-4" />
              {t('user.organizations.newOrganization')}
            </Button>
          </div>
        </SettingsSection>
      ) : null}
    </div>
  );
}

// ─── Organization row ────────────────────────────────────────────────────

function OrganizationRow({ row, onDisassociate }: { row: OrgRowData; onDisassociate: () => void }) {
  const { t } = useTranslation(NS);
  const details = [
    row.associatesCount !== undefined
      ? t('user.organizations.associatesCount', { count: row.associatesCount })
      : undefined,
    row.location,
  ].filter(Boolean);

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0 rounded-lg">
          {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt="" className="object-cover" /> : null}
          <AvatarFallback color={row.color} className="rounded-lg text-caption font-bold text-white">
            {row.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            {row.profileUrl ? (
              <a href={row.profileUrl} className="truncate text-body-emphasis transition-colors hover:text-primary">
                {row.displayName}
              </a>
            ) : (
              <p className="truncate text-body-emphasis">{row.displayName}</p>
            )}
            {row.verified ? (
              <>
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 fill-blue-500 text-white" />
                <span className="sr-only">{t('user.organizations.verified')}</span>
              </>
            ) : null}
          </div>
          {details.length > 0 ? (
            <p className="truncate text-caption text-muted-foreground">{details.join(' · ')}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">
          {t(`user.organizations.role.${row.role.toLowerCase()}` as 'user.organizations.role.admin')}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDisassociate}
          aria-label={t('user.organizations.disassociate.buttonAria', { name: row.displayName })}
        >
          {t('user.organizations.disassociate.button')}
        </Button>
      </div>
    </li>
  );
}

// ─── Filtered empty state ────────────────────────────────────────────────

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation(NS);
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 py-16 text-center">
      <Building2 aria-hidden="true" className="mb-3 size-10 text-muted-foreground/50" />
      <h3 className="text-subsection-title">{t('user.organizations.filteredEmptyTitle')}</h3>
      <p className="mb-4 text-body text-muted-foreground">{t('user.organizations.filteredEmptyDescription')}</p>
      <Button variant="outline" onClick={onClear}>
        {t('user.organizations.clearSearch')}
      </Button>
    </div>
  );
}

import { Building2, CheckCircle2, ExternalLink, LogOut, MapPin, MoreVertical, Plus, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/crd/primitives/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type OrgRowRole = 'Admin' | 'Associate';

export type OrgRowData = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  tagline?: string;
  location?: string;
  /** Deterministic accent colour — used for banner gradient + avatar fallback bg. */
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
 * User Organizations tab — presentational view. Card grid mirroring
 * `client-web-prototype/src/app/pages/UserOrganizationsPage.tsx`. Each card has a
 * banner area (deterministic gradient — orgs don't have banner images),
 * org logo + Verified badge bottom-left, kebab top-right (View Profile +
 * Disassociate), title + role + location header, tagline body, Associates
 * count footer.
 *
 * Above the grid: search input (filters by name and location) + "Create
 * Organization" primary button (privilege-gated). The empty state matches
 * the prototype's centered dashed-border block when filtering returns
 * zero rows; FR-018 muted caption when the user is associated with no
 * organizations at all.
 */
export function UserOrganizationsTabView(props: UserOrganizationsTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are interchangeable
          <Skeleton key={i} className="h-[340px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (props.totalUnfiltered === 0) {
    // FR-018: untouched-list empty state — single muted caption.
    return <p className="py-6 text-center text-body text-muted-foreground">{t('user.organizations.empty')}</p>;
  }

  return (
    <div className="space-y-4">
      <ControlsRow
        search={props.search}
        onSearchChange={props.onSearchChange}
        showCreateButton={props.showCreateButton}
        onCreateOrganization={props.onCreateOrganization}
      />

      <p className="text-caption text-muted-foreground">
        {t('user.organizations.summary', { shown: props.totalShown, total: props.totalUnfiltered })}
      </p>

      {props.rows.length === 0 ? (
        <FilteredEmptyState onClear={props.onClearFilters} />
      ) : (
        <>
          {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
          {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
          <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {props.rows.map(row => (
              <li key={row.id}>
                <OrganizationCard row={row} onDisassociate={() => props.onDisassociate(row)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Controls row ────────────────────────────────────────────────────────

function ControlsRow({
  search,
  onSearchChange,
  showCreateButton,
  onCreateOrganization,
}: {
  search: string;
  onSearchChange: (term: string) => void;
  showCreateButton: boolean;
  onCreateOrganization: () => void;
}) {
  const { t } = useTranslation(NS);
  return (
    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-96">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={t('user.organizations.searchPlaceholder')}
          aria-label={t('user.organizations.searchPlaceholder')}
          className="pl-9"
        />
      </div>
      {showCreateButton ? (
        <Button onClick={onCreateOrganization} className="ml-auto md:ml-0">
          <Plus aria-hidden="true" className="mr-2 size-4" />
          {t('user.organizations.createButton')}
        </Button>
      ) : null}
    </div>
  );
}

// ─── Organization card ───────────────────────────────────────────────────

function OrganizationCard({ row, onDisassociate }: { row: OrgRowData; onDisassociate: () => void }) {
  const { t } = useTranslation(NS);
  const initials = row.displayName.slice(0, 2).toUpperCase();
  const showProfileLink = row.profileUrl.length > 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border transition-colors hover:border-primary/50">
      {/* Banner area — orgs have no banner image, so always render the deterministic gradient */}
      <div
        className="relative aspect-video overflow-hidden bg-muted"
        style={{
          background: `linear-gradient(135deg, ${row.color}, color-mix(in srgb, ${row.color} 70%, black))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* Kebab top-right */}
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
              {showProfileLink ? (
                <DropdownMenuItem asChild={true}>
                  <a href={row.profileUrl}>
                    <ExternalLink aria-hidden="true" className="mr-2 size-4" />
                    {t('user.organizations.menu.viewProfile')}
                  </a>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem variant="destructive" onClick={onDisassociate}>
                <LogOut aria-hidden="true" className="mr-2 size-4" />
                {t('user.organizations.menu.disassociate')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar + Verified badge bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-end gap-3">
          <Avatar className="size-12 rounded-lg border-2 border-background shadow-md">
            {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt={row.displayName} className="object-cover" /> : null}
            <AvatarFallback color={row.color} className="rounded-lg font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {row.verified ? (
            <Badge
              variant="secondary"
              className="mb-0.5 gap-1 border-0 bg-background/80 pl-1.5 pr-2 text-foreground backdrop-blur-md"
            >
              <CheckCircle2 aria-hidden="true" className="size-3.5 fill-blue-500 text-white" />
              {t('user.organizations.verified')}
            </Badge>
          ) : null}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        {showProfileLink ? (
          <a
            href={row.profileUrl}
            className="line-clamp-1 text-subsection-title leading-tight transition-colors hover:text-primary group-hover:text-primary"
          >
            {row.displayName}
          </a>
        ) : (
          <h3 className="line-clamp-1 text-subsection-title leading-tight">{row.displayName}</h3>
        )}
        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className="h-5 border-primary/20 bg-primary/5 px-1.5 py-0 font-normal text-badge text-primary"
          >
            {t(`user.organizations.role.${row.role.toLowerCase()}` as 'user.organizations.role.admin')}
          </Badge>
          {row.location ? (
            <>
              <span className="text-caption text-muted-foreground">•</span>
              <div className="flex items-center text-caption text-muted-foreground">
                <MapPin aria-hidden="true" className="mr-1 size-3" />
                {row.location}
              </div>
            </>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4 pt-2">
        {row.tagline ? <p className="line-clamp-2 text-body text-muted-foreground">{row.tagline}</p> : null}
      </CardContent>

      {row.associatesCount !== undefined ? (
        <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t bg-muted/30 p-4 text-caption text-muted-foreground">
          <div className="flex items-center gap-1" title={t('user.organizations.associates')}>
            <Users aria-hidden="true" className="size-3.5" />
            <span>{t('user.organizations.associatesCount', { count: row.associatesCount })}</span>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}

// ─── Filtered empty state ────────────────────────────────────────────────

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation(NS);
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 py-16 text-center">
      <Building2 aria-hidden="true" className={cn('mb-3 size-10 text-muted-foreground/50')} />
      <h3 className="text-subsection-title">{t('user.organizations.filteredEmptyTitle')}</h3>
      <p className="mb-4 text-body text-muted-foreground">{t('user.organizations.filteredEmptyDescription')}</p>
      <Button variant="outline" onClick={onClear}>
        {t('user.organizations.clearSearch')}
      </Button>
    </div>
  );
}

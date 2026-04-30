import {
  Bot,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PendingMembership } from '@/crd/components/space/settings/PendingMembershipsTable';
import { PendingMembershipsTable } from '@/crd/components/space/settings/PendingMembershipsTable';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { Separator } from '@/crd/primitives/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type CommunityMember = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  url?: string;
  /** Plain-text role: `Host`, `Admin`, `Lead`, `Member`. */
  roleLabel: string;
  /** Whether this member currently holds the Lead role (drives the lead toggle). */
  isLead: boolean;
  /** Whether this member is a space admin — admin rows hide the lead toggle (admin role is managed separately). */
  isAdmin: boolean;
  /** ISO or already-formatted date string shown in the Joined column. Empty → "—". */
  joinedDate: string;
};

export type CommunityOrg = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  url?: string;
  isMember: boolean;
  isLead: boolean;
};

export type CommunityVC = {
  id: string;
  displayName: string;
  url?: string;
};

export type SpaceSettingsCommunityViewProps = {
  /**
   * Space hierarchy level. Drives:
   * - Virtual Contributors block visibility (L0 only — matches MUI's
   *   `virtualContributorsBlockEnabled`).
   * - Lead-toggle visibility on member/organization rows (L1/L2 only).
   */
  level: 'L0' | 'L1' | 'L2';
  members: CommunityMember[];
  pendingMemberships: PendingMembership[];
  organizations: CommunityOrg[];
  virtualContributors: CommunityVC[];
  applicationFormSlot?: ReactNode;
  communityGuidelinesSlot?: ReactNode;
  permissions: {
    canAddUsers: boolean;
    canAddOrganizations: boolean;
    canAddVirtualContributors: boolean;
  };
  /** Show the destructive "Remove from Space" dropdown item on member rows. Omit to hide. */
  onUserRemove?: (id: string) => void;
  /** Open the Member settings dialog for this user. Replaces the legacy inline lead-toggle dropdown item. */
  onMemberChangeRole?: (member: CommunityMember) => void;
  onOrgAdd: () => void;
  /** Show the destructive "Remove from Space" dropdown item on organization rows. Omit to hide. */
  onOrgRemove?: (id: string) => void;
  /** Open the Member settings dialog for this organization. */
  onOrgChangeRole?: (org: CommunityOrg) => void;
  onVCAdd: () => void;
  onVCAddExternal?: () => void;
  onVCRemove: (id: string) => void;
  onPendingApprove: (id: string) => void;
  onPendingReject: (id: string) => void;
  onPendingDelete: (id: string) => void;
  onInviteUsers: () => void;
  className?: string;
};

const MEMBERS_PAGE_SIZE = 10;

export function SpaceSettingsCommunityView({
  level,
  members,
  pendingMemberships,
  organizations,
  virtualContributors,
  applicationFormSlot,
  communityGuidelinesSlot,
  permissions,
  onUserRemove,
  onMemberChangeRole,
  onOrgAdd,
  onOrgRemove,
  onOrgChangeRole,
  onVCAdd,
  onVCAddExternal,
  onVCRemove,
  onPendingApprove,
  onPendingReject,
  onPendingDelete,
  onInviteUsers,
  className,
}: SpaceSettingsCommunityViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = members.filter(m => {
    if (!search) return true;
    const needle = search.toLowerCase();
    return m.displayName.toLowerCase().includes(needle) || (m.email?.toLowerCase().includes(needle) ?? false);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / MEMBERS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * MEMBERS_PAGE_SIZE;
  const pageEnd = Math.min(pageStart + MEMBERS_PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(pageStart, pageEnd);

  const handleSearchChange = (next: string) => {
    setSearch(next);
    setPage(1);
  };

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <div>
        <h2 className="text-section-title tracking-tight">{t('community.pageHeader.title')}</h2>
        <p className="text-body text-muted-foreground mt-2">{t('community.pageHeader.subtitle')}</p>
      </div>

      <Separator />

      <PendingMembershipsTable
        items={pendingMemberships}
        onApprove={onPendingApprove}
        onReject={onPendingReject}
        onDelete={onPendingDelete}
      />

      <Separator />

      {/* Space Members table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-subsection-title flex items-center gap-2">
            {t('community.members.title')}
            <Badge variant="secondary" className="rounded-full">
              {filtered.length}
            </Badge>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                aria-label={t('community.members.search')}
                placeholder={t('community.members.search')}
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="h-9 w-[220px] pl-9 text-sm"
              />
            </div>
            {permissions.canAddUsers && (
              <Button type="button" size="sm" className="gap-2" onClick={onInviteUsers}>
                <UserPlus aria-hidden="true" className="size-4" />
                {t('community.members.invite')}
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px]">{t('community.members.name')}</TableHead>
                <TableHead>{t('community.members.roleColumn')}</TableHead>
                <TableHead>{t('community.members.joined')}</TableHead>
                <TableHead className="w-[140px] text-right">{t('community.members.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {t('community.members.empty')}
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((m, index) => (
                <TableRow key={m.id} className={cn(index % 2 === 1 && 'bg-muted/30')}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8 border border-border shrink-0">
                        {m.avatarUrl ? <AvatarImage src={m.avatarUrl} alt="" /> : null}
                        <AvatarFallback className="text-caption">
                          {m.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        {m.url ? (
                          <a href={m.url} className="block text-body-emphasis truncate hover:underline">
                            {m.displayName}
                          </a>
                        ) : (
                          <span className="block text-body-emphasis truncate">{m.displayName}</span>
                        )}
                        {m.email && (
                          <span className="block text-caption text-muted-foreground truncate">{m.email}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-body-emphasis text-foreground">{m.roleLabel}</span>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{m.joinedDate || '—'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild={true}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={t('community.members.actions')}
                        >
                          <MoreHorizontal aria-hidden="true" className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(() => {
                          const hasViewProfile = !!m.url;
                          const showChangeRole = !!onMemberChangeRole;
                          const showRemove = !!onUserRemove;
                          const hasManageActions = showChangeRole;
                          return (
                            <>
                              {hasViewProfile && (
                                <DropdownMenuItem asChild={true}>
                                  <a href={m.url}>{t('community.members.dropdown.viewProfile')}</a>
                                </DropdownMenuItem>
                              )}
                              {showChangeRole && (
                                <DropdownMenuItem onClick={() => onMemberChangeRole?.(m)}>
                                  {t('community.members.dropdown.changeRole')}
                                </DropdownMenuItem>
                              )}
                              {showRemove && (hasViewProfile || hasManageActions) && <DropdownMenuSeparator />}
                              {showRemove && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => onUserRemove?.(m.id)}
                                >
                                  <Trash2 aria-hidden="true" className="mr-2 size-4" />
                                  {t('community.members.dropdown.removeFromSpace')}
                                </DropdownMenuItem>
                              )}
                            </>
                          );
                        })()}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length > MEMBERS_PAGE_SIZE && (
          <div className="flex items-center justify-between py-2">
            <p className="text-caption text-muted-foreground">
              {t('community.members.pagination.showing', { from: pageStart + 1, to: pageEnd, total: filtered.length })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label={t('community.members.pagination.previous')}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>
              <span className="text-caption text-body-emphasis">
                {t('community.members.pagination.page', { page: safePage, total: totalPages })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label={t('community.members.pagination.next')}
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {applicationFormSlot && (
        <SectionCard
          icon={FileText}
          title={t('community.applicationForm.title')}
          description={t('community.applicationForm.description')}
        >
          {applicationFormSlot}
        </SectionCard>
      )}

      {communityGuidelinesSlot && (
        <SectionCard
          icon={Shield}
          title={t('community.guidelines.title')}
          description={t('community.guidelines.description')}
        >
          {communityGuidelinesSlot}
        </SectionCard>
      )}

      <SectionCard
        icon={Building}
        title={t('community.organizations.title')}
        description={t('community.organizations.description')}
        count={organizations.length}
      >
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px]">{t('community.organizations.name')}</TableHead>
                <TableHead>{t('community.organizations.role')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('community.organizations.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    {t('community.organizations.empty')}
                  </TableCell>
                </TableRow>
              )}
              {organizations.map((org, index) => (
                <TableRow key={org.id} className={cn(index % 2 === 1 && 'bg-muted/30')}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8 rounded-md border border-border shrink-0">
                        {org.avatarUrl ? <AvatarImage src={org.avatarUrl} alt="" /> : null}
                        <AvatarFallback className="rounded-md text-badge bg-muted text-muted-foreground">
                          {org.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {org.url ? (
                        <a href={org.url} className="block text-body-emphasis truncate hover:underline">
                          {org.displayName}
                        </a>
                      ) : (
                        <span className="block text-body-emphasis truncate">{org.displayName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-body-emphasis text-foreground">
                      {org.isLead ? t('community.members.role.lead') : t('community.members.role.member')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild={true}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={t('community.organizations.actions')}
                        >
                          <MoreHorizontal aria-hidden="true" className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(() => {
                          const hasViewProfile = !!org.url;
                          const showChangeRole = !!onOrgChangeRole;
                          const showRemove = !!onOrgRemove;
                          const hasManageActions = showChangeRole;
                          return (
                            <>
                              {hasViewProfile && (
                                <DropdownMenuItem asChild={true}>
                                  <a href={org.url}>{t('community.organizations.dropdown.viewProfile')}</a>
                                </DropdownMenuItem>
                              )}
                              {showChangeRole && (
                                <DropdownMenuItem onClick={() => onOrgChangeRole?.(org)}>
                                  {t('community.organizations.dropdown.changeRole')}
                                </DropdownMenuItem>
                              )}
                              {showRemove && (hasViewProfile || hasManageActions) && <DropdownMenuSeparator />}
                              {showRemove && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => onOrgRemove?.(org.id)}
                                >
                                  <Trash2 aria-hidden="true" className="mr-2 size-4" />
                                  {t('community.organizations.dropdown.removeFromSpace')}
                                </DropdownMenuItem>
                              )}
                            </>
                          );
                        })()}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {permissions.canAddOrganizations && (
          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onOrgAdd}>
              <Plus aria-hidden="true" className="size-4" />
              {t('community.organizations.add')}
            </Button>
            <p className="mt-2 text-caption text-muted-foreground">{t('community.organizations.hint')}</p>
          </div>
        )}
      </SectionCard>

      {level === 'L0' && (
        <SectionCard
          icon={Bot}
          title={t('community.virtualContributors.title')}
          description={t('community.virtualContributors.description')}
          count={virtualContributors.length}
        >
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[320px]">{t('community.virtualContributors.name')}</TableHead>
                  <TableHead className="w-[100px] text-right">{t('community.virtualContributors.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {virtualContributors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      {t('community.virtualContributors.empty')}
                    </TableCell>
                  </TableRow>
                )}
                {virtualContributors.map((vc, index) => (
                  <TableRow key={vc.id} className={cn(index % 2 === 1 && 'bg-muted/30')}>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0">
                          <Bot aria-hidden="true" className="size-4" />
                        </div>
                        {vc.url ? (
                          <a href={vc.url} className="block text-body-emphasis truncate hover:underline">
                            {vc.displayName}
                          </a>
                        ) : (
                          <span className="block text-body-emphasis truncate">{vc.displayName}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onVCRemove(vc.id)}
                        aria-label={t('community.virtualContributors.remove')}
                        className="size-8"
                      >
                        <Trash2 aria-hidden="true" className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {permissions.canAddVirtualContributors && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onVCAdd}>
                <Plus aria-hidden="true" className="size-4" />
                {t('community.virtualContributors.add')}
              </Button>
              {onVCAddExternal && (
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onVCAddExternal}>
                  <Plus aria-hidden="true" className="size-4" />
                  {t('community.virtualContributors.addExternal')}
                </Button>
              )}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  count,
  defaultOpen = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  title: string;
  description: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <button
        type="button"
        className="flex w-full items-start gap-4 text-left group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <div className="mt-1 p-2 bg-muted rounded-md shrink-0 group-hover:bg-muted/80 transition-colors">
          <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-subsection-title flex items-center gap-2">
              {title}
              {typeof count === 'number' && (
                <Badge variant="secondary" className="rounded-full">
                  {count}
                </Badge>
              )}
            </h3>
            {open ? (
              <ChevronUp aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
            )}
          </div>
          <p className="mt-1 text-body text-muted-foreground pr-8">{description}</p>
        </div>
      </button>
      {open && <div className="mt-6 pl-[52px]">{children}</div>}
    </section>
  );
}

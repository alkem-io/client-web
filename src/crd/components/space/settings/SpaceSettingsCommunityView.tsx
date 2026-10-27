import {
  Bot,
  Building,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GatedAction } from '@/crd/components/common/GatedAction';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import type { PendingMembership } from '@/crd/components/space/settings/PendingMembershipsTable';
import { PendingMembershipsTable } from '@/crd/components/space/settings/PendingMembershipsTable';
import type { PendingOrganizationInvitationItem } from '@/crd/components/space/settings/PendingOrganizationInvitationsList';
import { PendingOrganizationInvitationsList } from '@/crd/components/space/settings/PendingOrganizationInvitationsList';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatShortDate } from '@/crd/lib/dateTimeFormat';
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

export type PendingOrganizationInvitation = {
  id: string;
  organizationDisplayName: string;
  organizationUrl?: string;
  /** Whether the invitation also offers the Lead role, alongside the always-granted Member role. */
  role: 'member' | 'memberLead';
  /** Raw ISO date string — the view formats it for display. */
  createdDate: string;
  canRevoke: boolean;
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
  pendingOrganizationInvitations: PendingOrganizationInvitation[];
  applicationFormSlot?: ReactNode;
  communityGuidelinesSlot?: ReactNode;
  permissions: {
    canInvite: boolean;
    canInviteOrganizations: boolean;
    canAddVirtualContributors: boolean;
  };
  /**
   * Tooltip copy for the add launch buttons when the action is unavailable.
   *
   * These buttons are rendered gated rather than hidden: hiding conceals the action's
   * existence and produces a hidden→shown flip once privileges resolve, which spec FR-002
   * and FR-008 rule out. Undefined means permitted.
   */
  addDisabledReasons?: {
    virtualContributors?: string;
  };
  /**
   * Tooltip copy for the *Invite organisation* button when the action is unavailable.
   * Gated, never hidden. Organisations join a Space by invitation only — there is no
   * direct-add control (alkem-io/server#6623). Undefined means permitted.
   */
  inviteOrganizationsDisabledReason?: string;
  /** Show the destructive "Remove from Space" dropdown item on member rows. Omit to hide. */
  onUserRemove?: (id: string) => void;
  /** Open the Member settings dialog for this user. Replaces the legacy inline lead-toggle dropdown item. */
  onMemberChangeRole?: (member: CommunityMember) => void;
  /** Opens the unified invite dialog with kind='organization'. */
  onInviteOrganizations: () => void;
  /** Show the destructive "Remove from Space" dropdown item on organization rows. Omit to hide. */
  onOrgRemove?: (id: string) => void;
  /** Open the Member settings dialog for this organization. */
  onOrgChangeRole?: (org: CommunityOrg) => void;
  onOrgInvitationRevoke: (id: string) => void;
  onVCAdd: () => void;
  onVCAddExternal?: () => void;
  onVCRemove: (id: string) => void;
  onPendingView: (id: string) => void;
  onPendingApprove: (id: string) => void;
  onPendingReject: (id: string) => void;
  onPendingDelete: (id: string) => void;
  onPendingResend?: (id: string) => void;
  resendingIds?: ReadonlySet<string>;
  onInviteUsers: () => void;
  onExportMembers?: () => void;
  exportDisabled?: boolean;
  className?: string;
};

const MEMBERS_PAGE_SIZE = 10;

export function SpaceSettingsCommunityView({
  level,
  members,
  pendingMemberships,
  organizations,
  virtualContributors,
  pendingOrganizationInvitations,
  applicationFormSlot,
  communityGuidelinesSlot,
  permissions,
  addDisabledReasons,
  inviteOrganizationsDisabledReason,
  onUserRemove,
  onMemberChangeRole,
  onInviteOrganizations,
  onOrgRemove,
  onOrgChangeRole,
  onOrgInvitationRevoke,
  onVCAdd,
  onVCAddExternal,
  onVCRemove,
  onPendingView,
  onPendingApprove,
  onPendingReject,
  onPendingDelete,
  onPendingResend,
  resendingIds,
  onInviteUsers,
  onExportMembers,
  exportDisabled,
  className,
}: SpaceSettingsCommunityViewProps) {
  const { t, i18n } = useTranslation('crd-spaceSettings');
  const locale = resolveDateFnsLocale(i18n.language);
  // FR-042: subspace copy via the i18next `_subspace` key variants.
  const context = level === 'L0' ? undefined : 'subspace';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [orgSearch, setOrgSearch] = useState('');

  const filtered = members.filter(m => {
    if (!search) return true;
    const needle = search.toLowerCase();
    return m.displayName.toLowerCase().includes(needle) || (m.email?.toLowerCase().includes(needle) ?? false);
  });

  const filteredOrganizations = organizations.filter(org => {
    if (!orgSearch) return true;
    return org.displayName.toLowerCase().includes(orgSearch.toLowerCase());
  });

  const pendingOrgInvitationItems: PendingOrganizationInvitationItem[] = pendingOrganizationInvitations.map(inv => ({
    id: inv.id,
    organizationDisplayName: inv.organizationDisplayName,
    organizationUrl: inv.organizationUrl,
    roleLabel:
      inv.role === 'memberLead'
        ? t('community.organizations.pendingInvitations.roleMemberLead')
        : t('community.organizations.pendingInvitations.roleMember'),
    date: formatShortDate(inv.createdDate, locale) ?? '',
    canRevoke: inv.canRevoke,
  }));

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
    <div className={cn('flex flex-col gap-5', className)}>
      <SettingsSection
        title={t('community.pendingMemberships.title')}
        icon={<Clock className="size-4" />}
        iconColor="amber"
        badge={<CountBadge count={pendingMemberships.length} />}
      >
        <PendingMembershipsTable
          hideHeading={true}
          items={pendingMemberships}
          onView={onPendingView}
          onApprove={onPendingApprove}
          onReject={onPendingReject}
          onDelete={onPendingDelete}
          onResend={onPendingResend}
          resendingIds={resendingIds}
        />
      </SettingsSection>

      {/* Space Members table */}
      <SettingsSection
        id="members"
        title={t('community.members.title', { context })}
        icon={<Users className="size-4" />}
        iconColor="blue"
        badge={<CountBadge count={filtered.length} />}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                aria-label={t('community.members.search')}
                placeholder={t('community.members.search')}
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="h-9 w-full pl-9 text-control"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {permissions.canInvite && (
                <Button type="button" size="sm" className="gap-2" onClick={onInviteUsers}>
                  <UserPlus aria-hidden="true" className="size-4" />
                  {t('community.members.invite')}
                </Button>
              )}
              {onExportMembers && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={onExportMembers}
                  disabled={exportDisabled}
                >
                  <Download aria-hidden="true" className="size-4" />
                  {t('community.members.export')}
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
                                    {t('community.members.dropdown.removeFromSpace', { context })}
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
                {t('community.members.pagination.showing', {
                  from: pageStart + 1,
                  to: pageEnd,
                  total: filtered.length,
                })}
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
      </SettingsSection>

      {applicationFormSlot && (
        <SettingsSection
          title={t('community.applicationForm.title')}
          icon={<FileText className="size-4" />}
          iconColor="purple"
          defaultOpen={false}
          keepMounted={false}
        >
          {applicationFormSlot}
        </SettingsSection>
      )}

      {communityGuidelinesSlot && (
        <SettingsSection
          id="guidelines"
          title={t('community.guidelines.title')}
          icon={<Shield className="size-4" />}
          iconColor="green"
          defaultOpen={false}
          keepMounted={false}
        >
          {communityGuidelinesSlot}
        </SettingsSection>
      )}

      <SettingsSection
        title={t('community.organizations.title')}
        icon={<Building className="size-4" />}
        iconColor="orange"
        badge={<CountBadge count={filteredOrganizations.length} />}
        defaultOpen={false}
        keepMounted={false}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              aria-label={t('community.organizations.search')}
              placeholder={t('community.organizations.search')}
              value={orgSearch}
              onChange={e => setOrgSearch(e.target.value)}
              className="h-9 w-[220px] pl-9 text-control"
            />
          </div>
          <div className="flex">
            {/* Gated, not hidden: every Space admin can eventually invite, so concealing this
                action would hide a capability the user can actually obtain, and it would flip
                hidden→shown once the privilege query resolves. Invitation is the only way an
                organisation joins a Space (alkem-io/server#6623). */}
            <GatedAction disabledReason={inviteOrganizationsDisabledReason}>
              <Button type="button" size="sm" className="gap-2" onClick={onInviteOrganizations}>
                <UserPlus aria-hidden="true" className="size-4" />
                {t('community.organizations.invite')}
              </Button>
            </GatedAction>
          </div>
        </div>
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
              {filteredOrganizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    {t('community.organizations.empty')}
                  </TableCell>
                </TableRow>
              )}
              {filteredOrganizations.map((org, index) => (
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
                                  {t('community.organizations.dropdown.removeFromSpace', { context })}
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
        <PendingOrganizationInvitationsList
          className="mt-6"
          title={t('community.organizations.pendingInvitations.title')}
          items={pendingOrgInvitationItems}
          emptyLabel={t('community.organizations.pendingInvitations.empty')}
          roleColumnLabel={t('community.organizations.pendingInvitations.role')}
          dateColumnLabel={t('community.organizations.pendingInvitations.date')}
          revokeLabel={t('community.organizations.pendingInvitations.revoke')}
          revokeAriaLabel={name => t('community.organizations.pendingInvitations.revokeAriaLabel', { name })}
          onRevoke={onOrgInvitationRevoke}
        />
      </SettingsSection>

      {level === 'L0' && (
        <SettingsSection
          title={t('community.virtualContributors.title')}
          icon={<Bot className="size-4" />}
          iconColor="rose"
          badge={<CountBadge count={virtualContributors.length} />}
          defaultOpen={false}
          keepMounted={false}
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
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <GatedAction disabledReason={addDisabledReasons?.virtualContributors}>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onVCAdd}>
                <Plus aria-hidden="true" className="size-4" />
                {t('community.virtualContributors.add')}
              </Button>
            </GatedAction>
            {onVCAddExternal && (
              <GatedAction disabledReason={addDisabledReasons?.virtualContributors}>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onVCAddExternal}>
                  <Plus aria-hidden="true" className="size-4" />
                  {t('community.virtualContributors.addExternal')}
                </Button>
              </GatedAction>
            )}
          </div>
        </SettingsSection>
      )}
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <Badge variant="secondary" className="rounded-full">
      {count}
    </Badge>
  );
}

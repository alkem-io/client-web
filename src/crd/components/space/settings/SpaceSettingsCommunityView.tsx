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
  onUserRemove: (id: string) => void;
  onOrgAdd: () => void;
  onOrgRemove: (id: string) => void;
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
  members,
  pendingMemberships,
  organizations,
  virtualContributors,
  applicationFormSlot,
  communityGuidelinesSlot,
  permissions,
  onUserRemove,
  onOrgAdd,
  onOrgRemove,
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
        <h2 className="text-section-title tracking-tight">
          {t('community.pageHeader.title', { defaultValue: 'Community' })}
        </h2>
        <p className="text-body text-muted-foreground mt-2">
          {t('community.pageHeader.subtitle', {
            defaultValue: 'Manage your space members, review applications, and configure community settings.',
          })}
        </p>
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
            {t('community.members.title', { defaultValue: 'Space Members' })}
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
                aria-label={t('community.members.search', { defaultValue: 'Search members…' })}
                placeholder={t('community.members.search', { defaultValue: 'Search members…' })}
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="h-9 w-[220px] pl-9 text-sm"
              />
            </div>
            {permissions.canAddUsers && (
              <Button type="button" size="sm" className="gap-2" onClick={onInviteUsers}>
                <UserPlus aria-hidden="true" className="size-4" />
                {t('community.members.invite', { defaultValue: 'Invite' })}
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px]">{t('community.members.name', { defaultValue: 'Name' })}</TableHead>
                <TableHead>{t('community.members.role', { defaultValue: 'Role' })}</TableHead>
                <TableHead>{t('community.members.joined', { defaultValue: 'Joined' })}</TableHead>
                <TableHead className="w-[140px] text-right">
                  {t('community.members.actions', { defaultValue: 'Actions' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {t('community.members.empty', { defaultValue: 'No members found.' })}
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
                          aria-label={t('community.members.actions', { defaultValue: 'Actions' })}
                        >
                          <MoreHorizontal aria-hidden="true" className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {m.url && (
                          <DropdownMenuItem asChild={true}>
                            <a href={m.url}>{t('community.members.viewProfile', { defaultValue: 'View Profile' })}</a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onUserRemove(m.id)}
                        >
                          <Trash2 aria-hidden="true" className="mr-2 size-4" />
                          {t('community.members.remove', { defaultValue: 'Remove from Space' })}
                        </DropdownMenuItem>
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
                defaultValue: 'Showing {{from}} to {{to}} of {{total}} members',
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
                aria-label={t('community.members.pagination.previous', { defaultValue: 'Previous page' })}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>
              <span className="text-caption text-body-emphasis">
                {t('community.members.pagination.page', {
                  defaultValue: 'Page {{page}} of {{total}}',
                  page: safePage,
                  total: totalPages,
                })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label={t('community.members.pagination.next', { defaultValue: 'Next page' })}
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
          title={t('community.applicationForm.title', { defaultValue: 'Application Form' })}
          description={t('community.applicationForm.description', {
            defaultValue: 'Customize the questions users must answer when applying to join this space.',
          })}
        >
          {applicationFormSlot}
        </SectionCard>
      )}

      {communityGuidelinesSlot && (
        <SectionCard
          icon={Shield}
          title={t('community.guidelines.title', { defaultValue: 'Community Guidelines' })}
          description={t('community.guidelines.description', {
            defaultValue: 'Establish rules and expectations for member behavior.',
          })}
        >
          {communityGuidelinesSlot}
        </SectionCard>
      )}

      <SectionCard
        icon={Building}
        title={t('community.organizations.title', { defaultValue: 'Member Organizations' })}
        description={t('community.organizations.description', {
          defaultValue: 'Allow members from specific organizations to join automatically.',
        })}
        count={organizations.length}
      >
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px]">
                  {t('community.organizations.name', { defaultValue: 'Name' })}
                </TableHead>
                <TableHead>{t('community.organizations.role', { defaultValue: 'Role' })}</TableHead>
                <TableHead className="w-[100px] text-right">
                  {t('community.organizations.actions', { defaultValue: 'Actions' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    {t('community.organizations.empty', { defaultValue: 'No organizations yet.' })}
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
                      {org.isLead
                        ? t('community.members.role.lead', { defaultValue: 'Lead' })
                        : t('community.members.role.member', { defaultValue: 'Member' })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onOrgRemove(org.id)}
                      aria-label={t('community.organizations.remove', { defaultValue: 'Remove organization' })}
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
        {permissions.canAddOrganizations && (
          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onOrgAdd}>
              <Plus aria-hidden="true" className="size-4" />
              {t('community.organizations.add', { defaultValue: 'Add Organization' })}
            </Button>
            <p className="mt-2 text-caption text-muted-foreground">
              {t('community.organizations.hint', {
                defaultValue: 'Users from these organizations can join without admin approval.',
              })}
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={Bot}
        title={t('community.virtualContributors.title', { defaultValue: 'Virtual Contributors' })}
        description={t('community.virtualContributors.description', {
          defaultValue: 'Manage AI agents and bots participating in this space.',
        })}
        count={virtualContributors.length}
      >
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px]">
                  {t('community.virtualContributors.name', { defaultValue: 'Name' })}
                </TableHead>
                <TableHead className="w-[100px] text-right">
                  {t('community.virtualContributors.actions', { defaultValue: 'Actions' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {virtualContributors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    {t('community.virtualContributors.empty', { defaultValue: 'No virtual contributors yet.' })}
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
                      aria-label={t('community.virtualContributors.remove', {
                        defaultValue: 'Remove virtual contributor',
                      })}
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
              {t('community.virtualContributors.add', { defaultValue: 'Add Virtual Contributor' })}
            </Button>
            {onVCAddExternal && (
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onVCAddExternal}>
                <Plus aria-hidden="true" className="size-4" />
                {t('community.virtualContributors.addExternal', {
                  defaultValue: 'Invite External Virtual Contributor',
                })}
              </Button>
            )}
          </div>
        )}
      </SectionCard>
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

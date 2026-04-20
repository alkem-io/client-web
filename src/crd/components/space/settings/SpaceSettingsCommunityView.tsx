import { Check, ChevronDown, ChevronRight, Clock, Mail, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type CommunityMember = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  url?: string;
  isMember: boolean;
  isLead: boolean;
  isAdmin: boolean;
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

export type PendingApplication = {
  id: string;
  displayName: string;
  email?: string;
  createdDate: string;
};

export type PendingInvitation = {
  id: string;
  displayName: string;
  email?: string;
  createdDate: string;
  isPlatformInvitation: boolean;
};

export type SpaceSettingsCommunityViewProps = {
  users: CommunityMember[];
  organizations: CommunityOrg[];
  virtualContributors: CommunityVC[];
  applications: PendingApplication[];
  invitations: PendingInvitation[];
  permissions: {
    canAddUsers: boolean;
    canAddOrganizations: boolean;
    canAddVirtualContributors: boolean;
  };
  onUserLeadChange: (id: string, isLead: boolean) => void;
  onUserAdminChange: (id: string, isAdmin: boolean) => void;
  onUserRemove: (id: string) => void;
  onOrgLeadChange: (id: string, isLead: boolean) => void;
  onOrgRemove: (id: string) => void;
  onVCRemove: (id: string) => void;
  onApplicationApprove: (id: string) => void;
  onApplicationReject: (id: string) => void;
  onInvitationDelete: (id: string) => void;
  onPlatformInvitationDelete: (id: string) => void;
  onInviteUsers: () => void;
  className?: string;
};

export function SpaceSettingsCommunityView({
  users,
  organizations,
  virtualContributors,
  applications,
  invitations,
  permissions,
  onUserLeadChange: _onUserLeadChange,
  onUserAdminChange: _onUserAdminChange,
  onUserRemove,
  onOrgLeadChange: _onOrgLeadChange,
  onOrgRemove,
  onVCRemove,
  onApplicationApprove,
  onApplicationReject,
  onInvitationDelete,
  onPlatformInvitationDelete,
  onInviteUsers,
  className,
}: SpaceSettingsCommunityViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = userSearch
    ? users.filter(
        u =>
          u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.email?.toLowerCase().includes(userSearch.toLowerCase()) ?? false)
      )
    : users;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <h2 className="text-lg font-semibold">{t('community.pageHeader.title', { defaultValue: 'Community' })}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('community.pageHeader.subtitle', {
            defaultValue: 'Manage members, organizations, and virtual contributors in this space.',
          })}
        </p>
      </div>

      {/* Pending Applications */}
      {applications.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {t('community.applications.title', { defaultValue: 'Pending Applications' })}
            <Badge variant="secondary" className="rounded-full">
              {applications.length}
            </Badge>
          </h3>
          <ul className="space-y-2">
            {applications.map(app => (
              <li key={app.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
                <Avatar className="size-10 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs bg-amber-100 text-amber-700">
                    {app.displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{app.displayName}</span>
                  {app.email && <span className="text-xs text-muted-foreground ml-2">{app.email}</span>}
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {app.createdDate}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onApplicationApprove(app.id)}
                    aria-label={t('community.applications.approve', { defaultValue: 'Approve' })}
                  >
                    <Check className="size-4 mr-1" />
                    {t('community.applications.approve', { defaultValue: 'Approve' })}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplicationReject(app.id)}
                    aria-label={t('community.applications.reject', { defaultValue: 'Reject' })}
                  >
                    <X className="size-4 mr-1" />
                    {t('community.applications.reject', { defaultValue: 'Reject' })}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {t('community.invitations.title', { defaultValue: 'Pending Invitations' })}
            <Badge variant="secondary" className="rounded-full">
              {invitations.length}
            </Badge>
          </h3>
          <ul className="space-y-2">
            {invitations.map(inv => (
              <li key={inv.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
                <Avatar className="size-10 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs bg-blue-100 text-blue-700">
                    <Mail className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{inv.displayName}</span>
                  {inv.email && inv.email !== inv.displayName && (
                    <span className="text-xs text-muted-foreground ml-2">{inv.email}</span>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {inv.createdDate}
                    </span>
                    {inv.isPlatformInvitation && (
                      <Badge variant="outline" className="text-[10px]">
                        {t('community.invitations.platformInvite', { defaultValue: 'Platform invite' })}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      inv.isPlatformInvitation ? onPlatformInvitationDelete(inv.id) : onInvitationDelete(inv.id)
                    }
                    aria-label={t('community.invitations.revoke', { defaultValue: 'Revoke invitation' })}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Users table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            {t('community.members.title', { defaultValue: 'Space Members' })}
            <Badge variant="secondary" className="ml-2">
              {users.length}
            </Badge>
          </h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('community.members.search', { defaultValue: 'Search members…' })}
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="h-8 w-48 text-sm"
            />
            {permissions.canAddUsers && (
              <Button type="button" variant="outline" size="sm" onClick={onInviteUsers}>
                <UserPlus aria-hidden="true" className="mr-1.5 size-3.5" />
                {t('community.members.invite', { defaultValue: 'Invite' })}
              </Button>
            )}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('community.members.name', { defaultValue: 'Name' })}</TableHead>
              <TableHead>{t('community.members.email', { defaultValue: 'Email' })}</TableHead>
              <TableHead>{t('community.members.role', { defaultValue: 'Role' })}</TableHead>
              <TableHead className="w-[80px]">{t('community.members.actions', { defaultValue: 'Actions' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {t('community.members.empty', { defaultValue: 'No members found.' })}
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.url ? (
                    <a href={user.url} className="hover:underline">
                      {user.displayName}
                    </a>
                  ) : (
                    user.displayName
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{user.email ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.isAdmin && (
                      <Badge variant="default" className="text-[10px]">
                        Admin
                      </Badge>
                    )}
                    {user.isLead && (
                      <Badge variant="secondary" className="text-[10px]">
                        Lead
                      </Badge>
                    )}
                    {user.isMember && !user.isLead && !user.isAdmin && (
                      <Badge variant="outline" className="text-[10px]">
                        Member
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onUserRemove(user.id)}
                    aria-label={t('community.members.remove', { defaultValue: 'Remove member' })}
                    className="size-7"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Organizations (collapsible) */}
      <CollapsibleSection
        title={t('community.organizations.title', { defaultValue: 'Member Organizations' })}
        count={organizations.length}
        defaultOpen={false}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('community.organizations.name', { defaultValue: 'Name' })}</TableHead>
              <TableHead>{t('community.organizations.role', { defaultValue: 'Role' })}</TableHead>
              <TableHead className="w-[80px]">
                {t('community.organizations.actions', { defaultValue: 'Actions' })}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                  {t('community.organizations.empty', { defaultValue: 'No organizations.' })}
                </TableCell>
              </TableRow>
            )}
            {organizations.map(org => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.displayName}</TableCell>
                <TableCell>
                  {org.isLead ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Lead
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Member
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onOrgRemove(org.id)}
                    aria-label={t('community.organizations.remove', { defaultValue: 'Remove organization' })}
                    className="size-7"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleSection>

      {/* Virtual Contributors (collapsible) */}
      <CollapsibleSection
        title={t('community.virtualContributors.title', { defaultValue: 'Virtual Contributors' })}
        count={virtualContributors.length}
        defaultOpen={false}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('community.virtualContributors.name', { defaultValue: 'Name' })}</TableHead>
              <TableHead className="w-[80px]">
                {t('community.virtualContributors.actions', { defaultValue: 'Actions' })}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {virtualContributors.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                  {t('community.virtualContributors.empty', { defaultValue: 'No virtual contributors.' })}
                </TableCell>
              </TableRow>
            )}
            {virtualContributors.map(vc => (
              <TableRow key={vc.id}>
                <TableCell className="font-medium">{vc.displayName}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onVCRemove(vc.id)}
                    aria-label={t('community.virtualContributors.remove', { defaultValue: 'Remove VC' })}
                    className="size-7"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="flex items-center gap-2">
          {title}
          <Badge variant="secondary">{count}</Badge>
        </span>
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

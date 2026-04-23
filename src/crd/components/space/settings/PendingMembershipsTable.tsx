import { Check, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type PendingMembershipType = 'application' | 'invitation' | 'platformInvitation';
export type PendingMembershipContributorType = 'user' | 'organization' | 'virtualContributor';
export type PendingMembershipState = 'new' | 'approved' | 'rejected' | 'invited' | 'accepted';

export type PendingMembership = {
  id: string;
  type: PendingMembershipType;
  state: PendingMembershipState;
  contributorType: PendingMembershipContributorType;
  displayName: string;
  email?: string;
  url?: string;
  createdDate: string;
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
};

export type PendingMembershipsTableProps = {
  items: PendingMembership[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
};

function statusKey(type: PendingMembershipType, state: PendingMembershipState): string {
  if (type === 'application') {
    switch (state) {
      case 'new':
        return 'community.pendingMemberships.status.applicationReceived';
      case 'approved':
        return 'community.pendingMemberships.status.applicationApproved';
      case 'rejected':
        return 'community.pendingMemberships.status.applicationRejected';
    }
  }
  if (type === 'invitation') {
    switch (state) {
      case 'invited':
        return 'community.pendingMemberships.status.invited';
      case 'accepted':
        return 'community.pendingMemberships.status.invitationAccepted';
      case 'rejected':
        return 'community.pendingMemberships.status.invitationRejected';
    }
  }
  return 'community.pendingMemberships.status.invitedExternal';
}

function statusVariantClass(type: PendingMembershipType, state: PendingMembershipState): string {
  if (type === 'application' && state === 'new') {
    return 'bg-muted text-muted-foreground border-border';
  }
  if (state === 'approved' || state === 'accepted') {
    return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  }
  if (state === 'rejected') {
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }
  return 'bg-primary/10 text-primary border-primary/20';
}

export function PendingMembershipsTable({
  items,
  onApprove,
  onReject,
  onDelete,
  className,
}: PendingMembershipsTableProps) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-subsection-title">{t('community.pendingMemberships.title')}</h3>
        <Badge variant="secondary" className="rounded-full">
          {items.length}
        </Badge>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">{t('community.pendingMemberships.name')}</TableHead>
              <TableHead>{t('community.pendingMemberships.email')}</TableHead>
              <TableHead>{t('community.pendingMemberships.date')}</TableHead>
              <TableHead>{t('community.pendingMemberships.status.column')}</TableHead>
              <TableHead>{t('community.pendingMemberships.type')}</TableHead>
              <TableHead className="w-[160px] text-right">{t('community.pendingMemberships.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  {t('community.pendingMemberships.empty')}
                </TableCell>
              </TableRow>
            )}
            {items.map((row, index) => (
              <TableRow key={`${row.type}-${row.id}`} className={cn(index % 2 === 1 && 'bg-muted/30')}>
                <TableCell>
                  {row.type === 'platformInvitation' ? (
                    <span className="text-muted-foreground">—</span>
                  ) : row.url ? (
                    <a href={row.url} target="_blank" rel="noreferrer" className="text-body-emphasis hover:underline">
                      {row.displayName}
                    </a>
                  ) : (
                    <span className="text-body-emphasis">{row.displayName}</span>
                  )}
                </TableCell>
                <TableCell className="text-body text-muted-foreground">{row.email || '—'}</TableCell>
                <TableCell className="text-caption text-muted-foreground">{row.createdDate || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-badge', statusVariantClass(row.type, row.state))}>
                    {t(statusKey(row.type, row.state), { defaultValue: row.state })}
                  </Badge>
                </TableCell>
                <TableCell className="text-body-emphasis">
                  {t(`community.pendingMemberships.contributorType.${row.contributorType}`, {
                    defaultValue: row.contributorType,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 text-primary border-primary/30 hover:bg-primary/10 disabled:opacity-40"
                      disabled={!row.canApprove}
                      onClick={() => onApprove(row.id)}
                      aria-label={t('community.pendingMemberships.approve')}
                    >
                      <Check aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 text-destructive border-destructive/30 hover:bg-destructive/10 disabled:opacity-40"
                      disabled={!row.canReject}
                      onClick={() => onReject(row.id)}
                      aria-label={t('community.pendingMemberships.reject')}
                    >
                      <X aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 disabled:opacity-40"
                      disabled={!row.canDelete}
                      onClick={() => onDelete(row.id)}
                      aria-label={t('community.pendingMemberships.delete')}
                    >
                      <Trash2 aria-hidden="true" className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

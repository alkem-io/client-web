import { ExternalLink, LogOut, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { VcMembershipRow, VcMembershipViewProps, VcPendingInvitationRow } from './VCMembershipTabView.types';

export function VCMembershipTabView(props: VcMembershipViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const {
    loading,
    memberships,
    onRequestLeave,
    emptyMembershipsLabel,
    pendingInvitations,
    onRequestAccept,
    onRequestDecline,
    pendingInvitationsHeading,
    pendingInvitationsHelp,
    leaveConfirm,
    acceptConfirm,
  } = props;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard title={t('vc.membership.confirmed.title')}>
        {memberships.length === 0 ? (
          <p className="text-caption text-muted-foreground">{emptyMembershipsLabel}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {memberships.map(row => (
              <MembershipCard key={row.id} row={row} onLeave={() => onRequestLeave(row.id)} />
            ))}
          </ul>
        )}
      </SettingsCard>

      {pendingInvitations.length > 0 ? (
        <SettingsCard title={pendingInvitationsHeading}>
          {pendingInvitationsHelp ? (
            <div className="mb-3 text-caption text-muted-foreground">{pendingInvitationsHelp}</div>
          ) : null}
          <ul className="space-y-3">
            {pendingInvitations.map(row => (
              <PendingInvitationRow
                key={row.id}
                row={row}
                onAccept={() => onRequestAccept(row.id)}
                onDecline={() => onRequestDecline(row.id)}
              />
            ))}
          </ul>
        </SettingsCard>
      ) : null}

      {/* Leave confirmation dialog */}
      <ConfirmationDialog
        open={Boolean(leaveConfirm.pendingId)}
        onOpenChange={open => {
          if (!open) leaveConfirm.onCancel();
        }}
        title={
          leaveConfirm.pendingType === 'subspace'
            ? t('vc.membership.leaveSubspaceConfirmTitle')
            : t('vc.membership.leaveSpaceConfirmTitle')
        }
        description={t('vc.membership.leaveConfirmBody', {
          name: leaveConfirm.pendingDisplayName ?? '',
        })}
        confirmLabel={t('vc.membership.leaveConfirmAction')}
        variant="destructive"
        onConfirm={leaveConfirm.onConfirm}
        onCancel={leaveConfirm.onCancel}
      />

      {/* Accept invitation confirmation dialog */}
      <ConfirmationDialog
        open={Boolean(acceptConfirm.pendingId)}
        onOpenChange={open => {
          if (!open) acceptConfirm.onCancel();
        }}
        title={t('vc.membership.acceptInvitationConfirmTitle')}
        description={
          acceptConfirm.pendingWelcomeMessage
            ? `${t('vc.membership.acceptInvitationConfirmBody', { name: acceptConfirm.pendingSpaceName ?? '' })}\n\n${acceptConfirm.pendingWelcomeMessage}`
            : t('vc.membership.acceptInvitationConfirmBody', { name: acceptConfirm.pendingSpaceName ?? '' })
        }
        confirmLabel={t('vc.membership.acceptInvitationConfirmAction')}
        onConfirm={acceptConfirm.onConfirm}
        onCancel={acceptConfirm.onCancel}
      />
    </div>
  );
}

function MembershipCard({ row, onLeave }: { row: VcMembershipRow; onLeave: () => void }) {
  const { t } = useTranslation('crd-contributorSettings');
  const banner = row.bannerUrl
    ? { backgroundImage: `url(${row.bannerUrl})` }
    : { background: `linear-gradient(135deg, ${row.color}, color-mix(in srgb, ${row.color} 70%, black))` };

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border bg-card">
      <div className="h-20 w-full bg-cover bg-center" style={banner} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-card-title">{row.displayName}</p>
          <Badge variant="outline" className="shrink-0">
            {t(row.type === 'subspace' ? 'vc.membership.subspaceBadge' : 'vc.membership.spaceBadge')}
          </Badge>
        </div>
        {row.tagline ? <p className="text-caption text-muted-foreground">{row.tagline}</p> : null}
        <div className="mt-auto flex items-center justify-end gap-2 pt-2">
          {row.spaceUrl ? (
            <Button asChild={true} variant="ghost" size="sm">
              <a href={row.spaceUrl}>
                <ExternalLink aria-hidden="true" className="mr-1 size-4" />
                {t('vc.membership.viewLabel')}
              </a>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={onLeave}>
            <LogOut aria-hidden="true" className="mr-1 size-4" />
            {t('vc.membership.leaveLabel')}
          </Button>
        </div>
      </div>
    </li>
  );
}

function PendingInvitationRow({
  row,
  onAccept,
  onDecline,
}: {
  row: VcPendingInvitationRow;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <li className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Mail aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
      <div className="flex-1">
        <p className="text-card-title">{row.spaceDisplayName}</p>
        {row.welcomeMessage ? <p className="mt-1 text-caption text-muted-foreground">{row.welcomeMessage}</p> : null}
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onDecline}>
            {t('vc.membership.declineLabel')}
          </Button>
          <Button size="sm" onClick={onAccept}>
            {t('vc.membership.acceptLabel')}
          </Button>
        </div>
      </div>
    </li>
  );
}

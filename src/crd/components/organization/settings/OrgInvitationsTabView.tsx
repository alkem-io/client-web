import { Building2 } from 'lucide-react';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { OrgInvitationRow, OrgInvitationsTabViewProps } from './OrgInvitationsTabView.types';

/**
 * Presentational view for the organization Invitations tab. Mirrors the
 * pending-invitations section of `VCMembershipTabView` — one `SettingsCard`
 * of rows, an always-rendered empty state, and an accept confirmation
 * dialog. Pure — all data + i18n resolution happens in the connector.
 */
export function OrgInvitationsTabView({
  loading,
  title,
  rows,
  emptyLabel,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
  acceptConfirm,
}: OrgInvitationsTabViewProps) {
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
      <SettingsCard title={title}>
        {rows.length === 0 ? (
          <p className="text-caption text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map(row => (
              <InvitationRow
                key={row.id}
                row={row}
                acceptLabel={acceptLabel}
                declineLabel={declineLabel}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </ul>
        )}
      </SettingsCard>

      <ConfirmationDialog
        open={acceptConfirm.open}
        onOpenChange={open => {
          if (!open) acceptConfirm.onCancel();
        }}
        title={acceptConfirm.title}
        description={acceptConfirm.body}
        confirmLabel={acceptConfirm.confirmLabel}
        onConfirm={acceptConfirm.onConfirm}
        onCancel={acceptConfirm.onCancel}
      />
    </div>
  );
}

function InvitationRow({
  row,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
}: {
  row: OrgInvitationRow;
  acceptLabel: string;
  declineLabel: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Building2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <a href={row.spaceUrl} className="text-card-title hover:underline">
          {row.spaceDisplayName}
        </a>
        <p className="mt-1 text-caption text-muted-foreground">
          {row.invitedByText} · {row.dateText} · {row.roleLabel}
        </p>
        {row.welcomeMessage && <p className="mt-1 text-caption text-muted-foreground">{row.welcomeMessage}</p>}
        {row.spacesToJoinText && <p className="mt-1 text-caption text-muted-foreground">{row.spacesToJoinText}</p>}
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={!row.canAct} onClick={() => onDecline(row.id)}>
            {declineLabel}
          </Button>
          <Button size="sm" disabled={!row.canAct} onClick={() => onAccept(row.id)}>
            {acceptLabel}
          </Button>
        </div>
      </div>
    </li>
  );
}

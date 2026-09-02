import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

export type LicensePlanOption = {
  id: string;
  name: string;
};

type ManageLicensePlansProps = {
  available: LicensePlanOption[];
  activePlanIds: string[];
  onAssign: (planId: string) => void;
  onRevoke: (planId: string) => void;
  loading?: boolean;
  className?: string;
};

/**
 * Account license-plan manager, reused by the Spaces / Users / Organizations
 * admin sections. Lists every available plan and lets the admin assign an
 * inactive plan or revoke an active one. Revoke routes through
 * `ConfirmationDialog` (destructive) before firing. Pure presentation — assign
 * and revoke surface through callbacks.
 */
export function ManageLicensePlans({
  available,
  activePlanIds,
  onAssign,
  onRevoke,
  loading = false,
  className,
}: ManageLicensePlansProps) {
  const { t } = useTranslation('crd-admin');
  const [pendingRevoke, setPendingRevoke] = useState<LicensePlanOption | null>(null);

  if (available.length === 0) {
    return <p className="text-body text-muted-foreground">{t('licensePlans.empty')}</p>;
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <ul className="flex flex-col gap-2">
        {available.map(plan => {
          const isActive = activePlanIds.includes(plan.id);
          return (
            <li
              key={plan.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <span className="text-body-emphasis">{plan.name}</span>
                {isActive && <Badge variant="secondary">{t('licensePlans.active')}</Badge>}
              </span>
              {isActive ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={loading}
                  onClick={() => setPendingRevoke(plan)}
                >
                  {t('licensePlans.revoke')}
                </Button>
              ) : (
                <Button type="button" variant="default" size="sm" disabled={loading} onClick={() => onAssign(plan.id)}>
                  {t('licensePlans.assign')}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmationDialog
        open={Boolean(pendingRevoke)}
        onOpenChange={open => {
          if (!open) setPendingRevoke(null);
        }}
        variant="destructive"
        title={t('licensePlans.revokeTitle', { name: pendingRevoke?.name ?? '' })}
        description={t('licensePlans.revokeDescription')}
        confirmLabel={t('licensePlans.revoke')}
        loading={loading}
        onConfirm={() => {
          if (pendingRevoke) onRevoke(pendingRevoke.id);
          setPendingRevoke(null);
        }}
      />
    </div>
  );
}
